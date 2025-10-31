import React, { useState } from 'react'
import '../../Styles/Contribute/contributeInformation.css'
import { useLocation, useNavigate } from 'react-router-dom'
// i18n removed: useTranslation import removed
import { getGoogleTranslateLanguage } from '../../Component/common/googleTranslateUtils'
import { KNOWN_CODES, CODE_TO_VN, labelFor, getCodeFromName } from '../../util/categoryMap'
import CustomSelect from '../../Component/common/CustomSelect'
import { createArticlePost } from '../../API/articlesPost'
import { getUserById } from '../../API/users'
import { useEffect } from 'react'
const BACKEND_BASE = 'http://localhost:3000'

// helper: convert dataURL -> Blob
function dataURLtoBlob(dataurl) {
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

  // Prefill contributor info from userId=1 (temporary)
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const user = await getUserById(1)
        if (!mounted) return
        if (user) {
          setName(user.FullName || '')
          setEmail(user.Email || '')
        }
      } catch (err) {
        console.debug('Could not load user 1:', err)
      }
    })()
    return () => { mounted = false }
  }, [])

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

  // helpers to get/set title based on language (use Google Translate language when available)
  const currentLang = typeof window !== 'undefined' ? getGoogleTranslateLanguage() : 'en'
  const getTitle = () => (currentLang === 'vi' ? (ai.title_vi || ai.title_en) : (ai.title_en || ai.title_vi))
  const setTitleForCurrentLang = (val) => {
    if (currentLang === 'vi') setAi(prev => ({ ...prev, title_vi: val }))
    else setAi(prev => ({ ...prev, title_en: val }))
  }

  const getCurrentCode = () => {
    // Prefer english field, fallback to vietnamese
    const codeFromEn = getCodeFromName(ai.category_en)
    if (codeFromEn && codeFromEn !== 'other') return codeFromEn
    const codeFromVi = getCodeFromName(ai.category_vi)
    if (codeFromVi && codeFromVi !== 'other') return codeFromVi
    return 'other'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const code = getCurrentCode()
      const codeToId = { architecture: 1, culture: 2, tourism: 3, nature: 4 }
      // Choose imagePath to send to backend API when creating article
      // If we have an uploadedPath (backend returned '/uploads/xxx'), use that
      // Otherwise if imageSrc already looks like a server-relative path use it
      // Do not send data: URLs
      const imgToSend = uploadedPath || (imageSrc && String(imageSrc).startsWith('/') ? imageSrc : undefined)

      const payload = {
        title: getTitle(),
        content,
        categoryId: codeToId[code] || 1,
        userId: 1,
        email,
        imagePath: imgToSend,
        imageDescription: alt || ai.title_en || ai.title_vi || ''
      }
      await createArticlePost(payload)
      navigate('/community')
    } catch (err) {
      const serverMsg = err?.message || String(err)
  alert('Lỗi khi gửi: ' + serverMsg)
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
  return () => { if (localObjectUrl) { try { URL.revokeObjectURL(localObjectUrl) } catch { /* ignore */ } ; setLocalObjectUrl(null) } }
  }, [loc.state, /* eslint-disable-line react-hooks/exhaustive-deps */])

  return (
    <div className="info-page">
      <div className="info-card">
        <div className="info-top">
          <div className="info-icon">✈</div>
          <h2>{'Hoàn tất thông tin đóng góp'}</h2>
          <p className="info-sub">{'AI đã phân tích và gợi ý danh mục, tiêu đề cho ảnh của bạn. Vui lòng bổ sung thông tin để hoàn tất đóng góp.'}</p>
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
            <label>{'Danh mục (AI gợi ý)'}</label>
            <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
              <CustomSelect
                value={getCurrentCode() !== 'other' ? getCurrentCode() : KNOWN_CODES[0]}
                options={KNOWN_CODES.map(code => ({ value: code, label: labelFor(code) }))}
                onChange={(code) => {
                  const enLabel = code ? (code.charAt(0).toUpperCase() + code.slice(1)) : ''
                  const viLabel = CODE_TO_VN[code] || enLabel
                  setAi(prev => ({ ...prev, category_en: enLabel, category_vi: viLabel }))
                }}
              />
            </div>
          </div>
              <div className="ai-row">
                <label>{'Tiêu đề (AI gợi ý)'}</label>
                <input value={getTitle()} onChange={(e)=>setTitleForCurrentLang(e.target.value)} />
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
              <input placeholder={'Mô tả ngắn gọn về nội dung hình ảnh'} value={alt} onChange={(e)=>setAlt(e.target.value)} />
            </div>

            <div className="field">
              <label>{'Nội dung đóng góp'}</label>
              <textarea placeholder={'Chia sẻ những gì bạn biết về di sản này...'} value={content} onChange={(e)=>setContent(e.target.value)} />
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
            <button type="button" className="btn-back" onClick={()=>navigate(-1)}>{'Quay lại'}</button>
            <button type="submit" className="btn-submit">{'Gửi đóng góp'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ContributeInformation
