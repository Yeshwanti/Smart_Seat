import React, { useState, useEffect } from 'react';
import queueData from '../data/queue.json';

const WaitingList = () => {
  const [queue, setQueue] = useState([]);
  const [sortBy, setSortBy] = useState('waiting_time'); // or 'group_size'

  useEffect(() => {
    setQueue(queueData);
  }, []);

  // Sort queue based on selected criteria
  const sortedQueue = [...queue].sort((a, b) => {
    if (sortBy === 'waiting_time') {
      return b.waiting_time - a.waiting_time; // Longest wait first
    } else {
      return b.group_size - a.group_size; // Largest group first
    }
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Waiting List</h2>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="waiting_time">Waiting Time</option>
            <option value="group_size">Group Size</option>
          </select>
        </div>
      </div>

      {sortedQueue.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No customers in queue</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Customer Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Group Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Waiting Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedQueue.map((customer, index) => {
                const waitStatus = customer.waiting_time > 20 ? 'high' : 
                                   customer.waiting_time > 10 ? 'medium' : 'low';
                
                return (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-semibold">
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span className="text-sm text-gray-900">{customer.group_size} people</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                        ${waitStatus === 'high' ? 'bg-red-100 text-red-800' :
                          waitStatus === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'}`}>
                        {customer.waiting_time} mins
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {waitStatus === 'high' && (
                        <span className="text-xs text-red-600 font-medium">⚠️ Priority</span>
                      )}
                      {waitStatus === 'medium' && (
                        <span className="text-xs text-yellow-600 font-medium">⏳ Waiting</span>
                      )}
                      {waitStatus === 'low' && (
                        <span className="text-xs text-green-600 font-medium">✓ Normal</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Waiting</p>
          <p className="text-2xl font-bold text-blue-600">{sortedQueue.length}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Avg Wait Time</p>
          <p className="text-2xl font-bold text-yellow-600">
            {sortedQueue.length > 0 
              ? Math.round(sortedQueue.reduce((sum, c) => sum + c.waiting_time, 0) / sortedQueue.length)
              : 0} mins
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Priority Cases</p>
          <p className="text-2xl font-bold text-red-600">
            {sortedQueue.filter(c => c.waiting_time > 20).length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WaitingList;