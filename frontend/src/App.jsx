import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';

// Public Pages
import HomePage from './pages/HomePage';
import AboutUsPage from './pages/AboutUsPage';
import FindDonorsPage from './pages/FindDonorsPage';
import HowItWorksPage from './pages/HowItWorksPage';
import AwarenessPage from './pages/AwarenessPage';
import DonateBloodInfoPage from './pages/DonateBloodInfoPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RequestBloodPage from './pages/RequestBloodPage';
import NotFoundPage from './pages/NotFoundPage';

// Authenticated Pages
import DonorDashboard from './pages/DonorDashboard';
import RequesterDashboard from './pages/RequesterDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProfilePage from './pages/ProfilePage';
import MyRequestsPage from './pages/MyRequestsPage';
import DonationHistoryPage from './pages/DonationHistoryPage';
import NotificationsPage from './pages/NotificationsPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-800 antialiased selection:bg-blood-500 selection:text-white">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutUsPage />} />
              <Route path="/find-donors" element={<FindDonorsPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/awareness" element={<AwarenessPage />} />
              <Route path="/donate-info" element={<DonateBloodInfoPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/request-blood" element={<RequestBloodPage />} />

              {/* Authenticated Common Pages */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <NotificationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-requests"
                element={
                  <ProtectedRoute>
                    <MyRequestsPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Donor Routes */}
              <Route
                path="/donor/dashboard"
                element={
                  <RoleRoute allowedRoles={['donor']}>
                    <DonorDashboard />
                  </RoleRoute>
                }
              />
              <Route
                path="/donation-history"
                element={
                  <RoleRoute allowedRoles={['donor']}>
                    <DonationHistoryPage />
                  </RoleRoute>
                }
              />

              {/* Protected Requester Dashboard */}
              <Route
                path="/requester/dashboard"
                element={
                  <RoleRoute allowedRoles={['requester']}>
                    <RequesterDashboard />
                  </RoleRoute>
                }
              />

              {/* Protected Admin Portal */}
              <Route
                path="/admin"
                element={
                  <RoleRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </RoleRoute>
                }
              />

              {/* Custom 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
