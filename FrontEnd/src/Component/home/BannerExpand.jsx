// src/Component/home/BannerExpand.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/useAppContext";
import ScrollExpandBanner from "./ScrollExpandBanner";
import "./BannerExpand.css";

const BannerExpand = () => {
  const navigate = useNavigate();
  const { images, locations, locIndex } = useAppContext();

  const bg =
    images?.[0] ||
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1920";
  const safeLocLength = locations?.length || 1;
  const currentLocation = locations?.[locIndex % safeLocLength] || null;
  const goldenBridgeImage =
    currentLocation?.image ||
    "https://images.unsplash.com/photo-1559628376-f3fe5f782a2e?q=80&w=1280";

  return (
    <ScrollExpandBanner
      mediaType="image"
      mediaSrc={goldenBridgeImage}
      bgImageSrc={bg}
      title="Dynamic Vault Đà Nẵng"
      subtitle="Bảo tồn Di sản Văn hóa"
      scrollToExpand="↓ Scroll để khám phá"
      textBlend={false}
    >
      <div className="banner-expand-content"></div>
    </ScrollExpandBanner>
  );
};

export default BannerExpand;
