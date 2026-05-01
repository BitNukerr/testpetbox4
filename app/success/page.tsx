import { redirect } from "next/navigation";

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ payment_id?: string }> }) {
  const { payment_id } = await searchParams;
  redirect(payment_id ? `/sucesso?payment_id=${encodeURIComponent(payment_id)}` : "/sucesso");
}
