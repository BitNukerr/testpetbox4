import { NextRequest, NextResponse } from "next/server";

const EMAIL_RE = /^\S+@\S+\.\S+$/;

function clean(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = clean(body.name, 80);
    const email = clean(body.email, 160);
    const subject = clean(body.subject, 120);
    const message = clean(body.message, 3000);
    const website = clean(body.website, 200);

    if (website) {
      return NextResponse.json({ ok: true });
    }

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Preencha todos os campos." }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Escreva um email valido." }, { status: 400 });
    }
    if (message.length < 10) {
      return NextResponse.json({ error: "Escreva uma mensagem um pouco mais completa." }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.CONTACT_FROM_EMAIL || "PetBox <onboarding@resend.dev>";
    const to = process.env.CONTACT_TO_EMAIL;

    if (!apiKey || !to) {
      return NextResponse.json({ error: "Faltam as variáveis RESEND_API_KEY ou CONTACT_TO_EMAIL no Vercel." }, { status: 500 });
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to,
        subject: `PetBox: ${subject}`,
        reply_to: email,
        text: `Nome: ${name}\nEmail: ${email}\n\n${message}`
      })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      return NextResponse.json({ error: data?.message || "Não foi possível enviar a mensagem." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Não foi possível enviar a mensagem." }, { status: 500 });
  }
}
