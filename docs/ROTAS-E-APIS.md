# Rotas e APIs

URLs de navegação usam barra final (`trailingSlash: true`). Preserve slugs e hierarquias existentes.

## Páginas

| URL | Fonte / comportamento |
| --- | --- |
| `/` | Home, dados locais e catálogo WooCommerce |
| `/busca/` | Pesquisa, filtros, ordenação e paginação |
| `/product/{slug}/` | Produto, galeria, compra, frete, avaliações e relacionados |
| `/product-category/{pai}/{slug}/` | Categoria WooCommerce com hierarquia variável |
| `/product-category/{slug}/page/{n}/` | Paginação, inclusive em hierarquias aninhadas |
| `/blog/`, `/blog/page/{n}/` | Índice editorial paginado |
| `/category/{slug}/` | Categoria WordPress, com paginação por `page/{n}` |
| `/{slug}/` e caminhos aninhados | Página/post WordPress com validação do permalink |
| `/sobre-nos/`, `/atendimento/`, `/atacado/` | Resolução WordPress e apresentação local específica |
| `/politica-de-privacidade/`, `/refund_returns/` | Políticas e componentes próprios |
| `/aprenda/` | Índice local, três guias e glossário |
| `/aprenda/primeiro-rape/` | Guia Seu primeiro rapé |
| `/aprenda/escolher-aplicador/` | Guia de aplicadores |
| `/aprenda/preparar-com-cuidado/` | Guia de incensos/resinas |
| `/cart/` | Sacola e resumo |
| `/checkout/` | Encaminha à sacola; GET não inicia checkout |
| `/account/` | Redirecionamento 307 à conta WooCommerce, sem cache |
| `/diagnostico-api/` | Diagnóstico em desenvolvimento; 404 fora dele |
| `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest` | Rotas geradas de SEO/manifest |

A rota curinga compara o `link` retornado pelo CMS com o caminho pedido. Posts explicitamente mapeados em `article-cta.ts` têm prioridade para evitar conflitos com páginas legadas de mesmo slug. Recursos inexistentes usam `notFound`; falhas de carregamento têm estados próprios.

## Parâmetros do catálogo

| Parâmetro | Contrato |
| --- | --- |
| `q` | Pesquisa com trim, até 80 caracteres |
| `ordem` | destaque, recentes, menor_preco, maior_preco, populares, avaliados |
| `min`, `max` | Reais, ponto/vírgula e até duas casas; convertido para centavos |
| `estoque=1` | Somente em estoque |
| `oferta=1` | Somente em oferta |
| `categoria` | IDs positivos, repetidos ou separados por vírgulas; até 50 únicos |
| `pagina` | Inteiro 1–1000; fallback 1 |

Faixa inválida é marcada e não enviada à API. Fonte: `lib/catalog-query.ts`. Paginação por caminho é resolvida pela rota correspondente.

## Regras HTTP comuns

Mutações de sacola, checkout, frete e avaliação exigem Origin compatível com a origem acessada ou configurada; rejeitam `Sec-Fetch-Site: cross-site`. JSON compartilhado usa `Content-Type: application/json` e limite de 8192 bytes. Clientes de servidor devem enviar Origin explicitamente; ausência resulta em 403. Operações privadas retornam no-store e mensagens públicas em português. Não registrar token ou credencial.

| Método / rota | Entrada | Resultado / observações |
| --- | --- | --- |
| GET `/api/cart/` | Cookie ms_cart, se houver | `{ cart }`, cria/recupera sessão e atualiza cookie |
| POST `/api/cart/` | Ação abaixo | `{ cart }`; entrada 400, origem 403, sessão 401, falha remota 502/503 |
| POST `/api/checkout/` | Cookie; sem corpo obrigatório | `{ url }`; vazia 400, divergência 409, gateway/origem inválida 503 |
| POST `/api/shipping/` | `{ productId, quantity, postcode }` | `{ quotes }`; entrada 400/422, origem 403, falhas conforme adaptador |
| GET `/api/reviews/?product={id}&page={n}` | ID positivo; página 1–1000 | Coleção de avaliações; parâmetros 400, indisponível 503 |
| POST `/api/reviews/` | `{ productId, rating, comment, username, password }` | 201 com message; 400/401/403/429/502/503 conforme falha |
| GET `/api/ritual-recommendation/` | intention e experience válidos | Recomendação; valores inválidos 400, consulta 503 |
| GET `/api/ritual-variation/?id={id}` | ID positivo de 1–10 dígitos | WooProduct tipo variation; 400/404/503 |
| POST `/api/revalidate/` | Bearer + JSON abaixo | `{ revalidated, path, timestamp }`; segredo 401, corpo inválido 400 |
| GET `/api/diagnostico/` | Desenvolvimento | Diagnóstico; 404 fora dele |
| GET `/api/commerce-status/` | Desenvolvimento | Diagnóstico comercial; 404 fora dele |
| GET `/api/dev/asset-version/?path=/assets/...` | Caminho dentro de assets | `{ version }` ou null; inválido 400; fora de dev 204 |

Contratos completos: `lib/types.ts`, `cart-types.ts`, `reviews.ts` e handlers. Não confundir Store API pública com API administrativa WooCommerce.

## Ações da sacola

```json
{ "action": "add", "id": 123, "quantity": 1, "variation": [{ "attribute": "pa_peso", "value": "10g" }] }
```

```json
{ "action": "update", "key": "0123456789abcdef0123456789abcdef", "quantity": 2 }
```

```json
{ "action": "remove", "key": "0123456789abcdef0123456789abcdef" }
```

```json
{ "action": "apply-coupon", "code": "EXEMPLO" }
```

`remove-coupon` usa code. Quantidade 1–9999, default 1. Key tem 32 hexadecimais minúsculos. Até 20 pares de variação, attribute até 100 e value até 200 caracteres. Cupom até 100 caracteres. Os valores acima são exemplos: use dados reais retornados pelo WooCommerce para operar a loja.

## Frete e avaliações

CEP aceita oito números ou `00000-000`, rejeita dígitos todos iguais; quantidade 1–9999. productId pode identificar variação. Cotação não modifica a sacola do comprador nem determina frete final. Cada quote contém name, price, deliveryTime e observations. Veja [Frete](FRETE.md).

Avaliações: rating 1–5, comment não vazio até 3000 caracteres, username até 254 e password até 256. Honeypot website preenchido é rejeitado. Até cinco tentativas em cinco minutos por hash de usuário, por instância. Login usa credenciais do cliente; WordPress pode impor moderação e restrições de compra/login. Não armazenar/logar senha. Fonte: `review-submission.ts`.

## Revalidação

```http
POST /api/revalidate/
Authorization: Bearer SEU_SEGREDO
Content-Type: application/json
```

```json
{ "type": "product", "slug": "slug-real" }
```

Alternativa: `{ "path": "/sobre-nos/" }`. Tipos declarados: page, post, product, product-category. Revalida caminho/sitemap e tags wordpress/woocommerce com perfil max. O handler faz validação mínima de presença, não schema estrito nem expurgo total. O plugin atual envia path `/`; demais recursos dependem também de tags/ISR. Segredo usa `timingSafeEqual`.
