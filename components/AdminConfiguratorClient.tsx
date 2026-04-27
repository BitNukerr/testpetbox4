"use client";

import { useEffect, useState } from "react";
import { AdminImageField } from "@/components/AdminImageField";
import { loadRemoteConfiguratorSettings, saveRemoteConfiguratorSettings } from "@/lib/admin-db";
import { adminStore, slugify, type ConfigOption, type ConfiguratorSettings } from "@/lib/admin-store";

type OptionGroup = "animals" | "sizes" | "ages" | "personalities" | "extras";

const emptyOption: ConfigOption = {
  id: "",
  label: "",
  description: "",
  price: 0,
  image: ""
};

const groups: { key: OptionGroup; title: string; text: string; allowImage?: boolean }[] = [
  { key: "animals", title: "Animais", text: "Cards do primeiro passo.", allowImage: true },
  { key: "sizes", title: "Tamanhos", text: "Opcoes de tamanho e acrescimos de preco." },
  { key: "ages", title: "Idades", text: "Opcoes de idade/fase de vida do animal." },
  { key: "personalities", title: "Personalidades", text: "Estilos da caixa." },
  { key: "extras", title: "Extras", text: "Produtos extra com preco proprio." }
];

function titleField(group: OptionGroup): keyof ConfiguratorSettings {
  if (group === "animals") return "animalTitle";
  if (group === "sizes") return "sizeTitle";
  if (group === "ages") return "ageTitle";
  if (group === "personalities") return "personalityTitle";
  return "extrasTitle";
}

function textField(group: OptionGroup): keyof ConfiguratorSettings {
  if (group === "animals") return "animalText";
  if (group === "sizes") return "sizeText";
  if (group === "ages") return "ageText";
  if (group === "personalities") return "personalityText";
  return "extrasText";
}

export default function AdminConfiguratorClient() {
  const [form, setForm] = useState<ConfiguratorSettings>(() => adminStore.configurator.get());
  const [editingGroup, setEditingGroup] = useState<OptionGroup>("animals");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [optionForm, setOptionForm] = useState<ConfigOption>(emptyOption);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadRemoteConfiguratorSettings(adminStore.configurator.get())
      .then((settings) => {
        setForm(settings);
        adminStore.configurator.set(settings);
      })
      .catch(() => null);
  }, []);

  function update(field: keyof ConfiguratorSettings, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateOption(field: keyof ConfigOption, value: string | number) {
    setOptionForm((current) => ({ ...current, [field]: value }));
  }

  function startNew(group: OptionGroup) {
    setEditingGroup(group);
    setEditingId(null);
    setEditorOpen(true);
    setOptionForm(emptyOption);
    setMessage("");
  }

  function startEdit(group: OptionGroup, option: ConfigOption) {
    setEditingGroup(group);
    setEditingId(option.id);
    setEditorOpen(true);
    setOptionForm(option);
    setMessage("");
  }

  function saveOption() {
    const id = optionForm.id || slugify(optionForm.label);
    if (!id || !optionForm.label || !optionForm.description) {
      setMessage("Preencha nome, id e descricao.");
      return;
    }

    const nextOption = { ...optionForm, id, price: Number(optionForm.price) || 0 };
    setForm((current) => {
      const currentItems = current[editingGroup];
      const exists = currentItems.some((item) => item.id === id || item.id === editingId);
      const nextItems = exists
        ? currentItems.map((item) => item.id === editingId || item.id === id ? nextOption : item)
        : [...currentItems, nextOption];

      return { ...current, [editingGroup]: nextItems };
    });
    setEditingId(id);
    setEditorOpen(false);
    setOptionForm(nextOption);
    setMessage("Opcao guardada. Clique em Guardar configurador para publicar.");
  }

  function deleteOption(group: OptionGroup, id: string) {
    setForm((current) => ({ ...current, [group]: current[group].filter((item) => item.id !== id) }));
    if (editingGroup === group && editingId === id) startNew(group);
    if (editingGroup === group && editingId === id) setEditorOpen(false);
    setMessage("Opcao removida. Clique em Guardar configurador para publicar.");
  }

  async function saveAll() {
    let remoteSaved = true;
    try {
      await saveRemoteConfiguratorSettings(form);
    } catch {
      remoteSaved = false;
    }
    adminStore.configurator.set(form);
    setMessage(remoteSaved ? "Configurador actualizado." : "Configurador guardado localmente. Confirme que o Supabase/RLS esta configurado.");
  }

  function resetAll() {
    adminStore.configurator.reset();
    const next = adminStore.configurator.get();
    setForm(next);
    setEditingGroup("animals");
    setEditingId(null);
    setEditorOpen(false);
    setOptionForm(emptyOption);
    setMessage("Configurador reposto.");
  }

  return (
    <div className="admin-card">
      <div className="card-header d-flex flex-column flex-md-row justify-content-between gap-3">
        <div>
          <h2 className="h4 mb-1">Criar caixa</h2>
          <div className="text-muted">Configure os passos, cards e extras do configurador publico.</div>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="admin-action-btn admin-action-primary" onClick={saveAll}>Guardar configurador</button>
          <button className="admin-action-btn" onClick={resetAll}>Repor</button>
        </div>
      </div>

      <div className="card-body">
        <div className="row g-4">
          <div className="col-12">
            <div className="row g-3">
              <div className="col-md-6"><label className="form-label fw-bold">Titulo do passo Plano</label><input className="admin-form-control" value={form.planTitle} onChange={(event) => update("planTitle", event.target.value)} /></div>
              <div className="col-md-6"><label className="form-label fw-bold">Texto do passo Plano</label><input className="admin-form-control" value={form.planText} onChange={(event) => update("planText", event.target.value)} /></div>
            </div>
          </div>

          {groups.map((group) => (
            <div className="col-12" key={group.key}>
              <div className="admin-config-group">
                <div className="admin-config-group-head">
                  <div>
                    <h3>{group.title}</h3>
                    <p>{group.text}</p>
                  </div>
                  <button className="admin-action-btn" onClick={() => startNew(group.key)}>Adicionar</button>
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-md-6"><label className="form-label fw-bold">Titulo do passo</label><input className="admin-form-control" value={form[titleField(group.key)] as string} onChange={(event) => update(titleField(group.key), event.target.value)} /></div>
                  <div className="col-md-6"><label className="form-label fw-bold">Texto do passo</label><input className="admin-form-control" value={form[textField(group.key)] as string} onChange={(event) => update(textField(group.key), event.target.value)} /></div>
                </div>
                <div className="admin-config-options">
                  {form[group.key].map((option) => (
                    <div className="admin-config-option" key={option.id}>
                      {option.image ? <img src={option.image} alt="" /> : null}
                      <div><strong>{option.label}</strong><span>{option.description}</span><small>{option.id} | +{option.price.toFixed(2)} €</small></div>
                      <div className="admin-table-actions"><button className="admin-action-btn" onClick={() => startEdit(group.key, option)}>Editar</button><button className="admin-action-btn" onClick={() => deleteOption(group.key, option.id)}>Remover</button></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {editorOpen ? <div className="col-12">
            <div className="admin-config-editor">
              <div><h3 className="h5 mb-1">{editingId ? "Editar opcao" : "Nova opcao"}</h3><p className="text-muted mb-0">Grupo: {groups.find((group) => group.key === editingGroup)?.title}</p></div>
              <div className="row g-3 mt-1">
                <div className="col-md-6"><label className="form-label fw-bold">Nome</label><input className="admin-form-control" value={optionForm.label} onChange={(event) => setOptionForm({ ...optionForm, label: event.target.value, id: editingId ? optionForm.id : slugify(event.target.value) })} /></div>
                <div className="col-md-6"><label className="form-label fw-bold">ID</label><input className="admin-form-control" value={optionForm.id} onChange={(event) => updateOption("id", slugify(event.target.value))} /></div>
                <div className="col-md-8"><label className="form-label fw-bold">Descricao</label><input className="admin-form-control" value={optionForm.description} onChange={(event) => updateOption("description", event.target.value)} /></div>
                <div className="col-md-4"><label className="form-label fw-bold">Preco extra</label><input className="admin-form-control" type="number" value={optionForm.price} onChange={(event) => updateOption("price", Number(event.target.value))} /></div>
                <div className="col-12"><label className="form-label fw-bold">Imagem opcional</label><AdminImageField value={optionForm.image || ""} onChange={(image) => updateOption("image", image)} onMessage={setMessage} options={{ width: 720, height: 720, fit: "contain" }} /></div>
                <div className="col-12 d-flex gap-2 flex-wrap"><button className="admin-action-btn admin-action-primary" onClick={saveOption}>Guardar opcao</button><button className="admin-action-btn" onClick={() => { setEditorOpen(false); setEditingId(null); setOptionForm(emptyOption); }}>Fechar</button></div>
              </div>
            </div>
          </div> : null}
        </div>
        {message ? <p className="text-muted mt-3 mb-0">{message}</p> : null}
      </div>
    </div>
  );
}
