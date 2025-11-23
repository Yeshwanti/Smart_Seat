import React, { useState, useEffect } from 'react';
import tablesData from '../data/tables.json';
import queueData from '../data/queue.json';

const ManualAssignment = ({ onAssignmentComplete }) => {
  const [tables, setTables] = useState([]);
  const [queue, setQueue] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedTable, setSelectedTable] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setTables(tablesData);
    setQueue(queueData);
  }, []);

  // Filter only free tables
  const availableTables = tables.filter(t => t.status === 'free');

  const handleAssign = () => {
    if (!selectedCustomer || !selectedTable) {
      setMessage('⚠️ Please select both customer and table');
      return;
    }

    const customer = queue.find(c => c.id === parseInt(selectedCustomer));
    const table = tables.find(t => t.id === parseInt(selectedTable));

    if (!customer || !table) {
      setMessage('❌ Invalid selection');
      return;
    }

    // Check if table can accommodate group
    if (customer.group_size > table.capacity) {
      setMessage(`❌ Table ${table.id} (capacity ${table.capacity}) cannot accommodate ${customer.group_size} people`);
      return;
    }

    // Update local state
    const updatedTables = tables.map(t => 
      t.id === table.id 
        ? { ...t, status: 'occupied', current_customer: customer.name }
        : t
    );
    
    const updatedQueue = queue.filter(c => c.id !== customer.id);

    setTables(updatedTables);
    setQueue(updatedQueue);
    setSelectedCustomer('');
    setSelectedTable('');
    setMessage(`✅ Assigned ${customer.name} (${customer.group_size} people) to Table ${table.id}`);

    // Notify parent component to refresh Table Status
    if (onAssignmentComplete) {
      onAssignmentComplete(updatedTables, updatedQueue);
    }

    // Clear message after 3 seconds
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Manual Table Assignment</h2>
      
      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Customer Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Customer from Queue
          </label>
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Choose Customer --</option>
            {queue.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.name} - {customer.group_size} people ({customer.waiting_time} mins)
              </option>
            ))}
          </select>
          {queue.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">No customers in queue</p>
          )}
        </div>

        {/* Table Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Available Table
          </label>
          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Choose Table --</option>
            {availableTables.map(table => (
              <option key={table.id} value={table.id}>
                Table {table.id} - Capacity: {table.capacity}
              </option>
            ))}
          </select>
          {availableTables.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">No tables available</p>
          )}
        </div>
      </div>

      <button
        onClick={handleAssign}
        disabled={!selectedCustomer || !selectedTable}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        Assign Table
      </button>

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Customers Waiting</p>
          <p className="text-2xl font-bold text-blue-600">{queue.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Tables Available</p>
          <p className="text-2xl font-bold text-green-600">{availableTables.length}</p>
        </div>
      </div>
    </div>
  );
};

export default ManualAssignment;
