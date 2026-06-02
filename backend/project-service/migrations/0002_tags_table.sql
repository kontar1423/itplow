CREATE TABLE IF NOT EXISTS tags (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_tags_project_lower_name
  ON tags (project_id, lower(name));

CREATE INDEX IF NOT EXISTS idx_tags_project_id
  ON tags (project_id);

CREATE INDEX IF NOT EXISTS idx_tags_lower_name
  ON tags (lower(name));

INSERT INTO tags (project_id, name)
SELECT
  p.id,
  trimmed_tag
FROM projects p
CROSS JOIN LATERAL (
  SELECT trim(tag_name) AS trimmed_tag
  FROM unnest(p.tags) AS tag_name
) tag_values
WHERE trimmed_tag <> ''
ON CONFLICT DO NOTHING;

ALTER TABLE projects DROP COLUMN IF EXISTS tags;
