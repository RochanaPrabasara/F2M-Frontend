import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Sprout } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const { t } = useTranslation()

  if (
    location.pathname.includes('/dashboard') ||
    location.pathname.includes('/farmer/') ||
    location.pathname.includes('/buyer/')
  ) {
    return null
  }

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-stone-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo – pinned to left */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="bg-green-600 p-1.5 rounded-lg">
              <Sprout className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-stone-900">Farm2Market</span>
          </Link>

          {/* Desktop menu – pinned to right */}
          <div className="hidden md:flex items-center gap-6 lg:gap-10">
            <Link
              to="/login"
              className="text-stone-700 hover:text-green-700 font-medium transition-colors"
            >
              {t('Login')}
            </Link>
            <Link to="/register">
              <button className="bg-green-600 text-white cursor-pointer px-6 py-2.5 rounded-lg hover:bg-green-700 font-medium transition-colors">
                {t('Register')}
              </button>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-stone-700 focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={t('Open menu')}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-sm border-b border-stone-100">
          <div className="px-4 py-5 space-y-4">
            <Link
              to="/login"
              className="block text-lg text-stone-700 hover:text-green-700"
              onClick={() => setIsOpen(false)}
            >
              {t('Login')}
            </Link>
            <Link
              to="/register"
              className="block text-lg text-green-700 font-semibold"
              onClick={() => setIsOpen(false)}
            >
              {t('Register')}
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}