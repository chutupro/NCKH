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

export async function createCollection(data) {
  const res = await fetch(`${BASE_URL}/collections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`POST /collections failed ${res.status}`);
  return res.json();
}

export async function updateCollection(id, data) {
  const res = await fetch(`${BASE_URL}/collections/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`PUT /collections/${id} failed ${res.status}`);
  return res.json();
}

export async function deleteCollection(id) {
  const res = await fetch(`${BASE_URL}/collections/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`DELETE /collections/${id} failed ${res.status}`);
  return res.json();
}
