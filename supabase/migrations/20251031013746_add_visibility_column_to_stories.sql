/*
  # Add visibility column to stories table

  1. Changes
    - Add `visibility` column to `stories` table
    - Set default value based on existing `is_public` column
    - Add check constraint for valid visibility values
  
  2. Notes
    - Visibility can be 'private', 'unlisted', or 'public'
    - Maintains backward compatibility with is_public column
*/

-- Add visibility column with default value
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stories' AND column_name = 'visibility'
  ) THEN
    ALTER TABLE stories 
    ADD COLUMN visibility text DEFAULT 'private';

    -- Add check constraint for valid values
    ALTER TABLE stories 
    ADD CONSTRAINT stories_visibility_check 
    CHECK (visibility IN ('private', 'unlisted', 'public'));

    -- Update existing records based on is_public
    UPDATE stories 
    SET visibility = CASE 
      WHEN is_public = true THEN 'public'
      ELSE 'private'
    END;
  END IF;
END $$;