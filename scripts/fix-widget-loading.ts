#!/usr/bin/env tsx

/**
 * Fix Homepage Widget Loading Issues
 * 
 * This script provides instructions for fixing widgets not loading on the homepage.
 * The issue is caused by corrupted localStorage data overriding default widget configuration.
 */

console.log(`
🔧 Widget Loading Fix Instructions
==================================

The homepage widgets aren't loading due to corrupted localStorage data.

To fix this issue:

1. Open your browser's Developer Console (F12)
2. Run this command:
   
   localStorage.removeItem("dgt-layout-preferences");
   location.reload();

3. Alternative methods:
   - DevTools → Application → Storage → localStorage → Delete "dgt-layout-preferences"
   - Clear browser cache/site data
   - Use incognito/private mode

After clearing localStorage, the default widgets will load:
- Left sidebar: Profile Card
- Right sidebar: Shoutbox, Wallet Summary, Daily Tasks, etc.

For developers: The issue occurs when useLayoutStore's persisted state 
contains empty 'order' and 'instances' objects, overriding defaults.
`);

// Optional: Check if running in browser context
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  const stored = localStorage.getItem("dgt-layout-preferences");
  if (stored) {
    try {
      const data = JSON.parse(stored);
      console.log('\nCurrent localStorage state:', data);
      console.log('\nWidget instances found:', Object.keys(data.state?.instances || {}).length);
    } catch (e) {
      console.log('\nCorrupted localStorage data found!');
    }
  }
}