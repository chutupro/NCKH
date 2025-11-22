import { apiClient } from '../services/api'

export const createComment = async (articleId, content) => {
  try {
    const response = await apiClient.post('/comments', {
      articleId: Number(articleId),
      content,
    })
    return response.data
  } catch (error) {
    console.error('Error creating comment:', error)
    throw error
  }
}

export const createReply = async (articleId, parentCommentId, content, replyToName) => {
  try {
    const response = await apiClient.post('/comments', {
      articleId: Number(articleId),
      parentCommentId: Number(parentCommentId),
      content,
      replyToName,
    })
    return response.data
  } catch (error) {
    console.error('Error creating reply:', error)
    throw error
  }
}

export const getCommentsByArticle = async (articleId) => {
  try {
    const response = await apiClient.get(`/comments/${articleId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching comments:', error)
    throw error
  }
}

export const updateComment = async (commentId, content) => {
  try {
    const response = await apiClient.put(`/comments/${commentId}`, { content })
    return response.data
  } catch (error) {
    console.error('Error updating comment:', error)
    throw error
  }
}

export const deleteComment = async (commentId) => {
  try {
    const response = await apiClient.delete(`/comments/${commentId}`)
    return response.data
  } catch (error) {
    console.error('Error deleting comment:', error)
    throw error
  }
}
