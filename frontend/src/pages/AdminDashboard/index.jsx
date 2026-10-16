import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  GitPullRequest,
  Heart,
  Droplet,
  Users,
  UserCheck,
  Sparkles,
  History,
  Shield,
  Activity,
  LogOut
} from 'lucide-react';
import AdminOverview from './AdminOverview';
import AdminRequests from './AdminRequests';
import AdminDonations from './AdminDonations';
import AdminInventory from './AdminInventory';
import AdminDonors from './AdminDonors';
import AdminUsers from './AdminUsers';
import AdminMatching from './AdminMatching';
import AdminAuditLogs from './AdminAuditLogs';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  const [selectedMatchingRequest, setSelectedMatchingRequest] = useState(null);

  const setTab = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  const handleSelectMatchingFromRequests = (request) => {
    setSelectedMatchingRequest(request);
    setTab('matching');
  };

  const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'requests', label: 'Blood Requests', icon: GitPullRequest },
    { id: 'donations', label: 'Donation Approvals', icon: Heart },
    { id: 'inventory', label: 'Bank Inventory', icon: Droplet },
    { id: 'donors', label: 'Registered Donors', icon: Users },
    { id: 'users', label: 'User Accounts', icon: UserCheck },
    { id: 'matching', label: 'Smart Donor Matcher', icon: Sparkles },
    { id: 'audit', label: 'System Audit Logs', icon: History }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Admin Greeting Bar */}
      <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-slate-900/20">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blood-600 flex items-center justify-center text-white shadow-md shadow-blood-600/30">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black">Central Blood Bank Administration</h1>
              <span className="px-2 py-0.5 bg-blood-500/30 text-blood-300 text-[10px] font-bold uppercase rounded-md border border-blood-500/40">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Logged in as: <strong>{user?.name}</strong> ({user?.email}) • Hospital Center: Mumbai Central
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/80 border border-emerald-800 text-emerald-400 rounded-xl text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            System Live & Safe
          </span>
        </div>
      </div>

      {/* Main Admin Section: Horizontal Tabs Bar on Mobile & Top Navigation */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-1.5 overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all ${
                isActive
                  ? 'bg-blood-600 text-white shadow-md shadow-blood-600/25 scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Content Area */}
      <div className="pt-2">
        {currentTab === 'overview' && <AdminOverview setActiveTab={setTab} />}
        {currentTab === 'requests' && (
          <AdminRequests onSelectMatchingRequest={handleSelectMatchingFromRequests} />
        )}
        {currentTab === 'donations' && <AdminDonations />}
        {currentTab === 'inventory' && <AdminInventory />}
        {currentTab === 'donors' && <AdminDonors />}
        {currentTab === 'users' && <AdminUsers />}
        {currentTab === 'matching' && <AdminMatching initialRequest={selectedMatchingRequest} />}
        {currentTab === 'audit' && <AdminAuditLogs />}
      </div>
    </div>
  );
};

export default AdminDashboard;
