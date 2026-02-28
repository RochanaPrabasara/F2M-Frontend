// src/Pages/Login.tsx
import { useState, useCallback } from 'react';
import type { FormEvent, ChangeEvent } from 'react';

import { Link, useNavigate } from 'react-router-dom';
import { Sprout, ArrowLeft, Loader2 } from 'lucide-react';

import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import type { Engine } from 'tsparticles-engine';

import toast from 'react-hot-toast';
import { useAuth } from '../context/useAuth';

// --- Typed error helpers ---
type ApiErrorData = {
  message?: string;
  error?: string;
  [key: string]: unknown;
};

type ApiError = {
  response?: {
    status?: number;
    data?: ApiErrorData;
  };
  request?: unknown;
  message?: string;
};

function getLoginErrorMessage(error: unknown): string {
  const err = error as ApiError;

  if (err.response) {
    const status = err.response.status ?? 0;
    const data = err.response.data;
    const serverMessage = data?.message ?? data?.error;

    if (status === 400 || status === 401) return serverMessage || 'Invalid email or password. Please try again.';
    if (status === 403) return serverMessage || 'Your account is not allowed to sign in. Please contact support.';
    if (status === 429) return 'Too many login attempts. Please wait a few minutes and try again.';
    if (status >= 500) return 'Server error. Please try again in a little while.';

    return serverMessage || 'Login failed. Please try again.';
  }

  if (err.request) return 'Network error. Please check your internet connection and try again.';
  if (error instanceof Error && error.message) return error.message;

  return 'Login failed. Please try again.';
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }));

    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';

    if (!formData.password) newErrors.password = 'Password is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const loginData = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      };

      const response = await login(loginData);

      toast.success(response.message || 'Login successful!', {
        duration: 4000,
        position: 'top-center',
      });

      const role = response.user?.role;

      if (role === 'farmer') {
        navigate('/farmer/dashboard', { replace: true });
      } else {
        navigate('/buyer/dashboard', { replace: true });
      }
    } catch (err: unknown) {
      toast.error(getLoginErrorMessage(err), {
        duration: 6000,
        position: 'top-center',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col relative">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: { color: { value: '#fafaf9' } },
          fpsLimit: 120,
          interactivity: {
            events: {
              onHover: { enable: true, mode: 'grab' },
              onClick: { enable: true, mode: 'push' },
            },
            modes: {
              grab: { distance: 200, links: { opacity: 0.4 } },
              push: { quantity: 4 },
            },
          },
          particles: {
            color: { value: '#16a34a' },
            links: {
              color: '#22c55e',
              distance: 150,
              enable: true,
              opacity: 0.3,
              width: 1,
            },
            move: { enable: true, speed: 0.5 },
            number: { density: { enable: true, area: 800 }, value: 80 },
            opacity: { value: 0.5 },
            size: { value: { min: 1, max: 3 } },
          },
          detectRetina: true,
        }}
        className="absolute inset-0 z-0"
      />

      <div className="border-b border-stone-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/"
            className="inline-flex items-center text-stone-600 hover:text-green-700 font-medium transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>

      <div className="grow flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-5">
              <div className="bg-green-600 p-3 rounded-xl shadow-md">
                <Sprout className="h-10 w-10 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-stone-900">Sign in to Farm2Market</h2>
            <p className="mt-2 text-sm text-stone-600">
              Or{' '}
              <Link
                to="/register"
                className="font-medium text-green-600 hover:text-green-700 hover:underline transition-colors"
              >
                create a new account
              </Link>
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-stone-200 shadow-sm p-5">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="you@example.com"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow placeholder-stone-400 text-sm
                    ${errors.email ? 'border-red-300 bg-red-50' : 'border-stone-300'}
                    ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="Your password"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow placeholder-stone-400 text-sm
                    ${errors.password ? 'border-red-300 bg-red-50' : 'border-stone-300'}
                    ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                />
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-stone-300 rounded"
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-stone-700">
                    Remember me
                  </label>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md text-base flex items-center justify-center gap-2
                    ${loading ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-stone-500">
            By signing in, you agree to our Terms and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}