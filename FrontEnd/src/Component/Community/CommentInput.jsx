import React from 'react'

const MAX_WORDS = 20

const CommentInput = ({ user, value, onChange, onSubmit, placeholder = "Viết bình luận..." }) => {
  const countWords = (text) => (text || '').split(/\s+/).filter(Boolean).length

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && value.trim()) {
      // prevent submitting if no words or exceeds limit
      const wc = countWords(value)
      if (wc > 0 && wc <= MAX_WORDS) onSubmit()
    }
  }

  const handleChange = (e) => {
    let v = e.target.value
    const words = (v || '').split(/\s+/).filter(Boolean)
    if (words.length > MAX_WORDS) {
      v = words.slice(0, MAX_WORDS).join(' ')
    }
    onChange(v)
  }

  const wordCount = countWords(value)

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
            const wc = wordCount
            if (wc > 0 && wc <= MAX_WORDS) onSubmit()
          }}
          disabled={!(wordCount > 0 && wordCount <= MAX_WORDS)}
        >
          Gửi
        </button>
        <div style={{ fontSize: 12, color: wordCount > MAX_WORDS ? '#ef4444' : 'var(--muted)', marginTop: 6 }}>
          {wordCount}/{MAX_WORDS} từ
        </div>
      </div>
    </div>
  )
}

export default CommentInput
