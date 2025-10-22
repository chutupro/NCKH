import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const CompareDetailHeader = ({ title }) => {
  const navigate = useNavigate();

  return (
    <div className="cd-header">
      <button onClick={() => navigate('/compare')} className="cd-back-btn">
        <FontAwesomeIcon icon={faArrowLeft} /> Quay lại
      </button>
      <nav className="cd-breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span>/</span>
        <Link to="/compare">So sánh</Link>
        <span>/</span>
        <span>{title}</span>
      </nav>
    </div>
  );
};

export default CompareDetailHeader;
