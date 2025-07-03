/**
 * ESLint Rule: no-number-id
 * 
 * Prevents the use of integer ID patterns in UUID-first architecture
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow integer ID patterns in UUID-first architecture',
      category: 'Possible Errors',
      recommended: true,
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          allowTestFiles: {
            type: 'boolean',
            default: false
          },
          allowMigrationFiles: {
            type: 'boolean',
            default: true
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      numberIdCast: 'Integer ID casting ({{method}}) is not allowed in UUID-first architecture. Use UUID validation instead.',
      numberIdLiteral: 'Integer ID literal ({{value}}) is not allowed in mock data. Use mockUuid() or TEST_UUIDS instead.',
      numberIdValidation: 'Integer ID validation (z.number()) is not allowed for ID fields. Use z.string().uuid() instead.',
      parseIntId: 'parseInt() on ID fields is not allowed. IDs should be UUIDs, not integers.',
      isNaNId: 'isNaN() check on ID fields suggests integer usage. Use UUID validation instead.'
    }
  },

  create(context) {
    const options = context.options[0] || {};
    const allowTestFiles = options.allowTestFiles || false;
    const allowMigrationFiles = options.allowMigrationFiles !== false;
    
    const filename = context.getFilename();
    const isTestFile = /\.(test|spec)\.[jt]s$/.test(filename);
    const isMigrationFile = /migrations?\//.test(filename) || /seed.*\.[jt]s$/.test(filename);
    
    // Skip if test files are allowed and this is a test file
    if (allowTestFiles && isTestFile) {
      return {};
    }
    
    // Skip if migration files are allowed and this is a migration file
    if (allowMigrationFiles && isMigrationFile) {
      return {};
    }

    function isIdField(node) {
      // Check if the identifier ends with 'Id' or is 'id'
      if (node.type === 'Identifier') {
        const name = node.name.toLowerCase();
        return name === 'id' || name.endsWith('id');
      }
      
      // Check if it's a property with an ID-like key
      if (node.type === 'Property' && node.key) {
        const keyName = node.key.name || node.key.value;
        if (typeof keyName === 'string') {
          const name = keyName.toLowerCase();
          return name === 'id' || name.endsWith('id');
        }
      }
      
      return false;
    }

    function isIdContext(node) {
      let parent = node.parent;
      while (parent) {
        // Check if we're in an assignment to an ID field
        if (parent.type === 'Property' && isIdField(parent)) {
          return true;
        }
        
        // Check if we're in a variable declaration with ID name
        if (parent.type === 'VariableDeclarator' && isIdField(parent.id)) {
          return true;
        }
        
        // Check if we're in a function parameter with ID name
        if (parent.type === 'AssignmentPattern' && isIdField(parent.left)) {
          return true;
        }
        
        parent = parent.parent;
      }
      return false;
    }

    return {
      // Catch Number(id) and parseInt(id) patterns
      CallExpression(node) {
        const { callee, arguments: args } = node;
        
        if (args.length === 0) return;
        
        const firstArg = args[0];
        
        // Check for Number(someId) or parseInt(someId)
        if (callee.type === 'Identifier') {
          if (callee.name === 'Number' && isIdField(firstArg)) {
            context.report({
              node,
              messageId: 'numberIdCast',
              data: { method: 'Number()' },
              fix(fixer) {
                // Remove the Number() wrapper
                return fixer.replaceText(node, context.getSourceCode().getText(firstArg));
              }
            });
          }
          
          if (callee.name === 'parseInt' && isIdField(firstArg)) {
            context.report({
              node,
              messageId: 'parseIntId',
              fix(fixer) {
                // Remove the parseInt() wrapper
                return fixer.replaceText(node, context.getSourceCode().getText(firstArg));
              }
            });
          }
          
          if (callee.name === 'isNaN' && isIdField(firstArg)) {
            context.report({
              node,
              messageId: 'isNaNId',
              fix(fixer) {
                // Replace with UUID validation
                return fixer.replaceText(node, `!isValidUUID(${context.getSourceCode().getText(firstArg)})`);
              }
            });
          }
        }
      },

      // Catch integer literals in ID contexts
      Property(node) {
        if (isIdField(node) && node.value.type === 'Literal' && typeof node.value.value === 'number') {
          context.report({
            node: node.value,
            messageId: 'numberIdLiteral',
            data: { value: node.value.value },
            fix(fixer) {
              if (isTestFile) {
                return fixer.replaceText(node.value, 'mockUuid()');
              } else {
                return fixer.replaceText(node.value, 'randomUUID()');
              }
            }
          });
        }
      },

      // Catch z.number() in Zod schemas for ID fields
      MemberExpression(node) {
        if (
          node.object &&
          node.object.type === 'CallExpression' &&
          node.object.callee &&
          node.object.callee.name === 'z' &&
          node.property &&
          node.property.name === 'number'
        ) {
          // Check if this is in an ID context by looking at the parent property
          let parent = node.parent;
          while (parent && parent.type !== 'Property') {
            parent = parent.parent;
          }
          
          if (parent && isIdField(parent)) {
            context.report({
              node,
              messageId: 'numberIdValidation',
              fix(fixer) {
                // Find the complete z.number() chain and replace with z.string().uuid()
                let replacement = 'z.string().uuid()';
                return fixer.replaceText(node.parent, replacement);
              }
            });
          }
        }
      }
    };
  }
};