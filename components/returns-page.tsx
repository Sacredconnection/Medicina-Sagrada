import { PolicyLayout } from "@/components/policy-layout";

const returnsSections = [
  { id: "como-solicitar", label: "Como solicitar" },
  { id: "devolucao-por-satisfacao", label: "Devolução por satisfação" },
  { id: "troca-por-tamanho", label: "Troca por tamanho" },
  { id: "defeito-de-fabricacao", label: "Defeito de fabricação" },
  { id: "ressarcimento", label: "Ressarcimento de valores" },
] as const;

export function ReturnsPage() {
  return (
    <PolicyLayout
      title="Trocas e devoluções"
      intro="Políticas de troca e devolução"
      sections={returnsSections}
    >
      <div className="rich-text policy-content returns-content">
        <section aria-labelledby="como-solicitar">
          <h2 id="como-solicitar">Como solicitar</h2>
          <p>
            Caso queira trocar ou devolver seu produto, você deve entrar em contato com a
            nossa Central de Atendimento pelo telefone{" "}
            <a href="https://wa.me/5522992289365" target="_blank" rel="noopener noreferrer">
              (22) 99228-9365
            </a>, ou relatar o ocorrido em nosso e-mail:
            <a href="mailto:contato@medicinasagrada.com.br?subject=Troca%20ou%20devolução%20-%20Medicina%20Sagrada">
              contato@medicinasagrada.com.br
            </a>
          </p>
        </section>

        <section aria-labelledby="devolucao-por-satisfacao">
          <h2 id="devolucao-por-satisfacao">Devolução por satisfação</h2>
          <p>
            Em caso de devolução por garantia de satisfação, você terá 7 dias
            corridos a partir do dia do recebimento para desistir do seu produto.
          </p>
          <ul>
            <li>Embalagem original;</li>
            <li>Não apresentar indícios de uso ou consumo;</li>
            <li>Sem riscos ou rasgos na embalagem;</li>
            <li>Acompanhado de todos os acessórios;</li>
            <li>Se for item de consumo, deve estar intacto, sem ter sido consumido;</li>
            <li>O frete de envio ficará por conta do comprador.</li>
          </ul>
        </section>

        <section aria-labelledby="troca-por-tamanho">
          <h2 id="troca-por-tamanho">Troca por tamanho</h2>
          <p>
            Se o tamanho solicitado não corresponder à sua necessidade, você deverá entrar em
            contato conosco nas primeiras 48 horas após o recebimento para
            acionar o procedimento de troca. As despesas de frete de ida e volta
            também ficarão por conta do comprador.
          </p>
        </section>

        <section aria-labelledby="defeito-de-fabricacao">
          <h2 id="defeito-de-fabricacao">Defeito de fabricação</h2>
          <p>
            Em casos de defeito de fabricação nos primeiros 90 dias a partir da
            data de recebimento (Código de Defesa do Consumidor, Artigo 26):
          </p>
          <ul>
            <li>Em todos os casos, o produto deverá estar com todos os acessórios, em embalagem original e bem embalado.</li>
            <li>Caso possa vir pelos Correios, será enviada uma autorização por e-mail para que o cliente não tenha despesas com o envio;</li>
            <li>O produto, tendo retornado para a empresa, será verificado pelo setor técnico para ser encaminhado para a assistência ou troca. O prazo solicitado para reparo é de 30 dias.</li>
            <li>Não aceitaremos produtos sem a embalagem original ou se a mesma chegar danificada, sem acessórios, ou com indícios de mau uso. O produto será devolvido ao comprador mediante pagamento de frete.</li>
          </ul>
        </section>

        <section aria-labelledby="ressarcimento">
          <h2 id="ressarcimento">Ressarcimento de valores de produtos trocados:</h2>
          <ul>
            <li>Cartão de crédito: o prazo de devolução de valores obedece às regras da operadora do cartão. Encaminharemos a solicitação de estorno à administradora do cartão de crédito, podendo levar até duas faturas para retornar o crédito ao cliente;</li>
            <li>Em qualquer caso de devolução, será feita a restituição do valor após passar por uma série de análises técnicas do produto;</li>
            <li>Caso seja constatada má-fé do requerente, as devidas medidas serão tomadas no âmbito cível e criminal.</li>
          </ul>
        </section>
      </div>
    </PolicyLayout>
  );
}
