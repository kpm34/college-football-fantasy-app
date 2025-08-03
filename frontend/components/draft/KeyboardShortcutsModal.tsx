'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { category: 'Navigation', items: [
    { keys: ['↑', '↓'], description: 'Navigate up/down through players' },
    { keys: ['J', 'K'], description: 'Navigate up/down (Vim style)' },
    { keys: ['Tab'], description: 'Move to next element' },
    { keys: ['Shift', 'Tab'], description: 'Toggle filters panel' },
  ]},
  { category: 'Actions', items: [
    { keys: ['D'], description: 'Draft selected player' },
    { keys: ['R'], description: 'Research player details' },
    { keys: ['C'], description: 'Compare selected players' },
    { keys: ['Enter'], description: 'Confirm action' },
  ]},
  { category: 'Search & Filter', items: [
    { keys: ['/'], description: 'Focus search input' },
    { keys: ['Ctrl', 'F'], description: 'Focus search input' },
    { keys: ['1-6'], description: 'Filter by position (1=QB, 2=RB, etc.)' },
    { keys: ['0'], description: 'Clear all filters' },
  ]},
  { category: 'General', items: [
    { keys: ['Esc'], description: 'Close modal / Clear selection' },
    { keys: ['?'], description: 'Show keyboard shortcuts' },
    { keys: ['Ctrl', 'Z'], description: 'Undo last action (if available)' },
  ]},
];

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-slate-900 p-6 text-left align-middle shadow-xl transition-all border border-slate-700">
                <Dialog.Title as="div" className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold chrome-text">Keyboard Shortcuts</h3>
                  <button
                    onClick={onClose}
                    className="rounded-lg p-2 hover:bg-slate-800 transition-colors"
                    aria-label="Close modal"
                  >
                    <XMarkIcon className="w-5 h-5 text-slate-400" />
                  </button>
                </Dialog.Title>

                <div className="space-y-6">
                  {shortcuts.map((section) => (
                    <div key={section.category}>
                      <h4 className="text-lg font-semibold text-white mb-3">{section.category}</h4>
                      <div className="space-y-2">
                        {section.items.map((shortcut, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50"
                          >
                            <span className="text-sm text-slate-300">{shortcut.description}</span>
                            <div className="flex items-center gap-1">
                              {shortcut.keys.map((key, keyIndex) => (
                                <Fragment key={keyIndex}>
                                  {keyIndex > 0 && (
                                    <span className="text-xs text-slate-500 mx-1">+</span>
                                  )}
                                  <kbd className="px-2 py-1 text-xs font-semibold text-slate-300 bg-slate-700 border border-slate-600 rounded">
                                    {key}
                                  </kbd>
                                </Fragment>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-sm text-blue-400">
                    <strong>Pro tip:</strong> Enable keyboard navigation for faster drafting. 
                    Press <kbd className="px-1 py-0.5 text-xs bg-blue-900/50 rounded">Tab</kbd> to 
                    navigate between elements.
                  </p>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}