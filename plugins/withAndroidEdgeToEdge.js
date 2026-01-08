const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Custom Expo config plugin to handle Android 15+ edge-to-edge compatibility
 * and remove orientation restrictions for large screen devices (Android 16+)
 *
 * This plugin addresses:
 * 1. Edge-to-edge display requirements for Android 15+
 * 2. Removal of orientation restrictions for tablets/foldables (Android 16+)
 * 3. Removal of resizability restrictions
 */
const withAndroidEdgeToEdge = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    
    // Get the main application element
    const application = androidManifest.manifest.application?.[0];
    
    if (application) {
      // Enable edge-to-edge for backward compatibility
      if (!application.$) {
        application.$ = {};
      }
      
      // Add theme that supports edge-to-edge
      application.$['android:theme'] = '@style/Theme.App.EdgeToEdge';
    }
    
    // Remove orientation restrictions from ALL activities
    const activities = androidManifest.manifest.application?.[0]?.activity || [];
    
    activities.forEach((activity) => {
      if (activity.$) {
        const activityName = activity.$['android:name'];
        
        // Remove portrait orientation restriction for large screens (Android 16+)
        if (activity.$['android:screenOrientation']) {
          console.log(`Removing screenOrientation from ${activityName || 'activity'}`);
          delete activity.$['android:screenOrientation'];
        }
        
        // Remove resizeableActivity attribute entirely to avoid conflicts
        // Let Android use default behavior which is resizeable=true for targetSdk 24+
        if (activity.$['android:resizeableActivity']) {
          console.log(`Removing resizeableActivity attribute from ${activityName || 'activity'}`);
          delete activity.$['android:resizeableActivity'];
        }
        
        // Set config changes to handle orientation and screen size changes
        const configChanges = activity.$['android:configChanges'];
        if (configChanges) {
          // Ensure orientation and screenSize are in configChanges
          const changes = new Set(configChanges.split('|'));
          changes.add('orientation');
          changes.add('screenSize');
          changes.add('screenLayout');
          changes.add('smallestScreenSize');
          activity.$['android:configChanges'] = Array.from(changes).join('|');
        }
      }
    });
    
    return config;
  });
};

module.exports = withAndroidEdgeToEdge;
