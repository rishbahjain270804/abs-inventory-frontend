import { useState, useEffect } from 'react';

let showNotificationCallback = null;

export const useNotification = () => {
  const showNotification = (message, type = 'info') => {
    if (showNotificationCallback) {
      showNotificationCallback(message, type);
    }
  };

  return { showNotification };
};

function Notification() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    showNotificationCallback = (message, type) => {
      const id = Date.now();
      setNotifications(prev => [...prev, { id, message, type }]);
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 4000);
    };

    return () => {
      showNotificationCallback = null;
    };
  }, []);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="notification-container">
      {notifications.map(notif => (
        <div key={notif.id} className={`notification notification-${notif.type}`}>
          <span className="notification-icon">
            {notif.type === 'success' && '✓'}
            {notif.type === 'error' && '✕'}
            {notif.type === 'warning' && '⚠'}
            {notif.type === 'info' && 'ℹ'}
          </span>
          <span className="notification-message">{notif.message}</span>
          <button className="notification-close" onClick={() => removeNotification(notif.id)}>×</button>
        </div>
      ))}
    </div>
  );
}

export default Notification;
