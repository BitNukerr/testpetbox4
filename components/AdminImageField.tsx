"use client";

import { prepareAdminImage, type AdminImageOptions } from "@/lib/admin-image";

type ImageFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onMessage?: (message: string) => void;
  presets?: string[];
  options?: AdminImageOptions;
};

type ImageListProps = {
  value: string;
  onChange: (value: string) => void;
  onMessage?: (message: string) => void;
  presets?: string[];
  options?: AdminImageOptions;
};

function imageItems(value: string) {
  return value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
}

export function AdminImageField({ value, onChange, onMessage, presets = [], options = { width: 900, height: 650, fit: "contain" } }: ImageFieldProps) {
  async function upload(file: File | undefined) {
    if (!file) return;
    try {
      const result = await prepareAdminImage(file, options);
      onChange(result);
      onMessage?.("Imagem adicionada e ajustada ao tamanho certo.");
    } catch (error) {
      onMessage?.(error instanceof Error ? error.message : "Nao foi possivel preparar a imagem.");
    }
  }

  return (
    <div className="admin-image-field">
      {value ? (
        <div className="admin-image-current">
          <img src={value} alt="" />
          <button className="admin-image-remove" type="button" onClick={() => onChange("")} aria-label="Remover imagem">X</button>
        </div>
      ) : <div className="admin-image-empty">Sem imagem</div>}
      <input className="admin-form-control" type="file" accept="image/*" onChange={(event) => upload(event.target.files?.[0])} />
      {presets.length ? (
        <div className="admin-image-presets mt-2">
          {presets.map((image) => (
            <button key={image} className={`admin-image-preset ${value === image ? "active" : ""}`} onClick={() => onChange(image)} type="button">
              <img src={image} alt="" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function AdminImageListField({ value, onChange, onMessage, presets = [], options = { width: 520, height: 520, fit: "contain" } }: ImageListProps) {
  const items = imageItems(value);

  function updateItems(next: string[]) {
    onChange(next.filter(Boolean).join("\n"));
  }

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    try {
      const prepared = await Promise.all(Array.from(files).map((file) => prepareAdminImage(file, options)));
      updateItems([...items, ...prepared]);
      onMessage?.(`${prepared.length} imagem${prepared.length === 1 ? "" : "s"} adicionada${prepared.length === 1 ? "" : "s"}.`);
    } catch (error) {
      onMessage?.(error instanceof Error ? error.message : "Nao foi possivel preparar as imagens.");
    }
  }

  function move(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= items.length) return;
    const next = [...items];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    updateItems(next);
  }

  return (
    <div className="admin-image-field">
      <div className="admin-image-list">
        {items.map((image, index) => (
          <div className="admin-image-list-item" key={`${image}-${index}`}>
            <img src={image} alt="" />
            <div className="admin-image-list-actions">
              <button type="button" onClick={() => move(index, -1)} disabled={index === 0}>Up</button>
              <button type="button" onClick={() => move(index, 1)} disabled={index === items.length - 1}>Down</button>
              <button type="button" onClick={() => updateItems(items.filter((_, itemIndex) => itemIndex !== index))}>X</button>
            </div>
          </div>
        ))}
        {!items.length ? <div className="admin-image-empty">Sem imagens</div> : null}
      </div>
      <input className="admin-form-control" type="file" accept="image/*" multiple onChange={(event) => upload(event.target.files)} />
      {presets.length ? (
        <div className="admin-image-presets mt-2">
          {presets.map((image) => (
            <button key={image} className="admin-image-preset" onClick={() => updateItems([...items, image])} type="button">
              <img src={image} alt="" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
