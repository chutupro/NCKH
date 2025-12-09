// src/Component/home/BannerExpandDemo.jsx
// Demo component với data mẫu để test ScrollExpandBanner

import React from "react";
import { useNavigate } from "react-router-dom";
import ScrollExpandBanner from "./ScrollExpandBanner";
import "./BannerExpand.css";

const BannerExpandDemo = () => {
  const navigate = useNavigate();

  // Demo data với Unsplash images
  const demoData = {
    mediaSrc:
      "https://images.unsplash.com/photo-1559628376-f3fe5f782a2e?q=80&w=1280", // Da Nang Golden Bridge
    bgImageSrc:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1920", // Mountain background
    title: "Dynamic Vault Đà Nẵng",
    subtitle: "Bảo tồn Di sản Văn hóa",
  };

  return (
    <ScrollExpandBanner
      mediaType="image"
      mediaSrc={demoData.mediaSrc}
      bgImageSrc={demoData.bgImageSrc}
      title={demoData.title}
      subtitle={demoData.subtitle}
      scrollToExpand="↓ Cuộn xuống để khám phá thêm"
      textBlend={false}
    >
      <div className="banner-expand-content">
        
      </div>
    </ScrollExpandBanner>
  );
};

export default BannerExpandDemo;
