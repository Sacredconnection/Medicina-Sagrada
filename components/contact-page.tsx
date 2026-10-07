import Link from "next/link";
import Image from "next/image";
import { config } from "@/lib/config";

type ContactIconName = "email" | "whatsapp" | "clock";

function ContactIcon({ name }: { name: ContactIconName }) {
  return (
    <svg className="contact-page-icon" viewBox="0 0 24 24" aria-hidden="true">
      {name === "email" ? (
        <>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m4 7 8 6 8-6" />
        </>
      ) : name === "clock" ? (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </>
      ) : (
        <>
          <path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3.5 20.5l1.4-4.3A8.5 8.5 0 1 1 20.5 11.6Z" />
          <path d="M8.3 7.7c.2-.4.4-.4.7-.4h.5c.2 0 .4 0 .6.5l.8 1.8c.1.3.1.5-.1.7l-.6.8c-.2.2-.2.4 0 .7.7 1.2 1.7 2.2 3 2.8.3.2.5.1.7-.1l.9-1.1c.2-.3.5-.3.7-.2l1.9.9c.3.1.5.3.5.5 0 .4-.2 1.5-1 2.1-.6.5-1.4.8-2.3.7-1-.1-2.3-.5-4-2-2.1-1.8-3.4-4-3.5-5.6 0-.8.3-1.5.7-2.1Z" />
        </>
      )}
    </svg>
  );
}

const contactChannels = [
  {
    label: "WhatsApp",
    value: "(22) 99228-9365",
    action: "Abrir WhatsApp",
    href: "https://wa.me/5522992289365",
    icon: "whatsapp",
    external: true,
  },
  {
    label: "E-mail",
    value: "contato@medicinasagrada.com.br",
    action: "Enviar e-mail",
    href: "mailto:contato@medicinasagrada.com.br?subject=Atendimento%20-%20Medicina%20Sagrada",
    icon: "email",
    external: false,
  },
] as const;

export function ContactPage() {
  return (
    <>
      <header className="contact-hero">
        <div className="contact-hero-copy">
          <h1>Fale com a gente.</h1>
          <p>
            Escolha o canal mais conveniente para falar com a Medicina Sagrada.
            Se a dúvida for sobre uma compra, tenha o número do pedido em mãos.
          </p>
        </div>
        <p className="contact-hero-note">
          Atendimento de segunda a sexta, em horários informados abaixo.
        </p>
      </header>

      <div className="contact-layout">
        <aside className="contact-hours" aria-labelledby="contact-hours-title">
          <h2 id="contact-hours-title">Horários de atendimento</h2>
          <dl>
            <div>
              <dt>Segunda a quinta</dt>
              <dd><ContactIcon name="clock" /><span>8h às 17h</span></dd>
            </div>
            <div>
              <dt>Sexta-feira</dt>
              <dd><ContactIcon name="clock" /><span>8h às 14h30</span></dd>
            </div>
          </dl>
          <p>Você pode deixar sua mensagem pelo canal que preferir.</p>
        </aside>

        <section className="contact-channels" aria-labelledby="contact-channels-title">
          <div className="contact-section-heading">
            <div>
              <h2 id="contact-channels-title">Escolha um canal</h2>
              <p>WhatsApp para conversar pelo celular ou e-mail para escrever com mais detalhes.</p>
            </div>
            <Image
              className="contact-conversation-symbol"
              src="/assets/contato/simbolo-contato.svg?v=20261007"
              alt=""
              width={128}
              height={128}
              unoptimized
            />
          </div>

          <div className="contact-channel-list">
            {contactChannels.map((channel) => (
              <a
                className="contact-channel"
                href={channel.href}
                key={channel.label}
                {...(channel.external
                  ? {
                      target: "_blank",
                      rel: "noopener noreferrer",
                      "aria-label": `${channel.action} no ${channel.label} em uma nova aba`,
                    }
                  : {})}
              >
                <span className="contact-channel-icon-wrap">
                  <ContactIcon name={channel.icon} />
                </span>
                <span className="contact-channel-copy">
                  <span>{channel.label}</span>
                  <strong>{channel.value}</strong>
                </span>
                <span className="contact-channel-action">
                  {channel.action}
                </span>
              </a>
            ))}
          </div>
        </section>
      </div>

      <section className="contact-self-service" aria-labelledby="contact-self-service-title">
        <div>
          <h2 id="contact-self-service-title">Precisa consultar algo agora?</h2>
          <p>Algumas informações ficam disponíveis sem esperar pelo atendimento.</p>
        </div>
        <nav className="contact-shortcuts" aria-label="Atalhos de atendimento">
          <a href={config.wooAccountUrl}>
            <span>
              <strong>Acompanhar pedidos</strong>
              <small>Acessar minha conta</small>
            </span>
            <span className="contact-shortcut-action">Acessar</span>
          </a>
          <Link href="/refund_returns/">
            <span>
              <strong>Trocas e devoluções</strong>
              <small>Ver orientações</small>
            </span>
            <span className="contact-shortcut-action">Consultar</span>
          </Link>
        </nav>
      </section>
    </>
  );
}
