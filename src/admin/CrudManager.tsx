import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import type { EntityConfig, FieldConfig } from "./entityConfigs";

interface GalleryImage {
  url: string;
  caption?: string;
}

interface AboutSection {
  title: string;
  content: string;
}

interface CrudManagerProps {
  config: EntityConfig;
  categories?: { id: string; name: string }[];
}

type Row = Record<string, unknown>;

export default function CrudManager({ config, categories }: CrudManagerProps) {
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from(config.table).select("*").order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Ошибка загрузки", description: error.message, variant: "destructive" });
    } else {
      setRows((data || []) as Row[]);
    }
    setLoading(false);
  }, [config.table, toast]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const openCreate = () => {
    const initial: Record<string, string> = {};
    config.fields.forEach((f) => {
      initial[f.key] = f.type === "select" && f.options && f.options.length > 0 ? f.options[0].value : "";
    });
    setFormData(initial);
    setEditingId(null);
    setShowDialog(true);
  };

  const openEdit = (row: Row) => {
    const initial: Record<string, string> = {};
    config.fields.forEach((f) => {
      const val = row[f.key];
      if (f.type === "gallery") {
        const imgs = Array.isArray(val) ? val as GalleryImage[] : [];
        initial[f.key] = JSON.stringify(imgs.map((i) => ({ url: i.url || "", caption: i.caption || "" })));
      } else if (f.type === "sections") {
        const secs = Array.isArray(val) ? val as AboutSection[] : [];
        initial[f.key] = JSON.stringify(secs.map((s) => ({ title: s.title || "", content: s.content || "" })));
      } else {
        initial[f.key] = val !== null && val !== undefined ? String(val) : "";
      }
    });
    setFormData(initial);
    setEditingId(row.id as string);
    setShowDialog(true);
  };

  const handleSave = async () => {
    const missing = config.fields.filter((f) => f.required && !formData[f.key]?.trim());
    if (missing.length > 0) {
      toast({ title: "Заполните обязательные поля", description: missing.map((f) => f.label).join(", "), variant: "destructive" });
      return;
    }

    setSaving(true);
    const payload: Record<string, unknown> = {};
    config.fields.forEach((f) => {
      const raw = formData[f.key] ?? "";
      const val = raw.trim();
      if (f.type === "gallery") {
        let imgs: GalleryImage[] = [];
        try {
          imgs = JSON.parse(raw || "[]") as GalleryImage[];
        } catch {
          imgs = [];
        }
        payload[f.key] = imgs.filter((i) => i.url.trim()).length > 0 ? imgs.filter((i) => i.url.trim()) : null;
      } else if (f.type === "sections") {
        let secs: AboutSection[] = [];
        try {
          secs = JSON.parse(raw || "[]") as AboutSection[];
        } catch {
          secs = [];
        }
        payload[f.key] = secs.filter((s) => s.title.trim() || s.content.trim()).length > 0 ? secs.filter((s) => s.title.trim() || s.content.trim()) : null;
      } else if (val === "") {
        payload[f.key] = null;
      } else if (f.type === "number") {
        payload[f.key] = parseFloat(val);
      } else {
        payload[f.key] = val;
      }
    });

    let error;
    if (editingId) {
      ({ error } = await supabase.from(config.table).update(payload).eq("id", editingId));
    } else {
      ({ error } = await supabase.from(config.table).insert(payload));
    }

    if (error) {
      toast({ title: "Ошибка сохранения", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editingId ? "Обновлено" : "Создано", description: config.singular + " сохранён(а)" });
      setShowDialog(false);
      fetchRows();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from(config.table).delete().eq("id", deleteId);
    if (error) {
      toast({ title: "Ошибка удаления", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Удалено", description: config.singular + " удалён(а)" });
      fetchRows();
    }
    setDeleteId(null);
  };

  const renderField = (field: FieldConfig) => {
    const value = formData[field.key] || "";

    if (field.type === "select") {
      const opts = field.key === "category_id" && categories
        ? categories.map((c) => ({ value: c.id, label: c.name }))
        : field.options || [];
      return (
        <Select value={value} onValueChange={(v) => setFormData((prev) => ({ ...prev, [field.key]: v }))}>
          <SelectTrigger className="rounded-none border-gray-400"><SelectValue placeholder="Выберите..." /></SelectTrigger>
          <SelectContent>
            {opts.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (field.type === "textarea") {
      return (
        <Textarea
          value={value}
          onChange={(e) => setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))}
          placeholder={field.placeholder}
          rows={field.key === "content" ? 10 : 4}
          className="rounded-none border-gray-400"
        />
      );
    }

    if (field.type === "image") {
      return (
        <div className="space-y-2">
          <Input
            value={value}
            onChange={(e) => setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))}
            placeholder="https://..."
            className="rounded-none border-gray-400"
          />
          {value && <img src={value} alt="preview" className="w-full max-h-40 object-contain border border-gray-300" />}
        </div>
      );
    }

    if (field.type === "gallery") {
      let images: GalleryImage[] = [];
      try {
        images = JSON.parse(value || "[]") as GalleryImage[];
        if (!Array.isArray(images)) images = [];
      } catch {
        images = [];
      }

      const updateGallery = (newImages: GalleryImage[]) => {
        setFormData((prev) => ({ ...prev, [field.key]: JSON.stringify(newImages) }));
      };

      return (
        <div className="space-y-3">
          {images.map((img, idx) => (
            <div key={idx} className="border border-gray-300 p-3 space-y-2">
              <div className="flex gap-2">
                <Input
                  value={img.url}
                  onChange={(e) => {
                    const next = [...images];
                    next[idx] = { ...next[idx], url: e.target.value };
                    updateGallery(next);
                  }}
                  placeholder="https://... (URL фотографии)"
                  className="rounded-none border-gray-400"
                />
                <button
                  type="button"
                  onClick={() => updateGallery(images.filter((_, i) => i !== idx))}
                  className="border border-red-700 text-red-700 hover:bg-red-50 px-3 text-xs font-bold transition-colors flex-shrink-0"
                >
                  Удалить
                </button>
              </div>
              <Input
                value={img.caption || ""}
                onChange={(e) => {
                  const next = [...images];
                  next[idx] = { ...next[idx], caption: e.target.value };
                  updateGallery(next);
                }}
                placeholder="Подпись к фото (необязательно)"
                className="rounded-none border-gray-400"
              />
              {img.url && <img src={img.url} alt="preview" className="w-full max-h-32 object-contain border border-gray-300" />}
            </div>
          ))}
          <button
            type="button"
            onClick={() => updateGallery([...images, { url: "", caption: "" }])}
            className="border border-gray-400 hover:bg-gray-100 px-4 py-2 text-sm font-bold transition-colors"
          >
            + Добавить фотографию
          </button>
        </div>
      );
    }

    if (field.type === "sections") {
      let sections: AboutSection[] = [];
      try {
        sections = JSON.parse(value || "[]") as AboutSection[];
        if (!Array.isArray(sections)) sections = [];
      } catch {
        sections = [];
      }

      const updateSections = (newSections: AboutSection[]) => {
        setFormData((prev) => ({ ...prev, [field.key]: JSON.stringify(newSections) }));
      };

      return (
        <div className="space-y-3">
          {sections.map((sec, idx) => (
            <div key={idx} className="border border-gray-300 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500">Блок {idx + 1}</span>
                <button
                  type="button"
                  onClick={() => updateSections(sections.filter((_, i) => i !== idx))}
                  className="border border-red-700 text-red-700 hover:bg-red-50 px-3 py-1 text-xs font-bold transition-colors"
                >
                  Удалить блок
                </button>
              </div>
              <Input
                value={sec.title}
                onChange={(e) => {
                  const next = [...sections];
                  next[idx] = { ...next[idx], title: e.target.value };
                  updateSections(next);
                }}
                placeholder="Заголовок блока"
                className="rounded-none border-gray-400"
              />
              <Textarea
                value={sec.content}
                onChange={(e) => {
                  const next = [...sections];
                  next[idx] = { ...next[idx], content: e.target.value };
                  updateSections(next);
                }}
                placeholder="Содержание блока"
                rows={4}
                className="rounded-none border-gray-400"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => updateSections([...sections, { title: "", content: "" }])}
            className="border border-gray-400 hover:bg-gray-100 px-4 py-2 text-sm font-bold transition-colors"
          >
            + Добавить блок
          </button>
        </div>
      );
    }

    return (
      <Input
        type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
        value={value}
        onChange={(e) => setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))}
        placeholder={field.placeholder}
        className="rounded-none border-gray-400"
      />
    );
  };

  const getDisplayValue = (row: Row, fieldKey: string): string => {
    const val = row[fieldKey];
    if (val === null || val === undefined) return "";
    if (fieldKey === "price" && typeof val === "number") return val.toLocaleString("ru-RU") + " ₽";
    return String(val);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#1a3a5c]">{config.label}</h2>
        <button onClick={openCreate} className="bg-[#1a3a5c] hover:bg-[#0f2a44] text-white px-4 py-2 text-sm font-bold transition-colors">
          + Добавить
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="border border-gray-300 py-12 text-center text-gray-500">
          <p className="text-sm">Нет записей. Нажмите «Добавить» чтобы создать первую.</p>
        </div>
      ) : (
        <div className="border border-gray-300">
          <table className="w-full text-sm">
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.id as string} className={`border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}>
                  {(row.image_url || row.logo_url) && (
                    <td className="px-3 py-3 w-14">
                      <img src={(row.image_url || row.logo_url) as string} alt="" className="w-10 h-10 object-cover" />
                    </td>
                  )}
                  <td className="px-3 py-3">
                    <p className="font-bold text-gray-900">{getDisplayValue(row, config.displayField)}</p>
                    {config.secondaryField && (
                      <p className="text-xs text-gray-500 truncate">{getDisplayValue(row, config.secondaryField)}</p>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right whitespace-nowrap">
                    <button onClick={() => openEdit(row)} className="border border-gray-400 hover:bg-gray-100 px-2.5 py-1.5 text-xs font-bold transition-colors mr-1">
                      Изменить
                    </button>
                    <button onClick={() => setDeleteId(row.id as string)} className="border border-red-700 text-red-700 hover:bg-red-50 px-2.5 py-1.5 text-xs font-bold transition-colors">
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-none border border-gray-300">
          <DialogHeader>
            <DialogTitle className="text-[#1a3a5c]">{editingId ? `Редактировать: ${config.singular}` : `Создать: ${config.singular}`}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {config.fields.map((field) => (
              <div key={field.key} className="space-y-1">
                <Label className="block text-xs font-bold text-gray-700">
                  {field.label}
                  {field.required && <span className="text-red-700 ml-1">*</span>}
                </Label>
                {renderField(field)}
              </div>
            ))}
          </div>
          <DialogFooter>
            <button onClick={() => setShowDialog(false)} className="border border-gray-400 hover:bg-gray-100 px-4 py-2 text-sm font-bold transition-colors">
              Отмена
            </button>
            <button onClick={handleSave} disabled={saving} className="bg-[#1a3a5c] hover:bg-[#0f2a44] text-white px-4 py-2 text-sm font-bold transition-colors disabled:opacity-50">
              {saving ? "Сохранение..." : "Сохранить"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-none border border-gray-300">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#1a3a5c]">Удалить {config.singular.toLowerCase()}?</AlertDialogTitle>
            <AlertDialogDescription>Действие нельзя отменить. Запись будет удалена навсегда.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none border border-gray-400 hover:bg-gray-100">Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-none bg-red-700 hover:bg-red-800 text-white">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
