import React, { useCallback, useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../../Styles/Contribute/contribute.css'

const Contribute = () => {
  const { t, i18n } = useTranslation();
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState(null)
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const clearFile = () => {
    setFile(null)
    setFileName(null)
    setPreviewUrl(null)
    setAnalysis(null)
    setMessage(null)
    setError(null)
    // reset native input value
    if (inputRef.current) inputRef.current.value = null
  }

  const handleMessageOk = () => {
    // when user acknowledges AI block, clear the image
    clearFile()
  }
  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer?.files?.[0]
    if (f) {
      setFileName(f.name)
      setFile(f)
    }
  }, [])

  const onFileChange = useCallback((e) => {
    const f = e.target.files?.[0]
    if (f) {
      setFileName(f.name)
      setFile(f)
    }
  }, [])

  // create preview when file changes
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const navigate = useNavigate()

  // analyze when user confirms (on purpose)
  const handleConfirm = async () => {
    setError(null)
    setMessage(null)
    setAnalysis(null)
    if (!file) {
      // show a plain Vietnamese message instead of the translation key
      setError('Hãy bỏ ảnh')
      return
    }
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: fd
      })
      if (!res.ok) throw new Error(`Server returned ${res.status}`)
      const json = await res.json()
      const isViolation = json?.nsfw_check?.is_violation
      // show message and block navigation when AI marks image as violation (true)
      if (isViolation === true) {
        // stop loading and show message when AI blocks the image
        setLoading(false)
        const msg = json?.nsfw_check?.message || (t('contributePage.analysisBlocked') || 'Image blocked by AI')
        setMessage(msg)
        // show a browser alert as a fallback so user definitely sees the message
        try {
          window.alert(msg)
          // after user dismisses the alert, clear the file so image is removed
          clearFile()
        } catch (e) {
          /* ignore in non-browser env */
        }
        setAnalysis(null)
        return
      }
      const label = Array.isArray(json?.activeLabels) && json.activeLabels.length ? json.activeLabels[0] : null
      // map AI labels to frontend category names in both EN and VI
      const mapAiToFeCategory = (aiLabel) => {
        if (!aiLabel) return { category_en: null, category_vi: null }
        const key = aiLabel.toLowerCase()
  if (key.includes('nature') || key.includes('landscape') || key.includes('thiên nhiên')) return { category_en: 'Nature', category_vi: 'Thiên nhiên' }
  if (key.includes('heritage') || key.includes('architecture') || key.includes('kiến trúc')) return { category_en: 'Heritage', category_vi: 'Kiến trúc' }
  if (key.includes('culture') || key.includes('art') || key.includes('văn hóa')) return { category_en: 'Culture', category_vi: 'Văn hóa' }
  if (key.includes('people') || key.includes('event') || key.includes('sự kiện')) return { category_en: 'People', category_vi: 'Du lịch' }
        // fallback: return original label for both
        return { category_en: aiLabel, category_vi: aiLabel }
      }
      const mappedCat = mapAiToFeCategory(label)
      const aiResult = {
        category_en: mappedCat.category_en || null,
        category_vi: mappedCat.category_vi || null,
        title_en: json?.caption_en || null,
        title_vi: json?.caption_vi || null
      }
      setAnalysis({ label, caption_en: aiResult.title_en, caption_vi: aiResult.title_vi })
      // navigate to details page; keep loading spinner visible until navigation
      navigate('/contributeinformation', { state: { filePreview: previewUrl, aiResult } })
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="contribute-page">
        <div className="contribute-card">
          <div className="contribute-top">
            <div className="contribute-icon">✦</div>
              <h2>{t('contributePage.title')}</h2>
              <p className="contribute-sub">{t('contributePage.subtitle')}</p>
          </div>

          <div className="contribute-body">
            <label
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={`upload-area ${dragOver ? 'drag-over' : ''}`}
            >
              <input ref={inputRef} type="file" accept="image/*" onChange={onFileChange} />
              {/* preview should overlay upload area */}
              {previewUrl && (
                <div className="preview-wrap">
                  <img src={previewUrl} alt="preview" className="preview-image" />
                </div>
              )}

              {/* loading overlay shown when confirming */}
              {/* no image overlay when loading; button indicates loading instead */}

              <div className="upload-inner">
                <div className="upload-icon">⬆</div>
                  <div className="upload-text">{t('contributePage.uploadText')}</div>
                  <div className="upload-hint">{t('contributePage.uploadHint')}</div>
                  {fileName && <div className="upload-file">{t('contributePage.selected')}: {fileName}</div>}
                  {message && (
                    <div className="upload-message">
                      <div className="upload-message-text">{message}</div>
                      <div className="message-actions">
                        <button type="button" className="btn-ok" onClick={handleMessageOk}>{t('contributePage.ok') || 'OK'}</button>
                      </div>
                    </div>
                  )}
                  {error && <div className="upload-error">{error}</div>}
                  {analysis && (
                    <div className="analysis-result">
                      <div className="analysis-label">{t('contributePage.detectedLabel')}: {analysis.label || '-'}</div>
                      <div className="analysis-caption">{i18n.language === 'vi' ? (analysis.caption_vi || analysis.caption_en) : (analysis.caption_en || analysis.caption_vi)}</div>
                      {/* language is controlled by header global switcher; no local buttons here */}
                    </div>
                  )}
              </div>
            </label>

            <div className="contribute-note">
                <h4>{t('contributePage.noteTitle')}</h4>
              <ul>
                  <li>{t('contributePage.note1')}</li>
                  <li>{t('contributePage.note2')}</li>
                  <li>{t('contributePage.note3')}</li>
                  <li>{t('contributePage.note4')}</li>
              </ul>
            </div>
          </div>

          <div className="contribute-footer">
              <div className="contribute-footer-text">{t('contributePage.footerText')}</div>
              {/* Confirm button triggers AI analyze then navigates with state */}
              <button
                type="button"
                className={`confirm-btn ${loading ? 'loading' : (analysis ? 'enabled' : 'primary')}`}
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading ? (
                  <span className="btn-spinner" aria-hidden="true" />
                ) : (
                  <span>{t('contributePage.confirm')}</span>
                )}
              </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contribute
