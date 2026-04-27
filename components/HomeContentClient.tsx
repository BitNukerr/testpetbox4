"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import HomeFeaturedProductsClient from "@/components/HomeFeaturedProductsClient";
import HomePlansClient from "@/components/HomePlansClient";
import { loadRemoteHomeSettings } from "@/lib/admin-db";
import { adminStore, type HomeSettings } from "@/lib/admin-store";

export default function HomeContentClient() {
  const [settings, setSettings] = useState<HomeSettings>(() => adminStore.home.get());

  useEffect(() => {
    const refresh = () => setSettings(adminStore.home.get());
    refresh();
    loadRemoteHomeSettings(adminStore.home.get())
      .then((remoteSettings) => {
        setSettings(remoteSettings);
        adminStore.home.set(remoteSettings);
      })
      .catch(() => null);
    window.addEventListener("petbox-admin-changed", refresh);
    return () => window.removeEventListener("petbox-admin-changed", refresh);
  }, []);

  return (
    <>
      <section className="container section">
        <div className="section-heading">
          <div><span className="eyebrow">{settings.plansEyebrow}</span><h2>{settings.plansTitle}</h2></div>
          <Link href="/configure" className="btn btn-secondary">Personalizar</Link>
        </div>
        <HomePlansClient />
      </section>
      <section className="container section">
        <div className="section-heading">
          <div><span className="eyebrow">{settings.productsEyebrow}</span><h2>{settings.productsTitle}</h2></div>
          <Link href="/shop" className="btn btn-secondary">Ver todos</Link>
        </div>
        <HomeFeaturedProductsClient />
      </section>
    </>
  );
}
