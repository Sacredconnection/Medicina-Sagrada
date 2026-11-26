# Preparação para publicação

Esta versão prepara o lançamento sem executar deploy, alterar DNS ou mudar a loja ativa. O WordPress continua sendo o registro de produtos, estoque, pedidos e pagamentos.

## Arquivos e comandos prontos

```powershell
npm.cmd run prepare:release
npm.cmd run package:wordpress
npm.cmd run check:release
```

`prepare:release` cria `.env.release.local` e `outputs/release/wp-config-snippet.txt`. Ambos são privados e ignorados pelo Git. O comando preserva `.env.local`, reaproveita o segredo já preparado e não acessa serviços externos. Não enviar esses arquivos a GitHub, tickets ou chats. O modelo sem segredos fica em `deploy/production.env.example`.

| Serviço | Destino preparado |
| --- | --- |
| Frontend / canonical | `https://medicinasagrada.com.br` |
| WordPress | `https://checkout.medicinasagrada.com.br` |
| API de conteúdo | `https://checkout.medicinasagrada.com.br/wp-json` |
| Store API | `https://checkout.medicinasagrada.com.br/wp-json/wc/store/v1` |
| Checkout | `https://checkout.medicinasagrada.com.br/checkout/` |
| Conta | `https://checkout.medicinasagrada.com.br/account/` |

O pacote `artifacts/medicina-sagrada-headless.zip` atualiza o mesmo plugin já instalado. Não desinstalar a versão existente. O plugin 1.0.1 foi identificado ativo no diagnóstico de 28/10; sua atualização automática de conteúdo estava desabilitada por falta de configuração. O snippet privado fornece as duas constantes necessárias. Preparar um segredo não significa que ele já foi aplicado à Vercel ou ao WordPress.

Na conferência de 28/10, o subdomínio `checkout` já respondeu às APIs com HTTPS, mas `/wp-json/` ainda informou `home`/`url` no domínio principal. Um acesso ao checkout vazio redirecionou para `https://medicinasagrada.com.br/cart/`. A origem responde, mas a migração das URLs WordPress ainda precisa ser concluída; não alterar DNS do frontend antes disso.

## Passos externos antes de mudar o domínio público

1. Fazer backup verificável de banco, uploads, configuração WordPress e DNS. Guardar o destino atual do domínio e reduzir o TTL com antecedência. Conservar acesso ao servidor antigo.
2. Criar `checkout.medicinasagrada.com.br` apontando ao servidor WordPress e instalar certificado HTTPS. Confirmar no painel da hospedagem que atende a instalação correta. Não apontar esse subdomínio à Vercel.
3. Preparar a mudança de `home`/`siteurl` e URLs serializadas com backup e ferramenta compatível com WordPress. Não usar substituição SQL simples. Rever retornos e callbacks na configuração real do Pagar.me, frete, e-mails e recuperação de senha. Copiar os endpoints do painel do plugin instalado, sem inventar caminhos.
4. Configurar Redis REST e preencher `RATE_LIMIT_REDIS_URL` e `RATE_LIMIT_REDIS_TOKEN` no arquivo privado. A Vercel tem múltiplas instâncias; o limite em memória serve apenas ao desenvolvimento. O cabeçalho de IP da Vercel é escolhido automaticamente.
5. Importar as variáveis privadas no ambiente **Production** da Vercel. Não importar credenciais administrativas Woo/WordPress: vitrine e compra não dependem delas. Não configurar `NODE_ENV` manualmente.
6. Instalar o snippet no `wp-config.php`, antes do encerramento da configuração. Para homologação, usar outra origem de frontend e outro segredo; WordPress externo não consegue chamar localhost. Evitar que homologação invalide produção.
7. Excluir do cache da hospedagem/CDN `/cart/`, `/checkout/`, `/account/`, `/wp-json/wc/store/`, `?session=` e sessões Woo. Purgar respostas REST antigas. PHP não corrige uma resposta já entregue pelo cache do servidor.
8. Confirmar domínio autorizado no kit Adobe Fonts. Mailchimp e produto do mês são opcionais: sem configuração, newsletter fica oculta e menu mensal mostra “Em breve”.

Não alterar o domínio público até frontend e checkout terem sido testados juntos. Mover `siteurl` pode mudar os redirecionamentos da loja antiga: coordenar a janela e não tratar a criação do subdomínio como migração completa.

## Conferência automática

```powershell
npm.cmd run check
npm.cmd run test:e2e
$env:RITUAL_CATALOG_FIXTURE = '1'
npx.cmd playwright test tests/e2e/ritual-catalog.spec.ts
Remove-Item Env:RITUAL_CATALOG_FIXTURE
npm.cmd run build
npm.cmd run check:release -- --online --frontend https://URL-DO-PREVIEW
```

`check:release` verifica exatamente `.env.release.local`, sem misturar desenvolvimento. `--env caminho` escolhe outro arquivo. Retorna código 1 em bloqueios e grava `artifacts/release-check.json` sem segredos. Sem `--online`, verifica apenas configuração. Com `--online`, consulta conteúdo, catálogo, status do plugin e Redis (PING). `--frontend` verifica liveness e sitemap.

Acrescentar `--revalidate` somente quando o destino informado deve receber uma invalidação de cache. Não cria pedidos nem publica conteúdo. Ainda é preciso salvar uma alteração controlada no WordPress de homologação e confirmar sua chegada ao frontend: o comando local não comprova entrega originada no WordPress. O plugin envia sem aguardar resposta e não possui fila durável de retentativas. O intervalo de atualização de 900 segundos permanece como recuperação, sujeito à disponibilidade da API.

`.github/workflows/ci.yml` executa lint, tipos, testes, navegador e build com catálogo simulado em PR ou acionamento manual. Não publica o site nem usa segredos de produção. Resultado verde não substitui homologação financeira.

## Aceite no ambiente preparado

- Produto simples e variável: peso, desconto, estoque, quantidade, total, cupom, sacola persistente e duas abas. Faixas promocionais devem coincidir entre catálogo, PDP, recomendações e dados estruturados. Valores cobrados continuam definidos pelo WooCommerce.
- Frete: CEP atendido/não atendido, opções, prazo, quantidade e peso. Confirmar cálculo definitivo no checkout.
- Handoff: ir ao checkout, voltar, mudar quantidade e retornar; conferir itens e total sem reaproveitar sessão antiga indevidamente.
- Pagamentos em **homologação do gateway**: Pix, cartão aprovado/recusado, boleto, callback repetido, confirmação, e-mail e limpeza da sacola. Não colocar a loja ativa em modo teste. Nenhum pagamento foi efetuado nesta preparação.
- Imagens e conteúdo da home, produto, categorias e matérias em desktop/mobile. Uploads antigos `/wp-content/uploads/...` são encaminhados ao WordPress; outras rotas administrativas/API não são encaminhadas pelo frontend.
- SEO: `/tag/.../` e `/product-tag/.../`, paginação, canonical, sitemap e caminhos ausentes. Conferir campos personalizados de Rank Math com o responsável: frontend usa título/excerpt públicos, sem garantir paridade integral com o plugin. Conservar Search Console e integrações aprovadas sem scripts duplicados.

## Publicação — somente após autorização

1. Registrar commit validado, backup, variáveis e versão WordPress. Criar/conferir o deployment final sem trocar tráfego.
2. Associar domínio principal e `www` ao projeto correto na Vercel. Copiar os registros DNS exatos apresentados para essa conta; não presumir IP fixo. Usar canonical sem `www`.
3. Conferir HTTPS de ambas as origens e alterar os registros do frontend. Manter `checkout` no servidor WordPress.
4. Rodar `check:release -- --online --frontend https://medicinasagrada.com.br`, testar a jornada e conferir canonical/robots. Produção só é indexável com `NODE_ENV=production`, origem oficial e ambiente Vercel `production`; previews ficam noindex.
5. Conferir `/sitemap.xml`, Search Console e erros após a troca. Não remover proteções de preview para corrigir indexação de produção.

## Monitoramento e retorno

Configurar monitor externo para `GET /api/health/` a cada 5 minutos; ele mede apenas se o frontend responde. Complementar com consultas do catálogo, status do plugin e jornada em homologação. Acompanhar logs Vercel, WooCommerce/Pagar.me, frete, 429/5xx e tempo de resposta. Não registrar Cart-Token, cookies, senha ou URL contendo `session`.

Em falha crítica, voltar primeiro ao deployment anterior validado na Vercel. Se o problema for a separação das origens, restaurar o plano DNS/WordPress preparado para a janela, incluindo `home`/`siteurl`, e conferir redirecionamentos, SSL e callbacks. Não restaurar banco antigo sobre pedidos recebidos durante a transição. Manter WooCommerce como registro financeiro e reconciliar pedidos antes de recuperar banco.

Status automatizado cobre verificações técnicas; não libera sozinho a troca de DNS, homologação financeira ou decisões comerciais/de conteúdo do responsável.
