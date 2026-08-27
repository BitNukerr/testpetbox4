import type { Plan, Product } from "@/data/products";
import { defaultLegalSettings, legalPageOrder, type LegalSettings } from "@/lib/legal-content";

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: string };

type ConfigOptionPayload = {
  id: string;
  label: string;
  description: string;
  price: number;
  image?: string;
};

type ConfiguratorImageVariantPayload = {
  animalId: string;
  sizeId: string;
  ageId: string;
  image: string;
};

type ConfiguratorSettingsPayload = {
  animalTitle: string;
  animalText: string;
  sizeTitle: string;
  sizeText: string;
  ageTitle: string;
  ageText: string;
  planTitle: string;
  planText: string;
  personalityTitle: string;
  personalityText: string;
  extrasTitle: string;
  extrasText: string;
  animals: ConfigOptionPayload[];
  sizes: ConfigOptionPayload[];
  ages: ConfigOptionPayload[];
  personalities: ConfigOptionPayload[];
  extras: ConfigOptionPayload[];
  imageVariants: ConfiguratorImageVariantPayload[];
};

type StoreSettingsPayload = {
  store_name: string;
  support_email: string | null;
  shipping_price: number;
  internal_note: string | null;
};

type PostPayload = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  status: "Publicado" | "Rascunho";
  author: string;
  published_at: string | null;
};

type OrderStatusPayload = {
  id: string;
  status: string;
};

const MAX_IMAGE_LENGTH = 2_100_000;
const CONTROL_CHARS = /[\u0000-\u001F\u007F]/g;
const CONTROL_CHARS_WITH_NEWLINES = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ORDER_STATUSES = new Set(["Confirmada", "Pago", "Pendente", "Enviado", "Cancelado"]);

const HOME_FIELDS = [
  "eyebrow",
  "title",
  "subtitle",
  "primaryCta",
  "primaryHref",
  "secondaryCta",
  "secondaryHref",
  "heroImage",
  "statOneTitle",
  "statOneText",
  "statTwoTitle",
  "statTwoText",
  "statThreeTitle",
  "statThreeText",
  "plansEyebrow",
  "plansTitle",
  "productsEyebrow",
  "productsTitle",
  "showcaseLeadTitle",
  "showcaseLeadText",
  "showcaseLeadHref",
  "showcaseLeadImages",
  "showcasePromoLabel",
  "showcasePromoTitle",
  "showcasePromoText",
  "showcasePromoCta",
  "showcasePromoHref",
  "showcasePromoImage",
  "showcaseTileOneLabel",
  "showcaseTileOneTitle",
  "showcaseTileOneText",
  "showcaseTileOneCta",
  "showcaseTileOneHref",
  "showcaseTileOneImage",
  "showcaseTileTwoLabel",
  "showcaseTileTwoTitle",
  "showcaseTileTwoText",
  "showcaseTileTwoCta",
  "showcaseTileTwoHref",
  "showcaseTileTwoImage",
  "showcaseTileThreeLabel",
  "showcaseTileThreeTitle",
  "showcaseTileThreeText",
  "showcaseTileThreeCta",
  "showcaseTileThreeHref",
  "showcaseTileThreeImage",
  "showcaseTileFourLabel",
  "showcaseTileFourTitle",
  "showcaseTileFourText",
  "showcaseTileFourCta",
  "showcaseTileFourHref",
  "showcaseTileFourImage",
  "infoLabel",
  "infoTitle",
  "infoText",
  "infoStepOneTitle",
  "infoStepOneText",
  "infoStepTwoTitle",
  "infoStepTwoText",
  "infoStepThreeTitle",
  "infoStepThreeText",
  "salesBannerText",
  "salesBannerCta",
  "salesBannerHref",
  "trustLabel",
  "trustTitle",
  "trustText",
  "trustOneTitle",
  "trustOneText",
  "trustTwoTitle",
  "trustTwoText",
  "trustThreeTitle",
  "trustThreeText",
  "reviewOneQuote",
  "reviewOneAuthor",
  "reviewTwoQuote",
  "reviewTwoAuthor",
  "faqOneQuestion",
  "faqOneAnswer",
  "faqTwoQuestion",
  "faqTwoAnswer",
  "faqThreeQuestion",
  "faqThreeAnswer"
] as const;

const CONFIG_TEXT_FIELDS = [
  "animalTitle",
  "animalText",
  "sizeTitle",
  "sizeText",
  "ageTitle",
  "ageText",
  "planTitle",
  "planText",
  "personalityTitle",
  "personalityText",
  "extrasTitle",
  "extrasText"
] as const;

function ok<T>(value: T): ValidationResult<T> {
  return { ok: true, value };
}

function fail(error: string): ValidationResult<never> {
  return { ok: false, error };
}

export function hasValidationError<T>(result: ValidationResult<T>): result is { ok: false; error: string } {
  return "error" in result;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown) {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
}

function cleanText(value: unknown, allowNewlines = false) {
  const pattern = allowNewlines ? CONTROL_CHARS_WITH_NEWLINES : CONTROL_CHARS;
  return stringValue(value).replace(pattern, "").trim();
}

function textField(value: unknown, label: string, options: { required?: boolean; max?: number; allowNewlines?: boolean; fallback?: string } = {}) {
  const max = options.max ?? 160;
  const text = cleanText(value, options.allowNewlines);
  if (!text) {
    if (options.required) return fail(`${label} e obrigatorio.`);
    return ok(options.fallback ?? "");
  }
  if (text.length > max) return fail(`${label} e demasiado longo.`);
  return ok(text);
}

function moneyField(value: unknown, label: string, options: { max?: number } = {}) {
  const number = Number(value);
  const max = options.max ?? 1000;
  if (!Number.isFinite(number)) return fail(`${label} invalido.`);
  if (number < 0 || number > max) return fail(`${label} deve estar entre 0 e ${max}.`);
  return ok(Math.round(number * 100) / 100);
}

function ratingField(value: unknown) {
  const number = Number(value);
  if (!Number.isFinite(number)) return ok(5);
  return ok(Math.round(Math.max(0, Math.min(number, 5)) * 10) / 10);
}

function isSafeHref(value: string) {
  if (!value || /[\r\n]/.test(value)) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  if (value.startsWith("#") && value.length > 1) return true;

  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function hrefField(value: unknown, label: string) {
  const href = cleanText(value, false);
  if (!href) return ok("");
  if (href.length > 500) return fail(`${label} e demasiado longo.`);
  if (!isSafeHref(href)) return fail(`${label} tem de ser um caminho interno, ancora ou URL https.`);
  return ok(href);
}

function isSafeImageSource(value: string) {
  if (!value || value.length > MAX_IMAGE_LENGTH || /[\r\n]/.test(value)) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  if (/^data:image\/(?:png|jpe?g|webp|gif);base64,[a-z0-9+/=]+$/i.test(value)) return true;

  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function imageField(value: unknown, label: string, fallback = "") {
  const source = cleanText(value, false);
  if (!source) return ok(fallback);
  if (!isSafeImageSource(source)) return fail(`${label} tem de ser uma imagem segura.`);
  return ok(source);
}

function imageListField(value: unknown, label: string) {
  const raw = stringValue(value);
  const images = raw.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
  if (images.length > 12) return fail(`${label} aceita no maximo 12 imagens.`);

  for (let index = 0; index < images.length; index += 1) {
    const result = imageField(images[index], `${label} ${index + 1}`);
    if (!result.ok) return result;
    images[index] = result.value;
  }

  return ok(images.join("\n"));
}

function slugField(value: unknown, label: string) {
  const slug = cleanText(value, false).toLowerCase();
  if (!slug) return fail(`${label} e obrigatorio.`);
  if (slug.length > 90 || !SLUG_PATTERN.test(slug)) {
    return fail(`${label} deve usar apenas letras minusculas, numeros e hifens.`);
  }
  return ok(slug);
}

function optionIdField(value: unknown, label: string) {
  const id = cleanText(value, false).toLowerCase();
  if (!id) return fail(`${label} e obrigatorio.`);
  if (id.length > 80 || !ID_PATTERN.test(id)) {
    return fail(`${label} deve usar apenas letras minusculas, numeros e hifens.`);
  }
  return ok(id);
}

function dateField(value: unknown, label: string) {
  const text = cleanText(value, false);
  if (!text) return ok(null);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return fail(`${label} deve estar no formato AAAA-MM-DD.`);

  const [year, month, day] = text.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return fail(`${label} invalida.`);
  }

  return ok(text);
}

function speciesField(value: unknown) {
  const species = cleanText(value, false).toLowerCase();
  if (species === "dog" || species === "cao" || species === "cão") return ok<Product["species"]>("dog");
  if (species === "cat" || species === "gato") return ok<Product["species"]>("cat");
  if (species === "both" || species === "ambos" || species === "todos") return ok<Product["species"]>("both");
  return fail("Animal invalido.");
}

function cadenceField(value: unknown) {
  const cadence = cleanText(value, false).toLowerCase();
  if (cadence === "monthly" || cadence === "mensal") return ok<Plan["cadence"]>("monthly");
  if (cadence === "quarterly" || cadence === "trimestral") return ok<Plan["cadence"]>("quarterly");
  return fail("Periodicidade invalida.");
}

function stringArrayField(value: unknown, label: string, options: { maxItems?: number; maxText?: number } = {}) {
  const source = Array.isArray(value)
    ? value
    : stringValue(value).split(/\r?\n/);
  const maxItems = options.maxItems ?? 12;
  const maxText = options.maxText ?? 140;
  const items: string[] = [];

  for (const item of source.slice(0, maxItems)) {
    const text = cleanText(item, false);
    if (!text) continue;
    if (text.length > maxText) return fail(`${label} contem um item demasiado longo.`);
    items.push(text);
  }

  return ok(items);
}

function homeTextMax(field: string) {
  if (field.includes("Answer") || field.includes("Text") || field.includes("Quote") || field === "subtitle") return 700;
  if (field.includes("Title")) return 180;
  return 140;
}

export function validateProductInput(input: unknown): ValidationResult<Product & { is_active: true }> {
  if (!isRecord(input)) return fail("Produto invalido.");

  const slug = slugField(input.slug, "Slug");
  if (hasValidationError(slug)) return fail(slug.error);
  const title = textField(input.title, "Nome do produto", { required: true, max: 140 });
  if (hasValidationError(title)) return fail(title.error);
  const category = textField(input.category, "Categoria", { required: true, max: 90 });
  if (hasValidationError(category)) return fail(category.error);
  const species = speciesField(input.species);
  if (hasValidationError(species)) return fail(species.error);
  const price = moneyField(input.price, "Preco", { max: 1000 });
  if (hasValidationError(price)) return fail(price.error);
  const description = textField(input.description, "Descricao", { max: 700, fallback: "" });
  if (hasValidationError(description)) return fail(description.error);
  const image = imageField(input.image, "Imagem", "/images/box-generic.svg");
  if (hasValidationError(image)) return fail(image.error);
  const tag = textField(input.tag, "Etiqueta", { max: 90, fallback: "" });
  if (hasValidationError(tag)) return fail(tag.error);
  const rating = ratingField(input.rating);
  if (hasValidationError(rating)) return fail(rating.error);

  return ok({
    slug: slug.value,
    title: title.value,
    category: category.value,
    species: species.value,
    price: price.value,
    description: description.value,
    image: image.value,
    tag: tag.value,
    rating: rating.value,
    is_active: true
  });
}

export function validatePlanInput(input: unknown): ValidationResult<Plan & { is_active: true }> {
  if (!isRecord(input)) return fail("Plano invalido.");

  const id = slugField(input.id, "ID do plano");
  if (hasValidationError(id)) return fail(id.error);
  const name = textField(input.name, "Nome do plano", { required: true, max: 140 });
  if (hasValidationError(name)) return fail(name.error);
  const cadence = cadenceField(input.cadence);
  if (hasValidationError(cadence)) return fail(cadence.error);
  const price = moneyField(input.price, "Preco", { max: 1000 });
  if (hasValidationError(price)) return fail(price.error);
  const description = textField(input.description, "Descricao", { max: 700, fallback: "" });
  if (hasValidationError(description)) return fail(description.error);
  const perks = stringArrayField(input.perks, "Vantagens do plano", { maxItems: 12, maxText: 140 });
  if (hasValidationError(perks)) return fail(perks.error);

  return ok({
    id: id.value,
    name: name.value,
    cadence: cadence.value,
    price: price.value,
    description: description.value,
    perks: perks.value,
    is_active: true
  });
}

export function validatePostInput(input: unknown): ValidationResult<PostPayload> {
  if (!isRecord(input)) return fail("Artigo invalido.");

  const slug = slugField(input.slug, "Slug");
  if (hasValidationError(slug)) return fail(slug.error);
  const title = textField(input.title, "Titulo", { required: true, max: 180 });
  if (hasValidationError(title)) return fail(title.error);
  const excerpt = textField(input.excerpt, "Resumo", { max: 400, fallback: "" });
  if (hasValidationError(excerpt)) return fail(excerpt.error);
  const body = textField(input.body, "Conteudo", { required: true, max: 40_000, allowNewlines: true });
  if (hasValidationError(body)) return fail(body.error);
  const unsafeImage = body.value.split(/\r?\n/).find((line) => {
    const match = line.trim().match(/^!\[[^\]]*\]\(([^)]+)\)$/);
    return match ? !isSafeImageSource(match[1].trim()) : false;
  });
  if (unsafeImage) return fail("O conteudo tem uma imagem com URL inseguro.");

  const rawStatus = cleanText(input.status, false);
  const status: PostPayload["status"] = rawStatus === "Publicado" || rawStatus === "Rascunho" ? rawStatus : "Rascunho";
  const author = textField(input.author, "Autor", { max: 120, fallback: "Equipa PetBox" });
  if (hasValidationError(author)) return fail(author.error);
  const publishedAt = dateField(input.published_at || input.date, "Data");
  if (hasValidationError(publishedAt)) return fail(publishedAt.error);

  return ok({
    slug: slug.value,
    title: title.value,
    excerpt: excerpt.value,
    body: body.value,
    status,
    author: author.value,
    published_at: publishedAt.value
  });
}

export function validateHomeSettingsInput(input: unknown): ValidationResult<Record<string, string>> {
  if (!isRecord(input)) return fail("Definicoes da pagina inicial invalidas.");

  const settings: Record<string, string> = {};
  for (const field of HOME_FIELDS) {
    if (!(field in input)) continue;

    if (field === "showcaseLeadImages") {
      const images = imageListField(input[field], "Imagens animadas");
      if (hasValidationError(images)) return fail(images.error);
      settings[field] = images.value;
      continue;
    }

    if (field.endsWith("Href")) {
      const href = hrefField(input[field], field);
      if (hasValidationError(href)) return fail(href.error);
      settings[field] = href.value;
      continue;
    }

    if (field.endsWith("Image")) {
      const image = imageField(input[field], field);
      if (hasValidationError(image)) return fail(image.error);
      settings[field] = image.value;
      continue;
    }

    const text = textField(input[field], field, { max: homeTextMax(field), allowNewlines: field.includes("Text") || field.includes("Answer") });
    if (hasValidationError(text)) return fail(text.error);
    settings[field] = text.value;
  }

  if (Object.keys(settings).length === 0) return fail("Nao ha dados da pagina inicial para guardar.");
  return ok(settings);
}

function validateOptionArray(input: unknown, label: string, options: { required?: boolean; allowImage?: boolean; maxItems?: number } = {}): ValidationResult<ConfigOptionPayload[]> {
  if (!Array.isArray(input)) return options.required ? fail(`${label} invalido.`) : ok<ConfigOptionPayload[]>([]);
  const maxItems = options.maxItems ?? 24;
  if (input.length > maxItems) return fail(`${label} tem demasiadas opcoes.`);

  const items: ConfigOptionPayload[] = [];
  for (let index = 0; index < input.length; index += 1) {
    const raw = input[index];
    if (!isRecord(raw)) return fail(`${label} contem uma opcao invalida.`);

    const id = optionIdField(raw.id, `${label} ${index + 1}: ID`);
    if (hasValidationError(id)) return fail(id.error);
    const itemLabel = textField(raw.label, `${label} ${index + 1}: nome`, { required: true, max: 120 });
    if (hasValidationError(itemLabel)) return fail(itemLabel.error);
    const description = textField(raw.description, `${label} ${index + 1}: descricao`, { max: 400, fallback: "" });
    if (hasValidationError(description)) return fail(description.error);
    const price = moneyField(raw.price ?? 0, `${label} ${index + 1}: preco`, { max: 1000 });
    if (hasValidationError(price)) return fail(price.error);

    const item: ConfigOptionPayload = {
      id: id.value,
      label: itemLabel.value,
      description: description.value,
      price: price.value
    };

    if (options.allowImage || "image" in raw) {
      const image = imageField(raw.image, `${label} ${index + 1}: imagem`);
      if (hasValidationError(image)) return fail(image.error);
      if (image.value) item.image = image.value;
    }

    items.push(item);
  }

  if (options.required && items.length === 0) return fail(`${label} precisa de pelo menos uma opcao.`);
  return ok(items);
}

function validateImageVariants(input: unknown): ValidationResult<ConfiguratorImageVariantPayload[]> {
  if (!Array.isArray(input)) return ok<ConfiguratorImageVariantPayload[]>([]);
  if (input.length > 120) return fail("Ha demasiadas imagens por combinacao.");

  const variants: ConfiguratorImageVariantPayload[] = [];
  const seen = new Set<string>();

  for (let index = 0; index < input.length; index += 1) {
    const raw = input[index];
    if (!isRecord(raw)) return fail("Imagem por combinacao invalida.");

    const animalId = optionIdField(raw.animalId, `Combinacao ${index + 1}: animal`);
    if (hasValidationError(animalId)) return fail(animalId.error);
    const sizeId = optionIdField(raw.sizeId, `Combinacao ${index + 1}: tamanho`);
    if (hasValidationError(sizeId)) return fail(sizeId.error);
    const ageId = optionIdField(raw.ageId, `Combinacao ${index + 1}: idade`);
    if (hasValidationError(ageId)) return fail(ageId.error);
    const image = imageField(raw.image, `Combinacao ${index + 1}: imagem`);
    if (hasValidationError(image)) return fail(image.error);
    if (!image.value) continue;

    const key = `${animalId.value}:${sizeId.value}:${ageId.value}`;
    if (seen.has(key)) continue;
    seen.add(key);
    variants.push({ animalId: animalId.value, sizeId: sizeId.value, ageId: ageId.value, image: image.value });
  }

  return ok(variants);
}

export function validateConfiguratorSettingsInput(input: unknown): ValidationResult<ConfiguratorSettingsPayload> {
  if (!isRecord(input)) return fail("Configurador invalido.");

  const settings: Partial<ConfiguratorSettingsPayload> = {};
  for (const field of CONFIG_TEXT_FIELDS) {
    const text = textField(input[field], field, { max: field.endsWith("Text") ? 500 : 140, fallback: "" });
    if (hasValidationError(text)) return fail(text.error);
    settings[field] = text.value;
  }

  const animals = validateOptionArray(input.animals, "Animais", { required: true, allowImage: true, maxItems: 12 });
  if (hasValidationError(animals)) return fail(animals.error);
  const sizes = validateOptionArray(input.sizes, "Tamanhos", { required: true, maxItems: 12 });
  if (hasValidationError(sizes)) return fail(sizes.error);
  const ages = validateOptionArray(input.ages, "Idades", { required: true, maxItems: 12 });
  if (hasValidationError(ages)) return fail(ages.error);
  const personalities = validateOptionArray(input.personalities, "Personalidades", { required: true, maxItems: 16 });
  if (hasValidationError(personalities)) return fail(personalities.error);
  const extras = validateOptionArray(input.extras, "Extras", { maxItems: 24 });
  if (hasValidationError(extras)) return fail(extras.error);
  const imageVariants = validateImageVariants(input.imageVariants);
  if (hasValidationError(imageVariants)) return fail(imageVariants.error);

  return ok({
    animalTitle: settings.animalTitle || "",
    animalText: settings.animalText || "",
    sizeTitle: settings.sizeTitle || "",
    sizeText: settings.sizeText || "",
    ageTitle: settings.ageTitle || "",
    ageText: settings.ageText || "",
    planTitle: settings.planTitle || "",
    planText: settings.planText || "",
    personalityTitle: settings.personalityTitle || "",
    personalityText: settings.personalityText || "",
    extrasTitle: settings.extrasTitle || "",
    extrasText: settings.extrasText || "",
    animals: animals.value,
    sizes: sizes.value,
    ages: ages.value,
    personalities: personalities.value,
    extras: extras.value,
    imageVariants: imageVariants.value
  });
}

export function validateLegalSettingsInput(input: unknown): ValidationResult<LegalSettings> {
  if (!isRecord(input)) return fail("Paginas legais invalidas.");

  const settings = {} as LegalSettings;
  for (const key of legalPageOrder) {
    const fallback = defaultLegalSettings[key];
    const rawPage = (isRecord(input[key]) ? input[key] : fallback) as Record<string, unknown>;
    const label = textField(rawPage.label, `${fallback.label}: etiqueta`, { required: true, max: 80 });
    if (hasValidationError(label)) return fail(label.error);
    const title = textField(rawPage.title, `${fallback.label}: titulo`, { required: true, max: 180 });
    if (hasValidationError(title)) return fail(title.error);
    const intro = textField(rawPage.intro, `${fallback.label}: introducao`, { required: true, max: 600 });
    if (hasValidationError(intro)) return fail(intro.error);

    const sourceSections = Array.isArray(rawPage.sections) ? rawPage.sections : fallback.sections;
    if (sourceSections.length > 12) return fail(`${fallback.label} tem demasiadas seccoes.`);

    const sections = [];
    for (let index = 0; index < sourceSections.length; index += 1) {
      const rawSection = sourceSections[index];
      if (!isRecord(rawSection)) return fail(`${fallback.label}: seccao invalida.`);
      const sectionTitle = textField(rawSection.title, `${fallback.label}: titulo da seccao ${index + 1}`, { required: true, max: 180 });
      if (hasValidationError(sectionTitle)) return fail(sectionTitle.error);

      const body = stringArrayField(rawSection.body, `${fallback.label}: texto da seccao ${index + 1}`, { maxItems: 8, maxText: 1200 });
      if (hasValidationError(body)) return fail(body.error);
      if (body.value.length === 0) return fail(`${fallback.label}: cada seccao precisa de texto.`);
      sections.push({ title: sectionTitle.value, body: body.value });
    }

    if (sections.length === 0) return fail(`${fallback.label} precisa de pelo menos uma seccao.`);
    settings[key] = {
      label: label.value,
      title: title.value,
      intro: intro.value,
      sections
    };
  }

  return ok(settings);
}

export function validateStoreSettingsInput(input: unknown): ValidationResult<StoreSettingsPayload> {
  if (!isRecord(input)) return fail("Definicoes da loja invalidas.");

  const storeName = textField(input.store_name || input.storeName, "Nome da loja", { required: true, max: 120 });
  if (hasValidationError(storeName)) return fail(storeName.error);
  const email = textField(input.support_email || input.email, "Email de suporte", { max: 160, fallback: "" });
  if (hasValidationError(email)) return fail(email.error);
  if (email.value && !EMAIL_PATTERN.test(email.value)) return fail("Email de suporte invalido.");
  const shippingPrice = moneyField(input.shipping_price ?? input.shippingPrice ?? 0, "Preco de envio", { max: 250 });
  if (hasValidationError(shippingPrice)) return fail(shippingPrice.error);
  const note = textField(input.internal_note || input.note, "Nota interna", { max: 600, fallback: "" });
  if (hasValidationError(note)) return fail(note.error);

  return ok({
    store_name: storeName.value,
    support_email: email.value || null,
    shipping_price: shippingPrice.value,
    internal_note: note.value || null
  });
}

export function validateOrderStatusInput(input: unknown): ValidationResult<OrderStatusPayload> {
  if (!isRecord(input)) return fail("Encomenda invalida.");
  const id = cleanText(input.id, false);
  if (!id) return fail("ID em falta.");
  if (id.length > 120) return fail("ID demasiado longo.");
  const status = cleanText(input.status, false);
  if (!ORDER_STATUSES.has(status)) return fail("Estado invalido.");
  return ok({ id, status });
}

export function validateDeleteId(resource: string | null, id: string): ValidationResult<string> {
  if (resource === "subscriptions") {
    return UUID_PATTERN.test(id) ? ok(id) : fail("ID invalido.");
  }

  if (resource === "products" || resource === "plans" || resource === "posts") {
    return SLUG_PATTERN.test(id) && id.length <= 90 ? ok(id) : fail("ID invalido.");
  }

  return ok(id);
}
