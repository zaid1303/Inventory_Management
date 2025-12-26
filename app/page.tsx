'use client'

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Package, TrendingUp, AlertTriangle, Activity, Plus, RefreshCw } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

// Type definitions
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
  sku_code: string;
  sku_name: string;
  location: string;
  quantity: number;
  unit: string;
  value: number;
  status: string;
}

interface SKU {
  id: string;
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
  color: string;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      const [statsRes, invRes, skusRes, movRes, abcRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/inventory'),
        fetch('/api/skus'),
        fetch('api/movements'),
        fetch('/api/analytics/abc')
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

  const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, subtitle, color }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-black">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {subtitle && <p className="text-sm text-black mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-black">Loading inventory data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-8 max-w-md">
          <div className="text-red-600 mb-4">
            <AlertTriangle className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-xl font-bold text-black mb-2">Error Loading Data</h2>
          <p className="text-black mb-4">{error}</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Make sure you have created:</strong>
            </p>
            <ul className="text-sm text-yellow-800 list-disc list-inside mt-2">
              <li>app/api/db.ts</li>
              <li>app/api/skus/route.ts</li>
              <li>app/api/inventory/route.ts</li>
              <li>app/api/movements/route.ts</li>
              <li>app/api/dashboard/stats/route.ts</li>
              <li>app/api/analytics/abc/route.ts</li>
            </ul>
          </div>
          <button 
            onClick={fetchData}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">Inventory Management System</h1>
          <p className="text-blue-100 mt-1">AEC Material Business Solution</p>
        </div>
      </div>

      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto">
          <nav className="flex space-x-8 px-6">
            {['dashboard', 'inventory', 'skus', 'movements', 'analytics'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-black hover:text-black hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>
      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-gray-500">
              <StatCard icon={Package} title="Total SKUs" value={stats.totalSKUs} color="bg-blue-500"/>
              <StatCard icon={TrendingUp} title="Total Value" value={`₹${(stats.totalValue / 100000).toFixed(2)}L`} color="bg-green-500" />
              <StatCard icon={AlertTriangle} title="Low Stock Items" value={stats.lowStockItems} subtitle="Need reorder" color="bg-orange-500" />
              <StatCard icon={Activity} title="Movements" value={stats.totalMovements} subtitle="Last 30 days" color="bg-purple-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6  text-gray-500">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={stats.categoryBreakdown} dataKey="value" nameKey="category" cx="50%" cy="50%" outerRadius={80} label>
                      {stats.categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Inventory by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.categoryBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="bg-white rounded-lg shadow  text-gray-500">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Current Inventory</h2>
              <button onClick={fetchData} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">SKU Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Unit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {inventory.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium">{item.sku_code}</td>
                      <td className="px-6 py-4 text-sm">{item.sku_name}</td>
                      <td className="px-6 py-4 text-sm">{item.location}</td>
                      <td className="px-6 py-4 text-sm font-semibold">{item.quantity}</td>
                      <td className="px-6 py-4 text-sm">{item.unit}</td>
                      <td className="px-6 py-4 text-sm">₹{item.value.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'low' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {item.status === 'low' ? 'Low Stock' : 'OK'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'skus' && (
          <div className="space-y-6 text-gray-500">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">SKU Management</h2>
              <button onClick={() => setShowAddSKU(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                <Plus className="w-4 h-4" /> Add SKU
              </button>
            </div>

            {showAddSKU && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Add New SKU</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="SKU Name" value={newSKU.name} onChange={(e) => setNewSKU({...newSKU, name: e.target.value})} className="border rounded px-3 py-2" />
                  <input type="text" placeholder="SKU Code" value={newSKU.sku_code} onChange={(e) => setNewSKU({...newSKU, sku_code: e.target.value})} className="border rounded px-3 py-2" />
                  <input type="text" placeholder="Category" value={newSKU.category} onChange={(e) => setNewSKU({...newSKU, category: e.target.value})} className="border rounded px-3 py-2" />
                  <input type="text" placeholder="Unit (Box/Piece/SqFt)" value={newSKU.unit} onChange={(e) => setNewSKU({...newSKU, unit: e.target.value})} className="border rounded px-3 py-2" />
                  <input type="number" placeholder="Reorder Level" value={newSKU.reorder_level} onChange={(e) => setNewSKU({...newSKU, reorder_level: e.target.value})} className="border rounded px-3 py-2" />
                  <input type="number" placeholder="Unit Price (₹)" value={newSKU.unit_price} onChange={(e) => setNewSKU({...newSKU, unit_price: e.target.value})} className="border rounded px-3 py-2" />
                  <select value={newSKU.location} onChange={(e) => setNewSKU({...newSKU, location: e.target.value})} className="border rounded px-3 py-2">
                    <option value="Warehouse-A">Warehouse-A</option>
                    <option value="Warehouse-B">Warehouse-B</option>
                    <option value="Warehouse-C">Warehouse-C</option>
                  </select>
                  <div className="flex gap-2">
                    <button onClick={handleAddSKU} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save SKU</button>
                    <button onClick={() => setShowAddSKU(false)} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Cancel</button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Unit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Reorder Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {skus.map(sku => (
                    <tr key={sku.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium">{sku.sku_code}</td>
                      <td className="px-6 py-4 text-sm">{sku.name}</td>
                      <td className="px-6 py-4 text-sm">{sku.category}</td>
                      <td className="px-6 py-4 text-sm">{sku.unit}</td>
                      <td className="px-6 py-4 text-sm">{sku.reorder_level}</td>
                      <td className="px-6 py-4 text-sm">₹{sku.unit_price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'movements' && (
          <div className="space-y-6 text-gray-500">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Stock Movements</h2>
              <button onClick={() => setShowAddMovement(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                <Plus className="w-4 h-4" /> Add Movement
              </button>
            </div>

            {showAddMovement && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Record Stock Movement</h3>
                <div className="grid grid-cols-2 gap-4">
                  <select value={newMovement.sku_id} onChange={(e) => setNewMovement({...newMovement, sku_id: e.target.value})} className="border rounded px-3 py-2 col-span-2">
                    <option value="">Select SKU</option>
                    {skus.map(sku => (
                      <option key={sku.id} value={sku.id}>{sku.sku_code} - {sku.name}</option>
                    ))}
                  </select>
                  <select value={newMovement.type} onChange={(e) => setNewMovement({...newMovement, type: e.target.value})} className="border rounded px-3 py-2">
                    <option value="inward">Inward</option>
                    <option value="outward">Outward</option>
                    <option value="damage">Damage</option>
                    <option value="transfer">Transfer</option>
                  </select>
                  <input type="number" placeholder="Quantity" value={newMovement.quantity} onChange={(e) => setNewMovement({...newMovement, quantity: e.target.value})} className="border rounded px-3 py-2" />
                  <input type="text" placeholder="Reference (PO/Invoice #)" value={newMovement.reference} onChange={(e) => setNewMovement({...newMovement, reference: e.target.value})} className="border rounded px-3 py-2" />
                  <select value={newMovement.location} onChange={(e) => setNewMovement({...newMovement, location: e.target.value})} className="border rounded px-3 py-2">
                    <option value="Warehouse-A">Warehouse-A</option>
                    <option value="Warehouse-B">Warehouse-B</option>
                    <option value="Warehouse-C">Warehouse-C</option>
                  </select>
                  <textarea placeholder="Notes" value={newMovement.notes} onChange={(e) => setNewMovement({...newMovement, notes: e.target.value})} className="border rounded px-3 py-2 col-span-2" rows={2} />
                  <div className="flex gap-2 col-span-2">
                    <button onClick={handleAddMovement} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Record Movement</button>
                    <button onClick={() => setShowAddMovement(false)} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Cancel</button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {movements.slice(0, 20).map(mov => (
                    <tr key={mov.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">{new Date(mov.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm">{mov.sku_code}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          mov.type === 'inward' ? 'bg-green-100 text-green-800' : mov.type === 'outward' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {mov.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold">{mov.quantity}</td>
                      <td className="px-6 py-4 text-sm">{mov.location}</td>
                      <td className="px-6 py-4 text-sm">{mov.reference || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6 text-gray-500">
            <h2 className="text-2xl font-bold">ABC Analysis</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-black mb-4">
                ABC Analysis categorizes inventory by value contribution. Category A (80% value) needs tight control, Category B (15% value) needs moderate control, Category C (5% value) needs minimal control.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">SKU</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">% of Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Cumulative %</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {abcAnalysis.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium">{item.sku_code}</td>
                        <td className="px-6 py-4 text-sm">{item.sku_name}</td>
                        <td className="px-6 py-4 text-sm">{item.quantity}</td>
                        <td className="px-6 py-4 text-sm font-semibold">₹{item.value.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm">{item.percentValue}%</td>
                        <td className="px-6 py-4 text-sm">{item.cumulativePercent}%</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            item.abcCategory === 'A' ? 'bg-green-100 text-green-800' : item.abcCategory === 'B' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-black'
                          }`}>
                            {item.abcCategory}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}