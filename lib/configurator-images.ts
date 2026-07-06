import type { ConfigOption, ConfiguratorSettings } from "@/lib/admin-store";

export function configuratorVariantKey(animalId: string, sizeId: string, ageId: string) {
  return `${animalId || "animal"}:${sizeId || "size"}:${ageId || "age"}`;
}

function escapeSvg(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    if (char === "&") return "&amp;";
    if (char === "<") return "&lt;";
    if (char === ">") return "&gt;";
    if (char === '"') return "&quot;";
    return "&#39;";
  });
}

function generatedVariantImage(animal: ConfigOption | undefined, size: ConfigOption | undefined, age: ConfigOption | undefined) {
  const animalId = animal?.id || "dog";
  const sizeId = size?.id || "medium";
  const ageId = age?.id || "adult";
  const animalLabel = escapeSvg(animal?.label || (animalId === "cat" ? "Gato" : "Cao"));
  const sizeLabel = escapeSvg(size?.label || "Medio");
  const ageLabel = escapeSvg(age?.label || "Adulto");
  const scale = sizeId === "small" ? 0.78 : sizeId === "large" ? 1.12 : 0.94;
  const bodyWidth = Math.round(150 * scale);
  const bodyHeight = Math.round(76 * scale);
  const bodyX = Math.round(320 - bodyWidth / 2);
  const bodyY = Math.round(ageId === "young" ? 230 : ageId === "senior" ? 218 : 224);
  const fur = animalId === "cat" ? "#8e73c7" : "#d39b62";
  const furDark = animalId === "cat" ? "#6d54a7" : "#b77d45";
  const ageAccent = ageId === "young" ? "#7ccbe8" : ageId === "senior" ? "#d8d2c7" : "#f4c77b";
  const bg = ageId === "young" ? "#e9f8ff" : ageId === "senior" ? "#eef4df" : "#fff4e3";
  const muzzle = ageId === "senior" ? "#ece7dd" : "#ffe4be";
  const accessory = ageId === "young"
    ? '<circle cx="446" cy="326" r="20" fill="#f5a3ef"/><circle cx="438" cy="319" r="5" fill="#fff"/>'
    : ageId === "senior"
      ? '<rect x="414" y="312" width="64" height="20" rx="10" fill="#fff" stroke="#6f756b" stroke-width="4"/><line x1="438" y1="322" x2="454" y2="322" stroke="#6f756b" stroke-width="4"/>'
      : '<path d="M420 322c30-28 60-28 90 0-29 19-61 19-90 0Z" fill="#8bc5dd"/>';
  const ears = animalId === "cat"
    ? `<path d="M${bodyX + 25} ${bodyY - 10}l-18-48 47 25Z" fill="${furDark}"/><path d="M${bodyX + bodyWidth - 25} ${bodyY - 10}l18-48-47 25Z" fill="${furDark}"/>`
    : `<ellipse cx="${bodyX + 24}" cy="${bodyY + 10}" rx="25" ry="43" fill="${furDark}" transform="rotate(22 ${bodyX + 24} ${bodyY + 10})"/><ellipse cx="${bodyX + bodyWidth - 24}" cy="${bodyY + 10}" rx="25" ry="43" fill="${furDark}" transform="rotate(-22 ${bodyX + bodyWidth - 24} ${bodyY + 10})"/>`;
  const tail = animalId === "cat"
    ? `<path d="M${bodyX + bodyWidth - 4} ${bodyY + 38}c70-28 58-90 14-88" fill="none" stroke="${furDark}" stroke-width="18" stroke-linecap="round"/>`
    : `<path d="M${bodyX + bodyWidth - 2} ${bodyY + 35}c54-34 78-6 98 24" fill="none" stroke="${furDark}" stroke-width="18" stroke-linecap="round"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
  <rect width="640" height="640" rx="44" fill="${bg}"/>
  <circle cx="144" cy="132" r="68" fill="${ageAccent}" opacity=".45"/>
  <circle cx="500" cy="146" r="44" fill="#fff" opacity=".72"/>
  <rect x="124" y="378" width="392" height="120" rx="24" fill="#d8ad7d"/>
  <rect x="172" y="352" width="296" height="76" rx="18" fill="#c8945d"/>
  ${tail}
  ${ears}
  <rect x="${bodyX}" y="${bodyY}" width="${bodyWidth}" height="${bodyHeight}" rx="${Math.round(bodyHeight / 2)}" fill="${fur}"/>
  <circle cx="320" cy="${bodyY - 2}" r="${Math.round(50 * scale)}" fill="${fur}"/>
  <ellipse cx="302" cy="${bodyY + 9}" rx="7" ry="8" fill="#15120f"/>
  <ellipse cx="338" cy="${bodyY + 9}" rx="7" ry="8" fill="#15120f"/>
  <ellipse cx="320" cy="${bodyY + 30}" rx="${Math.round(28 * scale)}" ry="${Math.round(18 * scale)}" fill="${muzzle}"/>
  <circle cx="320" cy="${bodyY + 22}" r="6" fill="#15120f"/>
  <rect x="196" y="430" width="56" height="42" rx="9" fill="#fff7ed"/>
  <rect x="388" y="430" width="56" height="42" rx="9" fill="#fff7ed"/>
  ${accessory}
  <text x="44" y="66" font-family="Arial, sans-serif" font-size="34" font-weight="900" fill="#07375a">PetBox</text>
  <text x="44" y="566" font-family="Arial, sans-serif" font-size="28" font-weight="900" fill="#07375a">${animalLabel}</text>
  <text x="44" y="598" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#526058">${sizeLabel} / ${ageLabel}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function configuredVariantImage(settings: ConfiguratorSettings, animalId: string, sizeId: string, ageId: string) {
  const key = configuratorVariantKey(animalId, sizeId, ageId);
  return (settings.imageVariants || []).find((variant) => configuratorVariantKey(variant.animalId, variant.sizeId, variant.ageId) === key)?.image || "";
}

export function getConfiguratorVariantImage(settings: ConfiguratorSettings, animal: ConfigOption | undefined, size: ConfigOption | undefined, age: ConfigOption | undefined) {
  const configured = configuredVariantImage(settings, animal?.id || "", size?.id || "", age?.id || "");
  if (configured) return configured;
  return generatedVariantImage(animal, size, age) || animal?.image || "/images/box-generic.svg";
}
