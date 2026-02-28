// src/Pages/buyer/BuyerDashboard.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  TrendingUp,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  ClipboardList,
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

interface BuyerStats {
  totalSpent: number;
  spentTrend: number;
  spentTrendIsPositive: boolean;
  activeOrders: number;
  ordersTrend: number;
  activeNeeds: number;
  completedOrders: number;
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
  payment_uploaded: { label: 'Proof Uploaded',    color: 'text-blue-600',   icon: AlertCircle },
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

export default function BuyerDashboard() {
  const { user } = useAuth();

  // ── Stats state ────────────────────────────────────────────────────────────
  const [stats, setStats] = useState<BuyerStats | null>(null);
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

  // ── Load dashboard stats ───────────────────────────────────────────────────
  useEffect(() => {
    axiosInstance
      .get('/api/dashboard/buyer')
      .then((r) => {
        setStats(r.data.stats);
        setActivity(r.data.recentActivity || []);
      })
      .catch((e) => console.error('Failed to load buyer stats:', e))
      .finally(() => setStatsLoading(false));
  }, []);

  // ── Load forecast commodities & regions ───────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const loadLists = async () => {
      try {
        setListsLoading(true);
        const [commodityList, regionList] = await Promise.all([getCommodities(), getRegions()]);
        if (cancelled) return;
        if (!commodityList.length || !regionList.length) {
          setListsError('No commodities or regions available.');
          return;
        }
        setCommodities(commodityList);
        setRegions(regionList);
        setSelectedCrop(commodityList[0]);
        setSelectedLocation(regionList[0]);
      } catch (err) {
        if (!cancelled) setListsError(err instanceof Error ? err.message : 'Failed to load data.');
      } finally {
        if (!cancelled) setListsLoading(false);
      }
    };
    loadLists();
    return () => { cancelled = true; };
  }, []);

  // ── Fetch forecast ─────────────────────────────────────────────────────────
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

  const formatCurrency = (val: number) =>
    `LKR ${val.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Dashboard</h1>
          <p className="text-stone-500 mt-1">Welcome back, {user?.fullName ?? 'Buyer'}</p>
        </div>
        <Link
          to="/buyer/browse"
          className="inline-flex items-center px-4 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium shadow-sm hover:bg-green-700 transition-colors"
        >
          <Search className="h-4 w-4 mr-2" />
          Browse Crops
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Spent"
          value={statsLoading ? '...' : formatCurrency(stats?.totalSpent ?? 0)}
          icon={ShoppingBag}
          color="green"
          trend={stats ? { value: Math.abs(stats.spentTrend), isPositive: stats.spentTrendIsPositive } : undefined}
        />
        <StatsCard
          title="Active Orders"
          value={statsLoading ? '...' : String(stats?.activeOrders ?? 0)}
          icon={Package}
          color="amber"
          trend={stats ? { value: Math.abs(stats.ordersTrend), isPositive: stats.ordersTrend >= 0 } : undefined}
        />
        <StatsCard
          title="My Posted Needs"
          value={statsLoading ? '...' : String(stats?.activeNeeds ?? 0)}
          icon={ClipboardList}
          color="blue"
        />
        <StatsCard
          title="Completed Orders"
          value={statsLoading ? '...' : String(stats?.completedOrders ?? 0)}
          icon={TrendingUp}
          color="purple"
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
          Plan your procurement with AI-powered price predictions.
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
        <h3 className="text-lg font-bold text-stone-900 mb-4">Recent Orders</h3>

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
            <p className="text-stone-900 font-medium">No orders yet</p>
            <p className="text-sm text-stone-500 mt-1">Browse crops to place your first order.</p>
            <Link
              to="/buyer/browse"
              className="mt-4 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              Browse Crops
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {activity.map((item) => {
              const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG['pending'];
              const Icon = cfg.icon;
              return (
                <div key={item.id} className="flex items-center gap-4 py-3">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                    <Package className="h-5 w-5 text-amber-600" />
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
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-stone-900">
                      LKR {item.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
            <div className="pt-3">
              <Link to="/buyer/orders" className="text-sm text-green-600 hover:text-green-700 font-medium">
                View all orders →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}