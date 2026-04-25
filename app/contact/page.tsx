"use client";

import { useState } from "react";

export default function ContactPage() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("");
    const form = new FormData(event.currentTarget);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries()))
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    setStatus(res.ok ? "Mensagem enviada com sucesso." : data.error || "Não foi possível enviar a mensagem.");
  }

  return (
    <section className="container section narrow">
      <span className="eyebrow">Contacto</span>
      <h1>Fale com a equipa PetBox</h1>
      <p className="muted">Envie uma mensagem e ela será encaminhada para o email do projecto.</p>
      <div className="card">
        <form className="card-body form-grid" onSubmit={submit}>
          <input name="name" placeholder="O seu nome" required />
          <input name="email" type="email" placeholder="Email" required />
          <input name="subject" placeholder="Assunto" className="span-2" required />
          <textarea name="message" placeholder="Como podemos ajudar?" className="span-2 textarea" required />
          <button className="btn span-2" disabled={loading}>{loading ? "A enviar..." : "Enviar mensagem"}</button>
          {status ? <p className="success-text span-2">{status}</p> : null}
        </form>
      </div>
    </section>
  );
}
