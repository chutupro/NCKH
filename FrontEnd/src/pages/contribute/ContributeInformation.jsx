import React, { useState } from 'react'
import '../../Styles/Contribute/contributeInformation.css'
import { useLocation, useNavigate } from 'react-router-dom'

import { getGoogleTranslateLanguage } from '../../Component/common/googleTranslateUtils'
import { KNOWN_CODES, CODE_TO_VN, labelFor, getCodeFromName } from '../../util/categoryMap'
import CustomSelect from '../../Component/common/CustomSelect'
import { createArticlePost } from '../../API/articlesPost'
import { useEffect, useContext } from 'react'
import AppContext from '../../context/context'
import getAiFeatureConfig, { getAiEndpointUrl } from '../../config/aiConfig'
const BACKEND_BASE = 'http://localhost:3000'

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
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState(null)

  const appCtx = useContext(AppContext)
  useEffect(() => {
    const ctxUser = appCtx?.user
    if (ctxUser) {

      setName(ctxUser.fullName || ctxUser.FullName || '')
      setEmail(ctxUser.email || ctxUser.Email || '')
    }
  }, [appCtx?.user])

  useEffect(() => {
    let mounted = true
    const doUpload = async () => {

      if (uploadedPath) return

      const incomingFile = loc.state?.file || null
      if (!imageSrc && !incomingFile) return

      try {
        setUploading(true)
        const fd = new FormData()
        if (incomingFile instanceof File) {

          fd.append('file', incomingFile, incomingFile.name)
        } else if (String(imageSrc).startsWith('data:')) {

          const blob = dataURLtoBlob(imageSrc)
          fd.append('file', blob, 'upload.png')
        } else {

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

  const currentLang = typeof window !== 'undefined' ? getGoogleTranslateLanguage() : 'en'
  const getTitle = () => (currentLang === 'vi' ? (ai.title_vi ?? '') : (ai.title_en ?? ''))
  const setTitleForCurrentLang = (val) => {
    if (currentLang === 'vi') setAi(prev => ({ ...prev, title_vi: val }))
    else setAi(prev => ({ ...prev, title_en: val }))
  }

  const getCurrentCode = () => {

    const codeFromEn = getCodeFromName(ai.category_en)
    if (codeFromEn && codeFromEn !== 'other') return codeFromEn
    const codeFromVi = getCodeFromName(ai.category_vi)
    if (codeFromVi && codeFromVi !== 'other') return codeFromVi
    return 'other'
  }

  const handleAnalyzeAI = async () => {
    setAnalyzeError(null)
    const fileToAnalyze = loc.state?.file
    if (!fileToAnalyze) {
      setAnalyzeError('Không tìm thấy file ảnh')
      return
    }

    const aiConfig = getAiFeatureConfig()
    setAnalyzing(true)
    try {
      const fd = new FormData()
      fd.append('file', fileToAnalyze)
      const endpoint = getAiEndpointUrl('analyze') || `${aiConfig.baseUrl}${aiConfig.analyzeEndpoint || '/fast-analyze'}`
      const res = await fetch(endpoint, {
        method: 'POST',
        body: fd
      })
      if (!res.ok) throw new Error(`Server returned ${res.status}`)
      const json = await res.json()

      const label = Array.isArray(json?.activeLabels) && json.activeLabels.length ? json.activeLabels[0] : null
      const caption_en = json?.caption_en || ''
      const caption_vi = json?.caption_vi || ''

      const mapAiToFeCategory = (aiLabel) => {
        if (!aiLabel) return { category_en: null, category_vi: null }
        const key = aiLabel.toLowerCase()
        if (key.includes('nature') || key.includes('landscape') || key.includes('thiên nhiên')) return { category_en: 'Nature', category_vi: 'Thiên nhiên' }
        if (key.includes('heritage') || key.includes('architecture') || key.includes('kiến trúc')) return { category_en: 'Architecture', category_vi: 'Kiến trúc' }
        if (key.includes('culture') || key.includes('art') || key.includes('văn hóa')) return { category_en: 'Culture', category_vi: 'Văn hóa' }
        if (key.includes('people') || key.includes('event') || key.includes('sự kiện')) return { category_en: 'People', category_vi: 'Du lịch' }
        return { category_en: aiLabel, category_vi: aiLabel }
      }

      const mappedCat = mapAiToFeCategory(label)

      setAi({
        category_en: mappedCat.category_en || 'Tourism',
        category_vi: mappedCat.category_vi || 'Du lịch',
        title_en: caption_en || '',
        title_vi: caption_vi || ''
      })
      setAnalyzing(false)
    } catch (err) {
      setAnalyzeError(err.message || 'Lỗi khi phân tích AI')
      setAnalyzing(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const code = getCurrentCode()
      const codeToId = { architecture: 1, culture: 2, tourism: 3, nature: 4 }

      const imgToSend = uploadedPath || (imageSrc && String(imageSrc).startsWith('/') ? imageSrc : undefined)

      const payload = {
        title: getTitle(),
        content,
        categoryId: codeToId[code] || 1,

        userId: appCtx?.user?.userId || appCtx?.user?.UserID || 1,
        email: appCtx?.user?.email || appCtx?.user?.Email || email,
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

  let previewDisplay = null
  if (uploadedPath) previewDisplay = `${BACKEND_BASE}${uploadedPath}`
  else if (localObjectUrl) previewDisplay = localObjectUrl
  else previewDisplay = imageSrc

  useEffect(() => {
    const f = loc.state?.file
    if (f instanceof File) {
      const url = URL.createObjectURL(f)
      setLocalObjectUrl(url)
      return () => {
        try { URL.revokeObjectURL(url) } catch {  }
        setLocalObjectUrl(null)
      }
    }

  return () => { if (localObjectUrl) { try { URL.revokeObjectURL(localObjectUrl) } catch {  } ; setLocalObjectUrl(null) } }
  }, [loc.state, ])

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
            <label>{'Danh mục (AI gợi ý)'}</label>
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
              <div className="ai-row">
                <label>{'Tiêu đề'}</label>
                <div style={{display: 'flex', gap: '8px', alignItems: 'stretch'}}>
                  <input 
                    style={{flex: 1}}
                    value={getTitle()} 
                    onChange={(e)=>setTitleForCurrentLang(e.target.value)} 
                    placeholder="Nhập tiêu đề hoặc dùng AI phân tích"
                  />
                  <button 
                    type="button" 
                    className="btn-analyze-ai"
                    onClick={handleAnalyzeAI}
                    disabled={analyzing}
                  >
                    {analyzing ? '⏳ Đang phân tích...' : '🤖 AI'}
                  </button>
                </div>
                {analyzeError && <div style={{color: '#e74c3c', fontSize: '13px', marginTop: '4px'}}>{analyzeError}</div>}
              </div>
          </div>

          <div className="fields">
            <div className="field-row">
              <div className="field">
                <label>{'Họ và tên'} *</label>
                {}
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
                {}
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
