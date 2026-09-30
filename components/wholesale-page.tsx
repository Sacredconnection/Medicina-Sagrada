const wholesaleChannels = [
  {
    label: "WhatsApp",
    value: "(22) 99228-9365",
    action: "Abrir WhatsApp",
    href: "https://wa.me/5522992289365",
    external: true,
  },
  {
    label: "E-mail",
    value: "contato@medicinasagrada.com.br",
    action: "Enviar e-mail",
    href: "mailto:contato@medicinasagrada.com.br?subject=Atacado%20-%20Medicina%20Sagrada",
    external: false,
  },
] as const;

export function WholesalePage() {
  return (
    <>
      <header className="wholesale-hero">
        <h1>Atacado</h1>
        <div className="wholesale-hero-copy">
          <p>
            Nossos produtos estão disponíveis para venda em atacado. Fale com a
            nossa equipe para receber informações sobre valores e condições
            comerciais.
          </p>
          <p className="wholesale-hero-note">
            Para agilizar o atendimento, informe os produtos e as quantidades de interesse.
          </p>
        </div>
      </header>

      <section className="wholesale-contact" aria-labelledby="wholesale-contact-title">
        <div className="wholesale-contact-heading">
          <h2 id="wholesale-contact-title">Converse com nossa equipe</h2>
          <p>Escolha o canal mais conveniente para solicitar as condições de atacado.</p>
        </div>

        <div className="wholesale-contact-list">
          {wholesaleChannels.map((channel) => (
            <a
              className="wholesale-contact-row"
              href={channel.href}
              key={channel.label}
              {...(channel.external
                ? {
                    target: "_blank",
                    rel: "noopener noreferrer",
                    "aria-label": `${channel.action} em uma nova aba`,
                  }
                : {})}
            >
              <span className="wholesale-contact-copy">
                <span>{channel.label}</span>
                <strong>{channel.value}</strong>
              </span>
              <span className="wholesale-contact-action">{channel.action}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="wholesale-international" lang="en" aria-labelledby="wholesale-international-title">
        <div className="wholesale-international-heading">
          <h2 id="wholesale-international-title">Wholesale</h2>
          <p>
            Our products are available for wholesale. Contact our team for
            pricing and commercial terms.
          </p>
        </div>

        <div className="wholesale-international-content">
          <div>
            <h3>International orders</h3>
            <p>
              Some natural or plant-based products may be restricted in your
              country. You are responsible for confirming local import rules
              before ordering. Medicina Sagrada is not responsible for packages
              lost by the carrier or for products returned, seized, or destroyed
              due to customs regulations.
            </p>
          </div>

          <div>
            <h3>Partner stores</h3>
            <p>Customers in the USA and Europe can also consult our partner platforms.</p>
            <div className="wholesale-partner-links">
              <a href="http://sacredconnection.co" target="_blank" rel="noopener noreferrer">
                Sacred Connection · USA
              </a>
              <a href="http://mayaherbs.com" target="_blank" rel="noopener noreferrer">
                Maya Herbs · Europe
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
