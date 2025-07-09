import { API, FileInfo, Options, JSCodeshift } from 'jscodeshift';

/**
 * Codemod: consolidate-error-boundaries
 * ------------------------------------
 * Consolidates multiple error boundary implementations into a single canonical one.
 * 
 * Replaces:
 * - AdminErrorBoundary → ErrorBoundary with level="page"
 * - ForumErrorBoundary → ErrorBoundary with level="component"
 * - react-error-boundary usage → ErrorBoundary class
 * 
 * Strategy:
 * 1. Find imports of legacy error boundary components
 * 2. Replace with canonical ErrorBoundary import
 * 3. Update JSX usage to use canonical ErrorBoundary props
 * 
 * Usage:
 *   jscodeshift -t scripts/codemods/phase5/consolidate-error-boundaries.ts <file/glob>
 */

const LEGACY_ERROR_BOUNDARY_IMPORTS = [
  '@/components/errors/AdminErrorBoundary',
  '@/components/errors/ForumErrorBoundary',
  '@/components/forum/ForumErrorBoundary',
  'react-error-boundary',
];

const CANONICAL_ERROR_BOUNDARY = '@/components/errors/ErrorBoundary';

export default function transformer(file: FileInfo, api: API, options: Options) {
  const j: JSCodeshift = api.jscodeshift;
  
  // Configure parser for TypeScript
  const parser = options.parser || 'tsx';
  
  const root = j(file.source);
  let modified = false;

  // Track if we need to add the canonical ErrorBoundary import
  let needsCanonicalImport = false;
  let hasCanonicalImport = false;

  // Check if canonical import already exists
  root.find(j.ImportDeclaration).forEach(path => {
    const importDecl = path.node;
    const sourceValue = importDecl.source.value?.toString();
    
    if (sourceValue === CANONICAL_ERROR_BOUNDARY) {
      hasCanonicalImport = true;
    }
  });

  // Replace legacy error boundary imports
  root.find(j.ImportDeclaration).forEach(path => {
    const importDecl = path.node;
    const sourceValue = importDecl.source.value?.toString();

    if (sourceValue && LEGACY_ERROR_BOUNDARY_IMPORTS.includes(sourceValue)) {
      if (sourceValue === 'react-error-boundary') {
        // Remove react-error-boundary import entirely
        j(path).remove();
      } else {
        // Replace with canonical ErrorBoundary import
        importDecl.source = j.literal(CANONICAL_ERROR_BOUNDARY);
        importDecl.specifiers = [j.importSpecifier(j.identifier('ErrorBoundary'))];
      }
      
      needsCanonicalImport = true;
      modified = true;
    }
  });

  // Add canonical import if needed and not already present
  if (needsCanonicalImport && !hasCanonicalImport) {
    const canonicalImport = j.importDeclaration(
      [j.importSpecifier(j.identifier('ErrorBoundary'))],
      j.literal(CANONICAL_ERROR_BOUNDARY)
    );
    
    // Add after the last import
    const lastImport = root.find(j.ImportDeclaration).at(-1);
    if (lastImport.length > 0) {
      lastImport.insertAfter(canonicalImport);
    } else {
      // Add at the beginning if no imports exist
      root.get().node.body.unshift(canonicalImport);
    }
    modified = true;
  }

  // Transform JSX usage
  root.find(j.JSXElement).forEach(path => {
    const element = path.node;
    const openingElement = element.openingElement;
    
    if (j.JSXIdentifier.check(openingElement.name)) {
      const tagName = openingElement.name.name;
      
      // Replace AdminErrorBoundary with ErrorBoundary
      if (tagName === 'AdminErrorBoundary') {
        openingElement.name = j.jsxIdentifier('ErrorBoundary');
        
        // Add level="page" attribute
        const levelAttr = j.jsxAttribute(
          j.jsxIdentifier('level'),
          j.literal('page')
        );
        openingElement.attributes = openingElement.attributes || [];
        openingElement.attributes.push(levelAttr);
        
        // Update closing tag if it exists
        if (element.closingElement) {
          element.closingElement.name = j.jsxIdentifier('ErrorBoundary');
        }
        
        modified = true;
      }
      
      // Replace ForumErrorBoundary with ErrorBoundary
      else if (tagName === 'ForumErrorBoundary') {
        openingElement.name = j.jsxIdentifier('ErrorBoundary');
        
        // Add level="component" attribute
        const levelAttr = j.jsxAttribute(
          j.jsxIdentifier('level'),
          j.literal('component')
        );
        openingElement.attributes = openingElement.attributes || [];
        openingElement.attributes.push(levelAttr);
        
        // Update closing tag if it exists
        if (element.closingElement) {
          element.closingElement.name = j.jsxIdentifier('ErrorBoundary');
        }
        
        modified = true;
      }
      
      // Replace react-error-boundary's ErrorBoundary with ours
      else if (tagName === 'ErrorBoundary') {
        // Check if this is from react-error-boundary by looking for specific props
        const hasReactErrorBoundaryProps = openingElement.attributes?.some(attr => {
          if (j.JSXAttribute.check(attr) && j.JSXIdentifier.check(attr.name)) {
            return ['fallbackRender', 'onError', 'onReset'].includes(attr.name.name);
          }
          return false;
        });
        
        if (hasReactErrorBoundaryProps) {
          // Transform react-error-boundary props to our ErrorBoundary props
          const attributes = openingElement.attributes || [];
          const newAttributes = attributes.map(attr => {
            if (j.JSXAttribute.check(attr) && j.JSXIdentifier.check(attr.name)) {
              const attrName = attr.name.name;
              
              // Map react-error-boundary props to our props
              if (attrName === 'fallbackRender') {
                return j.jsxAttribute(j.jsxIdentifier('fallback'), attr.value);
              }
              // onError and onReset can stay the same
              return attr;
            }
            return attr;
          });
          
          // Add default level if not specified
          const hasLevel = newAttributes.some(attr => 
            j.JSXAttribute.check(attr) && 
            j.JSXIdentifier.check(attr.name) && 
            attr.name.name === 'level'
          );
          
          if (!hasLevel) {
            newAttributes.push(j.jsxAttribute(
              j.jsxIdentifier('level'),
              j.literal('component')
            ));
          }
          
          openingElement.attributes = newAttributes;
          modified = true;
        }
      }
    }
  });

  if (!modified) return null;
  return root.toSource({ quote: 'single', trailingComma: true });
}