import React from 'react'

const MAX_CHARS = 200

const CommentInput = ({ user, value, onChange, onSubmit, placeholder = "Viết bình luận..." }) => {
  const countChars = (text) => (text || '').length

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && value.trim()) {
      // prevent submitting if no chars or exceeds limit
      const cc = countChars(value)
      if (cc > 0 && cc <= MAX_CHARS) onSubmit()
    }
  }

  const handleChange = (e) => {
    let v = e.target.value
    if ((v || '').length > MAX_CHARS) {
      v = v.slice(0, MAX_CHARS)
    }
    onChange(v)
  }

  const charCount = countChars(value)

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
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <button 
          className="comment-submit"
          onClick={() => {
            const cc = charCount
            if (cc > 0 && cc <= MAX_CHARS) onSubmit()
          }}
          disabled={!(charCount > 0 && charCount <= MAX_CHARS)}
        >
          Gửi
        </button>
      </div>
        <div style={{ fontSize: 12, color: charCount > MAX_CHARS ? '#ef4444' : 'var(--muted)', marginTop: 6 }}>
          {charCount}/{MAX_CHARS} chữ
        </div>
    </div>
  )
}

export default CommentInput
