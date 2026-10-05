type ContactIconName = "email" | "instagram" | "whatsapp" | "youtube";

function ContactIcon({ name }: { name: ContactIconName }) {
  const paths: Record<ContactIconName, React.ReactNode> = {
    email: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m4 7 8 6 8-6" />
      </>
    ),
    instagram: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <path d="M17.5 6.5h.01" />
      </>
    ),
    whatsapp: (
      <>
        <path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3.5 20.5l1.4-4.3A8.5 8.5 0 1 1 20.5 11.6Z" />
        <path d="M8.3 7.7c.2-.4.4-.4.7-.4h.5c.2 0 .4 0 .6.5l.8 1.8c.1.3.1.5-.1.7l-.6.8c-.2.2-.2.4 0 .7.7 1.2 1.7 2.2 3 2.8.3.2.5.1.7-.1l.9-1.1c.2-.3.5-.3.7-.2l1.9.9c.3.1.5.3.5.5 0 .4-.2 1.5-1 2.1-.6.5-1.4.8-2.3.7-1-.1-2.3-.5-4-2-2.1-1.8-3.4-4-3.5-5.6 0-.8.3-1.5.7-2.1Z" />
      </>
    ),
    youtube: (
      <>
        <path d="M21 12s0-3-.4-4.4c-.2-.8-.8-1.4-1.6-1.6-1.4-.4-7-.4-7-.4s-5.6 0-7 .4c-.8.2-1.4.8-1.6 1.6C3 9 3 12 3 12s0 3 .4 4.4c.2.8.8 1.4 1.6 1.6 1.4.4 7 .4 7 .4s5.6 0 7-.4c.8-.2 1.4-.8 1.6-1.6C21 15 21 12 21 12Z" />
        <path d="m10 15 5-3-5-3v6Z" />
      </>
    ),
  };

  return (
    <svg className="about-contact-icon" viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

const contactLinks = [
  {
    label: "E-mail",
    value: "contato@medicinasagrada.com.br",
    href: "mailto:contato@medicinasagrada.com.br",
    icon: "email",
    external: false,
  },
  {
    label: "WhatsApp",
    value: "(22) 99228-9365",
    href: "https://wa.me/5522992289365",
    icon: "whatsapp",
    external: true,
  },
  {
    label: "Instagram",
    value: "@medicinasagradabr",
    href: "https://www.instagram.com/medicinasagradabr/",
    icon: "instagram",
    external: true,
  },
  {
    label: "YouTube",
    value: "@medicinasagradabr",
    href: "https://www.youtube.com/@medicinasagradabr",
    icon: "youtube",
    external: true,
  },
] as const;

export function AboutContactSection() {
  return (
    <section className="about-connect" aria-labelledby="about-connect-title">
      <div className="about-connect-intro">
        <h2 id="about-connect-title">Vamos manter contato</h2>
        <p>
          Fale com a Medicina Sagrada ou acompanhe nossos conteúdos e caminhos
          pelas redes sociais.
        </p>
      </div>

      <div className="about-contact-list">
        {contactLinks.map((link) => (
          <a
            className="about-contact-link"
            href={link.href}
            key={link.label}
            {...(link.external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            <span className="about-contact-icon-wrap">
              <ContactIcon name={link.icon} />
            </span>
            <span className="about-contact-copy">
              <span className="about-contact-label">{link.label}</span>
              <strong>
                {link.icon === "email" ? (
                  <>{link.value.split("@")[0]}@<wbr />{link.value.split("@")[1]}</>
                ) : link.value}
              </strong>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
