import React, { useState } from 'react'
import '../../Styles/Contribute/contributeInformation.css'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const ContributeInformation = () => {
  const loc = useLocation()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  // try to get file data from location state (set by previous page)
  const initialImage = loc.state?.filePreview || null
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
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [alt, setAlt] = useState('')
  const [content, setContent] = useState('')

  // helpers to get/set title/category based on language
  const getTitle = () => (i18n.language === 'vi' ? (ai.title_vi || ai.title_en) : (ai.title_en || ai.title_vi))
  const setTitleForCurrentLang = (val) => {
    if (i18n.language === 'vi') setAi(prev => ({ ...prev, title_vi: val }))
    else setAi(prev => ({ ...prev, title_en: val }))
  }
  const getCategory = () => (i18n.language === 'vi' ? (ai.category_vi || ai.category_en) : (ai.category_en || ai.category_vi))
  const setCategoryForCurrentLang = (val) => {
    if (i18n.language === 'vi') setAi(prev => ({ ...prev, category_vi: val }))
    else setAi(prev => ({ ...prev, category_en: val }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
  // TODO: send payload to backend
  alert(t('contributeInfo.submitDemoAlert'))
  }

  return (
    <div className="info-page">
      <div className="info-card">
        <div className="info-top">
          <div className="info-icon">✈</div>
          <h2>{t('contributeInfo.title')}</h2>
          <p className="info-sub">{t('contributeInfo.subtitle')}</p>
        </div>

        <form className="info-form" onSubmit={handleSubmit}>
          <div className="preview">
            {imageSrc ? <img src={imageSrc} alt="preview" /> : <div className="preview-empty">{t('common.error')}</div>}
          </div>

          <div className="ai-result">
            <div className="ai-row">
              <label>{t('contributeInfo.aiCategory')}</label>
              <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                <input style={{flex: 1}} value={getCategory()} onChange={(e)=>setCategoryForCurrentLang(e.target.value)} />
              </div>
            </div>
              <div className="ai-row">
                <label>{t('contributeInfo.aiTitle')}</label>
                <input value={getTitle()} onChange={(e)=>setTitleForCurrentLang(e.target.value)} />
              </div>
          </div>

          <div className="fields">
            <div className="field-row">
              <div className="field">
                <label>{t('contributeInfo.fullName')} *</label>
                <input placeholder={t('contributeInfo.fullNamePlaceholder')} value={name} onChange={(e)=>setName(e.target.value)} />
              </div>
              <div className="field">
                <label>{t('contributeInfo.email')} *</label>
                <input placeholder={t('contributeInfo.emailPlaceholder')} value={email} onChange={(e)=>setEmail(e.target.value)} />
              </div>
            </div>

            <div className="field">
              <label>{t('contributeInfo.altLabel')}</label>
              <input placeholder={t('contributeInfo.altPlaceholder')} value={alt} onChange={(e)=>setAlt(e.target.value)} />
            </div>

            <div className="field">
              <label>{t('contributeInfo.contentLabel')} *</label>
              <textarea placeholder={t('contributeInfo.contentPlaceholder')} value={content} onChange={(e)=>setContent(e.target.value)} />
            </div>
          </div>

          <div className="process-box">
            <h4>{t('contributeInfo.processTitle')}</h4>
            <ul>
              <li>{t('contributeInfo.processPending')}</li>
              <li>{t('contributeInfo.processReview')}</li>
              <li>{t('contributeInfo.processEmail')}</li>
            </ul>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-back" onClick={()=>navigate(-1)}>{t('contributeInfo.back')}</button>
            <button type="submit" className="btn-submit">{t('contributeInfo.submit')}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ContributeInformation
