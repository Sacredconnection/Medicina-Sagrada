type BenefitIconName = "delivery" | "partnership" | "secure" | "support";

const benefits: Array<{ icon: BenefitIconName; title: string; detail: string }> = [
  {
    icon: "delivery",
    title: "Envio para todo o Brasil",
    detail: "Receba seu pedido com cuidado",
  },
  {
    icon: "partnership",
    title: "Parcerias responsáveis",
    detail: "Relações que valorizam a origem",
  },
  {
    icon: "secure",
    title: "Compra segura",
    detail: "Pagamento protegido no checkout",
  },
  {
    icon: "support",
    title: "Atendimento próximo",
    detail: "Estamos aqui para ajudar",
  },
];

function BenefitIcon({ name }: { name: BenefitIconName }) {
  return (
    <svg className="benefit-icon" aria-hidden="true" viewBox="0 0 24 24">
      {name === "delivery" && (
        <>
          <path d="M3 6.5h11v10H3z" />
          <path d="M14 10h3.2l3.3 3.5v3H14zM6.5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17.5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
        </>
      )}
      {name === "partnership" && (
        <>
          <circle cx="8" cy="8" r="2.5" />
          <circle cx="16" cy="8" r="2.5" />
          <path d="M3.5 18c.4-3 2-4.5 4.5-4.5s4.1 1.5 4.5 4.5M11.5 18c.4-3 2-4.5 4.5-4.5s4.1 1.5 4.5 4.5" />
        </>
      )}
      {name === "secure" && (
        <>
          <path d="M12 3.5 19 6v5.2c0 4.3-2.6 7.7-7 9.3-4.4-1.6-7-5-7-9.3V6z" />
          <path d="m8.8 11.8 2.1 2.1 4.4-4.5" />
        </>
      )}
      {name === "support" && (
        <>
          <path d="M4.5 13v-1a7.5 7.5 0 0 1 15 0v1" />
          <path d="M4.5 12.5h2.8v5H5.5a1 1 0 0 1-1-1zM19.5 12.5h-2.8v5h1.8a1 1 0 0 0 1-1zM16.7 17.5c-.6 1.8-2 2.5-4.2 2.5" />
        </>
      )}
    </svg>
  );
}

export function BenefitsStrip() {
  return (
    <section className="benefits-strip" aria-label="Benefícios da loja">
      <div className="container benefits-grid">
        {benefits.map((benefit) => (
          <div className="benefit-item" key={benefit.title}>
            <BenefitIcon name={benefit.icon} />
            <div className="benefit-copy">
              <strong>{benefit.title}</strong>
              <span>{benefit.detail}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
