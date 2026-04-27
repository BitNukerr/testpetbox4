export type AdminImageOptions = {
  width: number;
  height: number;
  fit?: "contain" | "max";
  quality?: number;
};

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Nao foi possivel ler a imagem."));
    };
    reader.onerror = () => reject(new Error("Nao foi possivel ler a imagem."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Nao foi possivel preparar a imagem."));
    image.src = src;
  });
}

export async function prepareAdminImage(file: File, options: AdminImageOptions) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Escolha um ficheiro de imagem.");
  }

  if (file.type === "image/svg+xml") {
    return readFileAsDataUrl(file);
  }

  const source = await readFileAsDataUrl(file);
  const image = await loadImage(source);
  const fit = options.fit || "contain";
  const quality = options.quality ?? 0.86;

  const scale = Math.min(options.width / image.naturalWidth, options.height / image.naturalHeight, 1);
  const drawWidth = Math.max(1, Math.round(image.naturalWidth * scale));
  const drawHeight = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");

  if (fit === "max") {
    canvas.width = drawWidth;
    canvas.height = drawHeight;
  } else {
    canvas.width = options.width;
    canvas.height = options.height;
  }

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Nao foi possivel processar a imagem.");

  context.clearRect(0, 0, canvas.width, canvas.height);
  const x = fit === "max" ? 0 : Math.round((canvas.width - drawWidth) / 2);
  const y = fit === "max" ? 0 : Math.round((canvas.height - drawHeight) / 2);
  context.drawImage(image, x, y, drawWidth, drawHeight);

  return canvas.toDataURL("image/webp", quality);
}
