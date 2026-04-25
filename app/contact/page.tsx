import ContactForm from "@/components/ContactForm";
import { pt } from "@/lib/translations";

export default function ContactPage() {
  return (
    <section className="container section narrow">
      <span className="eyebrow">{pt.contact.eyebrow}</span>
      <h1>{pt.contact.title}</h1>
      <p className="muted">{pt.contact.intro}</p>
      <ContactForm />
    </section>
  );
}
