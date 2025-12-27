'use client'

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, Legend, Area, AreaChart } from 'recharts';
import { Package, TrendingUp, AlertTriangle, Activity, Plus, RefreshCw, Edit, Trash2, Download, Search, Filter, ArrowUpRight, ArrowDownRight, Calendar, Users, Building2, ShoppingCart, DollarSign, Box, Sparkles } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
const GRADIENT_COLORS = [
  'from-blue-500 to-blue-600',
  'from-green-500 to-green-600',
  'from-orange-500 to-orange-600',
  'from-purple-500 to-purple-600',
  'from-pink-500 to-pink-600',
  'from-cyan-500 to-cyan-600'
];

const mockTrendData = [
  { month: 'Jan', value: 45000, movements: 120 },
  { month: 'Feb', value: 52000, movements: 145 },
  { month: 'Mar', value: 48000, movements: 132 },
  { month: 'Apr', value: 61000, movements: 168 },
  { month: 'May', value: 58000, movements: 155 },
  { month: 'Jun', value: 67000, movements: 189 }
];

const mockTopMovers = [
  { name: 'Premium Tiles Set', change: '+24%', trending: 'up' },
  { name: 'Cement Bags', change: '+18%', trending: 'up' },
  { name: 'Steel Rods', change: '-8%', trending: 'down' },
  { name: 'Paint Buckets', change: '+15%', trending: 'up' }
];

interface Stats {
  totalSKUs: number;
  totalValue: number;
  lowStockItems: number;
  totalMovements: number;
  categoryBreakdown: CategoryBreakdown[];
}

interface CategoryBreakdown {
  category: string;
  value: number;
  [key: string]: string | number;
}

interface InventoryItem {
  _id?: string;
  sku_id: string;
  sku_code: string;
  sku_name: string;
  location: string;
  quantity: number;
  unit: string;
  value: number;
  status: string;
}

interface SKU {
  _id?: string;
  id?: string;
  name: string;
  sku_code: string;
  category: string;
  unit: string;
  reorder_level: number;
  unit_price: number;
}

interface Movement {
  id: string;
  sku_code: string;
  type: string;
  quantity: number;
  location: string;
  reference: string;
  created_at: string;
}

interface ABCItem {
  sku_code: string;
  sku_name: string;
  quantity: number;
  value: number;
  percentValue: string;
  cumulativePercent: string;
  abcCategory: string;
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string | number;
  subtitle?: string;
  gradient: string;
  trend?: string;
  trendDirection?: 'up' | 'down';
}

export default function InventoryDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<Stats | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [skus, setSKUs] = useState<SKU[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [abcAnalysis, setABCAnalysis] = useState<ABCItem[]>([]);
  const [showAddSKU, setShowAddSKU] = useState(false);
  const [showAddMovement, setShowAddMovement] = useState(false);
  const [showEditSKU, setShowEditSKU] = useState(false);
  const [showEditInventory, setShowEditInventory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSKU, setEditingSKU] = useState<SKU | null>(null);
  const [editingInventory, setEditingInventory] = useState<InventoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [newSKU, setNewSKU] = useState({
    name: '',
    sku_code: '',
    category: '',
    unit: '',
    reorder_level: '',
    unit_price: '',
    location: 'Warehouse-A'
  });
  const [newMovement, setNewMovement] = useState({
    sku_id: '',
    type: 'inward',
    quantity: '',
    reference: '',
    notes: '',
    location: 'Warehouse-A'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchOpts = { cache: 'no-store' as RequestCache };

      const [statsRes, invRes, skusRes, movRes, abcRes] = await Promise.all([
        fetch('/api/dashboard/stats', fetchOpts),
        fetch('/api/inventory', fetchOpts),
        fetch('/api/skus', fetchOpts),
        fetch('/api/movements', fetchOpts),
        fetch('/api/analytics/abc', fetchOpts)
      ]);


      if (!statsRes.ok || !invRes.ok || !skusRes.ok || !movRes.ok || !abcRes.ok) {
        throw new Error('Failed to fetch data. Make sure API routes are set up.');
      }

      setStats(await statsRes.json());
      setInventory(await invRes.json());
      setSKUs(await skusRes.json());
      setMovements(await movRes.json());
      setABCAnalysis(await abcRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSKU = async () => {
    try {
      const response = await fetch('/api/skus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSKU)
      });

      if (!response.ok) throw new Error('Failed to add SKU');

      setShowAddSKU(false);
      setNewSKU({ name: '', sku_code: '', category: '', unit: '', reorder_level: '', unit_price: '', location: 'Warehouse-A' });
      fetchData();
    } catch (error) {
      console.error('Error adding SKU:', error);
      alert('Failed to add SKU. Please try again.');
    }
  };

  const handleAddMovement = async () => {
    try {
      const response = await fetch('/api/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMovement)
      });

      if (!response.ok) throw new Error('Failed to add movement');

      setShowAddMovement(false);
      setNewMovement({ sku_id: '', type: 'inward', quantity: '', reference: '', notes: '', location: 'Warehouse-A' });
      fetchData();
    } catch (error) {
      console.error('Error adding movement:', error);
      alert('Failed to add movement. Please try again.');
    }
  };

  const handleEditSKU = (sku: SKU) => {
    setEditingSKU({
      ...sku,
      _id: sku._id || sku.id
    });
    setShowEditSKU(true);
  };

  const handleUpdateSKU = async () => {
    if (!editingSKU) return;

    try {
      const skuId = editingSKU._id || editingSKU.id;
      const response = await fetch(`/api/skus/${skuId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSKU)
      });

      if (!response.ok) throw new Error('Failed to update SKU');

      setShowEditSKU(false);
      setEditingSKU(null);
      fetchData();
    } catch (error) {
      console.error('Error updating SKU:', error);
      alert('Failed to update SKU. Please try again.');
    }
  };

  const handleDeleteSKU = async (skuId: string) => {
    if (!confirm('Are you sure you want to delete this SKU? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/skus/${skuId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete SKU');

      fetchData();
    } catch (error) {
      console.error('Error deleting SKU:', error);
      alert('Failed to delete SKU. Please try again.');
    }
  };

  const handleEditInventory = (item: InventoryItem) => {
    setEditingInventory(item);
    setShowEditInventory(true);
  };

  const handleUpdateInventory = async () => {
    if (!editingInventory) return;

    try {
      const response = await fetch(`/api/inventory/${editingInventory.sku_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: editingInventory.location,
          quantity: editingInventory.quantity
        })
      });

      if (!response.ok) throw new Error('Failed to update inventory');

      setShowEditInventory(false);
      setEditingInventory(null);
      fetchData();
    } catch (error) {
      console.error('Error updating inventory:', error);
      alert('Failed to update inventory. Please try again.');
    }
  };

  const EnhancedStatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, subtitle, gradient, trend, trendDirection }) => (
    <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${trendDirection === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
              {trendDirection === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {trend}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm text-gray-600 font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.sku_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterCategory === 'all' || item.status === filterCategory;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <Package className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-600" />
          </div>
          <p className="mt-6 text-gray-700 font-medium text-lg">Loading inventory data...</p>
          <p className="mt-2 text-gray-500 text-sm">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-red-600 mb-4">
            <AlertTriangle className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">Connection Error</h2>
          <p className="text-gray-700 mb-4 text-center">{error}</p>
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-900 font-semibold mb-2">
              Setup Required:
            </p>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>✓ MongoDB connection configured</li>
              <li>✓ API routes properly set up</li>
              <li>✓ Database models created</li>
            </ul>
          </div>
          <button
            onClick={fetchData}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg transform hover:scale-105 transition-all"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Package className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Inventory Management</h1>
                <p className="text-blue-100 mt-1 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  AEC Business Solution
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-sm text-blue-100">Current Date</p>
                <p className="font-semibold">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
              <button className="p-3 bg-white/20 rounded-xl backdrop-blur-sm hover:bg-white/30 transition-all">
                <Users className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md sticky top-0 z-40 backdrop-blur-lg bg-white/95">
        <div className="max-w-7xl mx-auto">
          <nav className="flex space-x-1 px-6">
            {[
              { id: 'dashboard', icon: Activity, label: 'Dashboard' },
              { id: 'inventory', icon: Package, label: 'Inventory' },
              { id: 'skus', icon: Box, label: 'SKU Management' },
              { id: 'movements', icon: TrendingUp, label: 'Movements' },
              { id: 'analytics', icon: Sparkles, label: 'Analytics' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 py-4 px-4 font-medium text-sm transition-all ${activeTab === tab.id
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-full"></div>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <EnhancedStatCard
                icon={Package}
                title="Total SKUs"
                value={stats.totalSKUs}
                gradient={GRADIENT_COLORS[0]}
                trend="+12%"
                trendDirection="up"
              />
              <EnhancedStatCard
                icon={DollarSign}
                title="Total Value"
                value={`₹${(stats.totalValue / 100000).toFixed(2)}L`}
                gradient={GRADIENT_COLORS[1]}
                trend="+8%"
                trendDirection="up"
              />
              <EnhancedStatCard
                icon={AlertTriangle}
                title="Low Stock Items"
                value={stats.lowStockItems}
                subtitle="Need reorder"
                gradient={GRADIENT_COLORS[2]}
                trend="-5%"
                trendDirection="down"
              />
              <EnhancedStatCard
                icon={ShoppingCart}
                title="Movements"
                value={stats.totalMovements}
                subtitle="Last 30 days"
                gradient={GRADIENT_COLORS[3]}
                trend="+24%"
                trendDirection="up"
              />
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Inventory Value Trend</h3>
                  <p className="text-sm text-gray-500 mt-1">6-month overview of inventory value and movements</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all font-medium">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mockTrendData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Value']}
                  />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold mb-6 text-gray-900">Category Distribution</h3>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>

                    <Pie
                      data={stats.categoryBreakdown}
                      dataKey="value"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      //@ts-ignore
                      label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                      labelLine={true}
                    >
                      {stats.categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold mb-6 text-gray-900">Top Movers</h3>
                <div className="space-y-4">
                  {mockTopMovers.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${item.trending === 'up' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm font-medium text-gray-900">{item.name}</span>
                      </div>
                      <span className={`text-sm font-bold ${item.trending === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {item.change}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold mb-6 text-gray-900">Inventory Value by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.categoryBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="category" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip labelClassName='text-gray-600' wrapperClassName='text-gray-400'
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => `₹${Number(value).toLocaleString()}`}
                  />
                  <Bar dataKey="value" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-blue-50">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Current Inventory</h2>
                    <p className="text-sm text-gray-600 mt-1">Manage and track your stock levels</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search inventory..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-900"
                      />
                    </div>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-900"
                    >
                      <option value="all">All Status</option>
                      <option value="ok">In Stock</option>
                      <option value="low">Low Stock</option>
                    </select>
                    <button onClick={fetchData} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-lg transform hover:scale-105 transition-all font-medium">
                      <RefreshCw className="w-4 h-4" />
                      Refresh
                    </button>
                  </div>
                </div>
              </div>

              {showEditInventory && editingInventory && (
                <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
                  <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
                    <Edit className="w-5 h-5 text-blue-600" />
                    Edit Inventory Item
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">SKU Code</label>
                      <input type="text" value={editingInventory.sku_code} disabled className="border-2 rounded-lg px-4 py-2 w-full bg-gray-100 text-gray-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">SKU Name</label>
                      <input type="text" value={editingInventory.sku_name} disabled className="border-2 rounded-lg px-4 py-2 w-full bg-gray-100 text-gray-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">Location</label>
                      <input type="text" value={editingInventory.location} disabled className="border-2 rounded-lg px-4 py-2 w-full bg-gray-100 text-gray-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">Quantity</label>
                      <input
                        type="number"
                        value={editingInventory.quantity}
                        onChange={(e) => setEditingInventory({ ...editingInventory, quantity: Number(e.target.value) })}
                        className="border-2 border-blue-300 rounded-lg px-4 py-2 w-full text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button onClick={handleUpdateInventory} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg transform hover:scale-105 transition-all">
                      Update Inventory
                    </button>
                    <button onClick={() => { setShowEditInventory(false); setEditingInventory(null); }} className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-300 font-semibold transition-all">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">SKU Code</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Unit</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Value</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredInventory.map((item, idx) => (
                      <tr key={idx} className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{item.sku_code}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-700">{item.sku_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full">
                            <Building2 className="w-3 h-3" />
                            {item.location}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{item.quantity}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.unit}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">₹{item.value.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${item.status === 'low' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-green-100 text-green-800 border border-green-200'
                            }`}>
                            {item.status === 'low' ? '⚠️ Low Stock' : '✓ In Stock'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => handleEditInventory(item)}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold hover:bg-blue-50 px-3 py-1 rounded-lg transition-all"
                          >
                            <Edit className="w-4 h-4" /> Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'skus' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">SKU Management</h2>
                <p className="text-gray-600 mt-1">Create and manage your product catalog</p>
              </div>
              <button onClick={() => setShowAddSKU(true)} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 shadow-lg transform hover:scale-105 transition-all font-semibold">
                <Plus className="w-5 h-5" /> Add New SKU
              </button>
            </div>

            {showAddSKU && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-blue-100">
                <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                  Add New SKU
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">SKU Name *</label>
                    <input type="text" placeholder="e.g., Premium Ceramic Tiles" value={newSKU.name} onChange={(e) => setNewSKU({ ...newSKU, name: e.target.value })} className="border-2 border-gray-200 rounded-lg px-4 py-3 w-full text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">SKU Code *</label>
                    <input type="text" placeholder="e.g., SKU-001" value={newSKU.sku_code} onChange={(e) => setNewSKU({ ...newSKU, sku_code: e.target.value })} className="border-2 border-gray-200 rounded-lg px-4 py-3 w-full text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Category *</label>
                    <input type="text" placeholder="e.g., Building Materials" value={newSKU.category} onChange={(e) => setNewSKU({ ...newSKU, category: e.target.value })} className="border-2 border-gray-200 rounded-lg px-4 py-3 w-full text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Unit *</label>
                    <input type="text" placeholder="Box / Piece / SqFt / Kg" value={newSKU.unit} onChange={(e) => setNewSKU({ ...newSKU, unit: e.target.value })} className="border-2 border-gray-200 rounded-lg px-4 py-3 w-full text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Reorder Level *</label>
                    <input type="number" placeholder="50" value={newSKU.reorder_level} onChange={(e) => setNewSKU({ ...newSKU, reorder_level: e.target.value })} className="border-2 border-gray-200 rounded-lg px-4 py-3 w-full text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Unit Price (₹) *</label>
                    <input type="number" placeholder="1500" value={newSKU.unit_price} onChange={(e) => setNewSKU({ ...newSKU, unit_price: e.target.value })} className="border-2 border-gray-200 rounded-lg px-4 py-3 w-full text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Initial Location *</label>
                    <select value={newSKU.location} onChange={(e) => setNewSKU({ ...newSKU, location: e.target.value })} className="border-2 border-gray-200 rounded-lg px-4 py-3 w-full text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all">
                      <option value="Warehouse-A">Warehouse A</option>
                      <option value="Warehouse-B">Warehouse B</option>
                      <option value="Warehouse-C">Warehouse C</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-8">
                  <button onClick={handleAddSKU} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg transform hover:scale-105 transition-all">
                    Create SKU
                  </button>
                  <button onClick={() => setShowAddSKU(false)} className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-300 font-semibold transition-all">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {showEditSKU && editingSKU && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-purple-100">
                <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                  <Edit className="w-6 h-6 text-purple-600" />
                  Edit SKU
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">SKU Name</label>
                    <input type="text" value={editingSKU.name} onChange={(e) => setEditingSKU({ ...editingSKU, name: e.target.value })} className="border-2 border-gray-200 rounded-lg px-4 py-3 w-full text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">SKU Code</label>
                    <input type="text" value={editingSKU.sku_code} onChange={(e) => setEditingSKU({ ...editingSKU, sku_code: e.target.value })} className="border-2 border-gray-200 rounded-lg px-4 py-3 w-full text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Category</label>
                    <input type="text" value={editingSKU.category} onChange={(e) => setEditingSKU({ ...editingSKU, category: e.target.value })} className="border-2 border-gray-200 rounded-lg px-4 py-3 w-full text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Unit</label>
                    <input type="text" value={editingSKU.unit} onChange={(e) => setEditingSKU({ ...editingSKU, unit: e.target.value })} className="border-2 border-gray-200 rounded-lg px-4 py-3 w-full text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Reorder Level</label>
                    <input type="number" value={editingSKU.reorder_level} onChange={(e) => setEditingSKU({ ...editingSKU, reorder_level: Number(e.target.value) })} className="border-2 border-gray-200 rounded-lg px-4 py-3 w-full text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Unit Price (₹)</label>
                    <input type="number" value={editingSKU.unit_price} onChange={(e) => setEditingSKU({ ...editingSKU, unit_price: Number(e.target.value) })} className="border-2 border-gray-200 rounded-lg px-4 py-3 w-full text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all" />
                  </div>
                </div>
                <div className="flex gap-3 mt-8">
                  <button onClick={handleUpdateSKU} className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 font-semibold shadow-lg transform hover:scale-105 transition-all">
                    Update SKU
                  </button>
                  <button onClick={() => { setShowEditSKU(false); setEditingSKU(null); }} className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-300 font-semibold transition-all">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Code</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Unit</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Reorder Level</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {skus.map(sku => (
                      <tr key={sku._id || sku.id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{sku.sku_code}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-700">{sku.name}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                            {sku.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{sku.unit}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{sku.reorder_level}</td>
                        <td className="px-6 py-4 text-sm font-bold text-green-600">₹{sku.unit_price}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditSKU(sku)}
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold hover:bg-blue-50 px-3 py-1 rounded-lg transition-all"
                            >
                              <Edit className="w-4 h-4" /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteSKU(sku._id || sku.id || '')}
                              className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-semibold hover:bg-red-50 px-3 py-1 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}


        {activeTab === 'movements' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Stock Movements</h2>
                <p className="text-gray-600 mt-1">Track all inventory transactions</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white rounded-xl shadow-md px-4 py-2 border-2 border-gray-100">
                  <p className="text-xs text-gray-500 font-medium">Total Movements</p>
                  <p className="text-2xl font-bold text-gray-900">{movements.length}</p>
                </div>
                <button onClick={() => setShowAddMovement(true)} className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-green-800 shadow-lg transform hover:scale-105 transition-all font-semibold">
                  <Plus className="w-5 h-5" /> Record Movement
                </button>
              </div>
            </div>

            {showAddMovement && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-green-100">
                <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  Record Stock Movement
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Select SKU *</label>
                    <select value={newMovement.sku_id} onChange={(e) => setNewMovement({ ...newMovement, sku_id: e.target.value })} className="border-2 border-gray-200 rounded-lg px-4 py-3 w-full text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all">
                      <option value="">Choose a product...</option>
                      {skus.map(sku => (
                        <option key={sku.id} value={sku.id}>{sku.sku_code} - {sku.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Movement Type *</label>
                    <select value={newMovement.type} onChange={(e) => setNewMovement({ ...newMovement, type: e.target.value })} className="border-2 border-gray-200 rounded-lg px-4 py-3 w-full text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all">
                      <option value="inward">📥 Inward (Stock In)</option>
                      <option value="outward">📤 Outward (Stock Out)</option>
                      <option value="damage">⚠️ Damage/Loss</option>
                      <option value="transfer">🔄 Transfer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Quantity *</label>
                    <input type="number" placeholder="100" value={newMovement.quantity} onChange={(e) => setNewMovement({ ...newMovement, quantity: e.target.value })} className="border-2 border-gray-200 rounded-lg px-4 py-3 w-full text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Reference (PO/Invoice #)</label>
                    <input type="text" placeholder="PO-2025-001" value={newMovement.reference} onChange={(e) => setNewMovement({ ...newMovement, reference: e.target.value })} className="border-2 border-gray-200 rounded-lg px-4 py-3 w-full text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Location *</label>
                    <select value={newMovement.location} onChange={(e) => setNewMovement({ ...newMovement, location: e.target.value })} className="border-2 border-gray-200 rounded-lg px-4 py-3 w-full text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all">
                      <option value="Warehouse-A">Warehouse A</option>
                      <option value="Warehouse-B">Warehouse B</option>
                      <option value="Warehouse-C">Warehouse C</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Notes (Optional)</label>
                    <textarea placeholder="Add any additional notes..." value={newMovement.notes} onChange={(e) => setNewMovement({ ...newMovement, notes: e.target.value })} className="border-2 border-gray-200 rounded-lg px-4 py-3 w-full text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all" rows={3} />
                  </div>
                </div>
                <div className="flex gap-3 mt-8">
                  <button onClick={handleAddMovement} className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-lg hover:from-green-700 hover:to-green-800 font-semibold shadow-lg transform hover:scale-105 transition-all">
                    Record Movement
                  </button>
                  <button onClick={() => setShowAddMovement(false)} className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-300 font-semibold transition-all">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-green-50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">Recent Movements</h3>
                  <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">
                    Last 20 transactions
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date & Time</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">SKU</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {movements.slice(0, 20).map(mov => (
                      <tr key={mov.id} className="hover:bg-green-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {new Date(mov.created_at).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{mov.sku_code}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${mov.type === 'inward' ? 'bg-green-100 text-green-800 border-green-200' :
                              mov.type === 'outward' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                mov.type === 'transfer' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                                  'bg-red-100 text-red-800 border-red-200'
                            }`}>
                            {mov.type === 'inward' ? '📥 Inward' :
                              mov.type === 'outward' ? '📤 Outward' :
                                mov.type === 'transfer' ? '🔄 Transfer' : '⚠️ Damage'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{mov.quantity}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-xs text-black">
                            <Building2 className="w-3 h-3" />
                            {mov.location}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{mov.reference || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">ABC Analysis</h2>
              <p className="text-gray-600 mt-1">Inventory classification based on value contribution</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold">Category A</h3>
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Sparkles className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-green-100 mb-2">High Value Items</p>
                <p className="text-4xl font-bold mb-3">~80%</p>
                <p className="text-sm text-green-100 leading-relaxed">Of total inventory value. Requires tight control and accurate records.</p>
              </div>

              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold">Category B</h3>
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-orange-100 mb-2">Medium Value Items</p>
                <p className="text-4xl font-bold mb-3">~15%</p>
                <p className="text-sm text-orange-100 leading-relaxed">Of total inventory value. Moderate control with good records.</p>
              </div>

              <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold">Category C</h3>
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Package className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-gray-100 mb-2">Low Value Items</p>
                <p className="text-4xl font-bold mb-3">~5%</p>
                <p className="text-sm text-gray-100 leading-relaxed">Of total inventory value. Simple controls and periodic reviews.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-purple-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Detailed ABC Classification</h3>
                    <p className="text-sm text-gray-600 mt-1">Pareto analysis of inventory value distribution</p>
                  </div>
                  <button className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold shadow-lg transform hover:scale-105 transition-all">
                    <Download className="w-4 h-4" />
                    Export Report
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">SKU Code</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Value</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">% of Total</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Cumulative %</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {abcAnalysis.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all">
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{item.sku_code}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-700">{item.sku_name}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{item.quantity}</td>
                        <td className="px-6 py-4 text-sm font-bold text-green-600">₹{item.value.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(parseFloat(item.percentValue), 100)}%` }}
                              ></div>
                            </div>
                            <span className="font-bold text-gray-900">{item.percentValue}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-700">{item.cumulativePercent}%</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-bold border-2 shadow-sm ${item.abcCategory === 'A' ? 'bg-green-100 text-green-800 border-green-300' :
                              item.abcCategory === 'B' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                                'bg-gray-100 text-gray-800 border-gray-300'
                            }`}>
                            {item.abcCategory === 'A' ? '⭐ Category A' :
                              item.abcCategory === 'B' ? '📊 Category B' :
                                '📦 Category C'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Management Guidelines
                </h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-green-500 pl-4 py-2">
                    <h4 className="font-bold text-green-800 mb-1">Category A Items</h4>
                    <p className="text-sm text-gray-600">Daily cycle counts, EOQ model, tight supplier relationships</p>
                  </div>
                  <div className="border-l-4 border-yellow-500 pl-4 py-2">
                    <h4 className="font-bold text-yellow-800 mb-1">Category B Items</h4>
                    <p className="text-sm text-gray-600">Weekly reviews, standard ordering procedures</p>
                  </div>
                  <div className="border-l-4 border-gray-500 pl-4 py-2">
                    <h4 className="font-bold text-gray-800 mb-1">Category C Items</h4>
                    <p className="text-sm text-gray-600">Monthly reviews, bulk ordering to reduce admin costs</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Key Insights
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <p className="text-sm text-gray-700"><span className="font-bold">Focus:</span> Category A items require most attention despite being fewer in number</p>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-xl">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <p className="text-sm text-gray-700"><span className="font-bold">Efficiency:</span> Optimize resources by applying tighter controls to high-value items</p>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <p className="text-sm text-gray-700"><span className="font-bold">Strategy:</span> Use ABC analysis to reduce carrying costs and improve cash flow</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}