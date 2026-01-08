const { withAndroidStyles, AndroidConfig } = require('@expo/config-plugins');

/**
 * Custom Expo config plugin to add Android styles for edge-to-edge support
 *
 * This plugin creates a theme that:
 * 1. Uses transparent system bars (Android 15+ requirement)
 * 2. Avoids deprecated status/navigation bar color APIs
 * 3. Enables proper contrast enforcement
 * 4. Supports edge-to-edge display
 */
const withAndroidEdgeToEdgeStyles = (config) => {
  return withAndroidStyles(config, async (config) => {
    const styles = config.modResults;
    
    // Add edge-to-edge theme with modern Android 15+ approach
    const edgeToEdgeTheme = {
      $: {
        name: 'Theme.App.EdgeToEdge',
        parent: 'Theme.AppCompat.Light.NoActionBar',
      },
      item: [
        // Enable drawing behind system bars
        {
          _: 'true',
          $: {
            name: 'android:windowDrawsSystemBarBackgrounds',
          },
        },
        // Use transparent bars (modern approach, avoids deprecated setStatusBarColor)
        {
          _: '@android:color/transparent',
          $: {
            name: 'android:statusBarColor',
          },
        },
        {
          _: '@android:color/transparent',
          $: {
            name: 'android:navigationBarColor',
          },
        },
        // Enable contrast enforcement (Android 15+ feature)
        {
          _: 'true',
          $: {
            name: 'android:enforceNavigationBarContrast',
          },
        },
        {
          _: 'true',
          $: {
            name: 'android:enforceStatusBarContrast',
          },
        },
        // Enable edge-to-edge layout (shortEdges allows content behind cutout)
        {
          _: 'shortEdges',
          $: {
            name: 'android:windowLayoutInDisplayCutoutMode',
          },
        },
        // Ensure proper window flags
        {
          _: 'false',
          $: {
            name: 'android:windowTranslucentStatus',
          },
        },
        {
          _: 'false',
          $: {
            name: 'android:windowTranslucentNavigation',
          },
        },
      ],
    };
    
    // Ensure styles.resources exists
    if (!styles.resources) {
      styles.resources = {};
    }
    
    // Ensure styles.resources.style is an array
    if (!styles.resources.style) {
      styles.resources.style = [];
    }
    
    // Check if theme already exists
    const existingThemeIndex = styles.resources.style.findIndex(
      (style) => style.$?.name === 'Theme.App.EdgeToEdge'
    );
    
    if (existingThemeIndex >= 0) {
      // Update existing theme
      styles.resources.style[existingThemeIndex] = edgeToEdgeTheme;
    } else {
      // Add new theme
      styles.resources.style.push(edgeToEdgeTheme);
    }
    
    return config;
  });
};

module.exports = withAndroidEdgeToEdgeStyles;
