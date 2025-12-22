import React, { useCallback, useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { getGoogleTranslateLanguage } from '../../Component/common/googleTranslateUtils';
import '../../Styles/Contribute/contribute.css'
import getAiFeatureConfig, { getAiEndpointUrl } from '../../config/aiConfig'

const Contribute = () => {
  // i18n removed: use Google Translate helper to detect language when needed
  const currentLang = typeof window !== 'undefined' ? getGoogleTranslateLanguage() : 'en'
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState(null)
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const clearFile = (options = {}) => {
    const { preserveMessage = false } = options
    setFile(null)
    setFileName(null)
    setPreviewUrl(null)
    setAnalysis(null)
    if (!preserveMessage) setMessage(null)
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
      // remove persisted preview when there's no file
  try { sessionStorage.removeItem('contribute_filePreview') } catch (e) { console.debug('sessionStorage remove error', e) }
      return
    }

    // Read file as data URL so preview survives page reloads (sessionStorage)
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result
  setPreviewUrl(dataUrl)
  try { sessionStorage.setItem('contribute_filePreview', dataUrl) } catch (e) { console.debug('sessionStorage set error', e) }
    }
    reader.onerror = () => {
      setError('Không thể đọc file')
    }
    reader.readAsDataURL(file)
    // no cleanup needed for FileReader
  }, [file])

  const navigate = useNavigate()

  // Inline style for the confirm button when loading to avoid touching CSS file
  const confirmButtonLoadingStyle = loading
    ? {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px',
        width: '56px',
        height: '56px',
        minWidth: '0',
        minHeight: '0',
        boxSizing: 'border-box',
        borderRadius: '999px',
        overflow: 'hidden'
      }
    : undefined

  // Analyze image and category when user confirms, but not title
  const handleConfirm = async () => {
    setError(null)
    setMessage(null)
    setAnalysis(null)
    if (!file) {
      setError('Hãy bỏ ảnh')
      return
    }
    const aiConfig = getAiFeatureConfig()
    const analyzeDisabled = aiConfig?.featureFlags?.analyze === false || aiConfig?.enableAnalyze === false
    if (analyzeDisabled) {
      // Skip AI flow entirely; go straight to form
      navigate('/contributeinformation', { state: { filePreview: previewUrl, aiResult: null, file } })
      return
    }

    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const endpoint = getAiEndpointUrl('analyze') || `${aiConfig.baseUrl}${aiConfig.analyzeEndpoint || '/fast-analyze'}`
      const res = await fetch(endpoint, {
        method: 'POST',
        body: fd
      })
      if (!res.ok) throw new Error(`Server returned ${res.status}`)
      const json = await res.json()
      const action = json?.action
      const isViolation = json?.nsfw_check?.is_violation
      const isFake = json?.manipulation?.is_fake === true
      const isHistorical = json?.historical?.is_historical
      const blockAndNotify = (msg) => {
        setLoading(false)
        setMessage(msg)
        try {
          window.alert(msg)
        } catch {
          /* ignore */
        }
        clearFile({ preserveMessage: true })
        setAnalysis(null)
      }
      // show message and block navigation when AI marks issues
      if (action === 'blocked') {
        const msg = json?.message || 'Ảnh bị chặn bởi AI'
        blockAndNotify(msg)
        return
      }
      if (aiConfig.gates?.nsfw && isViolation === true) {
        const msg = json?.nsfw_check?.message || 'Ảnh bị chặn bởi AI'
        blockAndNotify(msg)
        return
      }
      if (aiConfig.gates?.manipulation && isFake) {
        blockAndNotify('Không nhận hình ảnh đã chỉnh sửa/giả mạo')
        return
      }
      if (aiConfig.gates?.historical && isHistorical === false) {
        setLoading(false)
        setMessage('Ảnh này không phải ảnh lịch sử, vui lòng chọn ảnh khác')
        const userChoice = window.confirm('Ảnh này không phải ảnh lịch sử. Bạn có muốn tiếp tục đóng góp ảnh này không?')
        if (!userChoice) {
          clearFile({ preserveMessage: true })
          setAnalysis(null)
          return
        }
        // User chose to continue, proceed with the image
      }
      const label = Array.isArray(json?.activeLabels) && json.activeLabels.length ? json.activeLabels[0] : null
      // map AI labels to frontend category names in both EN and VI
      const mapAiToFeCategory = (aiLabel) => {
        if (!aiLabel) return { category_en: null, category_vi: null }
        const key = aiLabel.toLowerCase()
      if (key.includes('nature') || key.includes('landscape') || key.includes('thiên nhiên')) return { category_en: 'Nature', category_vi: 'Thiên nhiên' }
      // map legacy/ambiguous heritage -> Architecture as requested
      if (key.includes('heritage') || key.includes('architecture') || key.includes('kiến trúc')) return { category_en: 'Architecture', category_vi: 'Kiến trúc' }
      if (key.includes('culture') || key.includes('art') || key.includes('văn hóa')) return { category_en: 'Culture', category_vi: 'Văn hóa' }
      if (key.includes('people') || key.includes('event') || key.includes('sự kiện')) return { category_en: 'People', category_vi: 'Du lịch' }
        // fallback: return original label for both
        return { category_en: aiLabel, category_vi: aiLabel }
      }
      const mappedCat = mapAiToFeCategory(label)
      // Only send category, NOT title (title will be analyzed separately in details page)
      const aiResult = {
        category_en: mappedCat.category_en || null,
        category_vi: mappedCat.category_vi || null,
        title_en: null,
        title_vi: null
      }
      setAnalysis({ label })
      setLoading(false)
      // navigate to details page; pass preview + file + AI result (category only)
      navigate('/contributeinformation', { state: { filePreview: previewUrl, aiResult, file } })
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
              <h2>{'Đóng góp ảnh di sản văn hóa'}</h2>
              <p className="contribute-sub">{'Tải lên hình ảnh lịch sử (xưa) về di sản văn hóa Đà Nẵng — AI sẽ phân tích ảnh và gợi ý danh mục.'}</p>
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
                  <div className="upload-text">{'Nhấn để chọn ảnh hoặc kéo thả vào đây'}</div>
                  <div className="upload-hint">{'Hỗ trợ: JPG, PNG, WEBP (tối đa 10MB)'}</div>
                  {fileName && <div className="upload-file">{'Chọn'}: {fileName}</div>}
                  {error && <div className="upload-error">{error}</div>}
                  {analysis && (
                    <div className="analysis-result">
                      <div className="analysis-label">{'Phát hiện danh mục'}: {analysis.label || '-'}</div>
                    </div>
                  )}
              </div>
            </label>

            <div className="contribute-note">
                <h4>{'Lưu ý khi chọn ảnh lịch sử:'}</h4>
              <ul>
                  <li>{'Chỉ nhận ảnh lịch sử (xưa) của di sản văn hóa Đà Nẵng'}</li>
                  <li>{'Tránh ảnh mờ, quá tối hoặc quá sáng'}</li>
                  <li>{'Ảnh nên thể hiện rõ di sản văn hóa cần đóng góp'}</li>
                  <li>{'AI sẽ phân tích tốt hơn với ảnh có góc chụp đẹp'}</li>
              </ul>
            </div>
          </div>

          <div className="contribute-footer">
              <div className="contribute-footer-text">{'AI sẽ phân tích ảnh và danh mục, sau đó chuyển đến trang điền thông tin'}</div>
              {/* Confirm button triggers AI analyze (category only) then navigates */}
              <button
                type="button"
                className={`confirm-btn ${loading ? 'loading' : (analysis ? 'enabled' : 'primary')}`}
                onClick={handleConfirm}
                disabled={loading}
                style={confirmButtonLoadingStyle}
              >
                {loading ? (
                  <span className="btn-spinner" aria-hidden="true" style={{ marginRight: 0 }} />
                ) : (
                  <span>{'Tiếp tục'}</span>
                )}
              </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contribute
