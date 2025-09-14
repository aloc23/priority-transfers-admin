// Feature flags for controlling application functionality
// These can be toggled to enable/disable features without removing code

export const FEATURES = {
  // Fleet & Driver Status functionality - disabled as per requirements
  // Can be re-enabled in the future by changing this flag
  FLEET_DRIVER_STATUS: false,
  
  // Other feature flags can be added here as needed
  ADVANCED_ANALYTICS: true,
  MOBILE_OPTIMIZATIONS: true,
};

export const isFeatureEnabled = (featureName) => {
  return FEATURES[featureName] ?? false;
};