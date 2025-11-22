const BASE_URL = 'http://localhost:3000';

export async function getArticles() {
  const res = await fetch(`${BASE_URL}/articles_post`);
  if (!res.ok) throw new Error(`GET /articles_post failed ${res.status}`);
  return res.json();
}

export async function getArticleById(id) {

  const articles = await getArticles();
  return articles.find(a => (a.ArticleID ?? a.id ?? a.id) == id) || null;
}
