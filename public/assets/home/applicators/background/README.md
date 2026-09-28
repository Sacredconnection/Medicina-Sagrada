# Fundo da seção Acessórios

Exporte as versões em WebP sRGB usando exatamente estes nomes:

- `medicina-sagrada-acessorios-background-desktop.webp` — 2400 × 1200 px
- `medicina-sagrada-acessorios-background-mobile.webp` — 1200 × 1800 px, com transparência (canal alpha)

Os arquivos devem ser salvos nesta mesma pasta:

`public/assets/home/applicators/background/`

A imagem cobre toda a seção com `background-size: cover` e acompanha a rolagem normal da página. No mobile, exporte o WebP preservando o canal alpha, sem achatar a arte sobre um fundo branco. O branco atual permanece por baixo da transparência e também funciona como cor de segurança enquanto o arquivo ainda não existir ou estiver carregando.

## Área segura

- Desktop: mantenha detalhes essenciais fora das áreas ocupadas pelo texto à esquerda e pelo mosaico de cards à direita.
- Mobile: considere o recorte vertical, distribua a composição por toda a altura e mantenha a informação visual importante nos 70% centrais.
- Prefira uma composição com contraste discreto atrás dos textos e dos cards para preservar a leitura.
- Peso recomendado: até 700 KB no desktop e até 500 KB no mobile.

Depois de substituir os arquivos mantendo esses nomes, não será necessário alterar o código.
