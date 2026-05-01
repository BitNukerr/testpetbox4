import SuccessClient from "@/components/SuccessClient";

export default async function SucessoPage({ searchParams }: { searchParams: Promise<{ payment_id?: string }> }) {
  const { payment_id } = await searchParams;
  const paymentId = payment_id || "";

  return (
    <section className="container section narrow">
      <span className="eyebrow">Sucesso</span>
      <h1>Obrigado pela sua encomenda</h1>
      <SuccessClient paymentId={paymentId} />
      <div className="action-row wrap top-gap">
        <a href="/conta" className="btn">Ir para a conta</a>
        <a href="/" className="btn btn-secondary">Voltar ao inicio</a>
      </div>
    </section>
  );
}
