// Lightweight API helpers for collections and categories
// Keep URL explicit to avoid proxy issues; change BASE_URL if needed.
const BASE_URL = 'http://localhost:3000';

export async function getCollections() {
  const res = await fetch(`${BASE_URL}/collections`);
  if (!res.ok) throw new Error(`GET /collections failed ${res.status}`);
  return res.json();
}

export async function getCategories() {
  const res = await fetch(`${BASE_URL}/categories`);
  if (!res.ok) throw new Error(`GET /categories failed ${res.status}`);
  return res.json();
}

export async function getCollectionById(id) {
  const res = await fetch(`${BASE_URL}/collections/${id}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`GET /collections/${id} failed ${res.status}`);
  }
  return res.json();
}
