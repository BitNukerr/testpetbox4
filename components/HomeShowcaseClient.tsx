"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { loadAdminPlans, loadAdminProducts, loadRemoteHomeSettings } from "@/lib/admin-db";
import { adminStore, type HomeSettings } from "@/lib/admin-store";
import type { Product } from "@/data/products";
import type { Plan } from "@/data/products";
import { money } from "@/lib/helpers";
import SmartImage from "@/components/SmartImage";

function speciesLabel(species: Product["species"]) {
  if (species === "dog") return "Caes";
  if (species === "cat") return "Gatos";
  return "Caes e gatos";
}

type HomeShowcaseClientProps = {
  initialHomeSettings?: Partial<HomeSettings> | null;
  initialProducts?: Product[];
  initialPlans?: Plan[];
};

function initialSettingsFromProps(initialHomeSettings?: Partial<HomeSettings> | null) {
  const localSettings = adminStore.home.get();
  return initialHomeSettings ? ({ ...localSettings, ...initialHomeSettings } as HomeSettings) : localSettings;
}

function shouldUseAdminPreview() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("preview") === "admin";
}

export default function HomeShowcaseClient({ initialHomeSettings = null, initialProducts = [], initialPlans = [] }: HomeShowcaseClientProps) {
  const [settings, setSettings] = useState<HomeSettings>(() => initialSettingsFromProps(initialHomeSettings));
  const [products, setProducts] = useState<Product[]>(() => initialProducts.length ? initialProducts : adminStore.products.get());
  const [plans, setPlans] = useState<Plan[]>(() => initialPlans.length ? initialPlans : adminStore.plans.get());
  const [previewMode, setPreviewMode] = useState(false);
  const hasInitialData = Boolean(initialHomeSettings || initialProducts.length || initialPlans.length);

  useEffect(() => {
    const refresh = () => {
      setSettings(adminStore.home.get());
      setProducts(adminStore.products.get());
      setPlans(adminStore.plans.get());
    };

    if (shouldUseAdminPreview()) {
      setPreviewMode(true);
      refresh();
      window.addEventListener("petbox-admin-changed", refresh);
      return () => window.removeEventListener("petbox-admin-changed", refresh);
    }

    if (initialHomeSettings) {
      adminStore.home.set(initialSettingsFromProps(initialHomeSettings));
    }
    if (initialProducts.length) {
      adminStore.products.set(initialProducts);
    }
    if (initialPlans.length) {
      adminStore.plans.set(initialPlans);
    }

    refresh();
    if (hasInitialData) {
      window.addEventListener("petbox-admin-changed", refresh);
      return () => window.removeEventListener("petbox-admin-changed", refresh);
    }

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
      {previewMode ? <div className="preview-mode-banner">Pre-visualizacao local do admin. Os visitantes so veem isto depois de guardar.</div> : null}
      <section className="home-campaign-grid" aria-label="PetBox em destaque">
        <Link href={settings.showcaseLeadHref || "/criar-caixa"} className="campaign-video-card">
          <div className="petbox-video-word" aria-hidden="true">
            <span>P</span><span>E</span><span>T</span><span>B</span><span>O</span><span>X</span>
          </div>
          <div className="video-asset-track" aria-hidden="true">
            {[0, 1].map((group) => (
              <div className="video-asset-group" key={group}>
                {heroLoopImages.map((image, index) => (
                  <SmartImage key={`${group}-${index}`} src={image} alt="" width={180} height={160} sizes="116px" priority={group === 0 && index < 3} />
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
            <Link href={settings.showcasePromoHref || "/criar-caixa"} className="btn campaign-btn">{settings.showcasePromoCta}</Link>
          </div>
          <SmartImage src={settings.showcasePromoImage || settings.heroImage} alt="" width={720} height={520} sizes="(max-width: 900px) 100vw, 34vw" priority />
        </aside>

        <Link href={settings.showcaseTileOneHref || "/criar-caixa"} className="campaign-tile tile-large tile-green">
          <span>{settings.showcaseTileOneLabel}</span>
          <strong>{settings.showcaseTileOneTitle}</strong>
          <p>{settings.showcaseTileOneText}</p>
          <em>{settings.showcaseTileOneCta}</em>
          <SmartImage src={settings.showcaseTileOneImage} alt="" width={420} height={320} sizes="(max-width: 900px) 45vw, 18vw" />
        </Link>

        <Link href={settings.showcaseTileTwoHref || "/loja"} className="campaign-tile tile-large tile-cream">
          <span>{settings.showcaseTileTwoLabel}</span>
          <strong>{settings.showcaseTileTwoTitle}</strong>
          <p>{settings.showcaseTileTwoText}</p>
          <em>{settings.showcaseTileTwoCta}</em>
          <SmartImage src={settings.showcaseTileTwoImage} alt="" width={420} height={320} sizes="(max-width: 900px) 45vw, 18vw" />
        </Link>

        <Link href={settings.showcaseTileThreeHref || "/sobre"} className="campaign-tile tile-side tile-blue">
          <span>{settings.showcaseTileThreeLabel}</span>
          <strong>{settings.showcaseTileThreeTitle}</strong>
          <p>{settings.showcaseTileThreeText}</p>
          <em>{settings.showcaseTileThreeCta}</em>
          <SmartImage src={settings.showcaseTileThreeImage} alt="" width={260} height={220} sizes="112px" />
        </Link>

        <Link href={settings.showcaseTileFourHref || "/blog"} className="campaign-tile tile-wide tile-blog">
          <span>{settings.showcaseTileFourLabel}</span>
          <strong>{settings.showcaseTileFourTitle}</strong>
          <p>{settings.showcaseTileFourText}</p>
          <em>{settings.showcaseTileFourCta}</em>
          <SmartImage src={settings.showcaseTileFourImage} alt="" width={380} height={240} sizes="(max-width: 900px) 35vw, 16vw" />
        </Link>

        <article className="campaign-info-card">
          <div>
            <span>{settings.infoLabel}</span>
            <h2>{settings.infoTitle}</h2>
            <p>{settings.infoText}</p>
          </div>
          <div className="info-steps">
            <div><strong>{settings.infoStepOneTitle}</strong><p>{settings.infoStepOneText}</p></div>
            <div><strong>{settings.infoStepTwoTitle}</strong><p>{settings.infoStepTwoText}</p></div>
            <div><strong>{settings.infoStepThreeTitle}</strong><p>{settings.infoStepThreeText}</p></div>
          </div>
        </article>

        <section className="sales-trust-section" aria-label="Confiança e perguntas frequentes">
          <div className="sales-banner">
            <p>{settings.salesBannerText}</p>
            <Link href={settings.salesBannerHref || "/criar-caixa"} className="btn campaign-btn">{settings.salesBannerCta}</Link>
          </div>

          <div className="trust-copy">
            <span>{settings.trustLabel}</span>
            <h2>{settings.trustTitle}</h2>
            <p>{settings.trustText}</p>
          </div>

          <div className="trust-points">
            <div><strong>{settings.trustOneTitle}</strong><p>{settings.trustOneText}</p></div>
            <div><strong>{settings.trustTwoTitle}</strong><p>{settings.trustTwoText}</p></div>
            <div><strong>{settings.trustThreeTitle}</strong><p>{settings.trustThreeText}</p></div>
          </div>

          <div className="faq-card">
            <h3>Perguntas frequentes</h3>
            <details open>
              <summary>{settings.faqOneQuestion}</summary>
              <p>{settings.faqOneAnswer}</p>
            </details>
            <details>
              <summary>{settings.faqTwoQuestion}</summary>
              <p>{settings.faqTwoAnswer}</p>
            </details>
            <details>
              <summary>{settings.faqThreeQuestion}</summary>
              <p>{settings.faqThreeAnswer}</p>
            </details>
          </div>

          <div className="review-card">
            <p>"{settings.reviewOneQuote}"</p>
            <strong>{settings.reviewOneAuthor}</strong>
          </div>
          <div className="review-card">
            <p>"{settings.reviewTwoQuote}"</p>
            <strong>{settings.reviewTwoAuthor}</strong>
          </div>
        </section>
      </section>

      <section className="home-offer-grid" aria-label="Produtos e vantagens">
        {featuredProducts.map((product) => (
          <Link href={`/produto/${product.slug}`} className="offer-card" key={product.slug}>
            <SmartImage src={product.image} alt={product.title} width={420} height={300} sizes="(max-width: 900px) 50vw, 20vw" />
            <span>{product.category}</span>
            <strong>{product.title}</strong>
            <p>{speciesLabel(product.species)} | {money(product.price)}</p>
          </Link>
        ))}
        {quarterlyPlan ? (
          <Link href="/criar-caixa" className="offer-card offer-card-strong">
            <SmartImage src="/images/box-generic.svg" alt="" width={420} height={300} sizes="(max-width: 900px) 50vw, 20vw" />
            <span>Melhor valor</span>
            <strong>{quarterlyPlan.name}</strong>
            <p>{money(quarterlyPlan.price)} | plano trimestral</p>
          </Link>
        ) : null}
      </section>
    </main>
  );
}
