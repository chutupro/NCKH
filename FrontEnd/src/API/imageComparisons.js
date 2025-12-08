// API helpers for image comparisons endpoint
const BASE_URL = 'http://localhost:3000';

function normalize(item) {
  if (!item || typeof item !== 'object') return item;
  
  // Backend returns: { ComparisonID, Title, Description, Category, firstImage, lastImage, images[] }
  const id = item.ComparisonID ?? item.id ?? null;
  const title = item.Title ?? item.title ?? '';
  const description = item.Description ?? item.description ?? '';
  const category = item.Category?.Name ?? item.category ?? null;
  const location = item.Location ?? item.location ?? item.City ?? null;
  
  // For list view: firstImage and lastImage
  const oldSrc = item.firstImage?.src ?? item.firstImage?.ImagePath ?? item.oldSrc ?? '';
  const newSrc = item.lastImage?.src ?? item.lastImage?.ImagePath ?? item.newSrc ?? '';
  const yearOld = item.firstImage?.year ?? item.firstImage?.Year ?? item.yearOld ?? null;
  const yearNew = item.lastImage?.year ?? item.lastImage?.Year ?? item.yearNew ?? null;
  
  // For detail view: full images array
  const images = Array.isArray(item.images) 
    ? item.images.map(img => ({
        ImageID: img.ImageID,
        src: img.src || img.ImagePath || '',
        year: img.year ?? img.Year ?? null,
        caption: img.caption || img.Caption || '',
        displayOrder: img.displayOrder ?? img.DisplayOrder ?? 0
      }))
    : [];

  return {
    ...item,
    id,
    ComparisonID: id,
    title,
    description,
    oldSrc,
    newSrc,
    yearOld,
    yearNew,
    category,
    location,
    firstImage: item.firstImage,
    lastImage: item.lastImage,
    images,
  };
}

export async function getImageComparisons(signal) {
  const res = await fetch(`${BASE_URL}/imagecomparisons`, { signal });
  if (!res.ok) throw new Error(`GET /imagecomparisons failed ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map(normalize);
}

export async function getImageComparisonById(id, signal) {
  const res = await fetch(`${BASE_URL}/imagecomparisons/${id}`, { signal });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`GET /imagecomparisons/${id} failed ${res.status}`);
  }
  const data = await res.json();
  return normalize(data);
}

export default {
  getImageComparisons,
  getImageComparisonById,
};
