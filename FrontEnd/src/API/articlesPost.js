// Trợ giúp API đơn giản cho các endpoint `articles_post` sử dụng axios
import apiClient from '../services/api'

export async function getArticlesPosts(signal) {
	try {
		const res = await apiClient.get('/articles_post', { signal })
		return res.data
	} catch (err) {
		const server = err?.response?.data || err?.response
		const msg = (server && (server.message || JSON.stringify(server))) || err.message || String(err)
		const e = new Error(msg)
		e.cause = err
		throw e
	}
}

export async function createArticlePost(payload) {
	try {
		const res = await apiClient.post('/articles_post', payload)
		return res.data
	} catch (err) {
		const server = err?.response?.data || err?.response
		const msg = (server && (server.message || JSON.stringify(server))) || err.message || String(err)
		const e = new Error(msg)
		e.cause = err
		throw e
	}
}

export default {
	getArticlesPosts,
	createArticlePost,
}

export async function deleteArticlePost(id) {
	try {
		const res = await apiClient.delete(`/articles_post/${id}`)
		return res.data
	} catch (err) {
		const server = err?.response?.data || err?.response
		const msg = (server && (server.message || JSON.stringify(server))) || err.message || String(err)
		const e = new Error(msg)
		e.cause = err
		throw e
	}
}
