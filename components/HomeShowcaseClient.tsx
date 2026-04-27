"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { loadAdminPlans, loadAdminProducts, loadRemoteHomeSettings } from "@/lib/admin-db";
import { adminStore, type HomeSettings } from "@/lib/admin-store";
import type { Product } from "@/data/products";
import { money } from "@/lib/helpers";

function speciesLabel(species: Product["species"]) {
  if (species === "dog") return "Caes";
  if (species === "cat") return "Gatos";
  return "Caes e gatos";
}

export default function HomeShowcaseClient() {
  const [settings, setSettings] = useState<HomeSettings>(() => adminStore.home.get());
  const [products, setProducts] = useState<Product[]>(() => adminStore.products.get());
  const [plans, setPlans] = useState(() => adminStore.plans.get());

  useEffect(() => {
    const refresh = () => {
      setSettings(adminStore.home.get());
      setProducts(adminStore.products.get());
      setPlans(adminStore.plans.get());
    };

    refresh();
    Promise.all([
      loadRemoteHomeSettings(adminStore.home.get()).catch(() => null),
      loadAdminProducts().catch(() => []),
      loadAdminPlans().catch(() => [])
    ]).then(([remoteSettings, remoteProducts, remotePlans]) => {
      if (remoteSettings) {
        setSettings(remoteSettings);
        adminStore.home.set(remoteSettings);
      }
      if (remoteProducts.length) {
        setProducts(remoteProducts);
        adminStore.products.set(remoteProducts);
      }
      if (remotePlans.length) {
        setPlans(remotePlans);
        adminStore.plans.set(remotePlans);
      }
    });
    window.addEventListener("petbox-admin-changed", refresh);
    return () => window.removeEventListener("petbox-admin-changed", refresh);
  }, []);

  const featuredProducts = useMemo(() => products.slice(0, 4), [products]);
  const heroImages = useMemo(() => {
    const configured = settings.showcaseLeadImages
      .split(/\r?\n/)
      .map((image) => image.trim())
      .filter(Boolean);
    return configured.length ? configured : products.slice(0, 5).map((product) => product.image);
  }, [products, settings.showcaseLeadImages]);
  const heroLoopImages = useMemo(() => {
    const source = heroImages.length ? heroImages : ["/images/dog-box.svg"];
    const count = Math.max(6, source.length);
    return Array.from({ length: count }, (_, index) => source[index % source.length]);
  }, [heroImages]);
  const quarterlyPlan = plans.find((plan) => plan.cadence === "quarterly") || plans[1] || plans[0];

  return (
    <main className="home-showcase container">
      <section className="home-campaign-grid" aria-label="PetBox em destaque">
        <Link href={settings.showcaseLeadHref || "/configure"} className="campaign-video-card">
          <div className="petbox-video-word" aria-hidden="true">
            <span>P</span><span>E</span><span>T</span><span>B</span><span>O</span><span>X</span>
          </div>
          <div className="video-asset-track" aria-hidden="true">
            {[0, 1].map((group) => (
              <div className="video-asset-group" key={group}>
                {heroLoopImages.map((image, index) => (
                  <img key={`${group}-${index}`} src={image} alt="" />
                ))}
              </div>
            ))}
          </div>
          <div className="video-caption">
            <strong>{settings.showcaseLeadTitle}</strong>
            <p>{settings.showcaseLeadText}</p>
          </div>
        </Link>

        <aside className="campaign-promo-card">
          <div>
            <span className="tag light">{settings.showcasePromoLabel}</span>
            <h1>{settings.showcasePromoTitle}</h1>
            <p>{settings.showcasePromoText}</p>
            <Link href={settings.showcasePromoHref || "/configure"} className="btn campaign-btn">{settings.showcasePromoCta}</Link>
          </div>
          <img src={settings.showcasePromoImage || settings.heroImage} alt="" />
        </aside>

        <Link href={settings.showcaseTileOneHref || "/configure"} className="campaign-tile tile-large tile-green">
          <span>{settings.showcaseTileOneLabel}</span>
          <strong>{settings.showcaseTileOneTitle}</strong>
          <p>{settings.showcaseTileOneText}</p>
          <em>{settings.showcaseTileOneCta}</em>
          <img src={settings.showcaseTileOneImage} alt="" />
        </Link>

        <Link href={settings.showcaseTileTwoHref || "/shop"} className="campaign-tile tile-large tile-cream">
          <span>{settings.showcaseTileTwoLabel}</span>
          <strong>{settings.showcaseTileTwoTitle}</strong>
          <p>{settings.showcaseTileTwoText}</p>
          <em>{settings.showcaseTileTwoCta}</em>
          <img src={settings.showcaseTileTwoImage} alt="" />
        </Link>

        <Link href={settings.showcaseTileThreeHref || "/about"} className="campaign-tile tile-side tile-blue">
          <span>{settings.showcaseTileThreeLabel}</span>
          <strong>{settings.showcaseTileThreeTitle}</strong>
          <p>{settings.showcaseTileThreeText}</p>
          <em>{settings.showcaseTileThreeCta}</em>
          <img src={settings.showcaseTileThreeImage} alt="" />
        </Link>

        <Link href={settings.showcaseTileFourHref || "/journal"} className="campaign-tile tile-wide tile-blog">
          <span>{settings.showcaseTileFourLabel}</span>
          <strong>{settings.showcaseTileFourTitle}</strong>
          <p>{settings.showcaseTileFourText}</p>
          <em>{settings.showcaseTileFourCta}</em>
          <img src={settings.showcaseTileFourImage} alt="" />
        </Link>
      </section>

      <section className="home-offer-grid" aria-label="Produtos e vantagens">
        {featuredProducts.map((product) => (
          <Link href={`/product/${product.slug}`} className="offer-card" key={product.slug}>
            <img src={product.image} alt={product.title} />
            <span>{product.category}</span>
            <strong>{product.title}</strong>
            <p>{speciesLabel(product.species)} | {money(product.price)}</p>
          </Link>
        ))}
        {quarterlyPlan ? (
          <Link href="/configure" className="offer-card offer-card-strong">
            <img src="/images/box-generic.svg" alt="" />
            <span>Melhor valor</span>
            <strong>{quarterlyPlan.name}</strong>
            <p>{money(quarterlyPlan.price)} | plano trimestral</p>
          </Link>
        ) : null}
      </section>
    </main>
  );
}
