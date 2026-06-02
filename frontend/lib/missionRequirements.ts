export interface MissionRequirementsMeta {
  details: string;
  requirePhoto: boolean;
  requirePlace: boolean;
}

const PHOTO_MARKER = '[meta:require_photo]';
const PLACE_MARKER = '[meta:require_place]';

export function parseMissionRequirements(raw: string | undefined | null): MissionRequirementsMeta {
  const source = (raw || '').trim();
  if (!source) {
    return { details: '', requirePhoto: false, requirePlace: false };
  }

  const lines = source.split('\n');
  let requirePhoto = false;
  let requirePlace = false;
  const detailLines: string[] = [];

  for (const line of lines) {
    const normalized = line.trim().toLowerCase();
    if (normalized === PHOTO_MARKER) {
      requirePhoto = true;
      continue;
    }
    if (normalized === PLACE_MARKER) {
      requirePlace = true;
      continue;
    }
    detailLines.push(line);
  }

  return {
    details: detailLines.join('\n').trim(),
    requirePhoto,
    requirePlace,
  };
}

export function buildMissionRequirements(details: string, requirePhoto: boolean, requirePlace: boolean): string {
  const chunks: string[] = [];
  const cleanedDetails = details.trim();
  if (cleanedDetails) {
    chunks.push(cleanedDetails);
  }
  if (requirePhoto) {
    chunks.push(PHOTO_MARKER);
  }
  if (requirePlace) {
    chunks.push(PLACE_MARKER);
  }
  return chunks.join('\n');
}
