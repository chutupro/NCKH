import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getImageComparisonById } from '../../API/imageComparisons';
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

  // fetch item from API
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    let mounted = true;
    const ac = new AbortController();
    setLoading(true);
    getImageComparisonById(id, ac.signal)
      .then((data) => {
        if (!mounted) return;
        setItem(data || null);
      })
      .catch((err) => {
        if (!mounted) return;
        console.warn(err);
        setItem(null);
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; ac.abort(); };
  }, [id]);

  if (loading) {
    return <div className="cd-loading">Loading...</div>;
  }

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
