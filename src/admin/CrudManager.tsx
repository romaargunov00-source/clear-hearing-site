import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import type { EntityConfig, FieldConfig } from "./entityConfigs";

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
      initial[f.key] = val !== null && val !== undefined ? String(val) : "";
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
      const val = formData[f.key]?.trim() ?? "";
      if (val === "") {
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
          <SelectTrigger>
            <SelectValue placeholder="Выберите..." />
          </SelectTrigger>
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
          />
          {value && <img src={value} alt="preview" className="w-full max-h-40 object-contain rounded border" />}
        </div>
      );
    }

    return (
      <Input
        type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
        value={value}
        onChange={(e) => setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))}
        placeholder={field.placeholder}
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
        <h2 className="text-2xl font-bold">{config.label}</h2>
        <Button onClick={openCreate} className="bg-primary hover:bg-primary/90 text-white">
          <Icon name="Plus" className="mr-2" size={18} />
          Добавить
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Icon name="Inbox" size={48} className="mx-auto mb-4 opacity-50" />
            <p>Нет записей. Нажмите «Добавить» чтобы создать первую.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => (
            <Card key={row.id as string} className="hover:border-primary/50 transition">
              <CardContent className="py-3 flex items-center gap-4">
                {row.image_url && (
                  <img src={row.image_url as string} alt="" className="w-12 h-12 rounded object-cover flex-shrink-0" />
                )}
                {row.logo_url && (
                  <img src={row.logo_url as string} alt="" className="w-12 h-12 rounded object-contain flex-shrink-0 bg-muted p-1" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{getDisplayValue(row, config.displayField)}</p>
                  {config.secondaryField && (
                    <p className="text-sm text-muted-foreground truncate">{getDisplayValue(row, config.secondaryField)}</p>
                  )}
                </div>
                <Button size="sm" variant="outline" onClick={() => openEdit(row)}>
                  <Icon name="Pencil" size={16} />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => setDeleteId(row.id as string)}>
                  <Icon name="Trash2" size={16} />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? `Редактировать: ${config.singular}` : `Создать: ${config.singular}`}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {config.fields.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label>
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                {renderField(field)}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Отмена</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 text-white">
              {saving ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить {config.singular.toLowerCase()}?</AlertDialogTitle>
            <AlertDialogDescription>Действие нельзя отменить. Запись будет удалена навсегда.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-white">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
