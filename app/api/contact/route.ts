import { NextRequest, NextResponse } from "next/server";

const CONTACT_TO_EMAIL = "rodrigoleite.96@gmail.com";

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Nome, email e mensagem são obrigatórios." }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.CONTACT_FROM_EMAIL || "PetBox <onboarding@resend.dev>";

    if (!apiKey) {
      return NextResponse.json({ error: "Falta configurar RESEND_API_KEY no Vercel." }, { status: 500 });
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: CONTACT_TO_EMAIL,
        reply_to: email,
        subject: subject || "Nova mensagem PetBox",
        text: `Nome: ${name}
Email: ${email}

Mensagem:
${message}`
      })
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json({ error: text || "Falha ao enviar email." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro inesperado no envio." }, { status: 500 });
  }
}
