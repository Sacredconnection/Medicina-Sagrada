import { saveAccount } from "./actions";
import styles from "./account.module.css";

export type AccountProfile = {
  name: string; email: string;
  orders: { id: string; status: string; total: string; date?: string; payment?: string; items?: { name: string; quantity: number; amount: string }[] }[];
  addresses?: Record<string, Record<string, string>>;
  downloads?: { name: string; url: string }[];
  payments?: string[];
  sections?: string[];
};
const tabs = [
  ["dashboard", "dashboard", "Painel"], ["orders", "orders", "Pedidos"],
  ["downloads", "downloads", "Downloads"], ["addresses", "edit-address", "Endereços"],
  ["payments", "payment-methods", "Formas de pagamento"], ["details", "edit-account", "Detalhes da conta"],
];
const fields = [
  ["first_name","Nome"], ["last_name","Sobrenome"], ["company","Empresa"], ["address_1","Rua e número"],
  ["address_2","Complemento"], ["city","Cidade"], ["state","Estado (sigla)"], ["postcode","CEP"], ["country","País (sigla)"],
];
export function CustomerArea({ profile, tab, saved, order }: { profile: AccountProfile; tab?: string; saved?: string; order?: string }) {
  const available = tabs.filter(([, endpoint]) => !profile.sections || profile.sections.includes(endpoint));
  const active = available.find(([id]) => id === tab) ?? available[0] ?? tabs[0];
  const selected = profile.orders.find(item => String(item.id) === order);
  return <div className={styles.customerArea}>
    <nav className={styles.accountNav} aria-label="Minha conta">{available.map(([id,,label]) =>
      <a key={id} href={"/account/?tab=" + id} aria-current={id === active[0] ? "page" : undefined}>{label}</a>
    )}</nav>
    <section className={styles.panel}>
      <h2>{active[2]}</h2>
      {saved === "1" && <p role="status">Alterações salvas.</p>}
      {saved === "0" && <p role="alert">Confira os dados e tente salvar novamente.</p>}
      {active[0] === "dashboard" && <div className={styles.sectionBody}><strong>Olá, {profile.name}.</strong><p>{profile.email}</p><a href="/account/?tab=orders">Ver meus pedidos</a></div>}
      {active[0] === "orders" && order && <div className={styles.sectionBody}>
        <a href="/account/?tab=orders">Voltar aos pedidos</a>
        {selected?.items ? <>
          <h3>Pedido #{selected.id}</h3><p>{selected.date} ? {selected.status}</p>
          <table><thead><tr><th>Produto</th><th>Qtd.</th><th>Subtotal</th></tr></thead>
            <tbody>{selected.items.map((item,i) => <tr key={i}><td>{item.name}</td><td>{item.quantity}</td><td>{item.amount}</td></tr>)}</tbody></table>
          {selected.payment && <p>Pagamento: {selected.payment}</p>}<strong>Total: {selected.total}</strong>
        </> : <p>Detalhes do pedido indispon?veis.</p>}
      </div>}
      {active[0] === "orders" && !order && (profile.orders.length ? <table><caption>Últimos pedidos</caption><thead><tr><th>Pedido</th><th>Situação</th><th>Total</th></tr></thead>
        <tbody>{profile.orders.map(o => <tr key={o.id}><th scope="row"><a className={styles.orderLink} href={"/account/?tab=orders&order=" + encodeURIComponent(o.id)} aria-label={"Ver detalhes do pedido " + o.id}>#{o.id}</a></th><td><span className={styles.status}>{o.status}</span></td><td>{o.total}</td></tr>)}</tbody></table> : <p>Você ainda não tem pedidos.</p>)}
      {active[0] === "downloads" && <div className={styles.sectionBody}>{profile.downloads?.length ? <ul>{profile.downloads.map(d => <li key={d.url}><a href={d.url}>{d.name}</a></li>)}</ul> : "Nenhum download disponível."}</div>}
      {active[0] === "payments" && <div className={styles.sectionBody}>{profile.payments?.length ? <ul>{profile.payments.map((p,i) => <li key={i}>{p}</li>)}</ul> : "Nenhuma forma de pagamento salva."}</div>}
      {active[0] === "addresses" && <div className={styles.sectionBody}>{["billing","shipping"].map(type =>
        <details key={type} className={styles.address}><summary>{type === "billing" ? "Endereço de cobrança" : "Endereço de entrega"}</summary>
          <form className={styles.editForm} action={saveAccount}><input type="hidden" name="section" value={type}/>
          {fields.map(([key,label]) => <label key={key}>{label}<input required={["country","city","address_1"].includes(key)} name={key} defaultValue={profile.addresses?.[type]?.[key] ?? ""}/></label>)}
          <button className={styles.exit}>Salvar endereço</button></form>
        </details>)}</div>}
      {active[0] === "details" && <form action={saveAccount} className={styles.editForm}><input type="hidden" name="section" value="details"/>
        <label>Nome de exibição<input name="name" defaultValue={profile.name} required/></label>
        <label>E-mail<input type="email" name="email" defaultValue={profile.email} required/></label>
        <label>Senha atual (para alterar e-mail ou senha)<input type="password" autoComplete="current-password" name="password"/></label>
        <label>Nova senha (opcional, mínimo de 12 caracteres)<input type="password" autoComplete="new-password" minLength={12} name="new_password"/></label>
        <button className={styles.exit}>Salvar alterações</button></form>}
    </section>
  </div>;
}
