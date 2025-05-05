// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';

// API client
import api from './services/api';

// Pages
import LandingPage        from './components/LandingPage/LandingPage';
import Login              from './components/Login/Login';
import Register           from './components/Register/Register';
import DiscoveryPage      from './pages/DiscoveryPage';
import PaymentPage        from './pages/PaymentPage';
import SongDetailPage     from './pages/SongDetailPage';
import VideoDetailPage    from './pages/VideoDetailPage';
import UserProfilePage    from './pages/UserProfilePage';
import UploadSongPage     from './pages/UploadSongPage';
import UploadVideoPage    from './pages/UploadVideoPage';
import UserDashboard      from './components/Dashboard/UserDashboard';
import AdminDashboard     from './components/Dashboard/AdminDashboard';
import UserChatPage       from './pages/UserChatPage';
import AdminChatPage      from './pages/AdminChatPage';
import AdminApproveSongs  from './pages/AdminApproveSongsPage';

// Guards
function PrivateRoute({ children }) {
  return localStorage.getItem('access_token')
    ? children
    : <Navigate to="/login" replace />;
}
function AdminRoute({ children }) {
  const token   = localStorage.getItem('access_token');
  const isAdmin = localStorage.getItem('is_admin') === 'true';
  if (!token) return <Navigate to="/login" replace />;
  return isAdmin
    ? children
    : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <main>
        <Routes>
          {/* Public */}
          <Route path="/"         element={<LandingPage />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected */}
          <Route path="/dashboard"      element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
          <Route path="/upload/song"    element={<PrivateRoute><UploadSongPage /></PrivateRoute>} />
          <Route path="/upload/video"   element={<PrivateRoute><UploadVideoPage /></PrivateRoute>} />
          <Route path="/discover"       element={<PrivateRoute><DiscoveryPage /></PrivateRoute>} />
          <Route path="/songs/:id"      element={<PrivateRoute><SongDetailPage /></PrivateRoute>} />
          <Route path="/videos/:id"     element={<PrivateRoute><VideoDetailPage /></PrivateRoute>} />
          <Route path="/profile"        element={<PrivateRoute><UserProfilePage /></PrivateRoute>} />
          <Route path="/upgrade"        element={<PrivateRoute><PaymentPage /></PrivateRoute>} />
          <Route path="/chat/user"      element={<PrivateRoute><UserChatPage /></PrivateRoute>} />

          {/* Admin-only */}
          <Route path="/admin/dashboard"      element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/approve-songs" element={<AdminRoute><AdminApproveSongs /></AdminRoute>} />
          <Route path="/chat/admin"           element={<AdminRoute><AdminChatPage /></AdminRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}
