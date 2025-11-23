import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import tablesData from '../data/tables.json';
import queueData from '../data/queue.json';
import reservationsData from '../data/reservations.json';

const Analytics = () => {
  const [tables] = useState(tablesData);
  const [queue] = useState(queueData);
  const [reservations] = useState(reservationsData);

  // 1. Table Status Distribution
  const tableStatusData = [
    { status: 'Free', count: tables.filter(t => t.status === 'free').length, color: '#10b981' },
    { status: 'Occupied', count: tables.filter(t => t.status === 'occupied').length, color: '#ef4444' },
    { status: 'Reserved', count: tables.filter(t => t.status === 'reserved').length, color: '#f59e0b' }
  ];

  // 2. Average Wait Time by Group Size
  const waitTimeByGroup = [];
  const groupedQueue = queue.reduce((acc, customer) => {
    if (!acc[customer.group_size]) {
      acc[customer.group_size] = [];
    }
    acc[customer.group_size].push(customer.waiting_time);
    return acc;
  }, {});

  Object.keys(groupedQueue).forEach(size => {
    const times = groupedQueue[size];
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    waitTimeByGroup.push({
      groupSize: `${size} people`,
      avgWaitTime: Math.round(avg)
    });
  });

  // 3. Peak Hours (from reservations) - FIXED
  const peakHoursData = [];
  const hourCounts = {};
  
  reservations.forEach(res => {
    // Safety check: only process if time exists and is a string
    if (res.time && typeof res.time === 'string') {
      const hour = parseInt(res.time.split(':')[0]);
      if (!isNaN(hour)) {
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    }
  });

  Object.keys(hourCounts).forEach(hour => {
    peakHoursData.push({
      hour: `${hour}:00`,
      reservations: hourCounts[hour]
    });
  });

  // Sort by hour
  peakHoursData.sort((a, b) => {
    const hourA = parseInt(a.hour.split(':')[0]);
    const hourB = parseInt(b.hour.split(':')[0]);
    return hourA - hourB;
  });

  // 4. Capacity Utilization
  const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0);
  const occupiedTables = tables.filter(t => t.status === 'occupied');
  const occupiedCapacity = occupiedTables.reduce((sum, t) => sum + t.capacity, 0);
  const utilizationRate = Math.round((occupiedCapacity / totalCapacity) * 100);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Analytics Dashboard</h2>

      {/* Key Metrics Cards - FIXED gradient classes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-linear-to-br from-blue-500 to-blue-600 text-white p-5 rounded-lg shadow">
          <p className="text-sm opacity-90 mb-1">Total Tables</p>
          <p className="text-3xl font-bold">{tables.length}</p>
        </div>
        <div className="bg-linear-to-br from-green-500 to-green-600 text-white p-5 rounded-lg shadow">
          <p className="text-sm opacity-90 mb-1">Tables Available</p>
          <p className="text-3xl font-bold">{tableStatusData[0].count}</p>
        </div>
        <div className="bg-linear-to-br from-yellow-500 to-yellow-600 text-white p-5 rounded-lg shadow">
          <p className="text-sm opacity-90 mb-1">Customers Waiting</p>
          <p className="text-3xl font-bold">{queue.length}</p>
        </div>
        <div className="bg-linear-to-br from-purple-500 to-purple-600 text-white p-5 rounded-lg shadow">
          <p className="text-sm opacity-90 mb-1">Capacity Used</p>
          <p className="text-3xl font-bold">{utilizationRate}%</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Table Status Distribution */}
        <div className="bg-gray-50 p-5 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Table Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={tableStatusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2: Pie Chart for Status */}
        <div className="bg-gray-50 p-5 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Table Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={tableStatusData}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {tableStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 3: Average Wait Time by Group Size */}
        {waitTimeByGroup.length > 0 && (
          <div className="bg-gray-50 p-5 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Avg Wait Time by Group Size</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={waitTimeByGroup}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="groupSize" />
                <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="avgWaitTime" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Chart 4: Peak Hours */}
        {peakHoursData.length > 0 && (
          <div className="bg-gray-50 p-5 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Peak Reservation Hours</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={peakHoursData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="reservations" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Additional Insights */}
      <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <h4 className="font-semibold text-blue-900 mb-2">📊 Key Insights</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• {utilizationRate > 70 ? 'High capacity utilization - consider expanding' : 'Good capacity management'}</li>
          <li>• Average wait time: {queue.length > 0 ? Math.round(queue.reduce((sum, c) => sum + c.waiting_time, 0) / queue.length) : 0} minutes</li>
          <li>• Peak hour: {peakHoursData.length > 0 ? peakHoursData.reduce((max, h) => h.reservations > max.reservations ? h : max, peakHoursData[0]).hour : 'N/A'}</li>
        </ul>
      </div>
    </div>
  );
};

export default Analytics;