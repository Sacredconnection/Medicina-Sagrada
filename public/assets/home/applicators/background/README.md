# Fundo da seção Acessórios

Exporte as versões em WebP sRGB usando exatamente estes nomes:

- `medicina-sagrada-acessorios-background-desktop.webp` — 2400 × 1200 px, com transparência (canal alpha)
- `medicina-sagrada-acessorios-background-mobile.webp` — 1200 × 1800 px, com transparência (canal alpha)

Os arquivos devem ser salvos nesta mesma pasta:

`public/assets/home/applicators/background/`

A imagem cobre toda a seção com `background-size: cover` e acompanha a rolagem normal da página. Exporte ambos os WebPs preservando o canal alpha, sem achatar a arte sobre um fundo branco. O branco atual permanece por baixo da transparência e também funciona como cor de segurança enquanto o arquivo ainda não existir ou estiver carregando.

Os arquivos são independentes: desktop acima de 800 px de largura e mobile até 800 px (incluindo tablets estreitos). Não inclua textos ou os cards de produtos na arte; eles já fazem parte da página. Use os nomes exatamente em minúsculas, inclusive a extensão `.webp`, para funcionar também na Vercel.

## Área segura

- Desktop: concentre os elementos decorativos nas bordas e mantenha a área atrás do texto à esquerda leve ou transparente; o mosaico à direita encobre parte do fundo.
- Mobile: considere o recorte vertical, distribua a composição por toda a altura e mantenha a informação visual importante nos 70% centrais.
- Prefira uma composição com contraste discreto atrás dos textos e dos cards para preservar a leitura.
- Peso recomendado: até 700 KB no desktop e até 500 KB no mobile.

Depois de substituir os arquivos mantendo esses nomes, não será necessário alterar o código.
