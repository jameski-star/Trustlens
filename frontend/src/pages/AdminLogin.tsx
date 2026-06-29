import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import SEOHead from '../components/SEOHead';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setIsLoading(true);
    try {
      const data = await login(email, password);
      if (data.user.role !== 'admin') {
        toast.error('Admin access required');
        return;
      }
      toast.success('Welcome to Admin Panel');
      navigate('/admin');
    } catch (err: unknown) {
      toast.error((err as Record<string, unknown>)?.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEOHead title="Admin Login" description="TrustLens administration panel login." />
      <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-[#0F172A] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="font-heading font-700 text-xl text-[var(--text-primary)]">Admin Panel</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Sign in to manage TrustLens</p>
          </div>
          <form onSubmit={handleSubmit} className="bg-[var(--bg-surface)] rounded-2xl shadow-card border border-[var(--border)] p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="admin@trustlens.website" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="input-field pr-10" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign In
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
