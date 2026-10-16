import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Bell,
  CheckCheck,
  Check,
  Clock,
  AlertTriangle,
  Info,
  Droplet,
  Heart,
  RefreshCw,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const url = filter === 'unread' ? '/notifications?unreadOnly=true' : '/notifications';
      const res = await api.get(url);
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'urgent':
      case 'emergency':
        return <AlertTriangle className="w-5 h-5 text-rose-600" />;
      case 'match':
        return <Heart className="w-5 h-5 text-blood-600 fill-current" />;
      case 'inventory':
        return <Droplet className="w-5 h-5 text-amber-600" />;
      case 'approval':
      case 'verified':
        return <Check className="w-5 h-5 text-emerald-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-blood-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Bell className="w-4 h-4" />
            <span>Activity & Emergency Dispatch</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              System Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-blood-100 text-blood-700 text-xs font-black">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time updates regarding your blood requests, compatibility matches, and donation status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchNotifications}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            title="Refresh Notifications"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all shadow-sm inline-flex items-center gap-1.5"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All as Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Notifications
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            filter === 'unread'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Unread Only</span>
          {unreadCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-blood-500"></span>
          )}
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm animate-pulse flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-3 bg-slate-100 rounded w-4/5"></div>
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200/90 shadow-sm space-y-3 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">No Notifications</h3>
          <p className="text-xs text-slate-500">
            {filter === 'unread'
              ? 'You have caught up with all your notifications!'
              : 'You have no system notifications yet. Important updates and alerts will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              className={`p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                notif.isRead
                  ? 'bg-white border-slate-200/80 shadow-sm'
                  : 'bg-blood-50/40 border-blood-200 shadow-md shadow-blood-500/5'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  notif.isRead ? 'bg-slate-100' : 'bg-white shadow-sm'
                }`}
              >
                {getNotificationIcon(notif.type)}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h3
                    className={`text-sm ${
                      notif.isRead ? 'font-semibold text-slate-800' : 'font-black text-slate-900'
                    }`}
                  >
                    {notif.title}
                  </h3>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" />
                    {new Date(notif.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {notif.message}
                </p>

                {/* Optional action link */}
                {notif.link && (
                  <div className="pt-1.5">
                    <Link
                      to={notif.link}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blood-600 hover:text-blood-800"
                    >
                      <span>View Details</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>

              {!notif.isRead && (
                <button
                  onClick={() => handleMarkAsRead(notif._id)}
                  className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors shrink-0"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
