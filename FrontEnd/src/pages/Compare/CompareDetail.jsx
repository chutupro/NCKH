import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import compareList from '../../util/compareList';
import '../../Styles/CompareCard/CompareDetail.css';
import CompareDetailHeader from '../../Component/Compare/CompareDetailHeader';
import CompareDetailHero from '../../Component/Compare/CompareDetailHero';
import CompareSlider from '../../Component/Compare/CompareSlider';
import CompareContent from '../../Component/Compare/CompareContent';
import CompareSidebar from '../../Component/Compare/CompareSidebar';
import { useTranslation } from 'react-i18next';

const CompareDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // find by id or ComparisonID for compatibility with DB-derived data
  const item = compareList.find(i => i.id === parseInt(id, 10) || i.ComparisonID === parseInt(id, 10));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!item) {
    return (
      <div className="cd-not-found">
        <h2>{t('common.error')}</h2>
        <button onClick={() => navigate('/compare')} className="cd-back-btn">
          {t('compareDetail.back')}
        </button>
      </div>
    );
  }

  return (
    <div className="cd-wrapper">
      <CompareDetailHeader title={item.title} />

      <div className="cd-container">
        <CompareDetailHero item={item} />
        <CompareSlider item={item} />

        <div className="cd-content">
          <CompareContent item={item} />
          <CompareSidebar item={item} />
        </div>
      </div>
    </div>
  );
};

export default CompareDetail;
