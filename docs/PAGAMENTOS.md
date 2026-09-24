# Integração WooCommerce + Pagar.me

## Decisão

Manter o plugin Pagar.me já instalado e configurado no WooCommerce. O Next.js é
a vitrine e a sacola; o checkout WooCommerce continua responsável por endereço,
CPF/CNPJ, frete, desconto por meio de pagamento, parcelamento, pedidos, estoque,
e-mails, Pix, boleto, cartão, estornos e notificações do Pagar.me.

Não colocar chaves Pagar.me no frontend. Esta integração não precisa de uma
segunda conta, de chaves `sk_` no Next.js ou de um novo webhook de cobrança.

O checkout hospedado diretamente pelo Pagar.me foi considerado, mas exigiria
sincronização própria de pedidos, estoque, frete e cancelamentos com WooCommerce.
Para a loja atual, usar o gateway que já funciona tem menor custo de operação.

## Fluxo implementado

1. O produto e suas variações vêm da Store API.
2. `/api/cart/` mantém o token em cookie HttpOnly, consulta estoque e preços no
   servidor e só aceita operações validadas. Não aceita preços do navegador.
3. `/api/checkout/` consulta novamente a sacola e cria uma sessão de transferência
   com os mesmos itens e cupons. Só prepara o checkout: não cria nem paga pedidos.
4. O navegador segue para `WOOCOMMERCE_CHECKOUT_URL?session=...`. WooCommerce
   importa a sacola para sua sessão nativa. A versão encontrada na loja foi 11.0.1.
5. O plugin complementar remove o token da URL antes da renderização. Ao receber
   a compra, limpa a sacola de origem se ela ainda corresponde ao que foi comprado.
   Alterações feitas na sacola depois da transferência são preservadas.
6. O plugin oficial Pagar.me processa o pagamento e mantém o pedido atualizado.

Uma nova sessão a cada transferência evita que o WooCommerce reutilize uma
versão antiga da sacola quando o comprador volta, altera itens e finaliza de novo.

## Instalação pendente no WordPress

O arquivo `wordpress/medicina-sagrada-headless/medicina-sagrada-headless.php`
é um plugin complementar, não substitui nem reconfigura o Pagar.me. Primeiro
instalar na homologação como pasta `medicina-sagrada-headless` em
`wp-content/plugins/` e ativar. Também pode instalar o ZIP em `artifacts/`,
quando gerado. Compatível com o fluxo nativo de sessão do WooCommerce 11.

Gerar o pacote com `npm run package:wordpress`. Usar
`artifacts/medicina-sagrada-headless.zip` (atualmente versão 1.0.1). O ZIP contém
somente `medicina-sagrada-headless/medicina-sagrada-headless.php`, com separadores
`/` compatíveis com Linux. Não usar o pacote antigo 1.0.0: ele foi produzido pelo
Compress-Archive do Windows com separadores `\\` e não foi reconhecido na loja.

### Atualizar o plugin existente (sem instalar outro)

A versão 1.0.1 é uma atualização do mesmo plugin. A identidade permanece
`medicina-sagrada-headless/medicina-sagrada-headless.php`: não acrescentar a
versão ao nome da pasta nem ao arquivo PHP. O nome externo do ZIP pode variar.

1. Manter um backup da pasta atual; não desinstalar nem apagar o plugin.
2. Em **Plugins → Adicionar plugin → Enviar plugin**, enviar
   `artifacts/medicina-sagrada-headless.zip`.
3. Na comparação entre as versões, escolher **Substituir o atual pelo enviado**.
   Essa tela é o fluxo de atualização manual por ZIP, não um segundo plugin.
4. Conferir versão 1.0.1, estado ativo e `/wp-json/ms-headless/v1/status`.

Se o WordPress não oferecer substituição ou disser que o arquivo não existe,
parar e conferir a pasta anterior pelo gerenciador de arquivos da hospedagem.
Na última consulta administrativa o complemento não apareceu na lista de plugins;
a instalação anterior pode ter uma estrutura inválida. Não criar uma pasta
alternativa nem remover arquivos sem identificar a instalação antiga.

O pacote não inclui um serviço de atualização automática: atualizações futuras
usam o mesmo ZIP e o mesmo identificador, por substituição. Referência do fluxo:
https://developer.wordpress.org/reference/classes/plugin_upgrader/.

Sem esse plugin, é possível testar adição e transferência de itens, mas a sacola
headless não é limpa após comprar e o token fica na URL do checkout. Por isso o
diagnóstico não indica prontidão de produção enquanto ele estiver ausente.

Para revalidação, adicionar no `wp-config.php`, antes da linha de encerramento:

```php
define( 'MS_HEADLESS_URL', 'https://SEU-FRONTEND-DE-HOMOLOGACAO' );
define( 'MS_REVALIDATION_SECRET', 'MESMO-SEGREDO-LONGO-DO-NEXT' );
```

No Next, configurar `REVALIDATION_SECRET` com o mesmo valor aleatório de pelo
menos 32 caracteres. `/api/revalidate/` já autentica esse segredo. O WordPress
precisa alcançar a URL do frontend; `localhost` não funciona entre servidores.
Eventos de conteúdo e estoque disparam invalidação; ISR de 900 segundos continua
como fallback caso o envio falhe. Não há fila durável de reenvio nesse plugin.

## Ambiente local

Node 22.18+ (Node 24 recomendado), `npm ci`, `npm run setup`, `npm run dev`.
O setup não sobrescreve `.env.local`. Copiar as URLs reais de `.env.example`.
`npm run check` valida lint, tipos e entradas da API; `npm run test:e2e` usa
um WooCommerce simulado em ambiente local, sem cobrar ou criar pedido real.

As credenciais do Pagar.me ficam exclusivamente no painel WordPress. A configuração
local consulta o catálogo real. Finalizar pagamento no checkout real pode cobrar;
para homologar cobranças, usar uma cópia da loja e credenciais de teste do Pagar.me.
Não trocar o gateway da loja em produção para modo teste.

### Credenciais administrativas WooCommerce

As variáveis `WORDPRESS_CONSUMER_KEY` e `WORDPRESS_CONSUMER_SECRET` de `.env.local`
foram verificadas em consultas autenticadas. `npm run check:woocommerce` repete
essa conferência sem imprimir os segredos ou as configurações sensíveis do gateway.
O script só consulta dados; não altera configurações nem cria pedidos.

Resultado confirmado: API WooCommerce HTTP 200, WooCommerce 11.0.1 e plugin
Stone for WooCommerce/Pagar.me 3.10.1, com Pix, cartão e boleto habilitados.
As mesmas chaves retornaram HTTP 401 para `/wp/v2/plugins`: esse par autentica
na API WooCommerce, mas não concede neste site acesso à administração de plugins
WordPress. Para instalar o ZIP complementar e ajustar LiteSpeed, usar o painel
WordPress com uma conta que tenha as permissões necessárias, ou acesso à hospedagem.
Não é necessário colocar as chaves WooCommerce no navegador.

O diagnóstico também aceita `WP_USER` e `WP_PASSWORD` em `.env.local`, sendo
`WP_PASSWORD` uma senha de aplicação WordPress. Usa esse par exclusivamente
nas consultas administrativas WordPress e informa as permissões do usuário.
As chaves `WORDPRESS_CONSUMER_*` continuam sendo usadas nas consultas WooCommerce.

Após salvar esse par, a autenticação administrativa foi confirmada com HTTP 200
em `/wp/v2/plugins` e `/wp/v2/users/me?context=edit`, com permissões
`install_plugins`, `activate_plugins` e `manage_options`. O complemento ainda
não está instalado. A API nativa de instalação recebe apenas um slug do
WordPress.org; o instalador WooCommerce também consulta esse diretório. O ZIP
personalizado deve ser enviado por **Plugins → Adicionar plugin → Enviar plugin**
no painel ou colocado em `wp-content/plugins/` pela hospedagem. Depois de instalado,
a ativação e a conferência podem ser feitas com a senha de aplicação já validada.

## Corte de domínio

Antes de apontar `medicinasagrada.com.br` para Next.js, manter WooCommerce em
uma origem HTTPS própria, por exemplo `cms.medicinasagrada.com.br`:

```dotenv
NEXT_PUBLIC_SITE_URL=https://medicinasagrada.com.br
WORDPRESS_SITE_URL=https://cms.medicinasagrada.com.br
WORDPRESS_API_URL=https://cms.medicinasagrada.com.br/wp-json
WOOCOMMERCE_STORE_API_URL=https://cms.medicinasagrada.com.br/wp-json/wc/store/v1
WOOCOMMERCE_CHECKOUT_URL=https://cms.medicinasagrada.com.br/checkout/
WOOCOMMERCE_ACCOUNT_URL=https://cms.medicinasagrada.com.br/account/
```

O servidor bloqueia finalizar se o destino tiver a mesma origem do frontend,
evitando um loop entre o Next e o WooCommerce. Não alterar DNS antes desse ajuste.

Na migração da origem WooCommerce, revisar URLs de webhook no Pagar.me e URLs
de retorno do gateway instalado; manter o endpoint acessível por HTTPS sem login,
cache ou desafio de CDN. Não inventar um endpoint de webhook: usar o informado
pela versão instalada do plugin. Configurar cache/CDN para ignorar `/cart/`,
`/checkout/`, `/account/`, `/wp-json/wc/store/`, `?session=` e cookies de sessão Woo.
O parâmetro `session` é um token: removê-lo dos logs e não enviá-lo ao analytics.

Foi observado `X-LiteSpeed-Cache: hit` na Store API `/cart`, mesmo com
`Cache-Control: no-store`. A integração usa uma query aleatória sem dados do
cliente em cada leitura e rejeita respostas identificadas como cache HIT.
O complemento marca as rotas privadas como não cacheáveis. Na instalação,
adicionar as exclusões no LiteSpeed e purgar o cache REST antigo: o PHP não
consegue corrigir uma página que o servidor já devolveu antes de executá-lo.

## Validação realizada nesta entrega

- Catálogo WordPress e Store API reais respondendo HTTP 200.
- Cinco testes de validação da API e três cenários de navegador com Woo simulado.
- Transferência real de um brinco artesanal: sacola persistiu, checkout respondeu
  HTTP 200, item/quantidade conferidos na sessão nativa e Pagar.me identificado.
  Nenhum pedido ou cobrança criado. Itens das sacolas de teste removidos ao final.
- Complemento ainda não instalado no WordPress; confirmação de compra, limpeza
  pós-pedido e callbacks do Pagar.me exigem homologação no ambiente da loja.

## Homologação necessária antes de receber clientes

- Confirmar plugin complementar ativo em `/diagnostico-api/`.
- Compra com produto simples e variação, alteração de quantidade, estoque
  insuficiente, cupom válido/inválido, frete e endereço brasileiro.
- Voltar do checkout, mudar a sacola e confirmar que a segunda ida reflete a mudança.
- Criar pedido de teste Pix, cartão aprovado/recusado e boleto. Conferir valor,
  parcelamento, desconto, expiração, retorno assíncrono e e-mails.
- Reentrega do webhook não duplica pedido, cobrança ou baixa de estoque.
- Conferir pedido pendente, pago, cancelado e estornado nos dois painéis.
- Confirmar sacola vazia depois de comprar e preservação de itens adicionados
  em outra aba após iniciar a compra.
- Validar checkout com sessão de cliente já logado. Conta e histórico permanecem
  no WooCommerce; o frontend não implementa um segundo sistema de autenticação.

Presença de `woo-pagarme-payments-*` na API indica gateway habilitado, não prova
liquidação, aprovação cadastral ou webhook funcionando. Essa homologação depende
do acesso ao WordPress/Pagar.me e não foi simulada como pagamento real.

## Referências oficiais

- https://docs.pagar.me/docs/copy-of-woocommerce
- https://developer.woocommerce.com/docs/apis/store-api/cart-tokens/
- https://github.com/woocommerce/woocommerce/blob/11.0.1/plugins/woocommerce/includes/class-wc-session-handler.php
