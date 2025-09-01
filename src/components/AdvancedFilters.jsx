import { useState } from 'react';
import { FilterIcon, XIcon, CalendarIcon, DownloadIcon } from './Icons';

export default function AdvancedFilters({ 
  filters, 
  onFiltersChange, 
  onExport, 
  onSaveView, 
  onLoadView,
  savedViews = [],
  exportFormats = ['CSV', 'PDF', 'Excel']
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [saveViewName, setSaveViewName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      dateRange: { start: '', end: '' },
      status: 'all',
      type: 'all',
      customer: '',
      driver: '',
      minAmount: '',
      maxAmount: '',
      sortBy: 'date',
      sortOrder: 'desc'
    });
  };

  const handleSaveView = () => {
    if (saveViewName.trim()) {
      onSaveView({
        name: saveViewName,
        filters: filters,
        createdAt: new Date().toISOString()
      });
      setSaveViewName('');
      setShowSaveDialog(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
      {/* Filter Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <FilterIcon className="w-5 h-5 text-slate-600" />
          <h3 className="font-medium text-slate-900">Advanced Filters</h3>
          <span className="text-xs text-slate-500">
            {Object.values(filters).filter(v => v && v !== 'all' && v !== '').length} active
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn btn-outline text-sm px-3 py-1"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
          {Object.values(filters).some(v => v && v !== 'all' && v !== '') && (
            <button
              onClick={clearFilters}
              className="btn btn-outline text-sm px-3 py-1 text-red-600 border-red-300 hover:bg-red-50"
            >
              <XIcon className="w-3 h-3 mr-1" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.dateRange?.start || ''}
                onChange={(e) => handleFilterChange('dateRange', {
                  ...filters.dateRange,
                  start: e.target.value
                })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.dateRange?.end || ''}
                onChange={(e) => handleFilterChange('dateRange', {
                  ...filters.dateRange,
                  end: e.target.value
                })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Status and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={filters.status || 'all'}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select
                value={filters.type || 'all'}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All Types</option>
                <option value="priority">Priority</option>
                <option value="outsourced">Outsourced</option>
              </select>
            </div>
          </div>

          {/* Customer and Driver */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Customer</label>
              <input
                type="text"
                placeholder="Search customer..."
                value={filters.customer || ''}
                onChange={(e) => handleFilterChange('customer', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Driver</label>
              <input
                type="text"
                placeholder="Search driver..."
                value={filters.driver || ''}
                onChange={(e) => handleFilterChange('driver', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Amount Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Min Amount (€)</label>
              <input
                type="number"
                placeholder="0"
                value={filters.minAmount || ''}
                onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Max Amount (€)</label>
              <input
                type="number"
                placeholder="1000"
                value={filters.maxAmount || ''}
                onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Sorting */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sort By</label>
              <select
                value={filters.sortBy || 'date'}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="date">Date</option>
                <option value="customer">Customer</option>
                <option value="amount">Amount</option>
                <option value="status">Status</option>
                <option value="driver">Driver</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sort Order</label>
              <select
                value={filters.sortOrder || 'desc'}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 mb-2 md:mb-0">
              {/* Export Buttons */}
              {exportFormats.map(format => (
                <button
                  key={format}
                  onClick={() => onExport(format)}
                  className="btn btn-outline text-sm px-3 py-1"
                >
                  <DownloadIcon className="w-3 h-3 mr-1" />
                  {format}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {/* Saved Views */}
              {savedViews.length > 0 && (
                <select
                  onChange={(e) => e.target.value && onLoadView(e.target.value)}
                  className="px-3 py-1 border border-slate-300 rounded text-sm"
                  value=""
                >
                  <option value="">Load Saved View...</option>
                  {savedViews.map(view => (
                    <option key={view.name} value={view.name}>
                      {view.name}
                    </option>
                  ))}
                </select>
              )}

              {/* Save View */}
              {showSaveDialog ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="View name..."
                    value={saveViewName}
                    onChange={(e) => setSaveViewName(e.target.value)}
                    className="px-3 py-1 border border-slate-300 rounded text-sm w-32"
                    onKeyPress={(e) => e.key === 'Enter' && handleSaveView()}
                  />
                  <button
                    onClick={handleSaveView}
                    className="btn btn-primary text-sm px-3 py-1"
                    disabled={!saveViewName.trim()}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setShowSaveDialog(false)}
                    className="btn btn-outline text-sm px-2 py-1"
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSaveDialog(true)}
                  className="btn btn-outline text-sm px-3 py-1"
                >
                  Save View
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}