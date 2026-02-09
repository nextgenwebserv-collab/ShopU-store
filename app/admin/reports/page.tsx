'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Package,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

interface ReportFilters {
  reportType: string;
  timePeriod: string;
  warehouse: string;
  groupBy: string;
  startDate: string;
  endDate: string;
}

interface SalesTrendData {
  week: string;
  sales: number;
}

interface RevenueCategoryData {
  name: string;
  value: number;
  color: string;
}

interface TopProductData {
  name: string;
  sales: number;
}

interface ReportStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueGrowth: number;
  ordersGrowth: number;
}

export default function AdminReportsPage() {
  const [filters, setFilters] = useState<ReportFilters>({
    reportType: 'Sales Report',
    timePeriod: 'This Month',
    warehouse: 'All Warehouses',
    groupBy: 'Day',
    startDate: '',
    endDate: '',
  });

  const [stats, setStats] = useState<ReportStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
  });

  const [salesTrendData, setSalesTrendData] = useState<SalesTrendData[]>([]);
  const [revenueCategoryData, setRevenueCategoryData] = useState<RevenueCategoryData[]>([]);
  const [topProductsData, setTopProductsData] = useState<TopProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch reports data
  const fetchReportsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard stats
      const statsResponse = await fetch('/api/admin/customers/stats');

      if (!statsResponse.ok) throw new Error('Failed to fetch stats');
      const statsData = await statsResponse.json();

      // Ensure all stats have default values
      setStats({
        totalRevenue: statsData.totalRevenue || 0,
        totalOrders: statsData.totalOrders || 0,
        totalCustomers: statsData.totalCustomers || 0,
        totalProducts: statsData.totalProducts || 0,
        revenueGrowth: statsData.revenueGrowth || 0,
        ordersGrowth: statsData.ordersGrowth || 0,
      });

      // Fetch sales trend data
      const trendResponse = await fetch('/api/admin/reports/sales-trend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters),
      });

      if (!trendResponse.ok) throw new Error('Failed to fetch sales trend');
      const trendData = await trendResponse.json();
      setSalesTrendData(trendData);

      // Fetch revenue by category
      const categoryResponse = await fetch('/api/admin/reports/revenue-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters),
      });

      if (!categoryResponse.ok) throw new Error('Failed to fetch category data');
      const categoryData = await categoryResponse.json();
      setRevenueCategoryData(categoryData);

      // Fetch top products
      const productsResponse = await fetch('/api/admin/reports/top-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters),
      });

      if (!productsResponse.ok) throw new Error('Failed to fetch top products');
      const productsData = await productsResponse.json();
      setTopProductsData(productsData);
    } catch (error) {
      console.error('Error fetching reports data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch data');

      // Set default values on error
      setSalesTrendData([]);
      setRevenueCategoryData([]);
      setTopProductsData([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchReportsData();
  }, [fetchReportsData]);

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      await fetchReportsData();
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Failed to generate report');
    }
  };

  const downloadReport = async () => {
    try {
      const response = await fetch('/api/admin/reports/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters),
      });

      if (!response.ok) throw new Error('Failed to download report');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading report:', error);
      setError('Failed to download report');
    }
  };

  const resetFilters = () => {
    setFilters({
      reportType: 'Sales Report',
      timePeriod: 'This Month',
      warehouse: 'All Warehouses',
      groupBy: 'Day',
      startDate: '',
      endDate: '',
    });
  };

  if (loading && !stats.totalRevenue) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {error && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600">Generate and analyze business reports</p>
      </div>

      {/* Filters Section */}
      <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Report Type</label>
            <select
              value={filters.reportType}
              onChange={e => handleFilterChange('reportType', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="Sales Report">Sales Report</option>
              <option value="Revenue Report">Revenue Report</option>
              <option value="Customer Report">Customer Report</option>
              <option value="Product Report">Product Report</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Time Period</label>
            <select
              value={filters.timePeriod}
              onChange={e => handleFilterChange('timePeriod', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="This Month">This Month</option>
              <option value="Last Month">Last Month</option>
              <option value="Last 3 Months">Last 3 Months</option>
              <option value="Last 6 Months">Last 6 Months</option>
              <option value="This Year">This Year</option>
              <option value="Custom Range">Custom Range</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Warehouse</label>
            <select
              value={filters.warehouse}
              onChange={e => handleFilterChange('warehouse', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="All Warehouses">All Warehouses</option>
              <option value="Main Warehouse">Main Warehouse</option>
              <option value="North Branch">North Branch</option>
              <option value="South Branch">South Branch</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Group By</label>
            <select
              value={filters.groupBy}
              onChange={e => handleFilterChange('groupBy', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="Day">Day</option>
              <option value="Week">Week</option>
              <option value="Month">Month</option>
              <option value="Quarter">Quarter</option>
            </select>
          </div>
        </div>

        {filters.timePeriod === 'Custom Range' && (
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={e => handleFilterChange('startDate', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={e => handleFilterChange('endDate', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            onClick={generateReport}
            className="rounded-md bg-teal-600 px-6 py-2 text-white transition-colors hover:bg-teal-700"
          >
            Generate Report
          </button>
          <button
            onClick={resetFilters}
            className="rounded-md bg-gray-100 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-200"
          >
            Reset Filters
          </button>
          <button
            onClick={downloadReport}
            className="flex items-center gap-2 rounded-md bg-green-600 px-6 py-2 text-white transition-colors hover:bg-green-700"
          >
            <Download className="h-4 w-4" />
            Download Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{(stats.totalRevenue || 0).toLocaleString()}
              </p>
              <div className="mt-2 flex items-center">
                {(stats.revenueGrowth || 0) >= 0 ? (
                  <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
                )}
                <span
                  className={`text-sm font-medium ${(stats.revenueGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {(stats.revenueGrowth || 0) >= 0 ? '+' : ''}
                  {(stats.revenueGrowth || 0).toFixed(1)}%
                </span>
                <span className="ml-1 text-sm text-gray-500">vs last month</span>
              </div>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {(stats.totalOrders || 0).toLocaleString()}
              </p>
              <div className="mt-2 flex items-center">
                <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-600">
                  +{(stats.ordersGrowth || 0).toFixed(1)}%
                </span>
                <span className="ml-1 text-sm text-gray-500">vs last month</span>
              </div>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {(stats.totalCustomers || 0).toLocaleString()}
              </p>
              <div className="mt-2 flex items-center">
                <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-600">+5.2%</span>
                <span className="ml-1 text-sm text-gray-500">vs last month</span>
              </div>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">
                {(stats.totalProducts || 0).toLocaleString()}
              </p>
              <div className="mt-2 flex items-center">
                <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
                <span className="text-sm font-medium text-red-600">-2.1%</span>
                <span className="ml-1 text-sm text-gray-500">vs last month</span>
              </div>
            </div>
            <div className="rounded-full bg-orange-100 p-3">
              <Package className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sales Trend Chart */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Sales Trend</h3>
          {loading ? (
            <div className="flex h-80 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-t-teal-600" />
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="week"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#0891b2"
                    strokeWidth={3}
                    dot={{ fill: '#0891b2', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#0891b2' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Revenue by Category Chart */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Revenue by Category</h3>
          {loading ? (
            <div className="flex h-80 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-t-teal-600" />
            </div>
          ) : (
            <>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueCategoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {revenueCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                {revenueCategoryData.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div
                      className="mr-2 h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm text-gray-600">
                      {item.name} ({item.value}%)
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Top Selling Products</h3>
        {loading ? (
          <div className="flex h-80 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-t-teal-600" />
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  width={150}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <Tooltip />
                <Bar dataKey="sales" fill="#0891b2" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
