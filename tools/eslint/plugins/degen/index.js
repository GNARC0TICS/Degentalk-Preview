const noNumberId = require('../../eslint-rules/no-number-id');
const enforcePathAliases = require('../../eslint-rules/enforce-path-aliases');

module.exports = {
  rules: {
    'no-number-id': noNumberId,
    'enforce-path-aliases': enforcePathAliases,
  },
};
