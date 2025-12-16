import { useState, useEffect } from 'react';
import { notificationsAPI } from '../services/api';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationsAPI.getAll();
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Ошибка загрузки уведомлений:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Ошибка отметки уведомления:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationsAPI.delete(id);
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (error) {
      console.error('Ошибка удаления уведомления:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Ошибка отметки всех уведомлений:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'verification_approved':
        return '✅';
      case 'verification_rejected':
        return '❌';
      case 'message':
        return '💬';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'verification_approved':
        return 'bg-green-50 border-green-200';
      case 'verification_rejected':
        return 'bg-red-50 border-red-200';
      case 'message':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin text-4xl mb-4">⏳</div>
          <p className="text-diabetes-600">Загрузка уведомлений...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-diabetes-900">
          🔔 Уведомления ({notifications.filter(n => !n.isRead).length} новых)
        </h2>
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-diabetes-600 hover:text-diabetes-800 font-medium"
          >
            Отметить все как прочитанные
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-health-md border border-diabetes-100 p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-bold text-diabetes-900 mb-2">Нет уведомлений</h3>
          <p className="text-diabetes-600">Когда появятся новости, вы увидите их здесь</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`rounded-xl border-2 p-4 transition-all ${
                notification.isRead
                  ? 'bg-white border-diabetes-100 opacity-75'
                  : `${getNotificationColor(notification.type)} shadow-health-md`
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className={`font-bold ${notification.isRead ? 'text-diabetes-700' : 'text-diabetes-900'}`}>
                      {notification.title}
                    </h3>
                    {!notification.isRead && (
                      <span className="px-2 py-1 bg-diabetes-600 text-white text-xs rounded-full">
                        Новое
                      </span>
                    )}
                  </div>
                  <p className={`mb-3 ${notification.isRead ? 'text-diabetes-600' : 'text-diabetes-800'}`}>
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-diabetes-500">
                      {new Date(notification.createdAt).toLocaleString('ru-RU')}
                    </span>
                    <div className="flex gap-2">
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="text-diabetes-600 hover:text-diabetes-800 font-medium"
                        >
                          Отметить прочитанным
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification._id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
