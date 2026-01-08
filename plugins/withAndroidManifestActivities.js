const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Custom Expo config plugin to handle specific activity configurations
 * 
 * This plugin addresses:
 * 1. ML Kit barcode scanner activity orientation restrictions
 * 2. Any other third-party library activities that need modification
 * 
 * Note: This runs after other plugins to ensure third-party activities
 * added by dependencies are properly configured.
 */
const withAndroidManifestActivities = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    
    // Get all activities
    const activities = androidManifest.manifest.application?.[0]?.activity || [];
    
    // List of activity names that should have orientation restrictions removed
    const activitiesToModify = [
      'com.google.mlkit.vision.codescanner.internal.GmsBarcodeScanningDelegateActivity',
      'com.onepage.jpjonline.MainActivity',
      // Add other activities here if needed
    ];
    
    activities.forEach((activity) => {
      if (activity.$) {
        const activityName = activity.$['android:name'];
        
        // Check if this activity needs modification
        if (activitiesToModify.some(name => activityName?.includes(name))) {
          console.log(`Configuring activity: ${activityName}`);
          
          // Remove orientation restrictions (Android 16+ requirement)
          if (activity.$['android:screenOrientation']) {
            console.log(`  - Removing screenOrientation: ${activity.$['android:screenOrientation']}`);
            delete activity.$['android:screenOrientation'];
          }
          
          // Remove resizeableActivity to let Android use defaults (resizeable=true for targetSdk 24+)
          if (activity.$['android:resizeableActivity']) {
            console.log(`  - Removing resizeableActivity attribute`);
            delete activity.$['android:resizeableActivity'];
          }
          
          // Add config changes to handle orientation properly
          const existingConfigChanges = activity.$['android:configChanges'];
          const configChanges = new Set(
            existingConfigChanges ? existingConfigChanges.split('|') : []
          );
          
          // Add necessary config changes for multi-window and orientation support
          configChanges.add('orientation');
          configChanges.add('screenSize');
          configChanges.add('screenLayout');
          configChanges.add('smallestScreenSize');
          configChanges.add('keyboard');
          configChanges.add('keyboardHidden');
          
          activity.$['android:configChanges'] = Array.from(configChanges).join('|');
          console.log(`  - Updated configChanges: ${activity.$['android:configChanges']}`);
        }
      }
    });
    
    return config;
  });
};

module.exports = withAndroidManifestActivities;
