import React from 'react';
import DOMPurify from 'dompurify';
import { SignatureTierLevel } from '@shared/signature/SignatureTierConfig';

type SignatureRendererProps = {
  signature: string;
  tier?: SignatureTierLevel;
  isCollapsible?: boolean;
  className?: string;
  activeEffects?: string[];
};

/**
 * Component for rendering user signatures with BBCode support and safety measures
 */
export function SignatureRenderer({
  signature,
  tier,
  isCollapsible = true,
  className = '',
  activeEffects = []
}: SignatureRendererProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(isCollapsible);
  
  // If no signature, return nothing
  if (!signature || signature.trim() === '') {
    return null;
  }
  
  // Simple BBCode parser - in a real app, use a full BBCode parser library
  const parseBBCode = (text: string) => {
    // Start with basic formatting
    let parsed = text
      // Bold
      .replace(/\[b\](.*?)\[\/b\]/g, '<strong>$1</strong>')
      // Italic
      .replace(/\[i\](.*?)\[\/i\]/g, '<em>$1</em>')
      // Underline
      .replace(/\[u\](.*?)\[\/u\]/g, '<span style="text-decoration: underline;">$1</span>')
      // Strike
      .replace(/\[s\](.*?)\[\/s\]/g, '<span style="text-decoration: line-through;">$1</span>')
      // Color
      .replace(/\[color=([a-zA-Z0-9#]+)\](.*?)\[\/color\]/g, '<span style="color: $1;">$2</span>');
    
    // Only add image support if the tier allows it
    if (tier?.canUseImages) {
      parsed = parsed
        // Image with URL
        .replace(/\[img\](.*?)\[\/img\]/g, '<img src="$1" alt="Signature Image" class="max-h-16 max-w-full" />');
    }
    
    // Simple link support
    parsed = parsed.replace(/\[url=(.*?)\](.*?)\[\/url\]/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$2</a>');
    
    // Line breaks
    parsed = parsed.replace(/\n/g, '<br>');
    
    return parsed;
  };
  
  // Parse the BBCode and sanitize
  const parsedSignature = parseBBCode(signature);
  const sanitizedSignature = DOMPurify.sanitize(parsedSignature, {
    ALLOWED_TAGS: ['b', 'i', 'u', 'em', 'strong', 'span', 'a', 'br', 'img'],
    ALLOWED_ATTR: ['style', 'href', 'target', 'rel', 'src', 'alt', 'class'],
    ALLOW_DATA_ATTR: false
  });
  
  // Apply signature effects
  const applyEffects = () => {
    let effectClasses = '';
    
    activeEffects.forEach(effect => {
      switch (effect) {
        case 'animated_glow':
          effectClasses += ' animate-pulse';
          break;
        case 'gradient_text':
          effectClasses += ' bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500';
          break;
        case 'sparkle_effect':
          // In a real app, this would be a more complex effect
          effectClasses += ' sparkle-effect';
          break;
        case 'rainbow_animation':
          effectClasses += ' rainbow-text';
          break;
        case '3d_shadow':
          effectClasses += ' text-shadow-3d';
          break;
        default:
          break;
      }
    });
    
    return effectClasses;
  };
  
  // Classes for signature container
  const containerClasses = [
    'signature-container',
    'text-sm',
    'border-t',
    'pt-2',
    'mt-2',
    'border-gray-700',
    applyEffects(),
    className,
    isCollapsed ? 'max-h-16 overflow-hidden' : ''
  ].filter(Boolean).join(' ');
  
  return (
    <div className={containerClasses}>
      {isCollapsible && (
        <div className="flex justify-end mb-1">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-xs text-gray-500 hover:text-gray-300"
          >
            {isCollapsed ? 'Show Full Signature' : 'Collapse Signature'}
          </button>
        </div>
      )}
      <div 
        className="signature-content"
        dangerouslySetInnerHTML={{ __html: sanitizedSignature }}
      />
    </div>
  );
} 