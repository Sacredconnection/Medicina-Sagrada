# Revisão do fluxo de compra — 24/09/2026

## Implementado no frontend

| Área | Lacuna encontrada | Entrega |
| --- | --- | --- |
| Descoberta | Busca vazia não mostrava a loja | `/busca/` também é catálogo completo |
| Catálogo | Sem filtros nem ordenação | Sidebar desktop, painel recolhível mobile; categoria, preço em reais, estoque, oferta; destaques, recentes, preço asc/desc, vendas e avaliação |
| Paginação | Suposição de próxima página ao retornar exatamente 12 itens | Usa `X-WP-Total` / `X-WP-TotalPages`; preserva busca, filtros e ordenação; troca de filtros retorna à primeira página |
| Feedback | Filtros invisíveis após aplicação | Contagem, intervalo exibido, filtros removíveis, limpar e recuperação de resultado vazio |
| Produto | Só primeira foto | Miniaturas e ampliação em nova aba |
| Preço | Preço não reagia à variação; CSS riscava faixa como desconto | Preço da opção selecionada, aviso para selecionar e desconto riscado apenas em `del` |
| Compra | Limites de quantidade pouco claros | Exibe máximo da opção quando informado; backend continua autoritativo |
| Avaliações | Estrelas no card, mas sem comentários no produto | Avaliações públicas do Woo, notas inclusive baixas, data, marcador de compra verificada retornado pelo Woo e carregar mais com recuperação de falha |
| Avaliar | Sem acesso ao envio | Botão para formulário nativo do mesmo produto no Woo; login e moderação preservados |
| Sacola lateral | Quantidade só na página completa | Aumentar/diminuir conforme limites de estoque e tentar atualizar após falha |
| Mobile | Sacola escondida no menu | Ícone e contagem visíveis no cabeçalho |
| Navegação | Sananga, devoluções e breadcrumb de categoria com caminhos errados | URLs reais do WP, respeitando a hierarquia; correção da conta legada `/my-account/` para `/account/` na mesma origem |
| Continuidade | Final da página de produto sem próximo caminho | Produtos da mesma categoria e acesso à política de devoluções |
| Erros | Infraestrutura expunha mensagem de banco na sacola | Mensagem de indisponibilidade e orientação para atualizar antes de repetir |

Preservados: identidade branca/verde e Proxima Nova, campos sem preços enviados pelo cliente, sessão HttpOnly, proteção de origem, cupons e checkout nativo Pagar.me. Orientação de frontend aplicada para consistência e responsividade, sem redesenhar a marca.

## Avaliações: limite deliberado

A loja original exige login. Verificado no HTML público do produto 6374 (`must-log-in`); a Store API expunha 128 avaliações públicas na data da revisão. O frontend lê a API pública e não expõe e-mail, avatar, credencial administrativa ou informações de pedidos.

O botão **Escrever uma avaliação** abre o produto original na área de avaliação. O envio permanece no WordPress, com login e moderação nativos. Não foi criada autenticação de cliente no Next.js, nem formulário que publique usando a chave administrativa. Envio sem sair do frontend exigirá uma integração de autenticação de cliente própria; não está implementado nesta entrega. Não foram publicadas avaliações fictícias em produção.

Referências: [Store API de produtos](https://developer.woocommerce.com/docs/apis/store-api/resources-endpoints/products/), [Store API de avaliações](https://developer.woocommerce.com/docs/apis/store-api/resources-endpoints/product-reviews/).

## Validação

- Testes unitários para filtros, preços, configuração, segurança de carrinho e frete.
- Navegador com servidor Woo de teste: catálogo, ordenação, paginação, filtros mobile, avaliações e falha/retry, galeria, variações, estoque, side cart, persistência, cupons, transferência ao checkout e frete.
- Build de produção local.
- Navegador local com Woo real: catálogo em estoque ordenado por preço, leitura de avaliações existentes, produto artesanal 6374 → side cart → sacola → checkout real. Token de sessão removido da URL pelo plugin. Nenhum pedido, pagamento ou etiqueta criado; sacolas de teste removidas.
- Imagens de QA em `artifacts/ux-*.png`; script reproduzível `node scripts/smoke-shopping-ux.mjs http://localhost:3019 --allow-live-cart`.

## Pendências que impedem chamar a migração de concluída

1. Publicar esta entrega e repetir o teste no domínio Vercel. Nenhuma migração de domínio feita nesta tarefa.
2. Uniformizar o design do checkout/conta/retorno de pagamento no WordPress via atualização do mesmo plugin. O checkout nativo ainda mantém o tema atual.
3. Homologar transações Pix/cartão/boleto e confirmar webhooks/status de pedido em ambiente de testes Pagar.me. Abrir o checkout não comprova uma transação aprovada.
4. Investigar as falhas intermitentes de banco e configurar corretamente as exclusões LiteSpeed; mensagens amigáveis não corrigem o servidor.
5. Resolver as rotas de etiquetas e demais pendências do relatório de slugs; esta entrega corrige os links de compra destacados, não substitui a auditoria SEO completa.
6. Na migração futura, coordenar DNS/URLs, canonicals, redirects e exceções de APIs/arquivos/webhooks/conta/checkout. Nenhuma dessas configurações foi alterada agora.

Os filtros de preço usam BRL com duas casas, como a loja atual. Dimensões/peso são usados pelo Melhor Envio, não aceitos como preço/frete definitivo fornecido pelo navegador. Os estados de ordenação e filtros são URLs compartilháveis; páginas filtradas de categoria ficam `noindex,follow` com canonical da categoria.
