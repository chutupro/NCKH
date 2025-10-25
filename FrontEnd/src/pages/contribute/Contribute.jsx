import React, { useCallback, useState } from 'react'
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../../Styles/Contribute/contribute.css'

const Contribute = () => {
  const { t } = useTranslation();
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
              <input type="file" accept="image/*" onChange={onFileChange} />
              <div className="upload-inner">
                <div className="upload-icon">⬆</div>
                  <div className="upload-text">{t('contributePage.uploadText')}</div>
                  <div className="upload-hint">{t('contributePage.uploadHint')}</div>
                  {fileName && <div className="upload-file">{t('contributePage.selected')}: {fileName}</div>}
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
              <Link to="/contributeinformation" className="confirm-btn enabled">{t('contributePage.confirm')}</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contribute
