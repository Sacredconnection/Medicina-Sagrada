# Calculadora de frete na página do produto

O endpoint `POST /api/shipping/` aceita somente produto/variação, quantidade e
CEP brasileiro. Consulta o catálogo público para validar a seleção e chama a
calculadora nativa do Melhor Envio instalado no WordPress (versão verificada:
2.16.5), via `wp-admin/admin-ajax.php`, ação `cotation_product_page`.

O parâmetro `data[cep_origem]` dessa ação representa o CEP de destino, apesar do
nome. Peso, dimensões, preço, métodos e regras vêm do WooCommerce. Não há uma
segunda tabela de frete nem necessidade de copiar o token do Melhor Envio.

Nenhum Cookie, Cart-Token ou Authorization do comprador é enviado ao WordPress
na cotação; nenhum Set-Cookie da cotação é repassado. O plugin pode inicializar
uma sessão própria para calcular, sem acessar a sacola existente do comprador.
O CEP não é salvo em cookies, logs ou cache do Next.js; é enviado à loja e ao
fluxo de cotação do plugin. A resposta ao navegador usa `private, no-store`.

Valores, prazos e condições de frete grátis são preservados da resposta do
plugin. Sem prazo disponível, a interface informa que ele será apresentado na
finalização. A cotação é uma estimativa por produto/quantidade, não uma garantia
do frete final da sacola. Alterar CEP, quantidade ou variação invalida o resultado.
Falhas de infraestrutura são apresentadas sem expor mensagens internas do banco.

Configuração: `WORDPRESS_SITE_URL` precisa apontar para o WordPress, inclusive
depois da mudança para `checkout.medicinasagrada.com.br`. Não mudar para a origem
do Next. Nenhuma atualização do plugin complementar é necessária para esta função.

Referência do fornecedor: https://github.com/melhorenvio/wp-melhorenvio-v2

Testes: `npm run check` e `npm run test:e2e`. A simulação cobre quantidades,
variações, CEP inválido, falta de opções, indisponibilidade, resultado obsoleto,
condições de gratuidade e preservação da sacola/cookies. A homologação real deve
usar produto de artesanato e CEP público, sem criar pedido nem comprar etiqueta.

Teste real automatizado, com sessão de navegador isolada e limpeza do item:
`node scripts/smoke-live-shipping.mjs URL_DO_FRONTEND --allow-live-quote`.
Usa o brinco 6374 e CEP público 01310-100; respeita o máximo disponível e compara
a sacola e seu cookie antes/depois da cotação. Capturas desktop/mobile são salvas
em `artifacts/`, fora do Git. Não submete checkout nem compra etiqueta.
