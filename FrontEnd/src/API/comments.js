import { apiClient } from '../services/api'
import { getAiFeatureConfig, getAiEndpointUrl } from '../config/aiConfig'

// Tạo comment mới
export const createComment = async (articleId, content) => {
  try {
    // Run AI moderation if enabled
    let modResult = null
    try {
      const cfg = getAiFeatureConfig()
      if (cfg?.featureFlags?.moderateComment) {
        const modUrl = getAiEndpointUrl('moderateComment')
        if (modUrl) {
          const modResp = await fetch(modUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: content }),
          })
          if (modResp && modResp.ok) {
            modResult = await modResp.json()
          }
        }
      }
    } catch (moderationError) {
      // If moderation fails (network or server), log but allow comment to be posted
      console.error('Moderation check failed, allowing comment by fallback:', moderationError)
      modResult = null
    }

    // Evaluate moderation result after the moderation call so we don't accidentally
    // catch 'block' decisions inside the moderation try/catch and fall back to allow.
    if (modResult) {
      const action = modResult.action
      const label = modResult.label
      if (action === 'block') {
        const err = new Error('Bình luận bị chặn bởi hệ thống kiểm duyệt')
        err.isModeration = true
        throw err
      }
      if (action === 'allow' && label === 'toxic') {
        const err = new Error('Bình luận chứa nội dung độc hại và đã bị chặn')
        err.isModeration = true
        throw err
      }
      // For 'hate' label we keep modResult in-memory (not sent to backend) so frontend
      // can display admin-only flag. Backend currently doesn't accept moderation field.
    }

    const payload = {
      articleId: Number(articleId),
      content,
      ...(modResult ? { moderation: modResult } : {}),
    }
    const response = await apiClient.post('/comments', payload)
    const returned = response.data || {}
    // Normalize common backend field names to frontend-friendly fields
    returned.id = returned.id ?? returned.CommentID ?? returned.commentId ?? returned.CommentId
    returned.createdAt = returned.createdAt ?? returned.CreatedAt ?? returned.createdAt
    returned.parentCommentId = returned.parentCommentId ?? returned.ParentCommentID ?? returned.parentCommentId ?? returned.ParentCommentId
    if (modResult && modResult.label === 'hate') {
      returned.moderation = { label: modResult.label, action: modResult.action }
    }
    // Debugging aid: print moderation result and normalized returned object when moderation ran
    if (modResult) {
      try {
        console.debug('[moderation] modResult:', modResult, 'createdComment:', returned)
      } catch (e) {
        // ignore console errors in older browsers
      }
    }
    return returned
  } catch (error) {
    console.error('Error creating comment:', error)
    throw error
  }
}

// Tạo reply cho comment
export const createReply = async (articleId, parentCommentId, content, replyToName) => {
  try {
    let modResult = null
    // Run AI moderation similar to createComment
    try {
      const cfg = getAiFeatureConfig()
      if (cfg?.featureFlags?.moderateComment) {
        const modUrl = getAiEndpointUrl('moderateComment')
        if (modUrl) {
          const modResp = await fetch(modUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: content }),
          })
          if (modResp && modResp.ok) {
            modResult = await modResp.json()
          }
        }
      }
    } catch (moderationError) {
      console.error('Moderation check failed for reply, allowing by fallback:', moderationError)
      modResult = null
    }

    if (modResult) {
      const action = modResult.action
      const label = modResult.label
      if (action === 'block') {
        const err = new Error('Trả lời bị chặn bởi hệ thống kiểm duyệt')
        err.isModeration = true
        throw err
      }
      if (action === 'allow' && label === 'toxic') {
        const err = new Error('Trả lời chứa nội dung độc hại và đã bị chặn')
        err.isModeration = true
        throw err
      }
    }

    const payload = {
      articleId: Number(articleId),
      parentCommentId: Number(parentCommentId),
      content,
      replyToName,
      ...(modResult ? { moderation: modResult } : {}),
    }
    const response = await apiClient.post('/comments', payload)
    const returned = response.data || {}
    returned.id = returned.id ?? returned.CommentID ?? returned.commentId ?? returned.CommentId
    returned.createdAt = returned.createdAt ?? returned.CreatedAt ?? returned.createdAt
    returned.parentCommentId = returned.parentCommentId ?? returned.ParentCommentID ?? returned.parentCommentId ?? returned.ParentCommentId
    if (modResult && modResult.label === 'hate') {
      returned.moderation = { label: modResult.label, action: modResult.action }
    }
    if (modResult) {
      try {
        console.debug('[moderation] modResult:', modResult, 'createdReply:', returned)
      } catch (e) {
      }
    }
    return returned
  } catch (error) {
    console.error('Error creating reply:', error)
    throw error
  }
}

// Lấy tất cả comment của một bài viết
export const getCommentsByArticle = async (articleId) => {
  try {
    const response = await apiClient.get(`/comments/${articleId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching comments:', error)
    throw error
  }
}

// Cập nhật comment
export const updateComment = async (commentId, content) => {
  try {
    const response = await apiClient.put(`/comments/${commentId}`, { content })
    return response.data
  } catch (error) {
    console.error('Error updating comment:', error)
    throw error
  }
}

// Xóa comment
export const deleteComment = async (commentId) => {
  try {
    const response = await apiClient.delete(`/comments/${commentId}`)
    return response.data
  } catch (error) {
    console.error('Error deleting comment:', error)
    throw error
  }
}
