// Simple API helper for articles_post endpoints using axios
import axios from 'axios'

const BASE = 'http://localhost:3000'

export async function getArticlesPosts(signal) {
	try {
		const res = await axios.get(`${BASE}/articles_post`, { signal })
		return res.data
	} catch (err) {
		// Try to extract useful server error details when available
		const server = err?.response?.data || err?.response
		const msg = (server && (server.message || JSON.stringify(server))) || err.message || String(err)
		const e = new Error(msg)
		e.cause = err
		throw e
	}
}

export async function createArticlePost(payload) {
	try {
		const res = await axios.post(`${BASE}/articles_post`, payload)
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
		const res = await axios.delete(`${BASE}/articles_post/${id}`)
		return res.data
	} catch (err) {
		const server = err?.response?.data || err?.response
		const msg = (server && (server.message || JSON.stringify(server))) || err.message || String(err)
		const e = new Error(msg)
		e.cause = err
		throw e
	}
}
