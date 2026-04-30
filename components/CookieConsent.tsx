"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import { useEffect, useState } from "react";

const CONSENT_KEY = "petbox-analytics-consent";

type Consent = "accepted" | "declined" | null;

export default function CookieConsent() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<Consent>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(CONSENT_KEY);
    if (stored === "accepted" || stored === "declined") setConsent(stored);
    setReady(true);
  }, []);

  function choose(next: Exclude<Consent, null>) {
    window.localStorage.setItem(CONSENT_KEY, next);
    setConsent(next);
  }

  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      {consent === "accepted" ? <Analytics /> : null}
      {ready && consent === null ? (
        <section className="cookie-consent" aria-label="Preferências de cookies">
          <div>
            <strong>Cookies e analytics</strong>
            <p>Usamos cookies necessários para o site funcionar. Com a sua autorização, usamos Vercel Analytics para perceber visitas e melhorar a PetBox.</p>
            <Link href="/legal/cookies">Ver política de cookies</Link>
          </div>
          <div className="cookie-actions">
            <button className="btn btn-secondary small" onClick={() => choose("declined")}>Recusar</button>
            <button className="btn small" onClick={() => choose("accepted")}>Aceitar</button>
          </div>
        </section>
      ) : null}
    </>
  );
}
