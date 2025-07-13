import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, User, Store, MapPin, Tag, Clock, AlertCircle, Shield, LogOut, Users, Package } from 'lucide-react';
const back = "http://localhost:3000"
const AdminPanel = () => {
  const [shopkeepers, setShopkeepers] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [token, setToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');

  // Authentication
  const handleLogin = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    
    try {
      const response = await fetch(`${back}/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setToken(data.token);
        setIsAuthenticated(true);
        setMessage('Successfully logged in!');
        localStorage.setItem('adminToken', data.token);
      } else {
        setMessage(data.message || 'Login failed');
      }
    } catch (error) {
      setMessage('Login failed. Please check your connection.');
    } finally {
      setActionLoading(false);
    }
  };

  // Fetch unverified shopkeepers
  const fetchUnverifiedShopkeepers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${back}/unverified`);
      const data = await response.json();
      
      if (response.ok) {
        setShopkeepers(data.data || []);
      } else {
        setMessage(data.message || 'Failed to fetch data');
      }
    } catch (error) {
      setMessage('Failed to fetch shopkeepers. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Accept selected shopkeepers
  const handleAccept = async () => {
    if (selectedIds.size === 0) {
      setMessage('Please select at least one shopkeeper to accept.');
      return;
    }

    setActionLoading(true);
    try {
      console.log('Accepting shopkeepers:', Array.from(selectedIds));
      
      const response = await fetch(`${back}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ usernames: Array.from(selectedIds) })
      });
      
      const data = await response.json();
      console.log('Accept response:', data);
      
      if (response.ok) {
        const count = data.verifiedCount !== undefined ? data.verifiedCount : selectedIds.size;
        setMessage(`Successfully verified ${count} shopkeepers!`);
        setSelectedIds(new Set());
        fetchUnverifiedShopkeepers(); // Refresh the list
      } else {
        setMessage(data.message || 'Failed to accept shopkeepers');
      }
    } catch (error) {
      console.error('Accept error:', error);
      setMessage('Failed to accept shopkeepers. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete selected shopkeepers
  const handleDelete = async () => {
    if (selectedIds.size === 0) {
      setMessage('Please select at least one shopkeeper to delete.');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedIds.size} shopkeeper(s)? This action cannot be undone.`)) {
      return;
    }

    setActionLoading(true);
    try {
      console.log('Deleting shopkeepers:', Array.from(selectedIds));
      
      const response = await fetch(`${back}/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ usernames: Array.from(selectedIds) })
      });
      
      const data = await response.json();
      console.log('Delete response:', data);
      
      if (response.ok) {
        const count = data.deletedCount !== undefined ? data.deletedCount : selectedIds.size;
        setMessage(`Successfully deleted ${count} shopkeepers!`);
        setSelectedIds(new Set());
        fetchUnverifiedShopkeepers(); // Refresh the list
      } else {
        setMessage(data.message || 'Failed to delete shopkeepers');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setMessage('Failed to delete shopkeepers. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle individual selection
  const toggleSelection = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedIds.size === shopkeepers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(shopkeepers.map(sk => sk.id)));
    }
  };

  // Check token on load
  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken');
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnverifiedShopkeepers();
    }
  }, [isAuthenticated]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-red-600/20 backdrop-blur-sm"></div>
        <div className="relative bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Shield className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Admin Portal
            </h1>
            <p className="text-gray-600 mt-2">Secure access to shopkeeper management</p>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200"
                placeholder="Enter your username"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin(e)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200"
                placeholder="Enter your password"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin(e)}
              />
            </div>
            
            <button
              onClick={handleLogin}
              disabled={actionLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg transform hover:scale-105 active:scale-95"
            >
              {actionLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
          
          {message && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center">
                <AlertCircle className="text-red-500 mr-2" size={18} />
                <span className="text-red-700 text-sm font-medium">{message}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 text-sm">Shopkeeper Management System</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsAuthenticated(false);
                setToken('');
                localStorage.removeItem('adminToken');
              }}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <LogOut size={18} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Pending</p>
                <p className="text-3xl font-bold">{shopkeepers.length}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Clock className="text-white" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Selected</p>
                <p className="text-3xl font-bold">{selectedIds.size}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="text-white" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Shops</p>
                <p className="text-3xl font-bold">{shopkeepers.reduce((acc, sk) => acc + sk.shops.length, 0)}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Store className="text-white" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl shadow-sm">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                <AlertCircle className="text-white" size={16} />
              </div>
              <span className="text-blue-800 font-medium">{message}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSelectAll}
                className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 font-medium shadow-sm"
              >
                {selectedIds.size === shopkeepers.length ? 'Deselect All' : 'Select All'}
              </button>
              <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-medium">
                {selectedIds.size} of {shopkeepers.length} selected
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleAccept}
                disabled={actionLoading || selectedIds.size === 0}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg transform hover:scale-105 active:scale-95"
              >
                <CheckCircle size={18} />
                Accept ({selectedIds.size})
              </button>
              
              <button
                onClick={handleDelete}
                disabled={actionLoading || selectedIds.size === 0}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg transform hover:scale-105 active:scale-95"
              >
                <XCircle size={18} />
                Delete ({selectedIds.size})
              </button>
            </div>
          </div>
        </div>

        {/* Shopkeepers List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-pulse w-6 h-6 bg-blue-600 rounded-full"></div>
              </div>
            </div>
          </div>
        ) : shopkeepers.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-16 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Store className="text-white" size={40} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">All Caught Up!</h3>
            <p className="text-gray-600 text-lg">No unverified shopkeepers at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {shopkeepers.map((shopkeeper) => (
              <div
                key={shopkeeper.id}
                className={`bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl ${
                  selectedIds.has(shopkeeper.id) 
                    ? 'border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 transform scale-[1.02]' 
                    : 'border-white/20 hover:border-blue-200'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(shopkeeper.id)}
                      onChange={() => toggleSelection(shopkeeper.id)}
                      className="mt-2 h-5 w-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center">
                          <User className="text-white" size={20} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{shopkeeper.name}</h3>
                          <p className="text-gray-600 font-medium">@{shopkeeper.username}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-gray-600">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <User size={16} className="text-green-600" />
                            </div>
                            <span className="font-medium">Phone:</span>
                            <span className="text-gray-800">{shopkeeper.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Clock size={16} className="text-purple-600" />
                            </div>
                            <span className="font-medium">Joined:</span>
                            <span className="text-gray-800">{new Date(shopkeeper.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Package size={16} className="text-blue-600" />
                            </div>
                            <span className="font-medium">Shops:</span>
                            <span className="text-gray-800 font-semibold">{shopkeeper.shops.length}</span>
                          </div>
                        </div>
                        
                        <div>
                          {shopkeeper.shops.length > 0 && (
                            <div className="space-y-3">
                              <h4 className="font-semibold text-gray-700 mb-3">Shop Details:</h4>
                              {shopkeeper.shops.map((shop) => (
                                <div key={shop.id} className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center">
                                      <Store size={12} className="text-orange-600" />
                                    </div>
                                    <span className="font-semibold text-gray-800">{shop.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2 mb-1 text-sm text-gray-600">
                                    <Tag size={12} className="text-gray-400" />
                                    <span>{shop.tagline}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <MapPin size={12} className="text-gray-400" />
                                    <span>{shop.localArea}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;