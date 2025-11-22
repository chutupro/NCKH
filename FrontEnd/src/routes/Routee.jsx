
import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";

import Lauput from "../layout/Lauput";
import Personal from "../pages/common/Personal";
import UserProfile from "../pages/common/UserProfile"; // ✅ USER PROFILE
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

import AdminLayout from "../Component/admin/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import UserManagement from "../pages/admin/UserManagement";
import ContentModeration from "../pages/admin/ContentModeration";
import AIModels from "../pages/admin/AIModels";
import SystemMonitor from "../pages/admin/SystemMonitor";
import RolePermissions from "../pages/admin/RolePermissions";
import PhotoModeration from "../pages/admin/PhotoModeration";
import ProtectedRoute from "../Component/common/ProtectedRoute";

const Routee = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchMapLocations());
  }, [dispatch]);

  return (
    <Routes>
      {}
      <Route element={<Lauput />}>
        <Route index element={<Home />} />
        <Route path="/Personal" element={<Personal />} />
        <Route path="/user/:userId" element={<UserProfile />} /> {}

        {}
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/timeline/:id" element={<TimelineDetail />} /> {}

        {}
        <Route path="/contribute" element={<Contribute />} />
        <Route
          path="/contributeinformation"
          element={<ContributeInformation />}
        />

        {}
        <Route path="/ImageLibrary" element={<ImageLibrary />} />
        <Route path="/ImageLibrary/:id" element={<ImageLibraryInformation />} />

        {}
        <Route path="/compare" element={<CompareGallery />} />
        <Route path="/compare/:id" element={<CompareDetail />} />

        {}
        <Route path="/community" element={<Community />} />

        {}
        <Route path="/about" element={<About />} /> {}
      </Route>

      {}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} /> {}
  <Route path="/oauth/google/success" element={<GoogleAuthSuccess />} /> {}
  <Route path="/oauth/facebook/success" element={<FacebookAuthSuccess />} /> {}

      {}
      <Route path="/map" element={<MapPage />} />

      {}
      <Route 
        path="/map/admin" 
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Editor']}>
            <MapAdmin />
          </ProtectedRoute>
        } 
      />

      {}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminLayout /> 
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="content" element={<ContentModeration />} />
        <Route path="photos" element={<PhotoModeration />} />
        <Route path="ai-models" element={<AIModels />} />
        <Route path="system-monitor" element={<SystemMonitor />} />
        <Route path="permissions" element={<RolePermissions />} />
      </Route>
    </Routes>
  );
};

export default Routee;
