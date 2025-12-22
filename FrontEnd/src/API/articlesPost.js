// Trợ giúp API đơn giản cho các endpoint `articles_post` sử dụng axios
import { apiClient } from '../services/api'
import { getAiFeatureConfig, getAiEndpointUrl } from '../config/aiConfig'

export async function getArticlesPosts(signal) {
	try {
		const res = await apiClient.get('/articles_post', { signal })
		return res.data
	} catch (err) {
		// Preserve moderation flag when rethrowing so UI can react (e.g., clear inputs)
		if (err && err.isModeration) {
			throw err
		}
		const server = err?.response?.data || err?.response
		const msg = (server && (server.message || JSON.stringify(server))) || err.message || String(err)
		const e = new Error(msg)
		e.cause = err
		throw e
	}
}

export async function createArticlePost(payload) {
	try {
		let modResult = null
		// Run AI moderation if configured
		try {
			const cfg = getAiFeatureConfig()
			const useArticleModeration = cfg?.featureFlags?.moderateArticle
			const endpointKey = useArticleModeration ? 'moderateArticle' : 'moderateComment'
			if (cfg && cfg.featureFlags && endpointKey) {
				const modUrl = getAiEndpointUrl(endpointKey)
				if (modUrl) {
						const text = [payload.title || '', payload.imageDescription || '', payload.content || '']
							.filter(Boolean)
							.join(' ')
							.replace(/\s+/g, ' ')
							.trim()
						// Log the exact JSON body that will be sent to the AI moderation endpoint
						try { console.log('[articlesPost] AI moderation request ->', modUrl, { text }) } catch (e) {}
						const modResp = await fetch(modUrl, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ text }),
					})
					if (modResp && modResp.ok) {
						modResult = await modResp.json()
					}
				}
			}
		} catch (moderationError) {
			console.error('Moderation check failed for article, allowing by fallback:', moderationError)
			modResult = null
		}

		// Evaluate moderation result
		let shouldPersistModeration = false
		if (modResult) {
			const action = modResult.action
			const label = modResult.label
			// Per policy: if label is 'hate' we allow the submission but flag it for admin review
			if (label === 'hate') {
				shouldPersistModeration = true
			} else {
				if (action === 'block') {
					console.debug && console.debug('[moderation] article blocked', modResult)
					const e = new Error('Bài đóng góp bị chặn bởi hệ thống kiểm duyệt')
					e.isModeration = true
					throw e
				}
				if (action === 'allow' && label === 'toxic') {
					console.debug && console.debug('[moderation] article toxic-block', modResult)
					const e = new Error('Bài đóng góp chứa nội dung độc hại và đã bị chặn')
					e.isModeration = true
					throw e
				}
			}
		}

		const sendPayload = {
			...payload,
			...(shouldPersistModeration ? { moderation: modResult } : {}),
		}

		const res = await apiClient.post('/articles_post', sendPayload)
		const data = res.data || {}
		if (modResult && modResult.label === 'hate') {
			try {
				data.moderation = { label: modResult.label, action: modResult.action }
			} catch (e) {}
		}
		if (modResult) {
			console.debug && console.debug('[moderation] modResult:', modResult, 'createdArticle:', data)
		}
		return data
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
