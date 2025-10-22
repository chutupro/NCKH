import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import compareList from '../../util/compareList';
import '../../Styles/CompareCard/CompareDetail.css';
import CompareDetailHeader from '../../Component/Compare/CompareDetailHeader';
import CompareDetailHero from '../../Component/Compare/CompareDetailHero';
import CompareSlider from '../../Component/Compare/CompareSlider';
import CompareContent from '../../Component/Compare/CompareContent';
import CompareSidebar from '../../Component/Compare/CompareSidebar';

const CompareDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const item = compareList.find(i => i.id === parseInt(id));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!item) {
    return (
      <div className="cd-not-found">
        <h2>Không tìm thấy bài viết</h2>
        <button onClick={() => navigate('/compare')} className="cd-back-btn">
          Quay lại
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
