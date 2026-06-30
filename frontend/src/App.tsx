import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

const Home = lazy(() => import('./pages/Home'));
const Result = lazy(() => import('./pages/Result'));
const URLChecker = lazy(() => import('./pages/URLChecker'));
const EmailChecker = lazy(() => import('./pages/EmailChecker'));
const SMSChecker = lazy(() => import('./pages/SMSChecker'));
const ScreenshotScanner = lazy(() => import('./pages/ScreenshotScanner'));
const QRCodeScanner = lazy(() => import('./pages/QRCodeScanner'));
const CommunityReports = lazy(() => import('./pages/CommunityReports'));
const ScamAlerts = lazy(() => import('./pages/ScamAlerts'));
const TrendingScams = lazy(() => import('./pages/TrendingScams'));
const KnowledgeCenter = lazy(() => import('./pages/KnowledgeCenter'));
const KnowledgeArticle = lazy(() => import('./pages/KnowledgeArticle'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPostPage = lazy(() => import('./pages/BlogPost'));
const About = lazy(() => import('./pages/About'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Contact = lazy(() => import('./pages/Contact'));
const FAQ = lazy(() => import('./pages/FAQ'));
const APIDocs = lazy(() => import('./pages/APIDocs'));
const Status = lazy(() => import('./pages/Status'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./admin/AdminUsers'));
const AdminReports = lazy(() => import('./admin/AdminReports'));
const AdminBlog = lazy(() => import('./admin/AdminBlog'));
const AdminAnalytics = lazy(() => import('./admin/AdminAnalytics'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-6 h-6 border-2 border-[var(--text-accent)] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/admin/login" element={<Suspense fallback={<PageLoader />}><AdminLogin /></Suspense>} />
        <Route path="/admin" element={<Suspense fallback={<PageLoader />}><ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute></Suspense>} />
        <Route path="/admin/users" element={<Suspense fallback={<PageLoader />}><ProtectedRoute requireAdmin><AdminUsers /></ProtectedRoute></Suspense>} />
        <Route path="/admin/reports" element={<Suspense fallback={<PageLoader />}><ProtectedRoute requireAdmin><AdminReports /></ProtectedRoute></Suspense>} />
        <Route path="/admin/blog" element={<Suspense fallback={<PageLoader />}><ProtectedRoute requireAdmin><AdminBlog /></ProtectedRoute></Suspense>} />
        <Route path="/admin/analytics" element={<Suspense fallback={<PageLoader />}><ProtectedRoute requireAdmin><AdminAnalytics /></ProtectedRoute></Suspense>} />
        <Route path="*" element={<Suspense fallback={<PageLoader />}><Layout><NotFound /></Layout></Suspense>} />
        <Route path="/" element={<Suspense fallback={<PageLoader />}><Layout><Home /></Layout></Suspense>} />
        <Route path="/result/:shareId" element={<Suspense fallback={<PageLoader />}><Layout><Result /></Layout></Suspense>} />
        <Route path="/url-checker" element={<Suspense fallback={<PageLoader />}><Layout><URLChecker /></Layout></Suspense>} />
        <Route path="/email-checker" element={<Suspense fallback={<PageLoader />}><Layout><EmailChecker /></Layout></Suspense>} />
        <Route path="/sms-checker" element={<Suspense fallback={<PageLoader />}><Layout><SMSChecker /></Layout></Suspense>} />
        <Route path="/screenshot-scanner" element={<Suspense fallback={<PageLoader />}><Layout><ScreenshotScanner /></Layout></Suspense>} />
        <Route path="/qr-scanner" element={<Suspense fallback={<PageLoader />}><Layout><QRCodeScanner /></Layout></Suspense>} />
        <Route path="/community-reports" element={<Suspense fallback={<PageLoader />}><Layout><CommunityReports /></Layout></Suspense>} />
        <Route path="/scam-alerts" element={<Suspense fallback={<PageLoader />}><Layout><ScamAlerts /></Layout></Suspense>} />
        <Route path="/trending-scams" element={<Suspense fallback={<PageLoader />}><Layout><TrendingScams /></Layout></Suspense>} />
        <Route path="/knowledge-center" element={<Suspense fallback={<PageLoader />}><Layout><KnowledgeCenter /></Layout></Suspense>} />
        <Route path="/knowledge-center/:slug" element={<Suspense fallback={<PageLoader />}><Layout><KnowledgeArticle /></Layout></Suspense>} />
        <Route path="/blog" element={<Suspense fallback={<PageLoader />}><Layout><Blog /></Layout></Suspense>} />
        <Route path="/blog/:slug" element={<Suspense fallback={<PageLoader />}><Layout><BlogPostPage /></Layout></Suspense>} />
        <Route path="/about" element={<Suspense fallback={<PageLoader />}><Layout><About /></Layout></Suspense>} />
        <Route path="/privacy" element={<Suspense fallback={<PageLoader />}><Layout><Privacy /></Layout></Suspense>} />
        <Route path="/terms" element={<Suspense fallback={<PageLoader />}><Layout><Terms /></Layout></Suspense>} />
        <Route path="/contact" element={<Suspense fallback={<PageLoader />}><Layout><Contact /></Layout></Suspense>} />
        <Route path="/faq" element={<Suspense fallback={<PageLoader />}><Layout><FAQ /></Layout></Suspense>} />
        <Route path="/api-docs" element={<Suspense fallback={<PageLoader />}><Layout><APIDocs /></Layout></Suspense>} />
        <Route path="/status" element={<Suspense fallback={<PageLoader />}><Layout><Status /></Layout></Suspense>} />
        <Route path="/login" element={<Suspense fallback={<PageLoader />}><Layout><Login /></Layout></Suspense>} />
        <Route path="/register" element={<Suspense fallback={<PageLoader />}><Layout><Register /></Layout></Suspense>} />
      </Routes>
    </>
  );
}