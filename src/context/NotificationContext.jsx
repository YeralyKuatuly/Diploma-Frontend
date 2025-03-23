import React, { createContext, useState, useEffect, useContext } from "react";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "../api";
import { useAuth } from "./AuthContext";

export const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const { isAuthenticated } = useAuth();

    // Fetch notifications when the user is authenticated
    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 60000); // Check every minute
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    const fetchNotifications = async () => {
        if (!isAuthenticated) return;
        
        try {
            setLoading(true);
            const data = await getNotifications();
            setNotifications(data);
            setUnreadCount(data.filter(notification => !notification.is_read).length);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await markNotificationAsRead(notificationId);
            setNotifications(notifications.map(notification => 
                notification.id === notificationId 
                    ? { ...notification, is_read: true } 
                    : notification
            ));
            setUnreadCount(prev => prev - 1);
        } catch (error) {
            console.error(`Error marking notification ${notificationId} as read:`, error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead();
            setNotifications(notifications.map(notification => ({ 
                ...notification, 
                is_read: true 
            })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
        }
    };

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                loading,
                fetchNotifications,
                markAsRead,
                markAllAsRead
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export default NotificationProvider; 