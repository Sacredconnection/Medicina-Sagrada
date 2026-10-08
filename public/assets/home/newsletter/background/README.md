# Fundos da newsletter

Coloque os dois arquivos finais nesta pasta, com exatamente estes nomes:

`public/assets/home/newsletter/background/`

| Versão | Nome do arquivo | Dimensões de exportação | Peso recomendado |
| --- | --- | --- | --- |
| Desktop | `medicina-sagrada-newsletter-background-desktop.webp` | **1920 × 600 px** | Até **400 KB** |
| Mobile | `medicina-sagrada-newsletter-background-mobile.webp` | **1080 × 1800 px** | Até **300 KB** |

Formato: **WebP sRGB com transparência (canal alpha)**. Exporte sem achatar sobre branco. A cor branca da seção permanece por baixo da imagem. Estes são tamanhos de produção definidos para os arquivos a fornecer; as imagens ainda não foram entregues e seus tamanhos reais não foram verificados.

## Composição e área segura

- A imagem fica no fundo de toda a seção, atrás do título, texto e formulário, sem receber eventos ou bloquear controles.
- Não inclua títulos, textos, botão ou campos dentro da arte: esses elementos já existem em HTML.
- Desktop: título, texto e formulário ficam empilhados na metade esquerda. Preserve essa área transparente ou de baixo contraste; a metade direita fica livre de conteúdo e pode receber a imagem principal.
- Mobile: composição vertical, com detalhes nas bordas, topo e base; mantenha a coluna central leve ou transparente para a leitura e o formulário empilhados.
- O CSS usa `background-size: cover` e centraliza a imagem, preservando a proporção. As bordas podem ser recortadas conforme largura e altura da seção, inclusive quando uma mensagem do formulário aumenta a altura.
- Mantenha elementos visuais importantes dentro dos **70% centrais** da arte. Nas telas intermediárias, o recorte poderá ser maior; evite informação essencial no fundo.
- A versão mobile entra em telas de **até 900px**, incluindo tablets estreitos. Acima de 900px, entra a versão desktop.

## Uso

Os caminhos já estão conectados ao CSS da newsletter. Depois de exportar e salvar com esses nomes, recarregue a home para visualizar. A ausência do arquivo mantém o fundo branco; cada versão é independente.

Guarde PSD, AI e demais editáveis fora de `public`. Em produção, arquivos novos ou substituídos exigem novo deploy. A preparação destes fundos não modifica a integração de cadastro da newsletter.
