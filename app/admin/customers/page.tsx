'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  UserPlus,
  Users,
  TrendingUp,
  Calendar,
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  status: 'Active' | 'Inactive';
  joinDate: string;
  city: string;
  state: string;
}

interface CustomerFilters {
  status: string;
  dateRange: string;
  minOrders: string;
  location: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 25,
    total: 0,
    pages: 0,
  });

  const [filters, setFilters] = useState<CustomerFilters>({
    status: '',
    dateRange: '',
    minOrders: '',
    location: '',
  });

  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    newThisMonth: 0,
    avgOrderValue: 0,
  });

  // Debounced search to avoid too many API calls
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Cache for stats with 5-minute expiry
  const [statsCache, setStatsCache] = useState<{
    data: typeof stats;
    timestamp: number;
  } | null>(null);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters for server-side filtering
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: entriesPerPage.toString(),
      });

      if (filters.status) params.append('status', filters.status);
      if (debouncedSearchQuery) params.append('search', debouncedSearchQuery);

      const response = await fetch(`/api/admin/customers?${params}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to fetch customers');

      const data = await response.json();
      setCustomers(data.customers || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  }, [currentPage, entriesPerPage, filters.status, debouncedSearchQuery]);

  const fetchCustomerStats = useCallback(async () => {
    try {
      // Check cache first
      const now = Date.now();
      if (statsCache && now - statsCache.timestamp < 5 * 60 * 1000) {
        setStats(statsCache.data);
        return;
      }

      const response = await fetch('/api/admin/customers/stats', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to fetch customer stats');

      const data = await response.json();
      setStats(data);

      // Update cache
      setStatsCache({
        data,
        timestamp: now,
      });
    } catch (error) {
      console.error('Error fetching customer stats:', error);
    }
  }, [statsCache]);

  // Fetch data on component mount and when dependencies change
  useEffect(() => {
    fetchCustomers();
  }, [filters, searchQuery, currentPage, fetchCustomers]);

  useEffect(() => {
    fetchCustomerStats();
  }, [fetchCustomerStats]);

  // Reset to first page when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [filters, debouncedSearchQuery, currentPage]); // Added currentPage to dependencies

  // Client-side filtering for non-server-side filters
  const filteredCustomers = useMemo(() => {
    let result = [...customers];

    if (filters.minOrders) {
      const minOrders = parseInt(filters.minOrders);
      result = result.filter(customer => customer.totalOrders >= minOrders);
    }

    if (filters.location) {
      result = result.filter(
        customer =>
          customer.city.toLowerCase().includes(filters.location.toLowerCase()) ||
          customer.state.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.dateRange) {
      const now = new Date();
      let dateThreshold = new Date();

      switch (filters.dateRange) {
        case 'last7days':
          dateThreshold.setDate(now.getDate() - 7);
          break;
        case 'last30days':
          dateThreshold.setDate(now.getDate() - 30);
          break;
        case 'last90days':
          dateThreshold.setDate(now.getDate() - 90);
          break;
        default:
          dateThreshold = new Date(0);
      }

      result = result.filter(customer => new Date(customer.lastOrderDate) >= dateThreshold);
    }

    return result;
  }, [customers, filters.minOrders, filters.location, filters.dateRange]);

  const resetFilters = () => {
    setFilters({
      status: '',
      dateRange: '',
      minOrders: '',
      location: '',
    });
    setSearchQuery('');
    setCurrentPage(1);
  };

  const exportCustomers = async () => {
    try {
      const response = await fetch('/api/admin/customers/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filters,
          searchQuery: debouncedSearchQuery,
          selectedCustomers: selectedCustomers.length > 0 ? selectedCustomers : undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to export customers');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting customers:', error);
      setError('Failed to export customers');
    }
  };

  const deleteCustomer = async (customerId: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to delete customer');

      // Refresh the customers list
      fetchCustomers();
      setSelectedCustomers(prev => prev.filter(id => id !== customerId));
    } catch (error) {
      console.error('Error deleting customer:', error);
      setError('Failed to delete customer');
    }
  };

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomers(prev =>
      prev.includes(customerId) ? prev.filter(id => id !== customerId) : [...prev, customerId]
    );
  };

  const handleSelectAll = () => {
    const currentPageCustomers = filteredCustomers.map(c => c.id);
    const allSelected = currentPageCustomers.every(id => selectedCustomers.includes(id));

    if (allSelected) {
      setSelectedCustomers(prev => prev.filter(id => !currentPageCustomers.includes(id)));
    } else {
      setSelectedCustomers(prev => [...new Set([...prev, ...currentPageCustomers])]);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    return status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen p-6">
      {error && (
        <div className="mb-4 rounded border-1 border-red-400 bg-red-100 p-4 text-red-700">
          {error}
          <button onClick={() => setError(null)} className="ml-2 text-red-800 hover:text-red-900">
            ×
          </button>
        </div>
      )}

      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
            <p className="text-gray-600">Manage and analyze customer data</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportCustomers}
              className="bg-background flex items-center gap-2 rounded-md border-2 border-gray-300 px-4 py-2 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="bg-background1 flex items-center gap-2 rounded-md px-4 py-2 text-white transition-colors">
              <UserPlus className="h-4 w-4" />
              Add Customer
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="rounded-lg border-1 border-gray-300 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalCustomers.toLocaleString()}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border-1 border-gray-300 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Customers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.activeCustomers.toLocaleString()}
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border-1 border-gray-300 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.newThisMonth.toLocaleString()}
                </p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border-1 border-gray-300 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{Math.round(stats.avgOrderValue).toLocaleString()}
                </p>
              </div>
              <div className="rounded-full bg-orange-100 p-3">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 rounded-lg border-1 border-gray-300 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-gray-300 py-2 pr-4 pl-10 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-md bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
          <button
            onClick={resetFilters}
            className="rounded-md bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
          >
            Reset
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 gap-4 border-t pt-4 md:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
              <select
                value={filters.status}
                onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Minimum Orders</label>
              <input
                type="number"
                value={filters.minOrders}
                onChange={e => setFilters(prev => ({ ...prev, minOrders: e.target.value }))}
                placeholder="e.g. 5"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                value={filters.location}
                onChange={e => setFilters(prev => ({ ...prev, location: e.target.value }))}
                placeholder="City or State"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={e => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="">All Time</option>
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="last90days">Last 90 Days</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Customers Table */}
      <div className="rounded-lg border-1 border-gray-300 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <span className="text-sm text-gray-700">Show</span>
              <select
                value={entriesPerPage}
                onChange={e => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="mx-2 rounded border border-gray-300 px-2 py-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-700">entries</span>
            </div>
            {selectedCustomers.length > 0 && (
              <span className="text-sm text-gray-600">{selectedCustomers.length} selected</span>
            )}
          </div>
          <div className="text-sm text-gray-600">
            Showing {(currentPage - 1) * entriesPerPage + 1} to{' '}
            {Math.min(currentPage * entriesPerPage, pagination.total)} of {pagination.total}{' '}
            customers
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      filteredCustomers.length > 0 &&
                      filteredCustomers.every(c => selectedCustomers.includes(c.id))
                    }
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Last Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-t-teal-600" />
                      <span className="ml-2">Loading customers...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    No customers found
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(
                  customer => (
                    console.log(customer),
                    (
                      <tr key={customer.id}>
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedCustomers.includes(customer.id)}
                            onChange={() => handleSelectCustomer(customer.id)}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                            <div className="text-sm text-gray-500">
                              Joined {formatDate(customer.joinDate)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm text-gray-900">{customer.email}</div>
                            <div className="text-sm text-gray-500">{customer.phoneNumber}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {customer.city}, {customer.state}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{customer.totalOrders}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          ₹{customer.totalSpent.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(customer.lastOrderDate)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(customer.status)}`}
                          >
                            {customer.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-800">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-800">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteCustomer(customer.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )
                )
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
            <div className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.pages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="rounded border border-gray-300 px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const page = Math.max(1, currentPage - 2) + i;
                if (page > pagination.pages) return null;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`rounded border px-3 py-1 text-sm ${
                      page === currentPage
                        ? 'border-teal-600 bg-teal-600 text-white'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
                disabled={currentPage === pagination.pages}
                className="rounded border border-gray-300 px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
