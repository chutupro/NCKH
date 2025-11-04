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
import MapAdminContributions from "../pages/map/MapAdminContributions";

const Routee = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchMapLocations());
  }, [dispatch]);

  return (
    <Routes>
      {/* TRANG CÓ LAYOUT */}
      <Route element={<Lauput />}>
        <Route index element={<Home />} />
        <Route path="/Personal" element={<Personal />} />

        {/* Timeline */}
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/timeline/:id" element={<TimelineDetail />} /> {/* khác → giữ thêm */}

        {/* Contribute */}
        <Route path="/contribute" element={<Contribute />} />
        <Route
          path="/contributeinformation"
          element={<ContributeInformation />}
        />

        {/* Gallery */}
        <Route path="/ImageLibrary" element={<ImageLibrary />} />
        <Route path="/ImageLibrary/:id" element={<ImageLibraryInformation />} />

        {/* Compare */}
        <Route path="/compare" element={<CompareGallery />} />
        <Route path="/compare/:id" element={<CompareDetail />} />

        {/* Community */}
        <Route path="/community" element={<Community />} />

        {/* About */}
        <Route path="/about" element={<About />} /> {/* khác → giữ thêm */}
      </Route>

      {/* TRANG KHÔNG LAYOUT */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* BẢN ĐỒ: FULL MÀN HÌNH */}
      <Route path="/map" element={<MapPage />} />
      <Route path="/map/admin" element={<MapAdmin />} /> {/* giữ lại */}
      <Route path="/map/admin/contributions" element={<MapAdminContributions />} /> {/* THÊM DÒNG NÀY */}
    </Routes>
  );
};


export default Routee;