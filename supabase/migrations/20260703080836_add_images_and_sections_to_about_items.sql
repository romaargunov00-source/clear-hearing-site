/*
# Add images and sections to about_items

1. Modified Tables
  - `about_items`
    - `images` (JSONB, nullable): массив URL фотографий, связанных с блоком. Например: ["https://...", "https://..."]
    - `sections` (JSONB, nullable): массив блоков {title, content} — дополнительные заголовки с содержимым.
      Например: [{"title": "Наша миссия", "content": "Текст..."}, {"title": "История", "content": "Текст..."}]
2. Security
  - Существующие политики RLS не затрагиваются (только добавление колонок).
  - Колонки наследуют текущие права на чтение/запись таблицы about_items.
3. Notes
  - Обе колонки nullable — старые записи остаются рабочими без изменений.
  - JSONB позволяет гибко хранить произвольное число фото и секций.
*/

ALTER TABLE about_items
  ADD COLUMN IF NOT EXISTS images JSONB,
  ADD COLUMN IF NOT EXISTS sections JSONB;