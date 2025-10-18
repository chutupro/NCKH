import React, { useState, useEffect } from 'react'
import '../../Styles/Contribute/contributeInformation.css'
import { useLocation, useNavigate } from 'react-router-dom'

const ContributeInformation = () => {
  const loc = useLocation()
  const navigate = useNavigate()
  // try to get file data from location state (set by previous page)
  const initialImage = loc.state?.filePreview || null
  const initialAI = loc.state?.aiResult || { category: 'Ẩm thực', title: 'Làng nghề mộc Kim Bồng' }

  const [imageSrc, setImageSrc] = useState(initialImage)
  const [ai, setAi] = useState(initialAI)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [alt, setAlt] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    // If no image, redirect back
    if (!imageSrc) {
      // in real app you might redirect back to upload
      // navigate('/contribute')
    }
    // keep setImageSrc referenced for future updates / lint
    // (no-op) eslint-disable-next-line
    void setImageSrc
  }, [imageSrc])

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: send payload to backend
    alert('Gửi đóng góp (demo)')
  }

  return (
    <div className="info-page">
      <div className="info-card">
        <div className="info-top">
          <div className="info-icon">✈</div>
          <h2>Hoàn tất thông tin đóng góp</h2>
          <p className="info-sub">AI đã phân tích và gợi ý danh mục, tiêu đề cho ảnh của bạn. Vui lòng bổ sung thông tin để hoàn tất đóng góp.</p>
        </div>

        <form className="info-form" onSubmit={handleSubmit}>
          <div className="preview">
            {imageSrc ? <img src={imageSrc} alt="preview" /> : <div className="preview-empty">No image</div>}
          </div>

          <div className="ai-result">
            <div className="ai-row">
              <label>Danh mục (AI gợi ý)</label>
              <input value={ai.category} onChange={(e)=>setAi({...ai, category: e.target.value})} />
            </div>
            <div className="ai-row">
              <label>Tiêu đề (AI gợi ý)</label>
              <input value={ai.title} onChange={(e)=>setAi({...ai, title: e.target.value})} />
            </div>
          </div>

          <div className="fields">
            <div className="field-row">
              <div className="field">
                <label>Họ và tên *</label>
                <input placeholder="Nhập họ và tên của bạn" value={name} onChange={(e)=>setName(e.target.value)} />
              </div>
              <div className="field">
                <label>Email *</label>
                <input placeholder="email@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} />
              </div>
            </div>

            <div className="field">
              <label>Mô tả ảnh (Alt Text)</label>
              <input placeholder="Mô tả ngắn gọn về nội dung hình ảnh" value={alt} onChange={(e)=>setAlt(e.target.value)} />
            </div>

            <div className="field">
              <label>Nội dung đóng góp *</label>
              <textarea placeholder="Chia sẻ những gì bạn biết về di sản này..." value={content} onChange={(e)=>setContent(e.target.value)} />
            </div>
          </div>

          <div className="process-box">
            <h4>Quy trình xử lý đóng góp:</h4>
            <ul>
              <li>Status: Pending - Đóng góp của bạn sẽ được gửi để chờ kiểm duyệt</li>
              <li>Quản trị viên sẽ xem xét và phản hồi trong 24-48 giờ</li>
              <li>Bạn sẽ nhận email thông báo khi đóng góp được chấp nhận hoặc từ chối</li>
            </ul>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-back" onClick={()=>navigate(-1)}>Quay lại</button>
            <button type="submit" className="btn-submit">Gửi đóng góp</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ContributeInformation
