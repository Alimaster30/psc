import React, { useState, useRef, useEffect } from 'react';

interface AutocompleteInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  suggestions: string[];
  placeholder?: string;
  label?: string;
  required?: boolean;
  className?: string;
  error?: string;
  onSelect?: (suggestion: string) => void;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  id,
  name,
  value,
  onChange,
  suggestions,
  placeholder,
  label,
  required,
  className = '',
  error,
  onSelect
}) => {
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);

  // Filter suggestions based on input value
  useEffect(() => {
    if (!value.trim()) {
      setFilteredSuggestions([]);
      return;
    }

    const filtered = suggestions.filter(
      suggestion => suggestion.toLowerCase().includes(value.toLowerCase())
    );
    
    setFilteredSuggestions(filtered.slice(0, 5)); // Limit to 5 suggestions
    setHighlightedIndex(-1);
  }, [value, suggestions]);

  // Handle input focus
  const handleFocus = () => {
    if (value && filteredSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Handle input blur
  const handleBlur = (e: React.FocusEvent) => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      setShowSuggestions(false);
    }, 150);
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    const fakeEvent = {
      target: {
        name,
        value: suggestion
      }
    } as React.ChangeEvent<HTMLInputElement>;

    onChange(fakeEvent);
    setShowSuggestions(false);
    
    if (onSelect) {
      onSelect(suggestion);
    }
    
    // Focus back on input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // If no suggestions are shown, don't handle arrow keys
    if (!showSuggestions || filteredSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSuggestionClick(filteredSuggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  // Scroll to highlighted suggestion
  useEffect(() => {
    if (highlightedIndex >= 0 && suggestionsRef.current) {
      const highlightedElement = suggestionsRef.current.children[highlightedIndex];
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [highlightedIndex]);

  return (
    <div className="relative">
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        ref={inputRef}
        type="text"
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        required={required}
        className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
          error ? 'border-red-300' : 'border-gray-300'
        } ${className}`}
        autoComplete="off"
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      
      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul 
          ref={suggestionsRef}
          className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`cursor-pointer select-none relative py-2 pl-3 pr-9 ${
                index === highlightedIndex
                  ? 'text-white bg-primary-600'
                  : 'text-gray-900 hover:bg-gray-100'
              }`}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutocompleteInput; 