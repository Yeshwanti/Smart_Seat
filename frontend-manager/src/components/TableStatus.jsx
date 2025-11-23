import React, { useState, useEffect } from 'react';
import tablesData from '../data/tables.json';

const TableStatus = () => {
  const [tables, setTables] = useState([]);

  useEffect(() => {
    setTables(tablesData);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'free': return 'bg-green-500 border-green-600 text-white';
      case 'occupied': return 'bg-red-500 border-red-600 text-white';
      case 'reserved': return 'bg-yellow-500 border-yellow-600 text-white';
      default: return 'bg-gray-300 border-gray-400 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'free': return '✓';
      case 'occupied': return '●';
      case 'reserved': return '⏰';
      default: return '?';
    }
  };

  const statusCounts = {
    free: tables.filter(t => t.status === 'free').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Table Status</h2>
        
        {/* Legend */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-green-500 rounded"></span>
            <span className="text-gray-700">Free ({statusCounts.free})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-red-500 rounded"></span>
            <span className="text-gray-700">Occupied ({statusCounts.occupied})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-yellow-500 rounded"></span>
            <span className="text-gray-700">Reserved ({statusCounts.reserved})</span>
          </div>
        </div>
      </div>

      {/* Table Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {tables.map(table => (
          <div
            key={table.id}
            className={`${getStatusColor(table.status)} rounded-lg border-2 p-4 transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer`}
          >
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-3xl mb-2">{getStatusIcon(table.status)}</div>
              <div className="text-xl font-bold mb-1">Table {table.id}</div>
              <div className="text-sm opacity-90">
                Capacity: {table.capacity}
              </div>
              {table.status === 'occupied' && table.current_customer && (
                <div className="text-xs mt-2 bg-white bg-opacity-20 px-2 py-1 rounded">
                  {table.current_customer}
                </div>
              )}
              {table.status === 'reserved' && table.reserved_by && (
                <div className="text-xs mt-2 bg-white bg-opacity-20 px-2 py-1 rounded">
                  {table.reserved_by}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Tables</p>
          <p className="text-2xl font-bold text-gray-900">{tables.length}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Occupancy Rate</p>
          <p className="text-2xl font-bold text-gray-900">
            {tables.length > 0 ? Math.round((statusCounts.occupied / tables.length) * 100) : 0}%
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Capacity</p>
          <p className="text-2xl font-bold text-gray-900">
            {tables.reduce((sum, t) => sum + t.capacity, 0)} seats
          </p>
        </div>
      </div>
    </div>
  );
};

export default TableStatus;
