import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import PlanManagement from './pages/admin/PlanManagement';
import Profile from './pages/Profile';
import Pricing from './pages/Pricing';
import VideoCall from './pages/VideoCall';
import Transcripts from './pages/Transcripts';
import TranscriptDetail from './pages/TranscriptDetail';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <SocketProvider>
          <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/video-call/:callId" element={<VideoCall />} />
            <Route path="/transcripts" element={<Transcripts />} />
            <Route path="/transcripts/:id" element={<TranscriptDetail />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/plans" element={<PlanManagement />} />
          </Route>
        </Routes>
        </SocketProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
