import supabase from "../utils/supabaseClient";
import { isDemoModeEnabled, demoStorage } from "../utils/demoMode";

/**
 * Settings API for Supabase persistence
 * Handles company settings, notification preferences, billing settings, etc.
 */

// Helper function to check if we're in demo mode
async function isDemoMode() {
  return isDemoModeEnabled();
}

/**
 * Fetch user settings from Supabase
 */
export async function fetchSettings() {
  const inDemoMode = await isDemoMode();
  
  if (inDemoMode) {
    // In demo mode, try to get settings from localStorage
    try {
      const settingsJson = demoStorage.getItem("priority-transfers-settings");
      if (settingsJson) {
        const settings = JSON.parse(settingsJson);
        console.log('Demo mode: Loading settings from localStorage');
        return settings;
      }
      return null;
    } catch (error) {
      console.error('Error loading settings from localStorage:', error);
      return null;
    }
  }

  // Real Supabase mode - get settings for current user
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('No authenticated user found');
      return null;
    }

    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No settings found yet, return null
        console.log('No settings found for user, will create on first save');
        return null;
      }
      console.error("Error fetching settings:", error);
      return null;
    }

    // Transform Supabase data to frontend format
    return {
      companyName: data.company_name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      notifications: data.notification_preferences || {
        email: true,
        sms: false,
        push: true
      },
      booking: data.booking_preferences || {
        autoAssign: true,
        requireConfirmation: true,
        allowOnlineBooking: true
      },
      billing: data.billing_preferences || {
        currency: "EUR",
        taxRate: "8.5",
        paymentTerms: "30"
      }
    };
  } catch (error) {
    console.error('Unexpected error fetching settings:', error);
    return null;
  }
}

/**
 * Save user settings to Supabase
 */
export async function saveSettings(settingsData) {
  const inDemoMode = await isDemoMode();
  
  if (inDemoMode) {
    // In demo mode, save to localStorage
    try {
      const updatedSettings = {
        ...settingsData,
        lastUpdated: new Date().toISOString()
      };
      demoStorage.setItem("priority-transfers-settings", JSON.stringify(updatedSettings));
      console.log('Demo mode: Settings saved to localStorage');
      return { success: true };
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
      return { success: false, error: 'Failed to save settings in demo mode' };
    }
  }

  // Real Supabase mode
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'No authenticated user found' };
    }

    // Transform frontend data to Supabase format
    const supabaseData = {
      user_id: user.id,
      company_name: settingsData.companyName,
      email: settingsData.email,
      phone: settingsData.phone,
      address: settingsData.address,
      notification_preferences: settingsData.notifications,
      booking_preferences: settingsData.booking,
      billing_preferences: settingsData.billing,
      updated_at: new Date().toISOString()
    };

    // Try to update existing settings first
    const { data, error } = await supabase
      .from("user_settings")
      .upsert(supabaseData, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving settings:", error);
      return { success: false, error: error.message };
    }

    console.log('Settings saved to Supabase successfully');
    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error saving settings:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Delete user settings (for cleanup/reset)
 */
export async function deleteSettings() {
  const inDemoMode = await isDemoMode();
  
  if (inDemoMode) {
    demoStorage.removeItem("priority-transfers-settings");
    return { success: true };
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'No authenticated user found' };
    }

    const { error } = await supabase
      .from("user_settings")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting settings:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error deleting settings:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}