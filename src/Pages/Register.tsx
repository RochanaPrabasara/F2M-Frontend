// src/pages/Register.tsx
import { useState, useCallback } from 'react';
import type { FormEvent, ChangeEvent } from 'react';

import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Sprout,
  Tractor,
  Store,
  ArrowLeft,
  Loader2
} from 'lucide-react';

import Select from 'react-select';
import type { SingleValue } from 'react-select';

import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import type { Engine } from 'tsparticles-engine';

import authService from '../services/auth.service';
import toast from 'react-hot-toast';

const SRI_LANKA_DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
  'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
  'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
  'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya',
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
];

const districtOptions = SRI_LANKA_DISTRICTS.map(district => ({
  value: district,
  label: district
}));

type DistrictOption = SingleValue<{
  value: string;
  label: string;
}>;

export default function Register() { 
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialType = searchParams.get('type') ?? 'farmer';

  const [userType, setUserType] = useState<'farmer' | 'buyer'>(
    initialType === 'buyer' ? 'buyer' : 'farmer'
  );

  const [selectedDistrict, setSelectedDistrict] =
    useState<DistrictOption>(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // UI state
  const [loading, setLoading] = useState(false);

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [id]: value
    }));

    if (errors[id]) {
      setErrors(prev => ({
        ...prev,
        [id]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{9,10}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Enter valid 9–10 digit phone number';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!selectedDistrict) {
      newErrors.district = 'Please select your district';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (!validateForm()) return;

  setLoading(true);

  try {
    const signupData = {
      fullName: formData.fullName.trim(),
      phone: `+94${formData.phone.trim()}`,
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      role: userType,
      district: selectedDistrict!.value
    };

    const response = await authService.signup(signupData);

    toast.success(response.message || 'Account created successfully!', {
      duration: 5000,
      position: 'top-center',
    });

    // Immediate redirect – no artificial delay
    navigate('/login', { replace: true });
  } catch (err: unknown) {
    const errMsg =
      err instanceof Error
        ? err.message
        : 'Registration failed. Please try again.';
    toast.error(errMsg, {
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
          background: { color: { value: "#fafaf9" } },
          fpsLimit: 120,
          interactivity: {
            events: {
              onHover: { enable: true, mode: "grab" },
              onClick: { enable: true, mode: "push" }
            },
            modes: {
              grab: { distance: 200, links: { opacity: 0.8 } },
              push: { quantity: 4 }
            }
          },
          particles: {
            color: { value: "#16a34a" },
            links: {
              color: "#22c55e",
              distance: 150,
              enable: true,
              opacity: 0.3,
              width: 1
            },
            move: {
              enable: true,
              speed: 0.5
            },
            number: {
              density: { enable: true, area: 800 },
              value: 80
            },
            opacity: { value: 0.5 },
            size: { value: { min: 1, max: 3 } }
          },
          detectRetina: true
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
        <div className="max-w-lg w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-5">
              <div className="bg-green-600 p-3 rounded-xl shadow-md">
                <Sprout className="h-10 w-10 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-stone-900">
              Create your Farm2Market account
            </h2>
            <p className="mt-2 text-sm text-stone-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-green-600 hover:text-green-700 hover:underline transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>

          

          <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-stone-200 shadow-sm p-5.5 lg:p-6.5">
            <div className="flex justify-center gap-4 mb-7">
              <button
                type="button"
                onClick={() => setUserType('farmer')}
                disabled={loading}
                className={`
                  flex flex-col items-center justify-center w-35 h-24 rounded-lg border-2 transition-all
                  ${userType === 'farmer'
                    ? 'border-green-600 bg-green-50 text-green-800 shadow-sm'
                    : 'border-stone-200 hover:border-stone-300 text-stone-600 hover:bg-stone-50 active:bg-stone-100'
                  }
                  ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <Tractor className="h-7 w-7 mb-1.5 text-green-600" />
                <span className="font-semibold text-xs leading-tight text-center">I'm a Farmer</span>
              </button>

              <button
                type="button"
                onClick={() => setUserType('buyer')}
                disabled={loading}
                className={`
                  flex flex-col items-center justify-center w-35 h-24 rounded-lg border-2 transition-all
                  ${userType === 'buyer'
                    ? 'border-green-600 bg-green-50 text-green-800 shadow-sm'
                    : 'border-stone-200 hover:border-stone-300 text-stone-600 hover:bg-stone-50 active:bg-stone-100'
                  }
                  ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <Store className="h-7 w-7 mb-1.5 text-green-600" />
                <span className="font-semibold text-xs leading-tight text-center">I'm a Buyer</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-stone-700 mb-1">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="Your full name"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow placeholder-stone-400 text-sm
                    ${errors.fullName ? 'border-red-300 bg-red-50' : 'border-stone-300'}
                    ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-stone-700 mb-1">
                  Phone Number
                </label>
                <div className={`flex border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-green-500 transition-shadow
                  ${errors.phone ? 'border-red-300 bg-red-50' : 'border-stone-300'}
                `}>
                  <div className="bg-stone-100 px-3 py-2.5 text-sm text-stone-700 font-medium border-r border-stone-300 flex items-center gap-1.5 min-w-22.5">
                    <span className="text-base">🇱🇰 +94</span>
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={loading}
                    placeholder="771234567"
                    className={`flex-1 px-4 py-2.5 text-sm border-none focus:outline-none placeholder-stone-400
                      ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    maxLength={10}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                )}
              </div>

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
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
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
                  placeholder="At least 8 characters"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow placeholder-stone-400 text-sm
                    ${errors.password ? 'border-red-300 bg-red-50' : 'border-stone-300'}
                    ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-stone-700 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="Re-enter password"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow placeholder-stone-400 text-sm
                    ${errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-stone-300'}
                    ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              <div>
                <label htmlFor="district" className="block text-sm font-medium text-stone-700 mb-1">
                  District
                </label>
                <Select
                  options={districtOptions}
                  value={selectedDistrict}
                  onChange={setSelectedDistrict}
                  isDisabled={loading}
                  placeholder="Select your district"
                  isSearchable={true}
                  className="text-sm"
                  classNames={{
                    control: () => 
                      `border rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-green-500 transition-shadow bg-white
                      ${errors.district ? 'border-red-300 bg-red-50' : 'border-stone-300'}`,
                    menu: () => 
                      'bg-white border border-stone-200 rounded-lg mt-1 shadow-lg z-50',
                    option: ({ isFocused, isSelected }) => 
                      `px-3 py-2 cursor-pointer ${isSelected ? 'bg-green-600 text-white' : isFocused ? 'bg-green-50' : 'text-stone-800'}`
                  }}
                  styles={{
                    indicatorSeparator: () => ({ display: 'none' }),
                    dropdownIndicator: (base) => ({
                      ...base,
                      color: '#6b7280',
                      paddingRight: 8,
                    }),
                    singleValue: (base) => ({
                      ...base,
                      color: '#1f2937',
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: '#9ca3af',
                    }),
                  }}
                  noOptionsMessage={() => "No districts found"}
                />
                {errors.district && (
                  <p className="mt-1 text-xs text-red-600">{errors.district}</p>
                )}
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
                      Creating Account...
                    </>
                  ) : (
                    `Create ${userType === 'farmer' ? 'Farmer' : 'Buyer'} Account`
                  )}
                </button>
              </div>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-stone-500">
            By signing up, you agree to our{' '}
            <Link to="/terms" className="text-stone-600 hover:text-stone-800 underline">
              Terms
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-stone-600 hover:text-stone-800 underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}