$ErrorActionPreference = 'Stop'
$root = (Get-Location).Path
$envMap = @{}
Get-Content (Join-Path $root '.env.local') | Where-Object { $_ -match '^[A-Z0-9_]+=.*' } | ForEach-Object { $i=$_.IndexOf('='); $envMap[$_.Substring(0,$i)]=$_.Substring($i+1).Trim('"','''') }
$base = ($envMap.WORDPRESS_API_URL).TrimEnd('/')
$woo = "$base/wc/v3"
$reportPath = 'C:\Users\danie\Downloads\image-mapping-report-fotos-ms.md'
$archive = 'C:\Users\danie\Downloads\Fotos-MS-900x900.rar'
$log = Join-Path $root 'scripts\image-mapping-curl.log'
$wpCredential = "$($envMap.WP_USER):$($envMap.WP_PASSWORD)"
$wooCredential = "$($envMap.WORDPRESS_CONSUMER_KEY):$($envMap.WORDPRESS_CONSUMER_SECRET)"
$rows = [regex]::Matches((Get-Content -Raw -Encoding UTF8 $reportPath), '\| ([^|]+) \| (\d+) \| ([^|]+) \| (product|variation) \|\s*(\d*)\s*\|') | ForEach-Object { [pscustomobject]@{ ProductId=[int]$_.Groups[2].Value; File=$_.Groups[3].Value.Trim(); Type=$_.Groups[4].Value; VariationId=if($_.Groups[5].Value){[int]$_.Groups[5].Value}else{$null} } } | Where-Object { $_.ProductId -notin @(336,13219,39) }
$ids = $rows.ProductId | Sort-Object -Unique
$temp = Join-Path ([IO.Path]::GetTempPath()) ("ms-curl-" + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $temp | Out-Null
try {
  & 'C:\Program Files\WinRAR\UnRAR.exe' x -y $archive "$temp\" | Out-Null
  foreach ($id in $ids) {
    $items = @($rows | Where-Object ProductId -eq $id)
    Add-Content $log "$(Get-Date -Format o) START $id"
    $media = @{}
    foreach ($item in $items) {
      $file = Get-ChildItem -LiteralPath $temp -Recurse -File -Filter $item.File | Select-Object -First 1
      if (-not $file) { throw "Arquivo não encontrado: $($item.File)" }
      $upload = $null
      for ($attempt=1; $attempt -le 3 -and -not $upload; $attempt++) {
        $json = & curl.exe --silent --show-error --fail --max-time 120 --retry 2 -u $wpCredential -F "file=@$($file.FullName);type=image/webp" -F "title=$([IO.Path]::GetFileNameWithoutExtension($file.Name))" "$base/wp/v2/media"
        if ($LASTEXITCODE -eq 0 -and $json) { $upload = $json | ConvertFrom-Json } else { Start-Sleep -Seconds 2 }
      }
      if (-not $upload.id) { throw "Falha no upload: $($item.File)" }
      $media[$item.File] = @{ id=[int]$upload.id }
      Add-Content $log "$(Get-Date -Format o) MEDIA $id $($item.File) $($upload.id)"
    }
    $productImages = @($items | Where-Object Type -eq 'product' | ForEach-Object { $media[$_.File] })
    $wooAuth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes($wooCredential))
    $headers = @{ Authorization = "Basic $wooAuth"; 'Content-Type'='application/json' }
    $productBody = Join-Path $temp "product-$id.json"
    (@{ images=$productImages } | ConvertTo-Json -Depth 5) | Set-Content -Encoding UTF8 $productBody
    & curl.exe --silent --show-error --fail --max-time 120 -u $wooCredential -H 'Content-Type: application/json' -X PUT --data-binary "@$productBody" "$woo/products/$id" | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "Falha ao atualizar produto $id" }
    foreach ($item in @($items | Where-Object Type -eq 'variation')) {
      $variationBody = Join-Path $temp "variation-$($item.VariationId).json"
      (@{ image=$media[$item.File] } | ConvertTo-Json -Depth 5) | Set-Content -Encoding UTF8 $variationBody
      & curl.exe --silent --show-error --fail --max-time 120 -u $wooCredential -H 'Content-Type: application/json' -X PUT --data-binary "@$variationBody" "$woo/products/$id/variations/$($item.VariationId)" | Out-Null
      if ($LASTEXITCODE -ne 0) { throw "Falha ao atualizar variação $($item.VariationId)" }
    }
    Add-Content $log "$(Get-Date -Format o) OK $id"
  }
} catch { Add-Content $log "$(Get-Date -Format o) ERROR $($_.Exception.Message)"; throw }
finally { Remove-Item -LiteralPath $temp -Recurse -Force -ErrorAction SilentlyContinue }
