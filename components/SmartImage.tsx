import Image from "next/image";
import type { CSSProperties } from "react";

type SmartImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  loading?: "eager" | "lazy";
  fallbackSrc?: string;
  style?: CSSProperties;
};

const supabaseImageHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : "";
  } catch {
    return "";
  }
})();

function canUseNextImage(src: string) {
  if (src.split("?")[0].toLowerCase().endsWith(".svg")) return false;
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  if (src.startsWith("data:") || src.startsWith("blob:")) return false;

  try {
    const url = new URL(src);
    return url.protocol === "https:" && Boolean(supabaseImageHost) && url.hostname === supabaseImageHost;
  } catch {
    return false;
  }
}

export default function SmartImage({
  src,
  alt,
  className,
  width = 900,
  height = 900,
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
  loading = "lazy",
  fallbackSrc = "/images/box-generic.svg",
  style
}: SmartImageProps) {
  const resolvedSrc = src?.trim() || fallbackSrc;

  if (canUseNextImage(resolvedSrc)) {
    return (
      <Image
        src={resolvedSrc}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : loading}
        className={className}
        style={style}
      />
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : loading}
      decoding="async"
      className={className}
      style={style}
    />
  );
}
