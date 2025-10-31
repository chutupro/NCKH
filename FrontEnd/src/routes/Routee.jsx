// src/routes/Routee.jsx
import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";

import Lauput from "../layout/Lauput";
import Personal from "../pages/common/Personal";
import Timeline from "../pages/Timeline/Timeline";
import TimelineDetail from "../pages/Timeline/TimelineDetail"; // khác → giữ thêm
import Home from "../pages/common/Home";
import Contribute from "../pages/contribute/Contribute";
import ContributeInformation from "../pages/contribute/ContributeInformation";
import ImageLibrary from "../pages/gallery/ImageLibrary";
import ImageLibraryInformation from "../pages/gallery/ImageLibraryInformation";
import About from "../pages/about/About"; // khác → giữ thêm
import Login from "../pages/common/Login";
import Register from "../pages/common/Register";
import Community from "../pages/community/Community";
import CompareGallery from "../pages/Compare/CompareGallery";
import CompareDetail from "../pages/Compare/CompareDetail";
import MapPage from "../pages/map/MapPage";
import MapAdmin from "../pages/map/MapAdmin"; // Import MapAdmin
import { fetchMapLocations } from "../pages/map/mapLocationsSlice";

const Routee = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchMapLocations());
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/" element={<Lauput />}>
        {/* Trang chính */}
        <Route index element={<Home />} />
        <Route path="personal" element={<Personal />} />

        {/* Timeline */}
        <Route path="timeline" element={<Timeline />} />
        <Route path="timeline/:id" element={<TimelineDetail />} />

        {/* Đóng góp */}
        <Route path="contribute" element={<Contribute />} />
        <Route path="contribute/info" element={<ContributeInformation />} />

        {/* Thư viện hình ảnh */}
        <Route path="gallery" element={<ImageLibrary />} />
        <Route path="gallery/:id" element={<ImageLibraryInformation />} />

        {/* So sánh */}
        <Route path="compare" element={<CompareGallery />} />
        <Route path="compare/:id" element={<CompareDetail />} />

        

        {/* Khác */}
        <Route path="community" element={<Community />} />
        <Route path="about" element={<About />} />
      </Route>

      {/* Xác thực */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Bản đồ */}
        <Route path="map" element={<MapPage />} />
        <Route path="map/admin" element={<MapAdmin />} />
    </Routes>

    

  );
};

export default Routee;
