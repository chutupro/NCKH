import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppContext } from '../../context/useAppContext'
import { useTranslation } from 'react-i18next'
import '../../Styles/Home/ContributeCall.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCamera, faHeart, faUsers, faArrowRight } from '@fortawesome/free-solid-svg-icons'

const ContributeCall = () => {
  const { t } = useTranslation();

  const navigate = useNavigate()
  const { isAuthenticated } = useAppContext()

  const onContributeClick = (e) => {
    // if not authenticated, show message and redirect to login
    if (!isAuthenticated) {
      e.preventDefault()
      // simple alert for now — we can replace with a nicer modal later
      const goLogin = window.confirm('Bạn cần đăng nhập để đóng góp. Đi tới trang đăng nhập?')
      if (goLogin) navigate('/login')
      return
    }
    // if authenticated, navigate to contribute page
    navigate('/contribute')
  }

  return (
    <section className="contribute-call-section">
      <div className="contribute-call-container">
        <div className="contribute-call-content">
          <div className="contribute-call-left">
            <div className="contribute-call-icon">
              <FontAwesomeIcon icon={faCamera} />
            </div>
            <h2 className="contribute-call-title">{t('contribute.callTitle')}</h2>
            <p className="contribute-call-description">
              {t('contribute.callDescription')}
            </p>
            <div className="contribute-call-stats">
              <div className="stat-item">
                <FontAwesomeIcon icon={faUsers} className="stat-icon" />
                <div className="stat-content">
                  <span className="stat-label">{t('contribute.contributors')}</span>
                </div>
              </div>
              <div className="stat-item">
                <FontAwesomeIcon icon={faHeart} className="stat-icon" />
                <div className="stat-content">
                  <span className="stat-label">{t('contribute.sharedPhotos')}</span>
                </div>
              </div>
            </div>
            <a href="/contribute" className="contribute-call-btn" onClick={(e) => { window.scrollTo(0, 0); onContributeClick(e); }}>
              <FontAwesomeIcon icon={faCamera} />
              {t('contribute.button')}
              <FontAwesomeIcon icon={faArrowRight} className="btn-arrow" />
            </a>
          </div>
          <div className="contribute-call-right">
            <div className="contribute-call-images">
              <div className="image-grid">
                <div className="grid-item large">
                  <img src="https://statics.vinpearl.com/chua-linh-ung-da-nang-3.jpg" alt="Di sản Đà Nẵng" />
                  <div className="image-overlay">
                    <span>Chùa Linh Ứng</span>
                  </div>
                </div>
                <div className="grid-item small">
                  <img src="https://haycafe.vn/wp-content/uploads/2022/01/Hinh-anh-cau-Rong.jpg" alt="Cầu Rồng" />
                  <div className="image-overlay">
                    <span>Cầu Rồng</span>
                  </div>
                </div>
                <div className="grid-item small">
                  <img src="https://focusasiatravel.vn/wp-content/uploads/2018/09/Ph%E1%BB%91-C%E1%BB%95-H%E1%BB%99i-An1.jpg" alt="Hội An" />
                  <div className="image-overlay">
                    <span>Phố cổ Hội An</span>
                  </div>
                </div>
                <div className="grid-item medium">
                  <img src="https://cdn3.ivivu.com/2024/04/sun-world-ba-na-hills-ivivu45.jpg" alt="Bà Nà Hills" />
                  <div className="image-overlay">
                    <span>Bà Nà Hills</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContributeCall
