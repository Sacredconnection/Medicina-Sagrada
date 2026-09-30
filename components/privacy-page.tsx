import { RichText } from "@/components/rich-text";
import { PolicyLayout } from "@/components/policy-layout";

const legalSections = [
  { source: "ACEITAÇÃO DOS TERMOS E CONDIÇÕES DE USO", label: "Aceitação dos termos e condições de uso", id: "aceitacao-dos-termos" },
  { source: "UTILIZAÇÃO DO SITE", label: "Utilização do site", id: "utilizacao-do-site" },
  { source: "REGISTRO E DADOS PESSOAIS", label: "Registro e dados pessoais", id: "registro-e-dados-pessoais" },
  { source: "REGRAS DE CONDUTA DO USUÁRIO", label: "Regras de conduta do usuário", id: "regras-de-conduta" },
  { source: "DIREITOS DE PROPRIEDADE INTELECTUAL", label: "Direitos de propriedade intelectual", id: "propriedade-intelectual" },
  { source: "DENÚNCIA DE ABUSOS E VIOLAÇÃO", label: "Denúncia de abusos e violação", id: "denuncia-de-abusos" },
  { source: "RESPONSABILIDADES", label: "Responsabilidades", id: "responsabilidades" },
  { source: "LEGISLAÇÃO APLICÁVEL", label: "Legislação aplicável", id: "legislacao-aplicavel" },
] as const;

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function prepareLegalHtml(html: string) {
  let prepared = html.replace(/<h4\b[^>]*>[\s\S]*?<\/h4>/i, "");

  for (const section of legalSections) {
    const heading = new RegExp(
      `<p>\\s*(?:<span\\b[^>]*>)?\\s*<strong>\\s*${escapeRegExp(section.source)}\\s*<\\/strong>\\s*<br\\s*\\/?>`,
      "i",
    );
    prepared = prepared.replace(
      heading,
      `<h2 id="${section.id}">${section.label}</h2><p>`,
    );
  }

  prepared = prepared
    .replace(/<\/span>\s*<\/p>/gi, "</p>")
    .replace(/<br\s*\/?>/gi, "</p><p>")
    .replace(/<p>\s*<\/p>/gi, "");

  prepared = prepared.replace(
    /<p>\s*a\)([\s\S]*?)<\/p>\s*<p>\s*b\)([\s\S]*?)<\/p>\s*<p>\s*c\)([\s\S]*?)<\/p>\s*<p>\s*d\)([\s\S]*?)<\/p>\s*<p>\s*e\)([\s\S]*?)<\/p>\s*<p>\s*f\)([\s\S]*?)<\/p>/i,
    (_match, ...items: string[]) =>
      `<ol class="policy-alpha-list">${items.slice(0, 6).map((item, index) => `<li>${String.fromCharCode(97 + index)})${item}</li>`).join("")}</ol>`,
  );

  prepared = prepared.replace(
    /(<p>\s*O Usuário concorda que, ao usar o Site, não irá:<\/p>)\s*((?:<p>[\s\S]*?<\/p>\s*)+?)(?=<h2 id="propriedade-intelectual")/i,
    (_match, introduction: string, items: string) =>
      `${introduction}<ul class="policy-conduct-list">${items.replace(/<p>([\s\S]*?)<\/p>/gi, "<li>$1</li>")}</ul>`,
  );

  return prepared;
}

export function PrivacyPage({ html }: { html: string }) {
  return (
    <PolicyLayout
      title="Política de Privacidade"
      intro="Consulte os termos, responsabilidades e condições aplicáveis ao uso do site Medicina Sagrada."
      note="Navegue pelas seções ou leia o documento completo na sequência."
      sections={legalSections}
    >
      <RichText className="policy-content" html={prepareLegalHtml(html)} />
    </PolicyLayout>
  );
}
