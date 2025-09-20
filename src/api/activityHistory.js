import supabase from "../utils/supabaseClient";
import { isDemoModeEnabled, demoStorage } from "../utils/demoMode";

/**
 * Activity History API for Supabase persistence
 */

// Helper function to check if we're in demo mode
async function isDemoMode() {
  return isDemoModeEnabled();
}

/**
 * Fetch activity history for the current user
 */
export async function fetchActivityHistory() {
  const inDemoMode = await isDemoMode();
  
  if (inDemoMode) {
    try {
      const activityJson = demoStorage.getItem("activityHistory");
      if (activityJson) {
        const activity = JSON.parse(activityJson);
        console.log('Demo mode: Loading activity history from localStorage');
        return activity;
      }
      return [];
    } catch (error) {
      console.error('Error loading activity history from localStorage:', error);
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
      .from("activity_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100); // Keep last 100 activities

    if (error) {
      console.error("Error fetching activity history:", error);
      return [];
    }

    return data.map((a) => ({
      id: a.id,
      type: a.type,
      description: a.description,
      timestamp: a.created_at,
      relatedId: a.related_id,
      details: a.details
    }));
  } catch (error) {
    console.error('Unexpected error fetching activity history:', error);
    return [];
  }
}

/**
 * Add new activity to history
 */
export async function addActivityLog(activityData) {
  const inDemoMode = await isDemoMode();
  
  if (inDemoMode) {
    try {
      const activities = await fetchActivityHistory();
      const newActivity = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...activityData
      };
      
      // Keep last 100 activities
      const updatedActivities = [newActivity, ...activities].slice(0, 100);
      demoStorage.setItem("activityHistory", JSON.stringify(updatedActivities));
      
      return { success: true, activity: newActivity };
    } catch (error) {
      console.error('Error adding activity in demo mode:', error);
      return { success: false, error: 'Failed to add activity in demo mode' };
    }
  }

  // Real Supabase mode
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'No authenticated user found' };
    }

    const { data, error } = await supabase
      .from("activity_history")
      .insert({
        user_id: user.id,
        type: activityData.type,
        description: activityData.description,
        related_id: activityData.relatedId,
        details: activityData.details
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding activity:", error);
      return { success: false, error: error.message };
    }

    return { success: true, activity: data };
  } catch (error) {
    console.error('Unexpected error adding activity:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Clear activity history (for cleanup)
 */
export async function clearActivityHistory() {
  const inDemoMode = await isDemoMode();
  
  if (inDemoMode) {
    demoStorage.removeItem("activityHistory");
    return { success: true };
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'No authenticated user found' };
    }

    const { error } = await supabase
      .from("activity_history")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      console.error("Error clearing activity history:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error clearing activity history:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}