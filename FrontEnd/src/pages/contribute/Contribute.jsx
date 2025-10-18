import React, { useCallback, useState } from 'react'
import { Link } from 'react-router-dom';
import '../../Styles/Contribute/contribute.css'

const Contribute = () => {
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState(null)

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer?.files?.[0]
    if (f) setFileName(f.name)
  }, [])

  const onFileChange = useCallback((e) => {
    const f = e.target.files?.[0]
    if (f) setFileName(f.name)
  }, [])

  return (
    <div>
      <div className="contribute-page">
        <div className="contribute-card">
          <div className="contribute-top">
            <div className="contribute-icon">✦</div>
            <h2>Đóng góp ảnh di sản văn hóa</h2>
            <p className="contribute-sub">Tải lên hình ảnh lịch sử (xưa) về di sản văn hóa Đà Nẵng — hệ thống sẽ phân tích và gợi ý tiêu đề.</p>
          </div>

          <div className="contribute-body">
            <label
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={`upload-area ${dragOver ? 'drag-over' : ''}`}
            >
              <input type="file" accept="image/*" onChange={onFileChange} />
              <div className="upload-inner">
                <div className="upload-icon">⬆</div>
                <div className="upload-text">Nhấn để chọn ảnh hoặc kéo thả vào đây</div>
                <div className="upload-hint">Hỗ trợ: JPG, PNG, WEBP (tối đa 10MB)</div>
                {fileName && <div className="upload-file">Chọn: {fileName}</div>}
              </div>
            </label>

            <div className="contribute-note">
              <h4>Lưu ý khi chọn ảnh lịch sử:</h4>
              <ul>
                <li>Chỉ nhận ảnh lịch sử (xưa) của di sản văn hóa Đà Nẵng</li>
                <li>Tránh ảnh mờ, quá tối hoặc quá sáng</li>
                <li>Ảnh nên thể hiện rõ di sản văn hóa cần đóng góp</li>
                <li>AI sẽ phân tích tốt hơn với ảnh có góc chụp đẹp</li>
              </ul>
            </div>
          </div>

          <div className="contribute-footer">
            <div className="contribute-footer-text">Sau khi phân tích, bạn sẽ được chuyển đến trang điền thông tin chi tiết</div>
            {/* <button
              className={`confirm-btn ${fileName ? 'enabled' : 'disabled'}`}
              disabled={!fileName}
              onClick={() => { if (fileName) alert('Xác nhận upload: ' + fileName) }}
            >
              Xác nhận
            </button> */}
            <Link to="/contributeinformation">Xác nhận</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contribute
