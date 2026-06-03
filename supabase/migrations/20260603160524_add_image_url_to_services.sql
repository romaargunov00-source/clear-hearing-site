/*
  # Add image_url to services table
  
  1. Modified Tables
    - `services`
      - Added `image_url` column for storing service image URLs
*/

ALTER TABLE services ADD COLUMN IF NOT EXISTS image_url text;