import React, { useState } from 'react';
import TableStatus from './components/TableStatus';
import WaitingList from './components/WaitingList';
import ManualAssignment from './components/ManualAssignment';
import Analytics from './components/Analytics';

function App() {
  const [activeTab, setActiveTab] = useState('tables');
  const [refreshKey, setRefreshKey] = useState(0);

  const tabs = [
    { id: 'tables', name: 'Table Status', icon: '🍽️' },
    { id: 'waiting', name: 'Waiting List', icon: '⏳' },
    { id: 'assign', name: 'Manual Assignment', icon: '✏️' },
    { id: 'analytics', name: 'Analytics', icon: '📊' }
  ];

  const handleAssignmentComplete = () => {
    // Trigger refresh of components
    setRefreshKey(prev => prev + 1);
    // Switch to table status to see the update
    setActiveTab('tables');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">SmartTable Manager</h1>
              <p className="text-sm text-gray-600 mt-1">Restaurant Table Management Dashboard</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-semibold">Status:</span>
                <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ● Live
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="transition-all duration-300">
          {activeTab === 'tables' && <TableStatus key={refreshKey} />}
          {activeTab === 'waiting' && <WaitingList key={refreshKey} />}
          {activeTab === 'assign' && <ManualAssignment onAssignmentComplete={handleAssignmentComplete} />}
          {activeTab === 'analytics' && <Analytics />}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white shadow-inner mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600">
            SmartTable Manager Dashboard 
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;