import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const CompareDetailHeader = ({ title }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="cd-header">
      <button onClick={() => navigate('/compare')} className="cd-back-btn">
        <FontAwesomeIcon icon={faArrowLeft} /> {t('compareDetail.back')}
      </button>
      <nav className="cd-breadcrumb">
        <Link to="/">{t('nav.home')}</Link>
        <span>/</span>
        <Link to="/compare">{t('compareDetail.breadcrumbCompare')}</Link>
        <span>/</span>
        <span>{title}</span>
      </nav>
    </div>
  );
};

export default CompareDetailHeader;
