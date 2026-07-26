import { X, CheckCircle, Info, AlertCircle, Clock, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useApp } from '../lib/AppContext';
import { getNotifications, markNotificationRead, clearNotifications, NotificationItem } from '../api/notificationsApi';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const { user } = useApp();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUserNotifications = async () => {
    if (!user?.email) return;
    try {
      setLoading(true);
      const data = await getNotifications(user.email);
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUserNotifications();
    }
  }, [isOpen, user?.email]);

  const handleMarkAsRead = async (id: string, currentlyRead: boolean) => {
    if (currentlyRead) return;
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    if (!user?.email) return;
    try {
      await clearNotifications(user.email);
      setNotifications([]);
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'alert': return AlertCircle;
      case 'reminder': return Clock;
      default: return Info;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-96 max-w-[90vw] bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-2xl z-50 transform transition-transform duration-300 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#DCD2FD]/50 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Notifications</h2>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button 
                onClick={handleClearAll}
                className="text-xs font-semibold text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded"
              >
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#F3E8FF]/50 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto flex-1 p-4">
          {loading && notifications.length === 0 ? (
            <div className="flex justify-center items-center h-32">
              <span className="text-sm text-gray-500 dark:text-gray-400">Loading...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => {
                const Icon = getIcon(notification.type);
                return (
                  <div
                    key={notification._id}
                    onClick={() => handleMarkAsRead(notification._id, notification.read)}
                    className={`bg-white dark:bg-gray-800 rounded-2xl p-4 border transition-all cursor-pointer ${
                      notification.read 
                        ? 'border-gray-100 dark:border-gray-800 opacity-70' 
                        : 'border-[#DCD2FD]/50 dark:border-purple-900/30 hover:shadow-md dark:shadow-none'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`flex-shrink-0 w-10 h-10 ${notification.bgColor} dark:bg-opacity-10 rounded-full flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${notification.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className={`font-semibold text-sm mb-1 ${notification.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-800 dark:text-white'}`}>
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <span className="w-2 h-2 rounded-full bg-purple-500 mt-1 flex-shrink-0"></span>
                          )}
                        </div>
                        <p className={`text-xs mb-2 line-clamp-2 ${notification.read ? 'text-gray-500 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300'}`}>
                          {notification.message}
                        </p>
                        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty state for when all read/cleared */}
          {!loading && notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-center px-4">
              <div className="w-16 h-16 bg-[#F3E8FF] dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-[#B9A9FB] dark:text-gray-500" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-300 mb-2">You're all caught up!</h3>
              <p className="text-sm text-gray-500 dark:text-gray-500">No new notifications</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
