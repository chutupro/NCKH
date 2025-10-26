// src/routes/Routee.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Lauput from "../layout/Lauput";
import Personal from "../pages/common/Personal";
import Timeline from "../pages/Timeline/Timeline";
import Home from "../pages/common/Home";
import Contribute from "../pages/contribute/Contribute";
import ContributeInformation from "../pages/contribute/ContributeInformation";
import ImageLibrary from "../pages/gallery/ImageLibrary";
import ImageLibraryInformation from "../pages/gallery/ImageLibraryInformation";
import Login from "../pages/common/Login";
import Register from "../pages/common/Register";
import Community from "../pages/community/Community";
import CompareGallery from "../pages/Compare/CompareGallery";
import CompareDetail from "../pages/Compare/CompareDetail";
import MapPage from "../pages/map/MapPage";
import MapAdmin from "../pages/map/MapAdmin"; // Import MapAdmin
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { fetchMapLocations } from "../pages/map/mapLocationsSlice";

const Routee = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchMapLocations()); // Fetch dữ liệu khi ứng dụng khởi động
  }, [dispatch]);

  return (
    <Routes>
      {/* TRANG CÓ LAYOUT */}
      <Route element={<Lauput />}>
        <Route index element={<Home />} />
        <Route path="/Personal" element={<Personal />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/contribute" element={<Contribute />} />
        <Route
          path="/contributeinformation"
          element={<ContributeInformation />}
        />
        <Route path="/ImageLibrary" element={<ImageLibrary />} />
        <Route path="/ImageLibrary/:id" element={<ImageLibraryInformation />} />
        <Route path="/compare" element={<CompareGallery />} />
        <Route path="/compare/:id" element={<CompareDetail />} />
        <Route path="/community" element={<Community />} />
      </Route>
      {/* TRANG KHÔNG LAYOUT */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* BẢN ĐỒ: FULL MÀN HÌNH */}
      <Route path="/map" element={<MapPage />} />
      <Route path="/map/admin" element={<MapAdmin />} />{" "}
      {/* Bỏ comment route này */}
    </Routes>
  );
};

export default Routee;
