import { NextRequest, NextResponse } from "next/server";
import { requestHasAdminSession } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const DEFAULT_BUCKET = "petbox-images";

function cleanFilename(value: unknown) {
  const name = typeof value === "string" ? value : "image";
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80) || "image";
}

function parseDataUrl(value: unknown) {
  if (typeof value !== "string") return null;
  const match = value.match(/^data:(image\/(?:png|webp|jpeg|jpg|svg\+xml));base64,(.+)$/);
  if (!match) return null;
  const mimeType = match[1] === "image/jpg" ? "image/jpeg" : match[1];
  const extension = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : mimeType === "image/svg+xml" ? "svg" : "jpg";
  return { bytes: Buffer.from(match[2], "base64"), mimeType, extension };
}

export async function POST(request: NextRequest) {
  try {
    if (!requestHasAdminSession(request)) {
      return NextResponse.json({ error: "Acesso nao autorizado." }, { status: 401 });
    }

    const admin = getSupabaseAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Configure SUPABASE_SECRET_KEY no Vercel." }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const parsed = parseDataUrl(body.image);
    if (!parsed) {
      return NextResponse.json({ error: "Imagem invalida." }, { status: 400 });
    }
    if (parsed.bytes.length > 1_500_000) {
      return NextResponse.json({ error: "Imagem demasiado grande depois de optimizada." }, { status: 400 });
    }

    const bucket = process.env.SUPABASE_STORAGE_BUCKET || DEFAULT_BUCKET;
    const baseName = cleanFilename(body.filename).replace(/\.[a-z0-9]+$/i, "");
    const path = `admin/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${baseName}.${parsed.extension}`;

    const bucketResult = await admin.storage.getBucket(bucket);
    if (bucketResult.error) {
      const createResult = await admin.storage.createBucket(bucket, {
        public: true,
        fileSizeLimit: "2MB",
        allowedMimeTypes: ["image/png", "image/webp", "image/jpeg", "image/svg+xml"]
      });
      if (createResult.error) throw createResult.error;
    }

    const uploadResult = await admin.storage.from(bucket).upload(path, parsed.bytes, {
      contentType: parsed.mimeType,
      upsert: false
    });
    if (uploadResult.error) throw uploadResult.error;

    const { data } = admin.storage.from(bucket).getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl, path, bucket });
  } catch (error) {
    console.error("Erro ao guardar imagem:", error);
    return NextResponse.json({ error: "Nao foi possivel guardar a imagem no Supabase Storage." }, { status: 500 });
  }
}
