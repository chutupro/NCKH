import apiClient from '../services/api'

export async function likeArticle(articleId, token = null) {
  try {
    const opts = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    console.debug('[likes] POST like request', { articleId, tokenProvided: !!token, opts })
    const res = await apiClient.post(`/articles_post/${articleId}/like`, {}, opts)
    console.debug('[likes] POST like response', { articleId, data: res.data })
    return res.data
  } catch (err) {
    const server = err?.response?.data || err?.response
    const msg = (server && (server.message || JSON.stringify(server))) || err.message || String(err)
    const e = new Error(msg)
    e.cause = err
    throw e
  }
}

export async function unlikeArticle(articleId, token = null) {
  try {
    const opts = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    console.debug('[likes] DELETE unlike request', { articleId, tokenProvided: !!token, opts })
    const res = await apiClient.delete(`/articles_post/${articleId}/like`, opts)
    console.debug('[likes] DELETE unlike response', { articleId, data: res.data })
    return res.data
  } catch (err) {
    const server = err?.response?.data || err?.response
    const msg = (server && (server.message || JSON.stringify(server))) || err.message || String(err)
    const e = new Error(msg)
    e.cause = err
    throw e
  }

}

export async function getLikeStatus(articleId, token = null) {
  try {
    const opts = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    const res = await apiClient.get(`/articles_post/${articleId}/like`, opts)
    return res.data
  } catch (err) {
    const server = err?.response?.data || err?.response
    const msg = (server && (server.message || JSON.stringify(server))) || err.message || String(err)
    const e = new Error(msg)
    e.cause = err
    throw e
  }
}

export async function listLikes() {
  try {
    const res = await apiClient.get('/likes')
    return res.data
  } catch (err) {
    const server = err?.response?.data || err?.response
    const msg = (server && (server.message || JSON.stringify(server))) || err.message || String(err)
    const e = new Error(msg)
    e.cause = err
    throw e
  }
}

export async function getArticleLikesList(articleId, token = null) {
  try {
    const opts = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    const res = await apiClient.get(`/articles_post/${articleId}/likes`, opts)
    // controller returns { count, userIds }
    return res.data
  } catch (err) {
    const server = err?.response?.data || err?.response
    const msg = (server && (server.message || JSON.stringify(server))) || err.message || String(err)
    const e = new Error(msg)
    e.cause = err
    throw e
  }
}

export default { likeArticle, unlikeArticle, getLikeStatus, listLikes, getArticleLikesList }
