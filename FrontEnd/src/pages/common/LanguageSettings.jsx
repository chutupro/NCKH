import React from 'react'
import { useNavigate } from 'react-router-dom'
import '../../Styles/Home/LanguageSettings.css'
import LanguageSwitcher from '../../Component/common/LanguageSwitcher'

const LanguageSettings = () => {
  const nav = useNavigate()
  return (
    <div className="language-settings-page">
      <div className="language-settings-card">
        <div className="language-settings-header">
          <h1>🌐 Cài đặt ngôn ngữ</h1>
        </div>
        <p className="language-settings-sub">Chọn ngôn ngữ hiển thị của giao diện.</p>

        <div className="language-settings-main">
          <div className="language-card">
            <div><strong>Ngôn ngữ hiện tại</strong></div>
            <div style={{ marginTop: 12 }}>
              <LanguageSwitcher />
            </div>
            <div className="language-actions">
              <button className="nav-buttonThamGia" onClick={() => nav(-1)}>Quay lại</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LanguageSettings
