// src/Pages/farmer/FarmerDashboard.tsx
import { useEffect, useState, useRef } from 'react';
import {
  Sprout,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { StatsCard } from '../../components/dashboards/StatsCard';
import { PriceChart } from '../../components/dashboards/PriceChart';
import { SearchableSelect } from '../../components/SearchableSelect';
import axiosInstance from '../../config/axios.config';
import {
  getPriceForecast,
  getCommodities,
  getRegions,
} from '../../services/forecast.service';

type ChartPoint = { label: string; price: number };

interface FarmerStats {
  totalRevenue: number;
  revenueTrend: number;
  activeOrders: number;
  ordersTrend: number;
  activeListings: number;
  listingsTrend: number;
  marketTrend: number;
  marketTrendIsPositive: boolean;
}

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  amount: number;
  status: string;
  date: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending:          { label: 'Pending',          color: 'text-amber-600',  icon: Clock },
  payment_pending:  { label: 'Awaiting Payment',  color: 'text-amber-600',  icon: Clock },
  payment_uploaded: { label: 'Proof Received',    color: 'text-blue-600',   icon: AlertCircle },
  confirmed:        { label: 'Confirmed',          color: 'text-green-600',  icon: CheckCircle },
  completed:        { label: 'Completed',          color: 'text-green-700',  icon: CheckCircle },
  cancelled:        { label: 'Cancelled',          color: 'text-red-600',    icon: AlertCircle },
};

// Forecast period options as strings for SearchableSelect
const WEEK_OPTIONS = [
  '1 Week Ahead',
  '2 Weeks Ahead',
  '3 Weeks Ahead',
  '4 Weeks Ahead',
];
const weekLabelToNum = (label: string) => parseInt(label) || 4;

export default function FarmerDashboard() {
  const { user } = useAuth();

  // ── Stats state ────────────────────────────────────────────────────────────
  const [stats, setStats] = useState<FarmerStats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  // ── Forecast state ─────────────────────────────────────────────────────────
  const [commodities, setCommodities] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [listsLoading, setListsLoading] = useState(true);
  const [listsError, setListsError] = useState<string | null>(null);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedWeeksLabel, setSelectedWeeksLabel] = useState('4 Weeks Ahead');
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState<string | null>(null);

  const initialLoadDone = useRef(false);

  // ── Load dashboard stats ───────────────────────────────────────────────────
  useEffect(() => {
    axiosInstance
      .get('/api/dashboard/farmer')
      .then((r) => {
        setStats(r.data.stats);
        setActivity(r.data.recentActivity || []);
      })
      .catch((e) => console.error('Failed to load farmer stats:', e))
      .finally(() => setStatsLoading(false));
  }, []);

  // ── Load forecast commodities & regions ───────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const loadLists = async () => {
      try {
        setListsLoading(true);
        const [commodityList, regionList] = await Promise.all([
          getCommodities(),
          getRegions(),
        ]);
        if (cancelled) return;
        if (!commodityList.length || !regionList.length) {
          setListsError('No commodities or regions available.');
          return;
        }
        setCommodities(commodityList);
        setRegions(regionList);
        setSelectedCrop(commodityList[0]);
        setSelectedLocation(regionList[0]);
        initialLoadDone.current = true;
      } catch (err) {
        if (!cancelled) setListsError(err instanceof Error ? err.message : 'Failed to load data.');
      } finally {
        if (!cancelled) setListsLoading(false);
      }
    };
    loadLists();
    return () => { cancelled = true; };
  }, []);

  // ── Fetch forecast on selection change ────────────────────────────────────
  useEffect(() => {
    if (!selectedCrop || !selectedLocation) return;
    let cancelled = false;
    const fetchForecast = async () => {
      setForecastLoading(true);
      setForecastError(null);
      try {
        const points = await getPriceForecast({
          commodity: selectedCrop,
          region: selectedLocation,
          weeksAhead: weekLabelToNum(selectedWeeksLabel),
        });
        if (cancelled) return;
        if (!points.length) { setChartData([]); return; }
        const today = new Date();
        setChartData(points.map((p) => {
          const d = new Date(today);
          d.setDate(today.getDate() + p.week * 7);
          return {
            label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            price: p.predictedPrice,
          };
        }));
      } catch (err) {
        if (!cancelled) {
          setForecastError(err instanceof Error ? err.message : 'Failed to load forecast.');
          setChartData([]);
        }
      } finally {
        if (!cancelled) setForecastLoading(false);
      }
    };
    fetchForecast();
    return () => { cancelled = true; };
  }, [selectedCrop, selectedLocation, selectedWeeksLabel]);

  // ── Format helpers ────────────────────────────────────────────────────────
  const formatCurrency = (val: number) =>
    `LKR ${val.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatTrend = (val: number) => Math.abs(val);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Dashboard</h1>
          <p className="text-stone-500 mt-1">Welcome back, {user?.fullName ?? 'Farmer'}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value={statsLoading ? '...' : formatCurrency(stats?.totalRevenue ?? 0)}
          icon={DollarSign}
          color="green"
          trend={stats ? { value: formatTrend(stats.revenueTrend), isPositive: stats.revenueTrend >= 0 } : undefined}
        />
        <StatsCard
          title="Active Orders"
          value={statsLoading ? '...' : String(stats?.activeOrders ?? 0)}
          icon={ShoppingBag}
          color="amber"
          trend={stats ? { value: formatTrend(stats.ordersTrend), isPositive: stats.ordersTrend >= 0 } : undefined}
        />
        <StatsCard
          title="Active Listings"
          value={statsLoading ? '...' : String(stats?.activeListings ?? 0)}
          icon={Sprout}
          color="blue"
          trend={stats ? { value: formatTrend(stats.listingsTrend), isPositive: stats.listingsTrend >= 0 } : undefined}
        />
        <StatsCard
          title="Market Trend"
          value={statsLoading ? '...' : `${stats?.marketTrend ?? 0}%`}
          icon={TrendingUp}
          color="purple"
          trend={stats ? { value: formatTrend(stats.marketTrend), isPositive: stats.marketTrendIsPositive } : undefined}
        />
      </div>

      {/* AI Price Forecast */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-stone-900">AI Price Forecast</h2>
          {forecastLoading && (
            <span className="text-xs text-green-600 font-medium animate-pulse">Updating...</span>
          )}
        </div>
        <p className="text-sm text-stone-500 mb-6">
          Select a vegetable, forecast period, and location to see AI-predicted prices.
        </p>

        {listsError && <p className="text-sm text-red-600 mb-3">{listsError}</p>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Commodity */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Select Vegetable</label>
            {listsLoading ? (
              <div className="h-10 bg-stone-100 rounded-lg animate-pulse" />
            ) : (
              <SearchableSelect
                name="crop"
                value={selectedCrop}
                options={commodities}
                placeholder="Choose a vegetable..."
                onChange={(_, val) => setSelectedCrop(val)}
              />
            )}
          </div>

          {/* Forecast Period */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Forecast Period</label>
            <SearchableSelect
              name="weeks"
              value={selectedWeeksLabel}
              options={WEEK_OPTIONS}
              placeholder="Choose period..."
              onChange={(_, val) => setSelectedWeeksLabel(val)}
            />
          </div>

          {/* Region */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Location</label>
            {listsLoading ? (
              <div className="h-10 bg-stone-100 rounded-lg animate-pulse" />
            ) : (
              <SearchableSelect
                name="location"
                value={selectedLocation}
                options={regions}
                placeholder="Choose a location..."
                onChange={(_, val) => setSelectedLocation(val)}
              />
            )}
          </div>
        </div>

        <PriceChart
          cropName={selectedCrop && selectedLocation ? `${selectedCrop} (${selectedLocation})` : 'Select options above'}
          data={chartData}
          isLoading={forecastLoading}
          error={forecastError}
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
        <h3 className="text-lg font-bold text-stone-900 mb-4">Recent Activity</h3>

        {statsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-4 py-3 border-b border-stone-100">
                <div className="w-10 h-10 bg-stone-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-stone-200 rounded w-3/4" />
                  <div className="h-3 bg-stone-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : activity.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="bg-stone-100 p-4 rounded-full mb-3">
              <ShoppingBag className="h-6 w-6 text-stone-400" />
            </div>
            <p className="text-stone-900 font-medium">No recent activity yet</p>
            <p className="text-sm text-stone-500 max-w-sm mt-1">
              Your recent orders and listings will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {activity.map((item) => {
              const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG['pending'];
              const Icon = cfg.icon;
              return (
                <div key={item.id} className="flex items-center gap-4 py-3">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                    <Package className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-900 truncate">{item.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                      <span className={`text-xs ${cfg.color}`}>{cfg.label}</span>
                      <span className="text-xs text-stone-400">·</span>
                      <span className="text-xs text-stone-400">
                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-stone-900">
                      LKR {item.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}