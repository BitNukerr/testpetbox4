export type EasypayCheckoutDetails = {
  checkout?: {
    id?: string;
    status?: string;
  };
  payment?: {
    id?: string;
    key?: string;
    method?: string;
    status?: string;
    value?: number;
  };
  order?: {
    key?: string;
    value?: number;
  };
  status?: string;
  value?: number;
};

const PAID_STATUSES = new Set(["success", "paid", "captured", "confirmed", "completed"]);

export function getEasypayBaseUrl() {
  if (process.env.EASYPAY_API_URL) return process.env.EASYPAY_API_URL.replace(/\/$/, "");
  return process.env.EASYPAY_ENVIRONMENT === "production"
    ? "https://api.prod.easypay.pt/2.0"
    : "https://api.test.easypay.pt/2.0";
}

export function getEasypayCheckoutApiUrl() {
  if (process.env.EASYPAY_CHECKOUT_API_URL) return process.env.EASYPAY_CHECKOUT_API_URL;
  return `${getEasypayBaseUrl()}/checkout`;
}

export function getEasypayCredentials() {
  const accountId = process.env.EASYPAY_ACCOUNT_ID;
  const apiKey = process.env.EASYPAY_API_KEY;
  return accountId && apiKey ? { accountId, apiKey } : null;
}

export async function fetchEasypayCheckout(checkoutId: string) {
  const credentials = getEasypayCredentials();
  if (!credentials) throw new Error("Faltam as variaveis EASYPAY_ACCOUNT_ID e EASYPAY_API_KEY no Vercel.");

  const response = await fetch(`${getEasypayCheckoutApiUrl()}/${encodeURIComponent(checkoutId)}`, {
    method: "GET",
    headers: {
      AccountId: credentials.accountId,
      ApiKey: credentials.apiKey
    },
    cache: "no-store"
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || data?.error || "Nao foi possivel consultar o pagamento Easypay.");
  }

  return data as EasypayCheckoutDetails;
}

export function isEasypayCheckoutPaid(details: EasypayCheckoutDetails) {
  const paymentStatus = details.payment?.status?.toLowerCase();
  const checkoutStatus = details.checkout?.status?.toLowerCase();
  return Boolean((paymentStatus && PAID_STATUSES.has(paymentStatus)) || (checkoutStatus && PAID_STATUSES.has(checkoutStatus)));
}

export function easypayPaymentValue(details: EasypayCheckoutDetails) {
  return Number(details.value ?? details.payment?.value ?? details.order?.value);
}

export function easypayOrderKey(details: EasypayCheckoutDetails) {
  return details.payment?.key || details.order?.key || "";
}
