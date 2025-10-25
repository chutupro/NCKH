import React from 'react'
import { useTranslation } from 'react-i18next'
import '../../Styles/Home/ContributeImpact.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHandHoldingHeart, faBookOpen, faUsers, faLandmark, faHeart, faGlobe } from '@fortawesome/free-solid-svg-icons'

const ContributeImpact = () => {
  const { t } = useTranslation();
  
  const impacts = [
    {
      icon: faHandHoldingHeart,
      title: t('impact.rememberRoots'),
      description: t('impact.rememberRootsDesc')
    },
    {
      icon: faBookOpen,
      title: t('impact.preserveMemories'),
      description: t('impact.preserveMemoriesDesc')
    },
    {
      icon: faUsers,
      title: t('impact.connectCommunity'),
      description: t('impact.connectCommunityDesc')
    },
    {
      icon: faLandmark,
      title: t('impact.preserveHeritage'),
      description: t('impact.preserveHeritageDesc')
    },
    {
      icon: faHeart,
      title: t('impact.inspire'),
      description: t('impact.inspireDesc')
    },
    {
      icon: faGlobe,
      title: t('impact.promote'),
      description: t('impact.promoteDesc')
    }
  ]

  return (
    <section className="contribute-impact-section">
      <div className="contribute-impact-container">
        <div className="impact-header">
          <h2 className="impact-title">{t('impact.title')}</h2>
          <p className="impact-subtitle">
            {t('impact.subtitle')}
          </p>
        </div>

        <div className="impact-grid">
          {impacts.map((impact, index) => (
            <div key={index} className="impact-card">
              <div className="impact-icon-wrapper">
                <FontAwesomeIcon icon={impact.icon} className="impact-icon" />
              </div>
              <h3 className="impact-card-title">{impact.title}</h3>
              <p className="impact-card-description">{impact.description}</p>
              <div className="impact-card-glow"></div>
            </div>
          ))}
        </div>

        <div className="impact-quote">
          <div className="quote-mark">"</div>
          <p className="quote-text">
            {t('impact.quote')}
          </p>
          <div className="quote-author">
            <div className="author-avatar">
              <FontAwesomeIcon icon={faHeart} />
            </div>
            <span>{t('impact.quoteAuthor')}</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContributeImpact
