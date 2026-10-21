param(
  [string]$WorkbookPath = 'C:\Users\danie\Downloads\Sacred_Connection_Rape_Intention_Master_v3.xlsx'
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [IO.Compression.ZipFile]::OpenRead($WorkbookPath)
function Read-WorkbookXml([string]$name) {
  $entry = $archive.GetEntry($name)
  if (!$entry) { throw "Missing workbook part: $name" }
  $reader = [IO.StreamReader]::new($entry.Open())
  try { [xml]$reader.ReadToEnd() } finally { $reader.Dispose() }
}
function Get-CellValues([xml]$sheet, [string[]]$sharedStrings) {
  $ns = [Xml.XmlNamespaceManager]::new($sheet.NameTable)
  $ns.AddNamespace('m', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main')
  $result = @{}
  foreach ($row in $sheet.SelectNodes('//m:sheetData/m:row', $ns)) {
    $values = @{}
    foreach ($cell in $row.SelectNodes('./m:c', $ns)) {
      if ($cell.r -notmatch '^([A-Z]+)(\d+)$') { continue }
      $column = $Matches[1]
      $valueNode = $cell.SelectSingleNode('./m:v', $ns)
      $value = if ($valueNode) { $valueNode.InnerText } else { '' }
      if ($cell.t -eq 's' -and $value -ne '') { $value = $sharedStrings[[int]$value] }
      $inline = $cell.SelectSingleNode('./m:is', $ns)
      if ($inline) { $value = ($inline.SelectNodes('.//m:t', $ns) | ForEach-Object InnerText) -join '' }
      $values[$column] = $value
    }
    if ($values.Count) { $result[[int]$row.r] = $values }
  }
  return $result
}

try {
  $sharedXml = Read-WorkbookXml 'xl/sharedStrings.xml'
  $sharedNs = [Xml.XmlNamespaceManager]::new($sharedXml.NameTable)
  $sharedNs.AddNamespace('m', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main')
  $sharedStrings = @($sharedXml.SelectNodes('//m:si', $sharedNs) | ForEach-Object { ($_.SelectNodes('.//m:t', $sharedNs) | ForEach-Object InnerText) -join '' })
  $sheet = Read-WorkbookXml 'xl/worksheets/sheet2.xml'
  $rows = Get-CellValues $sheet $sharedStrings
} finally { $archive.Dispose() }

$catalog = Get-Content -Raw -LiteralPath 'artifacts\woocommerce-intentions-catalog-read.json' | ConvertFrom-Json
$attributes = @($catalog.attributes)
$products = @($catalog.products)

function Normalize-ExactCatalogTitle([string]$value) {
  $normalized = $value.Trim().ToLowerInvariant()
  $normalized = $normalized -replace '^rapé[\s\-–—]*', ''
  return $normalized -replace '[\s\-–—]+', ''
}

$matches = foreach ($rowNumber in ($rows.Keys | Where-Object { $_ -gt 1 } | Sort-Object)) {
  $row = $rows[$rowNumber]
  if (!$row.A) { continue }
  $wooSku = if ($row.A -match '^RA') { 'MS' + $row.A.Substring(2) } else { $row.A }
  $found = @($products | Where-Object { $_.sku -ceq $wooSku })
  $titleKey = Normalize-ExactCatalogTitle $row.C
  $titleMatches = @($products | Where-Object { (Normalize-ExactCatalogTitle $_.name) -ceq $titleKey })
  $hasSource = [bool]($row.P -and ($row.Q -or $row.R))
  $oneSkuMatch = $found.Count -eq 1
  $eligible = $oneSkuMatch -and $row.L -eq 'High' -and $hasSource -and !$row.S
  if ($row.C -match 'Amazon|Forest Breeze|Gelzinho|Tsunu Extra' -or $row.S) { $eligible = $false }
  [pscustomobject]@{
    WorkbookRow = $rowNumber
    SKU = $row.A
    WooCommerceSKU = $wooSku
    ProductName = $row.C
    WooCommerceID = if ($oneSkuMatch) { $found[0].id } else { $null }
    MatchCount = $found.Count
    WooCommerceName = if ($oneSkuMatch) { $found[0].name } else { $null }
    TitleMatchCount = $titleMatches.Count
    WooCommerceIDBySku = if ($oneSkuMatch) { $found[0].id } else { $null }
    LinkBasis = if ($oneSkuMatch) { 'Exact WooCommerce SKU after changing the spreadsheet prefix RA to MS; spreadsheet SKU retained separately.' } else { $null }
    Decision = if ($eligible) { 'Ready for intention attributes' } else { 'Pending review; do not publish product classification' }
    PrimaryIntention = $row.E
    Secondary1 = $row.F
    Secondary2 = $row.G
    Intensity = $row.J
    Characteristics = $row.K
    Confidence = $row.L
    Source = $row.P
    SourcePage = $row.Q
    SourceURL = $row.R
    ReviewFlag = $row.S
  }
}

$report = [pscustomobject]@{
  ProductAttributeDefinitions = @($attributes | Select-Object id, name, slug, type, has_archives)
  PublishedProducts = $products.Count
  WorkbookRetailRows = @($matches).Count
  ExactSkuMatches = @($matches | Where-Object { $_.MatchCount -eq 1 }).Count
  UnmatchedOrDuplicateSkus = @($matches | Where-Object { $_.MatchCount -ne 1 }).Count
  PrefixSkuMatches = @($matches | Where-Object { $_.MatchCount -eq 1 }).Count
  ReadyForIntentionImport = @($matches | Where-Object { $_.Decision -eq 'Ready for intention attributes' }).Count
  PendingReview = @($matches | Where-Object { $_.Decision -ne 'Ready for intention attributes' }).Count
  Rows = @($matches)
}
$report | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath 'artifacts\intention-join-audit.json' -Encoding utf8
$report | Select-Object ProductAttributeDefinitions, PublishedProducts, WorkbookRetailRows, ExactSkuMatches, UnmatchedOrDuplicateSkus, PrefixSkuMatches, ReadyForIntentionImport, PendingReview | ConvertTo-Json -Depth 5
Write-Output 'Detailed match and source review: artifacts/intention-join-audit.json'
