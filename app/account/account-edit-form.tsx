"use client";

import { useActionState } from "react";
import { saveAccount } from "./actions";
import styles from "./account.module.css";

const fields = [
  ["first_name","Nome"], ["last_name","Sobrenome"], ["company","Empresa"], ["address_1","Rua e número"],
  ["address_2","Complemento"], ["city","Cidade"], ["state","Estado (sigla)"], ["postcode","CEP"], ["country","País (sigla)"],
];

export function AccountEditForm({ section, initialValues }: {
  section: "details" | "billing" | "shipping";
  initialValues: Record<string, string>;
}) {
  const [state, action, pending] = useActionState(saveAccount, null);
  const values = state?.values ?? initialValues;

  return <form action={action} className={styles.editForm} aria-busy={pending}>
    <input type="hidden" name="section" value={section} />
    {section === "details" ? <>
      <label>Nome de exibição<input name="name" defaultValue={values.name} required readOnly={pending} /></label>
      <label>E-mail<input type="email" name="email" defaultValue={values.email} required readOnly={pending} /></label>
      <label>Senha atual (para alterar e-mail ou senha)<input type="password" autoComplete="current-password" name="password" readOnly={pending} /></label>
      <label>Nova senha (opcional, mínimo de 12 caracteres)<input type="password" autoComplete="new-password" minLength={12} name="new_password" readOnly={pending} /></label>
    </> : fields.map(([key, label]) => <label key={key}>{label}
      <input name={key} defaultValue={values[key] ?? ""} required={["country", "city", "address_1"].includes(key)} readOnly={pending} />
    </label>)}
    {state && <p role={state.ok ? "status" : "alert"}>{state.message}</p>}
    <button className={styles.exit} disabled={pending}>{pending ? "Salvando…" : section === "details" ? "Salvar alterações" : "Salvar endereço"}</button>
  </form>;
}
