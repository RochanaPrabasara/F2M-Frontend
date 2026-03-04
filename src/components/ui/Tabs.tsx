// src/components/ui/Tabs.tsx
import { motion } from 'framer-motion';

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  mobileLayout?: 'scroll' | 'grid';
}

export function Tabs({ tabs, activeTab, onChange, mobileLayout = 'scroll' }: TabsProps) {
  const useMobileGrid = mobileLayout === 'grid';

  return (
    <div className={`mb-6 ${useMobileGrid ? '' : '-mx-2 px-2 overflow-x-auto'}`}>
      <div
        className={`
          border-b border-stone-200
          ${useMobileGrid
            ? 'grid grid-cols-2 gap-x-1 sm:flex sm:w-max sm:min-w-full sm:space-x-1'
            : 'flex w-max min-w-full space-x-1'}
        `}
      >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              relative px-3 sm:px-6 py-3 text-sm font-medium transition-colors
              ${useMobileGrid ? 'text-center' : 'whitespace-nowrap'}
              ${isActive ? 'text-green-700' : 'text-stone-600 hover:text-stone-800'}
            `}
          >
            {tab.label}
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 rounded-full"
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        );
      })}
      </div>
    </div>
  );
}