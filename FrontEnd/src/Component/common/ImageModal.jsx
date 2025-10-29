import React, { useEffect } from 'react'
import '../../Styles/ImageLibrary/ImageLibrary.css'

const ImageModal = ({ src, alt, caption, onClose }) => {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick} aria-modal="true" role="dialog">
      <div className="modal-content" style={{maxWidth: '1100px', padding: 12}}>
        <button aria-label="Close image" className="modal-close" onClick={onClose}>✕</button>
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <img src={src} alt={alt} style={{maxWidth: '100%', maxHeight: '80vh', borderRadius: 8, objectFit: 'contain'}} />
        </div>
        {caption && (
          <div style={{marginTop: 12, color: 'var(--muted)'}}>{caption}</div>
        )}
      </div>
    </div>
  )
}

export default ImageModal
