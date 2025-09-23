import React, { useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { Bell, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

const Notifications: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  useEffect(() => {
    // Mark all notifications as read when visiting the page
    if (notifications.some(n => !n.isRead)) {
      markAllAsRead();
    }
  }, [notifications, markAllAsRead]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment_reminder':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'appointment_request':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'appointment_confirmed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'appointment_rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationTypeText = (type: string) => {
    switch (type) {
      case 'appointment_reminder':
        return 'แจ้งเตือนนัดหมาย';
      case 'appointment_request':
        return 'คำขอการนัดหมาย';
      case 'appointment_confirmed':
        return 'ยืนยันการนัดหมาย';
      case 'appointment_rejected':
        return 'ปฏิเสธการนัดหมาย';
      default:
        return type;
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">การแจ้งเตือน</h1>
          </div>
          <div className="px-6 py-12 text-center">
            <Bell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">ไม่มีการแจ้งเตือน</h3>
            <p className="mt-1 text-sm text-gray-500">
              คุณจะเห็นการแจ้งเตือนที่นี่เมื่อมีการอัปเดตเกี่ยวกับนัดหมาย
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">การแจ้งเตือน</h1>
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              ทำเครื่องหมายว่าอ่านแล้วทั้งหมด
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {notifications.map((notification, index) => (
            <div
              key={`notification-${notification.id}-${notification.createdAt}-${index}`}
              className={`p-6 hover:bg-gray-50 transition-colors ${
                notification.isRead ? 'bg-gray-50' : 'bg-white'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${
                        notification.isRead ? 'text-gray-900' : 'text-blue-900'
                      }`}>
                        {notification.title}
                      </p>
                      <p className={`text-sm mt-1 ${
                        notification.isRead ? 'text-gray-600' : 'text-blue-700'
                      }`}>
                        {notification.message}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        notification.type === 'appointment_confirmed' ? 'bg-green-100 text-green-800' :
                        notification.type === 'appointment_rejected' ? 'bg-red-100 text-red-800' :
                        notification.type === 'appointment_request' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {getNotificationTypeText(notification.type)}
                      </span>
                      {!notification.isRead && (
                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      {format(new Date(notification.createdAt), 'd MMMM yyyy เวลา HH:mm', { locale: th })}
                    </p>
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        ทำเครื่องหมายว่าอ่านแล้ว
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
