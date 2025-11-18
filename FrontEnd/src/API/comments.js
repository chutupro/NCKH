import { apiClient } from '../services/api'

// Tạo comment mới
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
