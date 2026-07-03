export type FieldType = "text" | "textarea" | "number" | "select" | "image" | "date" | "gallery" | "sections";

export interface FieldConfig {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface EntityConfig {
  table: string;
  label: string;
  singular: string;
  icon: string;
  fields: FieldConfig[];
  displayField: string;
  secondaryField?: string;
}

export const entityConfigs: Record<string, EntityConfig> = {
  products: {
    table: "products",
    label: "Товары",
    singular: "Товар",
    icon: "Package",
    displayField: "name",
    secondaryField: "price",
    fields: [
      { key: "name", label: "Название", type: "text", required: true },
      { key: "price", label: "Цена (₽)", type: "number", required: true },
      { key: "category_id", label: "Категория", type: "select", required: true, options: [] },
      { key: "image_url", label: "URL изображения", type: "image" },
      { key: "description", label: "Описание", type: "textarea" },
      { key: "specs", label: "Характеристики", type: "textarea" },
    ],
  },
  categories: {
    table: "categories",
    label: "Категории",
    singular: "Категория",
    icon: "FolderTree",
    displayField: "name",
    fields: [
      { key: "name", label: "Название", type: "text", required: true },
      { key: "icon", label: "Иконка (Lucide)", type: "text", required: true, placeholder: "Ear, Radio, Cable..." },
    ],
  },
  services: {
    table: "services",
    label: "Услуги",
    singular: "Услуга",
    icon: "Briefcase",
    displayField: "title",
    secondaryField: "price",
    fields: [
      { key: "title", label: "Название", type: "text", required: true },
      { key: "price", label: "Цена (от, ₽)", type: "text", required: true, placeholder: "5000" },
      { key: "icon", label: "Иконка (Lucide)", type: "text", placeholder: "Wrench" },
      { key: "image_url", label: "URL изображения", type: "image" },
      { key: "description", label: "Описание", type: "textarea" },
    ],
  },
  articles: {
    table: "articles",
    label: "Статьи",
    singular: "Статья",
    icon: "Newspaper",
    displayField: "title",
    secondaryField: "date",
    fields: [
      { key: "title", label: "Заголовок", type: "text", required: true },
      { key: "date", label: "Дата", type: "date", required: true },
      { key: "image_url", label: "URL изображения", type: "image" },
      { key: "content", label: "Содержание", type: "textarea", required: true },
    ],
  },
  about_items: {
    table: "about_items",
    label: "О компании",
    singular: "Блок",
    icon: "Info",
    displayField: "title",
    fields: [
      { key: "title", label: "Заголовок", type: "text", required: true },
      { key: "icon", label: "Иконка (Lucide)", type: "text", placeholder: "Users" },
      { key: "description", label: "Описание", type: "textarea", required: true },
      { key: "images", label: "Фотографии", type: "gallery" },
      { key: "sections", label: "Дополнительные блоки (заголовок + содержание)", type: "sections" },
    ],
  },
  advantages: {
    table: "advantages",
    label: "Преимущества",
    singular: "Преимущество",
    icon: "Sparkles",
    displayField: "title",
    fields: [
      { key: "title", label: "Заголовок", type: "text", required: true },
      { key: "icon", label: "Иконка (Lucide)", type: "text", required: true, placeholder: "UserCheck" },
      { key: "description", label: "Описание", type: "textarea", required: true },
    ],
  },
  partners: {
    table: "partners",
    label: "Партнёры",
    singular: "Партнёр",
    icon: "Handshake",
    displayField: "name",
    fields: [
      { key: "name", label: "Название", type: "text", required: true },
      { key: "logo_url", label: "URL логотипа", type: "image", required: true },
    ],
  },
};

export const heroFields: FieldConfig[] = [
  { key: "title", label: "Заголовок", type: "text", required: true },
  { key: "highlighted_text", label: "Выделенный текст", type: "text", required: true },
  { key: "subtitle", label: "Подзаголовок", type: "text" },
  { key: "description", label: "Описание", type: "textarea", required: true },
];

export const orderStatusOptions = [
  { value: "new", label: "Новый" },
  { value: "processing", label: "В обработке" },
  { value: "completed", label: "Завершён" },
  { value: "cancelled", label: "Отменён" },
];
