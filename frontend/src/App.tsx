import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Result from './pages/Result';
import URLChecker from './pages/URLChecker';
import EmailChecker from './pages/EmailChecker';
import SMSChecker from './pages/SMSChecker';
import ScreenshotScanner from './pages/ScreenshotScanner';
import QRCodeScanner from './pages/QRCodeScanner';
import CommunityReports from './pages/CommunityReports';
import ScamAlerts from './pages/ScamAlerts';
import TrendingScams from './pages/TrendingScams';
import KnowledgeCenter from './pages/KnowledgeCenter';
import Blog from './pages/Blog';
import BlogPostPage from './pages/BlogPost';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import APIDocs from './pages/APIDocs';
import Status from './pages/Status';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import AdminUsers from './admin/AdminUsers';
import AdminReports from './admin/AdminReports';
import AdminBlog from './admin/AdminBlog';
import AdminAnalytics from './admin/AdminAnalytics';

export default function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/reports" element={<AdminReports />} />
      <Route path="/admin/blog" element={<AdminBlog />} />
      <Route path="/admin/analytics" element={<AdminAnalytics />} />
      <Route path="*" element={<Layout><NotFound /></Layout>} />
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/result/:shareId" element={<Layout><Result /></Layout>} />
      <Route path="/url-checker" element={<Layout><URLChecker /></Layout>} />
      <Route path="/email-checker" element={<Layout><EmailChecker /></Layout>} />
      <Route path="/sms-checker" element={<Layout><SMSChecker /></Layout>} />
      <Route path="/screenshot-scanner" element={<Layout><ScreenshotScanner /></Layout>} />
      <Route path="/qr-scanner" element={<Layout><QRCodeScanner /></Layout>} />
      <Route path="/community-reports" element={<Layout><CommunityReports /></Layout>} />
      <Route path="/scam-alerts" element={<Layout><ScamAlerts /></Layout>} />
      <Route path="/trending-scams" element={<Layout><TrendingScams /></Layout>} />
      <Route path="/knowledge-center" element={<Layout><KnowledgeCenter /></Layout>} />
      <Route path="/blog" element={<Layout><Blog /></Layout>} />
      <Route path="/blog/:slug" element={<Layout><BlogPostPage /></Layout>} />
      <Route path="/about" element={<Layout><About /></Layout>} />
      <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
      <Route path="/terms" element={<Layout><Terms /></Layout>} />
      <Route path="/contact" element={<Layout><Contact /></Layout>} />
      <Route path="/faq" element={<Layout><FAQ /></Layout>} />
      <Route path="/api-docs" element={<Layout><APIDocs /></Layout>} />
      <Route path="/status" element={<Layout><Status /></Layout>} />
      <Route path="/login" element={<Layout><Login /></Layout>} />
      <Route path="/register" element={<Layout><Register /></Layout>} />
    </Routes>
  );
}
