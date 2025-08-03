'use client';

import { useEffect, useCallback } from 'react';

interface UseDraftKeyboardNavigationProps {
  onSearch?: () => void;
  onDraft?: () => void;
  onOpenResearch?: () => void;
  onCompare?: () => void;
  onNextPlayer?: () => void;
  onPrevPlayer?: () => void;
  onToggleFilters?: () => void;
  onEscape?: () => void;
  isEnabled?: boolean;
}

export function useDraftKeyboardNavigation({
  onSearch,
  onDraft,
  onOpenResearch,
  onCompare,
  onNextPlayer,
  onPrevPlayer,
  onToggleFilters,
  onEscape,
  isEnabled = true
}: UseDraftKeyboardNavigationProps) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isEnabled) return;

    // Don't trigger shortcuts when typing in input fields
    if (event.target instanceof HTMLInputElement || 
        event.target instanceof HTMLTextAreaElement) {
      // Allow Escape even in input fields
      if (event.key === 'Escape') {
        (event.target as HTMLElement).blur();
        onEscape?.();
      }
      return;
    }

    // Keyboard shortcuts
    switch (event.key) {
      case '/':
      case 'f':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          onSearch?.();
        }
        break;
      
      case 'd':
        if (!event.ctrlKey && !event.metaKey) {
          event.preventDefault();
          onDraft?.();
        }
        break;
      
      case 'r':
        if (!event.ctrlKey && !event.metaKey) {
          event.preventDefault();
          onOpenResearch?.();
        }
        break;
      
      case 'c':
        if (!event.ctrlKey && !event.metaKey) {
          event.preventDefault();
          onCompare?.();
        }
        break;
      
      case 'ArrowDown':
      case 'j':
        event.preventDefault();
        onNextPlayer?.();
        break;
      
      case 'ArrowUp':
      case 'k':
        event.preventDefault();
        onPrevPlayer?.();
        break;
      
      case 'Tab':
        if (event.shiftKey) {
          event.preventDefault();
          onToggleFilters?.();
        }
        break;
      
      case 'Escape':
        event.preventDefault();
        onEscape?.();
        break;
      
      case '?':
        if (event.shiftKey) {
          event.preventDefault();
          showKeyboardShortcuts();
        }
        break;
    }
  }, [
    isEnabled,
    onSearch,
    onDraft,
    onOpenResearch,
    onCompare,
    onNextPlayer,
    onPrevPlayer,
    onToggleFilters,
    onEscape
  ]);

  useEffect(() => {
    if (isEnabled) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isEnabled, handleKeyDown]);

  return {
    shortcuts: [
      { key: '/', description: 'Search players' },
      { key: 'D', description: 'Draft selected player' },
      { key: 'R', description: 'Research player' },
      { key: 'C', description: 'Compare players' },
      { key: '↑/↓', description: 'Navigate players' },
      { key: 'J/K', description: 'Navigate players (vim)' },
      { key: 'Tab', description: 'Toggle filters' },
      { key: 'Esc', description: 'Close modal/Clear' },
      { key: '?', description: 'Show shortcuts' }
    ]
  };
}

function showKeyboardShortcuts() {
  // This would typically show a modal with keyboard shortcuts
  // For now, we'll log them to console
  console.log(`
    Draft Keyboard Shortcuts:
    ------------------------
    / or Ctrl+F : Search players
    D          : Draft selected player
    R          : Research player details
    C          : Compare players
    ↑/↓ or J/K : Navigate players
    Shift+Tab  : Toggle filters
    Esc        : Close modal/Clear selection
    ?          : Show this help
  `);
}

// Hook for accessibility announcements
export function useAriaAnnouncer() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = message;
    
    document.body.appendChild(announcer);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  }, []);

  return { announce };
}