import React, { useState } from 'react'
import '../../Styles/Contribute/contributeInformation.css'
import { useLocation, useNavigate } from 'react-router-dom'
// i18n removed: useTranslation import removed
import { getGoogleTranslateLanguage } from '../../Component/common/googleTranslateUtils'

import CustomSelect from '../../Component/common/CustomSelect'
import { createArticlePost } from '../../API/articlesPost'
import { getCategories } from '../../API/collections'
import { useEffect, useContext } from 'react'
import AppContext from '../../context/context'
import getAiFeatureConfig, { getAiEndpointUrl } from '../../config/aiConfig'
const BACKEND_BASE = 'http://localhost:3000'

// helper: convert dataURL -> Blob
async function dataURLtoBlob(dataurl) {
  const arr = dataurl.split(',')
  const mimeMatch = arr[0].match(/:(.*?);/)
  const mime = mimeMatch ? mimeMatch[1] : 'image/png'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], { type: mime })
}

const ContributeInformation = () => {
  const loc = useLocation()
  const navigate = useNavigate()
  // const { t, i18n } = useTranslation()  // no longer used
  // try to get file data from location state (set by previous page)
  // fallback to sessionStorage so image persists across reloads
  let initialImage = null
  if (loc.state?.filePreview) initialImage = loc.state.filePreview
  else {
    try {
      initialImage = sessionStorage.getItem('contribute_filePreview') || null
    } catch (e) {
      console.debug('sessionStorage get error', e)
      initialImage = null
    }
  }
  const incomingAi = loc.state?.aiResult || null

  // normalize ai result to include both title_en/title_vi and category_en/category_vi
  const initialAI = incomingAi ? {
    category_en: incomingAi.category_en || incomingAi.category || '',
    category_vi: incomingAi.category_vi || incomingAi.category || '',
    title_en: incomingAi.title_en || incomingAi.title || '',
    title_vi: incomingAi.title_vi || incomingAi.title || ''
  } : { category_en: 'Travel', category_vi: 'Du lịch', title_en: 'Kim Bong wood village', title_vi: 'Làng nghề mộc Kim Bồng' }

  const [imageSrc] = useState(initialImage)
  const [ai, setAi] = useState(initialAI)
  const [uploadedPath, setUploadedPath] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [localObjectUrl, setLocalObjectUrl] = useState(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [alt, setAlt] = useState('')
  const [content, setContent] = useState('')
  const [categories, setCategories] = useState([])
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)
  const [showAiModal, setShowAiModal] = useState(false)
  const [showAiOptionsForm, setShowAiOptionsForm] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiGenerateError, setAiGenerateError] = useState(null)
  const [selectedAiOptions, setSelectedAiOptions] = useState([])
  const [aiFormData, setAiFormData] = useState({
    tone: 'friendly',
    length: 'medium',
    language: 'vi_en'
  })

  // Fetch categories from API
  useEffect(() => {
    const fetchCategoriesData = async () => {
      try {
        const data = await getCategories()
        setCategories(data || [])
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    fetchCategoriesData()
  }, [])

  // Prefill contributor info from logged-in user (AppContext)
  const appCtx = useContext(AppContext)
  useEffect(() => {
    const ctxUser = appCtx?.user
    if (ctxUser) {
      // AuthService shapes user as { userId, email, fullName }
      setName(ctxUser.fullName || ctxUser.FullName || '')
      setEmail(ctxUser.email || ctxUser.Email || '')
    }
  }, [appCtx?.user])

  // Prefer uploading the original File when available. The previous flow
  // only had a dataURL preview; uploading that can produce a new image
  // (or a different format) that looks blurry. We now look for a File in
  // the navigation state and upload it. If that's not present, fall back to
  // uploading a dataURL blob (legacy behavior).
  useEffect(() => {
    let mounted = true
    const doUpload = async () => {
      // If we already have a server path, nothing to do
      if (uploadedPath) return
      // First try to get a File object from location state (set by previous page)
      const incomingFile = loc.state?.file || null
      if (!imageSrc && !incomingFile) return

      try {
        setUploading(true)
        const fd = new FormData()
        if (incomingFile instanceof File) {
          // upload original file to preserve quality
          fd.append('file', incomingFile, incomingFile.name)
        } else if (String(imageSrc).startsWith('data:')) {
          // legacy: convert dataURL -> Blob and upload
          const blob = dataURLtoBlob(imageSrc)
          fd.append('file', blob, 'upload.png')
        } else {
          // imageSrc is probably already a server path; nothing to upload
          return
        }

        const res = await fetch(`${BACKEND_BASE}/upload`, {
          method: 'POST',
          body: fd,
        })
        if (!res.ok) throw new Error('Upload failed: ' + res.status)
        const json = await res.json()
        const fp = json?.filePath || json?.file_path || null
        if (fp && mounted) {
          setUploadedPath(fp)
        }
      } catch (err) {
        console.error('Failed to upload image to server:', err)
      } finally {
        if (mounted) setUploading(false)
      }
    }
    doUpload()
    return () => { mounted = false }
  }, [imageSrc, loc.state, uploadedPath])

  // helpers to get/set title based on AI-selected language first,
  // then fall back to the page Google Translate language
  const currentLang = typeof window !== 'undefined' ? getGoogleTranslateLanguage() : 'en'
  const getRequestedAiLang = () => {
    const g = aiFormData?.language
    if (!g) return null
    // normalize composite values like 'vi_en' -> 'vi'
    if (typeof g === 'string') {
      if (g.startsWith('vi')) return 'vi'
      if (g.startsWith('en')) return 'en'
    }
    return g
  }

  // helper: normalize AI response values that may be either a string
  // or an object like { vi: '...', en: '...' }. Prefers prefLang when available.
  const extractString = (val, prefLang) => {
    if (!val && val !== 0) return ''
    if (typeof val === 'string') return val
    if (typeof val === 'object') {
      if (prefLang === 'vi' && (val.vi || val.vi === 0)) return val.vi
      if (prefLang === 'en' && (val.en || val.en === 0)) return val.en
      // try common keys
      if (val.vi) return val.vi
      if (val.en) return val.en
      // fallback: first string value found
      for (const k of Object.keys(val)) {
        if (typeof val[k] === 'string') return val[k]
      }
      return ''
    }
    // other primitives
    return String(val)
  }

  const getTitle = () => {
    const reqLang = getRequestedAiLang()
    if (reqLang === 'vi') return ai.title_vi ?? ai.title_en ?? ''
    if (reqLang === 'en') return ai.title_en ?? ai.title_vi ?? ''
    // fallback to page language
    return (currentLang === 'vi' ? (ai.title_vi ?? '') : (ai.title_en ?? ''))
  }

  const setTitleForCurrentLang = (val, langOverride) => {
    const useLang = langOverride || getRequestedAiLang() || currentLang
    if (useLang === 'vi') setAi(prev => ({ ...prev, title_vi: val }))
    else setAi(prev => ({ ...prev, title_en: val }))
  }

  // Toggle AI option selection
  const toggleAiOption = (type) => {
    setSelectedAiOptions(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  // Navigate to AI options form
  const handleContinueToOptions = () => {
    if (selectedAiOptions.length === 0) {
      setAiGenerateError('Vui lòng chọn ít nhất một mục cần AI hỗ trợ')
      return
    }
    setShowAiModal(false)
    setShowAiOptionsForm(true)
    setAiGenerateError(null)
  }

  // Handle AI generation with form data
  const handleGenerateWithAI = async () => {
    setAiGenerateError(null)
    setIsGenerating(true)
    setShowAiOptionsForm(false)

    try {
      const fd = new FormData()
      const fileToAnalyze = loc.state?.file

      // Add file if available
      if (!fileToAnalyze) {
        throw new Error('Không tìm thấy file ảnh để phân tích')
      }

      fd.append('file', fileToAnalyze)

      // Add form fields matching API expectations from screenshot
      const categoryName = selectedCategoryId
        ? categories.find(c => c.CategoryID === selectedCategoryId)?.Name || 'Travel'
        : ai.category_en || 'Travel'

      fd.append('post_type', 'post')
      fd.append('tone', aiFormData.tone)
      fd.append('length', aiFormData.length)
      fd.append('language', aiFormData.language)

      // Build options string - what fields to generate
      const optionsArray = []
      if (selectedAiOptions.includes('title')) optionsArray.push('title')
      if (selectedAiOptions.includes('alt')) optionsArray.push('alt')
      if (selectedAiOptions.includes('content')) optionsArray.push('content')
      fd.append('options', optionsArray.join(','))

      // Add existing values as context
      if (getTitle()) fd.append('description', getTitle())
      fd.append('category', categoryName)
      fd.append('place', 'Hà Nội')

      const endpoint = 'http://26.68.60.194:8000/gemini/generate'
      const res = await fetch(endpoint, {
        method: 'POST',
        body: fd
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Server returned ${res.status}: ${errorText}`)
      }

      const json = await res.json()

      const successMessages = []

      // Fill fields based on selected options
      if (selectedAiOptions.includes('title')) {
        const prefLang = getRequestedAiLang() || 'en'
        // prefer language-specific keys when available; gracefully handle object shapes
        const rawTitleCandidates = [json.title, json.title_vi, json.title_en, json.caption_vi, json.caption_en, json.description_vi, json.description_en]
        let generatedTitle = ''
        for (const cand of rawTitleCandidates) {
          const s = extractString(cand, prefLang)
          if (s) { generatedTitle = s; break }
        }

        if (generatedTitle) {
          // store into language specific field and update visible title
          if (prefLang === 'vi') {
            setAi(prev => ({ ...prev, title_vi: generatedTitle }))
            setTitleForCurrentLang(generatedTitle, 'vi')
          } else {
            setAi(prev => ({ ...prev, title_en: generatedTitle }))
            setTitleForCurrentLang(generatedTitle, 'en')
          }
          successMessages.push('tiêu đề')
        }
      }

      if (selectedAiOptions.includes('alt')) {
        const prefLang = getRequestedAiLang() || 'en'
        const rawAltCandidates = [json.alt, json.alt_vi, json.alt_en, json.description, json.caption_vi, json.caption_en, json.content]
        let generatedAlt = ''
        for (const cand of rawAltCandidates) {
          const s = extractString(cand, prefLang)
          if (s) { generatedAlt = s; break }
        }
        if (generatedAlt) {
          setAlt(generatedAlt)
          successMessages.push('mô tả ảnh')
        }
      }

      if (selectedAiOptions.includes('content')) {
        const prefLang = getRequestedAiLang() || 'en'
        const rawContentCandidates = [json.content, json.content_vi, json.content_en, json.description, json.caption_vi, json.caption_en, json.text]
        let generatedContent = ''
        for (const cand of rawContentCandidates) {
          const s = extractString(cand, prefLang)
          if (s) { generatedContent = s; break }
        }
        if (generatedContent) {
          setContent(generatedContent)
          successMessages.push('nội dung đóng góp')
        }
      }

      // Show success toast
      if (successMessages.length > 0) {
        const tempDiv = document.createElement('div')
        tempDiv.className = 'ai-success-toast'
        tempDiv.textContent = `✅ Đã tạo ${successMessages.join(', ')} bằng AI`
        document.body.appendChild(tempDiv)
        setTimeout(() => tempDiv.remove(), 3000)
      } else {
        throw new Error('AI không trả về dữ liệu phù hợp')
      }

      // Reset selections
      setSelectedAiOptions([])

      setIsGenerating(false)
    } catch (err) {
      console.error('AI Generation Error:', err)
      let errorMsg = 'Lỗi khi tạo nội dung AI'

      // Provide helpful error messages
      if (err.message?.includes('Failed to fetch') || err.message?.includes('ERR_CONNECTION_REFUSED')) {
        errorMsg = 'Không thể kết nối đến AI service. Vui lòng kiểm tra xem service có đang chạy ở port 8000 không.'
      } else if (err.message) {
        errorMsg = err.message
      }

      setAiGenerateError(errorMsg)
      setIsGenerating(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Choose imagePath to send to backend API when creating article
      // If we have an uploadedPath (backend returned '/uploads/xxx'), use that
      // Otherwise if imageSrc already looks like a server-relative path use it
      // Do not send data: URLs
      const imgToSend = uploadedPath || (imageSrc && String(imageSrc).startsWith('/') ? imageSrc : undefined)

      const payload = {
        title: getTitle(),
        content,
        categoryId: selectedCategoryId || (categories.length > 0 ? categories[0].CategoryID : 1),
        // Use logged-in user info when available
        userId: appCtx?.user?.userId || appCtx?.user?.UserID || 1,
        email: appCtx?.user?.email || appCtx?.user?.Email || email,
        imagePath: imgToSend,
        // imageDescription should come only from the explicit alt field (or AI-generated alt),
        // do NOT fallback to the title — title and image description are separate.
        imageDescription: alt || ''
      }
      await createArticlePost(payload)
      navigate('/community')
    } catch (err) {
      const serverMsg = err?.message || String(err)
      console.debug && console.debug('[Contribute] submit error', err)
      // If blocked by moderation, clear the recently entered fields as requested
      if (err && err.isModeration) {
        // clear title (ai state), content, and alt input
        setAi(prev => ({ ...prev, title_en: '', title_vi: '' }))
        setContent('')
        setAlt('')
        // also clear selected category and uploaded path so form appears empty
        setSelectedCategoryId(null)
        setUploadedPath(null)
        alert(err.message || 'Bài đóng góp bị chặn bởi hệ thống kiểm duyệt')
      } else {
        alert('Lỗi khi gửi: ' + serverMsg)
      }
    }
  }

  // For preview, prefer the uploaded server file, then a native object URL
  // from the original File (keeps full resolution), and finally the
  // fallback dataURL preview.
  let previewDisplay = null
  if (uploadedPath) previewDisplay = `${BACKEND_BASE}${uploadedPath}`
  else if (localObjectUrl) previewDisplay = localObjectUrl
  else previewDisplay = imageSrc

  // create/revoke object URL for original File when available
  useEffect(() => {
    const f = loc.state?.file
    if (f instanceof File) {
      const url = URL.createObjectURL(f)
      setLocalObjectUrl(url)
      return () => {
        try { URL.revokeObjectURL(url) } catch { /* ignore */ }
        setLocalObjectUrl(null)
      }
    }
    // if no file provided, ensure we don't keep an old object URL
    return () => { if (localObjectUrl) { try { URL.revokeObjectURL(localObjectUrl) } catch { /* ignore */ }; setLocalObjectUrl(null) } }
  }, [loc.state, /* eslint-disable-line react-hooks/exhaustive-deps */])

  return (
    <div className="info-page">
      <div className="info-card">
        <div className="info-top">
          <div className="info-icon">✈</div>
          <h2>{'Hoàn tất thông tin đóng góp'}</h2>
          <p className="info-sub">{'AI đã gợi ý danh mục cho ảnh. Bạn có thể dùng AI để phân tích tiêu đề, hoặc tự nhập. Vui lòng bổ sung thông tin để hoàn tất đóng góp.'}</p>
        </div>

        <form className="info-form" onSubmit={handleSubmit}>
          <div className="preview">
            {previewDisplay ? (
              <img src={previewDisplay} alt="preview" />
            ) : (
              <div className="preview-empty">{'Đã xảy ra lỗi'}</div>
            )}
            {uploading && <div className="uploading-indicator">{'Đang tải ảnh...'}</div>}
          </div>

          <div className="ai-result">
            <div className="ai-row">
              <label>{'Danh mục'}</label>
              <CustomSelect
                value={selectedCategoryId || (categories.length > 0 ? categories[0].CategoryID : '')}
                options={categories.map(cat => ({
                  value: cat.CategoryID,
                  label: cat.Name
                }))}
                onChange={(categoryId) => {
                  setSelectedCategoryId(categoryId)
                  const selectedCat = categories.find(c => c.CategoryID === categoryId)
                  if (selectedCat) {
                    setAi(prev => ({
                      ...prev,
                      category_en: selectedCat.Name,
                      category_vi: selectedCat.Name
                    }))
                  }
                }}
              />
            </div>
            <div className="ai-row">
              <label>{'Tiêu đề'}</label>
              <input
                value={getTitle()}
                onChange={(e) => setTitleForCurrentLang(e.target.value)}
                placeholder="Nhập tiêu đề"
              />
            </div>
          </div>

          <div className="fields">
            <div className="field-row">
              <div className="field">
                <label>{'Họ và tên'} *</label>
                {/* Fixed contributor name: not editable in this form */}
                <input
                  className="fixed-field"
                  placeholder={'Nhập họ và tên của bạn'}
                  value={name}
                  readOnly
                  disabled
                />
              </div>
              <div className="field">
                <label>{'Email'} *</label>
                {/* Fixed contributor email: not editable in this form */}
                <input
                  className="fixed-field"
                  placeholder={'email@example.com'}
                  value={email}
                  readOnly
                  disabled
                />
              </div>
            </div>

            <div className="field">
              <label>{'Mô tả ảnh (Alt Text)'}</label>
              <input placeholder={'Mô tả ngắn gọn về nội dung hình ảnh'} value={alt} onChange={(e) => setAlt(e.target.value)} />
            </div>

            <div className="field">
              <label>{'Nội dung đóng góp'}</label>
              <textarea placeholder={'Chia sẻ những gì bạn biết về di sản này...'} value={content} onChange={(e) => setContent(e.target.value)} />
            </div>
          </div>

          <div className="process-box">
            <h4>{'Quy trình xử lý đóng góp:'}</h4>
            <ul>
              <li>{'Trạng thái: Đang chờ - Đóng góp của bạn sẽ được gửi để kiểm duyệt'}</li>
              <li>{'Quản trị viên sẽ xem xét và phản hồi trong 24-48 giờ'}</li>
              <li>{'Bạn sẽ nhận email thông báo khi đóng góp được chấp nhận hoặc từ chối'}</li>
            </ul>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-back" onClick={() => navigate(-1)}>{'Quay lại'}</button>
            <button
              type="button"
              className="btn-ai-assist"
              onClick={() => setShowAiModal(true)}
              disabled={isGenerating}
            >
              {isGenerating ? '⏳ Đang tạo...' : '🤖 AI'}
            </button>
            <button type="submit" className="btn-submit">{'Gửi đóng góp'}</button>
          </div>
        </form>
      </div>

      {/* AI Modal */}
      {showAiModal && (
        <div className="ai-modal-overlay" onClick={() => setShowAiModal(false)}>
          <div className="ai-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="ai-modal-close" onClick={() => setShowAiModal(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            <div className="ai-modal-header">
              <div className="ai-header-icon">
                <img src="/img/ai-icon.png" alt="AI Icon" style={{ width: 40, height: 40, display: 'block', margin: '0 auto' }} />
              </div>
              <h3>AI Hỗ trợ Sáng tạo</h3>
              <p className="ai-subtitle">Chọn nội dung bạn muốn AI tạo tự động</p>
            </div>

            <div className="ai-modal-body">
              <p className="ai-instruction">Chọn ít nhất 1 mục để AI hỗ trợ tạo nội dung</p>
              <div className="ai-options-grid">
                <div
                  className={`ai-option-card ${selectedAiOptions.includes('title') ? 'selected' : ''}`}
                  onClick={() => toggleAiOption('title')}
                >
                  <div className="ai-card-check">
                    {selectedAiOptions.includes('title') && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <div className="ai-card-icon">📝</div>
                  <div className="ai-card-title">Tiêu đề</div>
                  <div className="ai-card-desc">Tạo tiêu đề hấp dẫn từ hình ảnh</div>
                </div>

                <div
                  className={`ai-option-card ${selectedAiOptions.includes('alt') ? 'selected' : ''}`}
                  onClick={() => toggleAiOption('alt')}
                >
                  <div className="ai-card-check">
                    {selectedAiOptions.includes('alt') && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <div className="ai-card-icon">🖼️</div>
                  <div className="ai-card-title">Mô tả ảnh</div>
                  <div className="ai-card-desc">Tạo mô tả chi tiết cho hình ảnh</div>
                </div>

                <div
                  className={`ai-option-card ${selectedAiOptions.includes('content') ? 'selected' : ''}`}
                  onClick={() => toggleAiOption('content')}
                >
                  <div className="ai-card-check">
                    {selectedAiOptions.includes('content') && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <div className="ai-card-icon">✍️</div>
                  <div className="ai-card-title">Nội dung</div>
                  <div className="ai-card-desc">Tạo nội dung đóng góp đầy đủ</div>
                </div>
              </div>

              <div className="ai-info-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span>AI sẽ phân tích hình ảnh và tạo nội dung trong vài giây</span>
              </div>
            </div>

            <div className="ai-modal-footer">
              <button
                className="ai-cancel-btn"
                onClick={() => setShowAiModal(false)}
              >
                Hủy
              </button>
              <button
                className="ai-generate-btn"
                onClick={handleContinueToOptions}
                disabled={selectedAiOptions.length === 0}
              >
                {selectedAiOptions.length === 0 ? (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Chọn nội dung
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Tiếp tục ({selectedAiOptions.length})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Options Form Modal */}
      {showAiOptionsForm && (
        <div className="ai-modal-overlay" onClick={() => setShowAiOptionsForm(false)}>
          <div className="ai-options-modal" onClick={e => e.stopPropagation()}>
            <button className="ai-modal-close" onClick={() => setShowAiOptionsForm(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <div className="ai-modal-header">
              <div className="ai-header-icon">
                <img src="/img/ai-icon.png" alt="AI Icon" style={{ width: 40, height: 40, display: 'block', margin: '0 auto' }} />
              </div>
              <h3>Tùy chỉnh AI</h3>
              <p className="ai-subtitle">Điều chỉnh cách AI tạo nội dung cho bạn</p>
            </div>
            <div className="ai-modal-body">
              <div className="ai-form-field">
                <label>Kiểu bài viết</label>
                <select className="ai-form-select" value={aiFormData.post_type || 'post'} onChange={e => setAiFormData({ ...aiFormData, post_type: e.target.value })}>
                  <option value="post">Bài viết</option>
                  <option value="review">Đánh giá</option>
                  <option value="news">Tin tức</option>
                  <option value="guide">Hướng dẫn</option>
                  <option value="event">Sự kiện</option>
                  <option value="story">Câu chuyện</option>
                  <option value="question">Câu hỏi</option>
                </select>
              </div>
              <div className="ai-form-field">
                <label>Giọng điệu</label>
                <select className="ai-form-select" value={aiFormData.tone} onChange={e => setAiFormData({ ...aiFormData, tone: e.target.value })}>
                  <option value="formal">Trang trọng</option>
                  <option value="friendly">Thân thiện</option>
                  <option value="enthusiastic">Nhiệt huyết</option>
                  <option value="informative">Thông tin</option>
                  <option value="storytelling">Kể chuyện</option>
                  <option value="humorous">Hài hước</option>
                  <option value="critical">Phê bình</option>
                  <option value="neutral">Trung lập</option>
                  <option value="emotional">Cảm xúc</option>
                  <option value="motivational">Truyền cảm hứng</option>
                </select>
              </div>
              <div className="ai-form-field">
                <label>Độ dài nội dung</label>
                <select className="ai-form-select" value={aiFormData.length} onChange={e => setAiFormData({ ...aiFormData, length: e.target.value })}>
                  <option value="short">Ngắn gọn (1-2 câu)</option>
                  <option value="medium">Trung bình (3-5 câu)</option>
                  <option value="long">Dài (6-10 câu)</option>
                  <option value="very_long">Rất dài (trên 10 câu, chi tiết)</option>
                  <option value="summary">Tóm tắt</option>
                  <option value="detailed">Chi tiết</option>
                  <option value="bullet">Gạch đầu dòng</option>
                  <option value="qa">Hỏi đáp</option>
                </select>
              </div>
              <div className="ai-form-field">
                <label>Ngôn ngữ</label>
                <select className="ai-form-select" value={aiFormData.language} onChange={e => setAiFormData({ ...aiFormData, language: e.target.value })}>
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">Tiếng Anh</option>
                </select>
              </div>
              <div className="ai-form-field">
                <label>Mô tả</label>
                <div style={{ position: 'relative' }}>
                  <input className="ai-form-input ai-form-input-desc" placeholder="Nhập mô tả cho nội dung AI tạo" value={aiFormData.description || ''} onChange={e => setAiFormData({ ...aiFormData, description: e.target.value })} style={{ paddingLeft: 40, borderRadius: 8, border: '1px solid #10b981', minHeight: 40 }} />
                  <img src="/img/ai-icon.png" alt="AI" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 24, height: 24, opacity: 0.7 }} />
                </div>
              </div>
              <div className="ai-form-field">
                <label>Danh mục</label>
                <select className="ai-form-select" value={aiFormData.category || ''} onChange={e => setAiFormData({ ...aiFormData, category: e.target.value })}>
                  <option value="">Chọn danh mục</option>
                  {categories.map(cat => (
                    <option key={cat.CategoryID} value={cat.Name}>{cat.Name}</option>
                  ))}
                </select>
              </div>
              <div className="ai-form-field">
                <label>Địa điểm</label>
                <select className="ai-form-select" value={aiFormData.place || ''} onChange={e => setAiFormData({ ...aiFormData, place: e.target.value })}>
                  <option value="">Không chọn</option>
                  <option value="Quận Hải Châu">Quận Hải Châu</option>
                  <option value="Quận Thanh Khê">Quận Thanh Khê</option>
                  <option value="Quận Sơn Trà">Quận Sơn Trà</option>
                  <option value="Quận Ngũ Hành Sơn">Quận Ngũ Hành Sơn</option>
                  <option value="Quận Liên Chiểu">Quận Liên Chiểu</option>
                  <option value="Quận Cẩm Lệ">Quận Cẩm Lệ</option>
                  <option value="Huyện Hòa Vang">Huyện Hòa Vang</option>
                  <option value="Huyện Hoàng Sa">Huyện Hoàng Sa</option>
                  {/* Nếu có API cho địa điểm thì thêm vào đây */}
                  {/* locations && locations.map(loc => (
                    <option key={loc.LocationID} value={loc.Name}>{loc.Name}</option>
                  )) */}
                </select>
              </div>
            </div>
            <div className="ai-modal-footer">
              <button className="ai-cancel-btn" onClick={() => { setShowAiOptionsForm(false); setShowAiModal(true); }}>Quay lại</button>
              <button className="ai-generate-btn" onClick={handleGenerateWithAI}>
                {isGenerating ? (<span className="spinner"></span>) : 'Tạo bằng AI'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Generate Error */}
      {aiGenerateError && (
        <div className="ai-error-toast">
          ❌ {aiGenerateError}
          <button onClick={() => setAiGenerateError(null)}>✕</button>
        </div>
      )}
    </div>
  )
}

export default ContributeInformation
