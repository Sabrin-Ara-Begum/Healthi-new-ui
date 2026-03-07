import { X, CheckCircle, Info, AlertCircle, Clock } from 'lucide-react';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const notifications = [
  {
    id: 1,
    type: 'success',
    icon: CheckCircle,
    title: 'Mood Entry Saved',
    message: 'Your daily mood has been logged successfully',
    time: '2 hours ago',
    color: 'text-green-500',
    bgColor: 'bg-green-50'
  },
  {
    id: 2,
    type: 'info',
    icon: Info,
    title: 'New Wellness Tip',
    message: 'Check out today\'s breathing exercise for better relaxation',
    time: '5 hours ago',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50'
  },
  {
    id: 3,
    type: 'reminder',
    icon: Clock,
    title: 'Daily Check-in Reminder',
    message: 'Don\'t forget to log your mood today!',
    time: '1 day ago',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50'
  },
  {
    id: 4,
    type: 'alert',
    icon: AlertCircle,
    title: 'Appointment Reminder',
    message: 'You have a scheduled appointment tomorrow at 2 PM',
    time: '2 days ago',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50'
  }
];

export default function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-96 bg-white/95 backdrop-blur-md shadow-2xl z-50 transform transition-transform duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#DCD2FD]/50">
          <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F3E8FF]/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto h-[calc(100%-80px)] p-4">
          <div className="space-y-3">
            {notifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <div
                  key={notification.id}
                  className="bg-white rounded-2xl p-4 border border-[#DCD2FD]/30 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex gap-3">
                    <div className={`flex-shrink-0 w-10 h-10 ${notification.bgColor} rounded-full flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${notification.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 text-sm mb-1">
                        {notification.title}
                      </h3>
                      <p className="text-gray-600 text-xs mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      <span className="text-xs text-gray-400">
                        {notification.time}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty state for when all read */}
          {notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-center px-4">
              <div className="w-16 h-16 bg-[#F3E8FF] rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-[#B9A9FB]" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">You're all caught up!</h3>
              <p className="text-sm text-gray-500">No new notifications</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
