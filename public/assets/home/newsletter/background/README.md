# Fundo desktop da newsletter

Coloque o arquivo final nesta pasta, com exatamente o nome indicado:

`public/assets/home/newsletter/background/`

| Versão | Nome do arquivo | Dimensões de exportação | Peso recomendado |
| --- | --- | --- | --- |
| Desktop | `medicina-sagrada-newsletter-background-desktop.webp` | **1920 × 600 px** | Até **400 KB** |

Formato: **WebP sRGB com transparência (canal alpha)**. Exporte sem achatar sobre branco. A cor branca da seção permanece por baixo da imagem. Dimensões e peso são referências de produção. No mobile, a newsletter usa somente fundo branco, texto e formulário, sem imagem ou área reservada.

## Composição e área segura

- Desktop: a imagem fica no fundo da seção, sem receber eventos ou bloquear controles.
- Não inclua títulos, textos, botão ou campos dentro da arte: esses elementos já existem em HTML.
- Desktop: título, texto e formulário ficam empilhados na metade esquerda. Preserve essa área transparente ou de baixo contraste; a metade direita fica livre de conteúdo e pode receber a imagem principal.
- Desktop usa `background-size: cover` e centraliza a imagem, preservando a proporção. As bordas podem ser recortadas conforme largura e altura da seção, inclusive quando uma mensagem do formulário aumenta a altura.
- No desktop, mantenha elementos visuais importantes dentro dos **70% centrais** da arte. Nas telas intermediárias, o recorte poderá ser maior; evite informação essencial no fundo.
- O fundo desktop aparece somente em telas **acima de 900px**. Até 900px, incluindo tablets estreitos, a imagem não é exibida nem solicitada pelo CSS.

## Uso

O caminho desktop já está conectado ao CSS da newsletter. Depois de exportar e salvar com esse nome, recarregue a home para visualizar. A ausência do arquivo mantém o fundo branco. A preparação da imagem mobile foi removida a pedido de Danilo.

Guarde PSD, AI e demais editáveis fora de `public`. Em produção, arquivos novos ou substituídos exigem novo deploy. A preparação destes fundos não modifica a integração de cadastro da newsletter.
