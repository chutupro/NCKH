// src/routes/Routee.jsx
import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";

import Lauput from "../layout/Lauput";
import Personal from "../pages/common/Personal";
import UserProfile from "../pages/common/UserProfile"; // ✅ USER PROFILE
import LanguageSettings from "../pages/common/LanguageSettings";
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
import GoogleAuthSuccess from "../pages/common/GoogleAuthSuccess"; // ✅ GOOGLE AUTH
import FacebookAuthSuccess from "../pages/common/FacebookAuthSuccess"; // ✅ FACEBOOK AUTH
import ForgotPassword from "../pages/common/ForgotPassword"; // ✅ FORGOT PASSWORD
import Community from "../pages/community/Community";
import CompareGallery from "../pages/Compare/CompareGallery";
import CompareDetail from "../pages/Compare/CompareDetail";
import MapPage from "../pages/map/MapPage";
import MapAdmin from "../pages/map/MapAdmin";
import { fetchMapLocations } from "../pages/map/mapLocationsSlice";

// Admin Dashboard
import AdminLayout from "../Component/admin/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import UserManagement from "../pages/admin/UserManagement";
import CollectionManagement from "../pages/admin/CollectionManagement";
import AIModels from "../pages/admin/AIModels";
import SystemMonitor from "../pages/admin/SystemMonitor";
import RolePermissions from "../pages/admin/RolePermissions";
import PhotoModeration from "../pages/admin/PhotoModeration";
import AdminContributions from "../Component/admin/AdminContributions";
import MapManagement from "../pages/admin/MapManagement";
import CrawlerManagement from "../pages/admin/CrawlerManagement";
import Logs from "../pages/admin/Logs";
import ProtectedRoute from "../Component/common/ProtectedRoute";

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
        <Route path="/user/:userId" element={<UserProfile />} />{" "}
        {/* ✅ XEM PROFILE NGƯỜI KHÁC */}
        {/* Timeline */}
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/timeline/:id" element={<TimelineDetail />} />{" "}
        {/* khác → giữ thêm */}
        {/* Contribute */}
        <Route path="/contribute" element={<Contribute />} />
        <Route
          path="/contributeinformation"
          element={<ContributeInformation />}
        />
        <Route path="/language" element={<LanguageSettings />} />
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
      <Route path="/forgot-password" element={<ForgotPassword />} />{" "}
      {/* ✅ FORGOT PASSWORD */}
      <Route
        path="/oauth/google/success"
        element={<GoogleAuthSuccess />}
      />{" "}
      {/* ✅ GOOGLE CALLBACK */}
      <Route
        path="/oauth/facebook/success"
        element={<FacebookAuthSuccess />}
      />{" "}
      {/* ✅ FACEBOOK CALLBACK */}
      {/* BẢN ĐỒ: FULL MÀN HÌNH */}
      <Route path="/map" element={<MapPage />} />
<<<<<<< HEAD
      {/* QUẢN TRỊ BẢN ĐỒ: CHỈ ADMIN/EDITOR */}
      <Route
        path="/map/admin"
        element={
          <ProtectedRoute allowedRoles={["Admin", "Editor"]}>
=======

      {/* QUẢN TRỊ BẢN ĐỒ: CHỈ ADMIN/MODERATOR */}
      <Route
        path="/map/admin"
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Moderator']}>
>>>>>>> e8d1b1f92415f39fffd890dbfa37983e55c94d33
            <MapAdmin />
          </ProtectedRoute>
        }
      />
      {/* ADMIN DASHBOARD: CHỈ ADMIN */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="content" element={<CollectionManagement />} />
        <Route path="photos" element={<PhotoModeration />} />
        <Route path="contributions" element={<AdminContributions />} />
        <Route path="map-management" element={<MapManagement />} />
        <Route path="crawler" element={<CrawlerManagement />} />
        <Route path="ai-models" element={<AIModels />} />
        <Route path="system-monitor" element={<SystemMonitor />} />
        <Route path="permissions" element={<RolePermissions />} />
        <Route path="logs" element={<Logs />} />
      </Route>
    </Routes>
  );
};

export default Routee;
