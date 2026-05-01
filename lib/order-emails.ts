import { money } from "@/lib/helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type OrderEmailData = {
  id: string;
  user_id: string | null;
  title: string;
  status: string;
  total: number | string;
  payment_method: string | null;
  created_at: string;
  confirmation_email_sent_at?: string | null;
};

type OrderItem = {
  title: string;
  quantity: number;
  unit_price: number | string;
};

type DeliveryDetails = {
  full_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  zip: string | null;
  nif: string | null;
  notes: string | null;
};

type Profile = {
  email: string | null;
  full_name: string | null;
  phone: string | null;
};

function clean(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function line(label: string, value: string) {
  return value ? `${label}: ${value}` : "";
}

function itemsText(items: OrderItem[]) {
  return items.map((item) => `${item.quantity}x ${item.title} - ${money(Number(item.unit_price || 0) * Number(item.quantity || 1))}`).join("\n");
}

function itemsHtml(items: OrderItem[]) {
  return items
    .map((item) => `<li>${escapeHtml(String(item.quantity))}x ${escapeHtml(item.title)} - <strong>${escapeHtml(money(Number(item.unit_price || 0) * Number(item.quantity || 1)))}</strong></li>`)
    .join("");
}

async function sendResendEmail(params: {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: params.from,
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html,
      reply_to: params.replyTo
    })
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || "Nao foi possivel enviar email Resend.");
  }
}

async function getOrder(orderId: string) {
  const admin = getSupabaseAdmin();
  if (!admin) return { admin: null, order: null, supportsEmailMarker: false };

  const columns = "id,user_id,title,status,total,payment_method,created_at,confirmation_email_sent_at";
  const result = await admin.from("orders").select(columns).eq("id", orderId).maybeSingle();

  if (!result.error) {
    return { admin, order: result.data as OrderEmailData | null, supportsEmailMarker: true };
  }

  if (!result.error.message.includes("confirmation_email_sent_at")) {
    console.error("Erro ao ler encomenda para email:", result.error);
    return { admin, order: null, supportsEmailMarker: false };
  }

  const fallback = await admin
    .from("orders")
    .select("id,user_id,title,status,total,payment_method,created_at")
    .eq("id", orderId)
    .maybeSingle();

  if (fallback.error) {
    console.error("Erro ao ler encomenda para email:", fallback.error);
    return { admin, order: null, supportsEmailMarker: false };
  }

  return { admin, order: fallback.data as OrderEmailData | null, supportsEmailMarker: false };
}

export async function sendOrderConfirmationEmails(orderId: string) {
  let claimedEmailMarker = false;
  let markerClient: Awaited<ReturnType<typeof getOrder>>["admin"] = null;
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.CONTACT_FROM_EMAIL || "PetBox <onboarding@resend.dev>";
    const adminTo = process.env.ORDER_NOTIFICATION_EMAIL || process.env.CONTACT_TO_EMAIL;

    if (!apiKey) {
      console.warn("RESEND_API_KEY em falta. Emails de encomenda nao enviados.");
      return;
    }

    const { admin, order, supportsEmailMarker } = await getOrder(orderId);
    if (!admin || !order) return;
    markerClient = admin;
    if (order.confirmation_email_sent_at) return;

    const [{ data: items, error: itemsError }, deliveryResult, profileResult] = await Promise.all([
      admin.from("order_items").select("title,quantity,unit_price").eq("order_id", orderId),
      admin.from("order_delivery_details").select("full_name,email,phone,address,city,zip,nif,notes").eq("order_id", orderId).maybeSingle(),
      order.user_id
        ? admin.from("profiles").select("email,full_name,phone").eq("user_id", order.user_id).maybeSingle()
        : Promise.resolve({ data: null, error: null })
    ]);

    if (itemsError) {
      console.error("Erro ao ler artigos para email:", itemsError);
      return;
    }

    const delivery = (deliveryResult.error ? null : deliveryResult.data) as DeliveryDetails | null;
    const profile = (profileResult.error ? null : profileResult.data) as Profile | null;
    const customerEmail = clean(delivery?.email, clean(profile?.email));

    if (!adminTo && !customerEmail) {
      console.warn("Sem destinatarios para email de encomenda.");
      return;
    }

    if (supportsEmailMarker) {
      const { data: claimed, error: claimError } = await admin
        .from("orders")
        .update({ confirmation_email_sent_at: new Date().toISOString() })
        .eq("id", orderId)
        .is("confirmation_email_sent_at", null)
        .select("id")
        .maybeSingle();

      if (claimError) {
        console.error("Erro ao marcar email de encomenda:", claimError);
        return;
      }
      if (!claimed) return;
      claimedEmailMarker = true;
    }

    const orderItems = (items || []) as OrderItem[];
    const customerName = clean(delivery?.full_name, clean(profile?.full_name, "Cliente PetBox"));
    const phone = clean(delivery?.phone, clean(profile?.phone));
    const address = [delivery?.address, [delivery?.zip, delivery?.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");
    const total = money(Number(order.total || 0));
    const itemListText = itemsText(orderItems) || "Artigos PetBox";
    const itemListHtml = itemsHtml(orderItems) || "<li>Artigos PetBox</li>";
    const deliveryText = [
      line("Nome", customerName),
      line("Email", customerEmail),
      line("Telefone", phone),
      line("Morada", address),
      line("NIF", clean(delivery?.nif)),
      line("Notas", clean(delivery?.notes))
    ].filter(Boolean).join("\n");

    const customerText = [
      `Ola ${customerName},`,
      "",
      `Recebemos a sua encomenda ${order.id} e o pagamento foi confirmado.`,
      "",
      itemListText,
      "",
      `Total: ${total}`,
      "",
      "Vamos preparar a sua PetBox e avisar quando houver novidades."
    ].join("\n");

    const customerHtml = `
      <div style="font-family:Arial,sans-serif;color:#172117;line-height:1.55">
        <h1 style="color:#063150">Encomenda confirmada</h1>
        <p>Ola ${escapeHtml(customerName)}, recebemos a sua encomenda <strong>${escapeHtml(order.id)}</strong> e o pagamento foi confirmado.</p>
        <ul>${itemListHtml}</ul>
        <p><strong>Total:</strong> ${escapeHtml(total)}</p>
        <p>Vamos preparar a sua PetBox e avisar quando houver novidades.</p>
      </div>
    `;

    const adminText = [
      `Nova encomenda confirmada: ${order.id}`,
      `Total: ${total}`,
      `Metodo: ${clean(order.payment_method, "Easypay")}`,
      "",
      "Artigos:",
      itemListText,
      "",
      "Entrega:",
      deliveryText || "Sem dados de entrega."
    ].join("\n");

    const adminHtml = `
      <div style="font-family:Arial,sans-serif;color:#172117;line-height:1.55">
        <h1 style="color:#063150">Nova encomenda confirmada</h1>
        <p><strong>${escapeHtml(order.id)}</strong> - ${escapeHtml(total)}</p>
        <h2>Artigos</h2>
        <ul>${itemListHtml}</ul>
        <h2>Entrega</h2>
        <pre style="white-space:pre-wrap;font-family:Arial,sans-serif;background:#f8f3e9;padding:12px;border-radius:12px">${escapeHtml(deliveryText || "Sem dados de entrega.")}</pre>
      </div>
    `;

    const sends = [];
    if (customerEmail) {
      sends.push(sendResendEmail({
        apiKey,
        from,
        to: customerEmail,
        subject: `Encomenda PetBox confirmada - ${order.id}`,
        text: customerText,
        html: customerHtml
      }));
    }
    if (adminTo) {
      sends.push(sendResendEmail({
        apiKey,
        from,
        to: adminTo,
        subject: `Nova encomenda PetBox - ${order.id}`,
        text: adminText,
        html: adminHtml,
        replyTo: customerEmail || undefined
      }));
    }

    await Promise.all(sends);
  } catch (error) {
    if (claimedEmailMarker && markerClient) {
      try {
        await markerClient
          .from("orders")
          .update({ confirmation_email_sent_at: null })
          .eq("id", orderId);
      } catch {
        // Keep the original email error visible below.
      }
    }
    console.error("Erro ao enviar emails da encomenda:", error);
  }
}
