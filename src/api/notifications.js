import supabase from "../utils/supabaseClient";
import { isDemoModeEnabled, demoStorage } from "../utils/demoMode";

/**
 * Notifications API for Supabase persistence
 */

// Helper function to check if we're in demo mode
async function isDemoMode() {
  return isDemoModeEnabled();
}

/**
 * Fetch notifications for the current user
 */
export async function fetchNotifications() {
  const inDemoMode = await isDemoMode();
  
  if (inDemoMode) {
    try {
      const notificationsJson = demoStorage.getItem("notifications");
      if (notificationsJson) {
        const notifications = JSON.parse(notificationsJson);
        console.log('Demo mode: Loading notifications from localStorage');
        return notifications;
      }
      return [];
    } catch (error) {
      console.error('Error loading notifications from localStorage:', error);
      return [];
    }
  }

  // Real Supabase mode
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('No authenticated user found');
      return [];
    }

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }

    return data.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      read: n.read || false,
      timestamp: n.created_at,
      relatedId: n.related_id,
      priority: n.priority || 'normal'
    }));
  } catch (error) {
    console.error('Unexpected error fetching notifications:', error);
    return [];
  }
}

/**
 * Create a new notification
 */
export async function createNotification(notificationData) {
  const inDemoMode = await isDemoMode();
  
  if (inDemoMode) {
    try {
      const notifications = await fetchNotifications();
      const newNotification = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: false,
        ...notificationData
      };
      
      const updatedNotifications = [newNotification, ...notifications];
      demoStorage.setItem("notifications", JSON.stringify(updatedNotifications));
      
      return { success: true, notification: newNotification };
    } catch (error) {
      console.error('Error creating notification in demo mode:', error);
      return { success: false, error: 'Failed to create notification in demo mode' };
    }
  }

  // Real Supabase mode
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'No authenticated user found' };
    }

    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: user.id,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        related_id: notificationData.relatedId,
        priority: notificationData.priority || 'normal',
        read: false
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating notification:", error);
      return { success: false, error: error.message };
    }

    return { success: true, notification: data };
  } catch (error) {
    console.error('Unexpected error creating notification:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(id) {
  const inDemoMode = await isDemoMode();
  
  if (inDemoMode) {
    try {
      const notifications = await fetchNotifications();
      const updatedNotifications = notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      );
      demoStorage.setItem("notifications", JSON.stringify(updatedNotifications));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to update notification in demo mode' };
    }
  }

  // Real Supabase mode
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);

    if (error) {
      console.error("Error marking notification as read:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error updating notification:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Delete notification
 */
export async function deleteNotification(id) {
  const inDemoMode = await isDemoMode();
  
  if (inDemoMode) {
    try {
      const notifications = await fetchNotifications();
      const updatedNotifications = notifications.filter(n => n.id !== id);
      demoStorage.setItem("notifications", JSON.stringify(updatedNotifications));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to delete notification in demo mode' };
    }
  }

  // Real Supabase mode
  try {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting notification:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error deleting notification:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}