import AccountClient from "@/components/AccountClient";

export default function ContaPage() {
  return (
    <section className="section">
      <AccountClient requireAuth />
    </section>
  );
}
