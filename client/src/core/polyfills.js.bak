// Node.js v22 crypto polyfill
const crypto = require('crypto');

if (!globalThis.crypto || !globalThis.crypto.getRandomValues) {
  globalThis.crypto = {
    ...globalThis.crypto,
    getRandomValues: function(buffer) {
      return crypto.randomFillSync(buffer);
    }
  };
}

// Register tsconfig-paths
require('tsconfig-paths/register'); 