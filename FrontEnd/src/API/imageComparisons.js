// Lightweight helpers for image comparisons endpoint
const BASE_URL = 'http://localhost:3000';

function normalize(item) {
  if (!item || typeof item !== 'object') return item;
  // backend shape (example): { ComparisonID, Title, Description, YearOld, YearNew, Category: { Name }, OldImagePath, NewImagePath }
  const id = item.id ?? item.ComparisonID ?? null;
  const title = item.title ?? item.Title ?? '';
  const description = item.description ?? item.Description ?? '';
  const oldSrc = item.oldSrc ?? item.OldImagePath ?? item.OldImageUrl ?? item.OldImage ?? '';
  const newSrc = item.newSrc ?? item.NewImagePath ?? item.NewImageUrl ?? item.NewImage ?? '';
  const yearOld = item.yearOld ?? item.YearOld ?? null;
  const yearNew = item.yearNew ?? item.YearNew ?? null;
  const category = item.category ?? (item.Category && (item.Category.Name || item.Category.name)) ?? null;
  const location = item.location ?? item.Location ?? item.City ?? null;
  const likes = typeof item.likes === 'number' ? item.likes : (item.Likes ?? 0);

  return {
    // keep original fields too
    ...item,
    id,
    ComparisonID: item.ComparisonID ?? item.id ?? null,
    title,
    description,
    oldSrc,
    newSrc,
    yearOld,
    yearNew,
    category,
    location,
    likes,
  };
}

export async function getImageComparisons(signal) {
  const res = await fetch(`${BASE_URL}/image-comparisons`, { signal });
  if (!res.ok) throw new Error(`GET /image-comparisons failed ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map(normalize);
}

export async function getImageComparisonById(id, signal) {
  const res = await fetch(`${BASE_URL}/image-comparisons/${id}`, { signal });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`GET /image-comparisons/${id} failed ${res.status}`);
  }
  const data = await res.json();
  return normalize(data);
}

export default {
  getImageComparisons,
  getImageComparisonById,
};
