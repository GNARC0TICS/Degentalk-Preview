import React, { useState, useRef, useEffect } from 'react';
import { X, Tag as TagIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useTags } from '@/features/forum/hooks/useForumQueries';
import type { Tag } from '@/types/forum'; // Import Tag type

interface TagInputProps {
  value: Tag[]; // Changed from string[]
  onChange: (tags: Tag[]) => void; // Changed from string[]
  placeholder?: string;
  maxTags?: number;
  className?: string;
}

export function TagInput({
  value = [],
  onChange,
  placeholder = 'Add tags...',
  maxTags = 10,
  className = '',
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  const { data: availableTags, isLoading } = useTags(); // Returns Tag[]
  
  const filteredSuggestions = availableTags
    ? availableTags
        .filter(tag => 
          tag.name.toLowerCase().includes(inputValue.toLowerCase()) && 
          !value.some(selectedTag => selectedTag.id === tag.id) // Compare by ID or slug for uniqueness
        )
        .slice(0, 5)
    : [];
  
  const removeTag = (tagToRemove: Tag) => {
    onChange(value.filter(tag => tag.id !== tagToRemove.id));
  };
  
  // Simplified addTag: only adds from suggestions for now
  const addTag = (tagToAdd: Tag) => {
    if (!value.some(selectedTag => selectedTag.id === tagToAdd.id) && value.length < maxTags) {
      onChange([...value, tagToAdd]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Comma-based adding for new tags is more complex with Tag objects, disable for now
    // Users will select from suggestions or type and press Enter (if we implement creating new tags)
    setInputValue(newValue);
    setShowSuggestions(true);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue) {
      e.preventDefault();
      // Attempt to find a suggestion that matches the input exactly
      const exactMatch = filteredSuggestions.find(s => s.name.toLowerCase() === inputValue.trim().toLowerCase());
      if (exactMatch) {
        addTag(exactMatch);
      }
      // TODO: Implement creating a new tag if no exact match, or disallow free-form entry if not desired
      // For now, pressing Enter with text that's not a suggestion does nothing.
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  useEffect(() => {
    if (inputValue === '') {
      setShowSuggestions(false);
    }
  }, [inputValue]);
  
  return (
    <div className={`w-full ${className}`}>
      <div className="flex flex-wrap items-center gap-2 p-2 min-h-10 bg-zinc-950 border border-zinc-800 rounded-md focus-within:ring-1 focus-within:ring-emerald-500 focus-within:border-emerald-500">
        {value.map((tag, index) => (
          <Badge 
            key={tag.id} // Use tag.id as key
            variant="secondary"
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-0.5 flex items-center gap-1"
          >
            #{tag.name} {/* Display tag.name */}
            <X 
              className="h-3 w-3 cursor-pointer hover:text-red-400" 
              onClick={() => removeTag(tag)}
            />
          </Badge>
        ))}
        
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] border-0 bg-transparent p-0 focus-visible:ring-0 text-sm h-7"
          disabled={value.length >= maxTags}
        />
      </div>
      
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="mt-1 p-1 bg-zinc-900 border border-zinc-800 rounded-md shadow-lg max-h-48 overflow-y-auto z-10 absolute w-full left-0 right-0"
        >
          {filteredSuggestions.map((tag) => (
            <div
              key={tag.id}
              className="px-2 py-1.5 hover:bg-zinc-800 cursor-pointer flex items-center gap-2 text-sm rounded"
              onClick={() => addTag(tag)}
            >
              <TagIcon className="h-3 w-3 text-emerald-400" />
              {tag.name}
              {/* Assuming 'threadCount' might be part of your Tag object from the API, otherwise remove or adjust */}
              {/* <span className="text-xs text-zinc-500">
                ({tag.threadCount || 0} threads)
              </span> */}
            </div>
          ))}
        </div>
      )}
      
      {value.length >= maxTags && (
        <p className="mt-1 text-xs text-zinc-500">
          Maximum of {maxTags} tags reached
        </p>
      )}
      
      {/* Removing comma instruction as it's temporarily disabled for Tag objects 
      <p className="mt-1 text-xs text-zinc-500">
        Press Enter or use commas to add tags
      </p>*/}
    </div>
  );
}
