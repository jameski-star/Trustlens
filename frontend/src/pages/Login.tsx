import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '../validation/schemas';
import { useAuth } from '../hooks/useAuth';
import { Shield, Loader2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import SEOHead from '../components/SEOHead';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch {
      toast.error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEOHead title="Sign In" description="Sign in to your TrustLens account to manage your scans and reports." />
      <div className="container-page py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-[#2563EB] rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-heading font-700 text-xl md:text-2xl text-[var(--text-primary)]">Welcome Back</h1>
            <p className="text-[var(--text-secondary)] mt-1">Sign in to your TrustLens account</p>
          </div>

          <div className="bg-[var(--bg-surface)] rounded-2xl shadow-card border border-[var(--border)] p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Email</label>
                <input {...register('email')} type="email" className="input-field" placeholder="you@example.com" />
                {errors.email && <p className="text-sm text-[#DC2626] mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Password</label>
                <div className="relative">
                  <input {...register('password')} type={showPassword ? 'text' : 'password'} className="input-field pr-10" placeholder="Your password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-[#DC2626] mt-1">{errors.password.message}</p>}
              </div>
              <button type="submit" disabled={isLoading} className="btn-primary w-full">
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Sign In
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-[var(--text-accent)] font-medium hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </>
  );
}
