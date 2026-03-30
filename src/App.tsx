/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import ScoreManagement from "./pages/ScoreManagement";
import CharitySelection from "./pages/CharitySelection";
import WinnerVerification from "./pages/WinnerVerification";
import Checkout from "./pages/Checkout";
import QADashboard from "./pages/QADashboard";
import GearPage from "./pages/GearPage";
import CommunityPage from "./pages/CommunityPage";
import DrawRulesPage from "./pages/DrawRulesPage";
import CharityPartnersPage from "./pages/CharityPartnersPage";
import ScholarshipsPage from "./pages/ScholarshipsPage";
import AnnualReportPage from "./pages/AnnualReportPage";
import MembershipPage from "./pages/MembershipPage";
import Settings from "./pages/Settings";
import Wallet from "./pages/Wallet";
import AdminReports from "./pages/AdminReports";
import AdminWithdrawals from "./pages/AdminWithdrawals";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/memberships" element={<MembershipPage />} />
          <Route path="/gear" element={<GearPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/draw-rules" element={<DrawRulesPage />} />
          <Route path="/charity-partners" element={<CharityPartnersPage />} />
          <Route path="/scholarships" element={<ScholarshipsPage />} />
          <Route path="/annual-report" element={<AnnualReportPage />} />

          {/* Subscriber & Admin Routes (Wrapped in Layout) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/wallet"
            element={
              <ProtectedRoute requireSubscription>
                <Layout>
                  <Wallet />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/scores"
            element={
              <ProtectedRoute requireSubscription>
                <Layout>
                  <ScoreManagement />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/charity"
            element={
              <ProtectedRoute>
                <Layout>
                  <CharitySelection />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/verify-win"
            element={
              <ProtectedRoute requireSubscription>
                <Layout>
                  <WinnerVerification />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <Layout>
                  <ErrorBoundary>
                    <AdminPanel />
                  </ErrorBoundary>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute requireAdmin>
                <Layout>
                  <ErrorBoundary>
                    <AdminReports />
                  </ErrorBoundary>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/withdrawals"
            element={
              <ProtectedRoute requireAdmin>
                <Layout>
                  <ErrorBoundary>
                    <AdminWithdrawals />
                  </ErrorBoundary>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/qa"
            element={
              <ProtectedRoute requireAdmin>
                <Layout>
                  <ErrorBoundary>
                    <QADashboard />
                  </ErrorBoundary>
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
