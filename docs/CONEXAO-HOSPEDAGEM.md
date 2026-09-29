# Conexão com a hospedagem

Verificação em 29/09/2026. Este relatório descreve o acesso a partir do ambiente
de desenvolvimento; não comprova indisponibilidade para todos os visitantes.

## Resultado confirmado

| Camada | Evidência | Conclusão |
| --- | --- | --- |
| DNS principal e www | Resolução local para `187.33.241.43`; Google e Cloudflare concordam sobre o domínio principal | Não apareceu divergência do registro A |
| Servidores DNS | `ns1.target-tech.com.br` e `ns2.target-tech.com.br` | Pista do administrador do DNS; não confirma a empresa de hospedagem contratada |
| DNS reverso | `pro106.dnspro.com.br` | Identificador público do servidor para localizar a conta com o responsável |
| HTTP e HTTPS | Conexões TCP às portas 80 e 443 expiram em cerca de 12 segundos | A falha observada ocorre antes da requisição HTTP e da negociação TLS |
| Certificado HTTPS | Negociação TLS não alcançada | Validade do certificado não verificada; nenhum erro de certificado foi confirmado |
| Conectividade de controle | `https://example.com` e resolutores DNS por HTTPS respondem | Existe acesso externo neste ambiente; isso não descarta bloqueio local específico |
| Arquivo hosts | Nenhuma entrada para o domínio ou seu IP | Não foi encontrada substituição local nesse arquivo |
| WordPress e WooCommerce | Sem resposta às consultas atuais | Plugins, credenciais, WAF e cache ainda não puderam ser inspecionados |
| Futuro CMS | `cms.medicinasagrada.com.br` retorna NXDOMAIN | O subdomínio sugerido para a migração ainda não existe; o ambiente atual usa o domínio principal |

A ferramenta de pesquisa conseguiu recuperar o conteúdo público da home, mas
não os endpoints da API. Como essa recuperação pode usar conteúdo previamente
rastreado, ela não comprova disponibilidade em tempo real nem isola o bloqueio.
Não foi possível obter uma sessão administrativa acessível do WordPress ou da
hospedagem neste atendimento.

## Solução recomendada, em ordem

### 1. Isolar rede/IP e hospedagem

Abrir a home e `/wp-json/wc/store/v1/products?per_page=1` pelo celular usando
dados móveis, com Wi-Fi desligado. Comparar com a rede utilizada no computador.

- Se funcionar no celular e falhar na rede do computador: pedir ao responsável
  para consultar bloqueios do IP público de saída nos logs do firewall e na
  proteção contra abuso. Se confirmado um falso positivo, remover o bloqueio
  específico e corrigir a regra que o originou.
- Se falhar em redes independentes: verificar no servidor o serviço web, as
  portas 80/443, recursos, regras de rede e a rota de retorno.
- Se a home responder e só `/wp-json/` falhar: verificar os logs do WAF/ModSecurity
  e dos plugins de segurança para identificar a regra exata que afeta a API.
- Se o navegador do computador responder e somente o processo Next.js/Node
  falhar: comparar as saídas de rede, proxy e regras de proteção do ambiente de
  execução. Nesse caso, não atribuir automaticamente a falha à hospedagem.

Nenhuma regra de firewall, rota, DNS ou configuração de segurança foi alterada
sem diagnóstico confirmado. Aumentar o timeout do frontend não restabelece uma
conexão TCP que está sendo descartada.

### 2. Conferir a API após restabelecer o acesso

Executar na pasta do projeto:

```powershell
npm.cmd run check:connection
```

O comando usa `.env.local` e as variáveis do processo, verifica DNS, conexão TCP
e os endpoints públicos. Salva `artifacts/connection-report.json` sem chaves,
cookies, tokens ou corpos de respostas. Retorna código 1 enquanto houver falhas;
isso é o resultado do diagnóstico, não erro de execução. Uma consulta GET ao
carrinho pode abrir uma sessão anônima vazia; não adiciona itens nem cria pedidos.

O catálogo público da Store API não exige consumer key/secret. A API administrativa
WooCommerce usa outro fluxo de autenticação. A solução do timeout não depende de
criar novas chaves. [Documentação WooCommerce](https://developer.woocommerce.com/docs/apis/store-api/)

### 3. Revisar cache e plugin quando o painel estiver disponível

Confirmar se `medicina-sagrada-headless` está ativo. Se necessário, usar o ZIP
`artifacts/medicina-sagrada-headless.zip` conforme `docs/PAGAMENTOS.md`.

No LiteSpeed Cache, em **Cache → Excludes → Do Not Cache URIs**, conferir:

```text
^/cart/
^/checkout/
^/account/
^/wp-json/wc/store/
^/wp-json/ms-headless/
```

Em **Do Not Cache Query Strings**, incluir `session`. Após salvar as exclusões,
purgar o cache antigo das rotas afetadas e repetir o diagnóstico. Não excluir
tokens da chave do cache enquanto a resposta ainda puder ser armazenada.
O histórico do projeto registra cache HIT no carrinho; seu estado atual não pôde
ser verificado. As exclusões são uma revisão pendente, não a causa demonstrada
do timeout TCP. [Documentação LiteSpeed](https://docs.litespeedtech.com/lscache/lscwp/cache/#excludes-tab)

O carrinho precisa responder com `Cart-Token` e sem cache HIT. O comando só
informa a presença do token, sem revelar seu valor.
[Documentação Cart Tokens](https://developer.woocommerce.com/docs/apis/store-api/cart-tokens/)

### 4. Preparar a migração e o webhook

Antes de apontar o domínio principal ao Next.js, configurar uma origem HTTPS
para o WordPress, checkout e conta. `cms.medicinasagrada.com.br` é uma opção,
mas exige criação no DNS, virtual host/certificado e validação do WordPress;
criar apenas o registro DNS não conclui a migração.

Configurar `MS_HEADLESS_URL` e `MS_REVALIDATION_SECRET` no WordPress conforme
`docs/PAGAMENTOS.md`, com o mesmo segredo do Next.js no ambiente de destino.
Somente depois testar atualização de catálogo e pagamentos em homologação.

## Texto pronto para o responsável técnico

> Estamos integrando a vitrine Next.js ao WordPress/WooCommerce de
> medicinasagrada.com.br. Em 29/09/2026, por volta de 14h de Brasília, o DNS
> apontou para 187.33.241.43, mas as conexões TCP às portas 80 e 443 expiraram,
> sem chegar a HTTP/TLS, a partir do ambiente de desenvolvimento. DNS público
> consultado em Google e Cloudflare está consistente. Favor verificar serviço
> web, firewall, bloqueios por IP/antiabuso e rota de retorno. Precisamos confirmar
> acesso HTTPS ao domínio e às APIs `/wp-json/wp/v2/pages`,
> `/wp-json/wc/store/v1/products` e `/wp-json/wc/store/v1/cart`. Se houver falso
> positivo, corrigir apenas a regra responsável. Favor informar também qual
> painel/empresa administra a conta. Os nameservers são ns1.target-tech.com.br
> e ns2.target-tech.com.br; o reverso do IP é pro106.dnspro.com.br.

O texto acima foi apenas preparado; não foi enviado a terceiros.
