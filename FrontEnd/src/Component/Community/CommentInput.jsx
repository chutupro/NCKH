import React from 'react'

const CommentInput = ({ user, value, onChange, onSubmit, placeholder = "Viết bình luận..." }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && value.trim()) {
      onSubmit()
    }
  }

  return (
    <div className="comment-input-wrapper">
      <div 
        className="comment-avatar"
        style={{
          backgroundImage: user?.avatar ? `url(${user.avatar})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {!user?.avatar && (user?.fullName || 'U').slice(0,2).toUpperCase()}
      </div>
      <input
        type="text"
        className="comment-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button 
        className="comment-submit"
        onClick={onSubmit}
        disabled={!value.trim()}
      >
        Gửi
      </button>
    </div>
  )
}

export default CommentInput
