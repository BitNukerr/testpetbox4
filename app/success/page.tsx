import SuccessClient from "@/components/SuccessClient";

export default function SuccessPage({ searchParams }: { searchParams: { payment_id?: string } }) {
  const paymentId = searchParams.payment_id || "";

  return (
    <section className="container section narrow">
      <span className="eyebrow">Sucesso</span>
      <h1>Obrigado pela sua encomenda</h1>
      <SuccessClient paymentId={paymentId} />
      <div className="action-row wrap top-gap">
        <a href="/account" className="btn">Ir para a conta</a>
        <a href="/" className="btn btn-secondary">Voltar ao início</a>
      </div>
    </section>
  );
}
