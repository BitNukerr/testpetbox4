"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminStore, type HomeSettings } from "@/lib/admin-store";

export default function Hero() {
  const [settings, setSettings] = useState<HomeSettings>(() => adminStore.home.get());

  useEffect(() => {
    const refresh = () => setSettings(adminStore.home.get());
    refresh();
    window.addEventListener("petbox-admin-changed", refresh);
    return () => window.removeEventListener("petbox-admin-changed", refresh);
  }, []);

  return (
    <section className="hero container">
      <div className="hero-copy">
        <span className="eyebrow">{settings.eyebrow}</span>
        <h1>{settings.title}</h1>
        <p>{settings.subtitle}</p>
        <div className="hero-actions">
          <Link href={settings.primaryHref} className="btn">{settings.primaryCta}</Link>
          <Link href={settings.secondaryHref} className="btn btn-secondary">{settings.secondaryCta}</Link>
        </div>
      </div>
      <div className="hero-card">
        <img src={settings.heroImage} alt="PetBox" />
        <div className="hero-stats">
          <div><strong>{settings.statOneTitle}</strong><span>{settings.statOneText}</span></div>
          <div><strong>{settings.statTwoTitle}</strong><span>{settings.statTwoText}</span></div>
          <div><strong>{settings.statThreeTitle}</strong><span>{settings.statThreeText}</span></div>
        </div>
      </div>
    </section>
  );
}
