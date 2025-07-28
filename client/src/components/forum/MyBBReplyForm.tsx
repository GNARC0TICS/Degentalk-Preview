import React, { useState } from 'react';
import { Bold, Italic, Underline, Link, Image, Quote, Code, Smile } from 'lucide-react';
import type { ThreadId } from '@shared/types/ids';

interface MyBBReplyFormProps {
  threadId: ThreadId;
  onSubmit: (content: string) => Promise<void>;
  isDisabled?: boolean;
}

export function MyBBReplyForm({ threadId, onSubmit, isDisabled = false }: MyBBReplyFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content);
      setContent('');
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  // Insert formatting tags
  const insertTag = (tag: string, closeTag?: string) => {
    const textarea = document.getElementById('mybb-reply-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const beforeText = content.substring(0, start);
    const afterText = content.substring(end);

    const newContent = closeTag
      ? `${beforeText}[${tag}]${selectedText}[/${closeTag || tag}]${afterText}`
      : `${beforeText}[${tag}]${afterText}`;

    setContent(newContent);
    
    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      const newPosition = closeTag ? start + tag.length + 2 : start + tag.length + 2;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  return (
    <div className="mybb-reply-form">
      {/* Reply Form Header */}
      <div className="mybb-category-header mybb-category-green">
        <div className="mybb-category-title">Post Reply</div>
      </div>

      <form onSubmit={handleSubmit} className="mybb-reply-content">
        {/* Formatting Toolbar */}
        <div className="mybb-editor-toolbar">
          <button
            type="button"
            onClick={() => insertTag('b')}
            className="mybb-editor-btn"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertTag('i')}
            className="mybb-editor-btn"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertTag('u')}
            className="mybb-editor-btn"
            title="Underline"
          >
            <Underline className="w-4 h-4" />
          </button>
          
          <div className="mybb-editor-separator" />
          
          <button
            type="button"
            onClick={() => insertTag('url')}
            className="mybb-editor-btn"
            title="Insert Link"
          >
            <Link className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertTag('img')}
            className="mybb-editor-btn"
            title="Insert Image"
          >
            <Image className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertTag('quote')}
            className="mybb-editor-btn"
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertTag('code')}
            className="mybb-editor-btn"
            title="Code"
          >
            <Code className="w-4 h-4" />
          </button>
          
          <div className="mybb-editor-separator" />
          
          <button
            type="button"
            onClick={() => setContent(content + ' :)')}
            className="mybb-editor-btn"
            title="Smilies"
          >
            <Smile className="w-4 h-4" />
          </button>
        </div>

        {/* Reply Textarea */}
        <textarea
          id="mybb-reply-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter your reply..."
          className="mybb-reply-textarea"
          rows={8}
          disabled={isDisabled || isSubmitting}
          required
        />

        {/* Submit Actions */}
        <div className="mybb-reply-actions">
          <button
            type="submit"
            disabled={!content.trim() || isSubmitting || isDisabled}
            className="mybb-submit-btn"
          >
            {isSubmitting ? 'Posting...' : 'Post Reply'}
          </button>
          <button
            type="button"
            onClick={() => setContent('')}
            disabled={isSubmitting || isDisabled}
            className="mybb-preview-btn"
          >
            Preview
          </button>
        </div>
      </form>
    </div>
  );
}