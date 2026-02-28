// src/components/NavigationSpinner.tsx
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function NavigationSpinner() {
  const location = useLocation();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Show spinner on every route change
    setShow(true);
    // Hide after page has had time to render
    const timer = setTimeout(() => setShow(false), 500);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!show) return null;

  return (
    <>
      {/* Top progress bar */}
      <div className="fixed top-0 left-0 z-[9999] h-0.5 w-full overflow-hidden">
        <div
          className="h-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"
          style={{ animation: 'progress-slide 0.5s ease-out forwards' }}
        />
      </div>

      {/* Full-screen overlay */}
      <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
        <div className="flex flex-col items-center gap-4">

          {/* Spinner ring */}
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-stone-200" />
            <div
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-500 border-r-green-400"
              style={{ animation: 'spin 0.75s linear infinite' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-2.5 h-2.5 rounded-full bg-green-500"
                style={{ animation: 'pulse-dot 1s ease-in-out infinite' }}
              />
            </div>
          </div>

          <p
            className="text-sm font-medium text-stone-500 tracking-wide"
            style={{ animation: 'fade-in-up 0.2s ease-out forwards' }}
          >
            Loading...
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes progress-slide {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes pulse-dot {
          0%, 100% { transform: scale(1);   opacity: 1; }
          50%       { transform: scale(0.6); opacity: 0.5; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}