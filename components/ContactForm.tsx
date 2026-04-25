"use client";

import { useState } from "react";
import { pt } from "@/lib/translations";

export default function ContactForm() {
  const [status, setStatus] = useState<"" | "loading" | "success" | "error">("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (!res.ok) {
      setStatus("error");
      setError(data.error || pt.contact.fallback);
      return;
    }

    setStatus("success");
    form.reset();
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <div className="card-body form-grid">
        <input name="name" placeholder={pt.contact.name} required />
        <input name="email" type="email" placeholder={pt.contact.email} required />
        <input name="subject" placeholder={pt.contact.subject} className="span-2" />
        <textarea name="message" placeholder={pt.contact.message} className="span-2 textarea" required />
        <button className="btn span-2" disabled={status === "loading"}>{status === "loading" ? pt.common.loading : pt.contact.send}</button>
        {status === "success" ? <p className="success-text span-2">{pt.contact.success}</p> : null}
        {status === "error" ? <p className="error-text span-2">{error}</p> : null}
      </div>
    </form>
  );
}
