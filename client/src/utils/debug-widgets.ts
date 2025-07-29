// Widget debugging utilities
// This file exposes helpful functions to the window object for debugging widget issues

import { useLayoutStore } from '@/stores/useLayoutStore';

// Expose to window for debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).widgetDebug = {
    // Reset widgets to default configuration
    reset: () => {
      useLayoutStore.getState().resetToDefaults();
      console.log('✅ Widgets reset to defaults');
    },
    
    // Show current widget state
    showState: () => {
      const state = useLayoutStore.getState();
      console.log('Current widget state:', {
        instances: state.instances,
        order: state.order,
        hasHydrated: state._hasHydrated
      });
    },
    
    // Clear localStorage and reload
    clearAndReload: () => {
      localStorage.removeItem('dgt-layout-preferences');
      window.location.reload();
    },
    
    // Force hydration with defaults
    forceDefaults: () => {
      const defaultLayout = {
        sidebars: {
          left: { isVisible: true, width: 'normal' },
          right: { isVisible: true, width: 'normal' },
          position: 'left-right'
        },
        order: {
          'sidebar/left': ['profile-card'],
          'sidebar/right': [
            'shoutbox',
            'wallet-summary',
            'daily-tasks',
            'hot-threads',
            'forum-nav',
            'leaderboard',
            'active-members'
          ],
          'sidebar/top': [],
          'sidebar/bottom': [],
          'sidebar/widgets': [],
          'main/left': [],
          'main/right': [],
          'main/top': [],
          'main/bottom': [],
          'main/widgets': [],
          'mobile/left': [],
          'mobile/right': [],
          'mobile/top': [],
          'mobile/bottom': [],
          'mobile/widgets': ['mobile-shoutbox', 'mobile-wallet', 'mobile-leaderboard']
        },
        instances: {
          'profile-card': { instanceId: 'profile-card', componentId: 'profileCard' },
          shoutbox: { instanceId: 'shoutbox', componentId: 'shoutbox' },
          'wallet-summary': { instanceId: 'wallet-summary', componentId: 'walletSummary' },
          'daily-tasks': { instanceId: 'daily-tasks', componentId: 'dailyTasks' },
          'hot-threads': { instanceId: 'hot-threads', componentId: 'hotThreads' },
          'forum-nav': { instanceId: 'forum-nav', componentId: 'forumNav' },
          leaderboard: { instanceId: 'leaderboard', componentId: 'leaderboard' },
          'active-members': { instanceId: 'active-members', componentId: 'activeMembers' },
          'mobile-shoutbox': { instanceId: 'mobile-shoutbox', componentId: 'shoutbox' },
          'mobile-wallet': { instanceId: 'mobile-wallet', componentId: 'walletSummary' },
          'mobile-leaderboard': { instanceId: 'mobile-leaderboard', componentId: 'leaderboard' }
        }
      };
      
      useLayoutStore.setState({
        ...defaultLayout,
        version: 1,
        _hasHydrated: true
      });
      
      console.log('✅ Forced default widget configuration');
    }
  };
  
  console.log('🔧 Widget debug utilities loaded. Available commands:');
  console.log('- widgetDebug.reset()        // Reset to default widgets');
  console.log('- widgetDebug.showState()    // Show current widget state');
  console.log('- widgetDebug.clearAndReload() // Clear localStorage and reload');
  console.log('- widgetDebug.forceDefaults()  // Force default configuration');
}