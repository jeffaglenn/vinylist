'use client'

import { useEffect } from 'react'

interface ConfirmationDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  isDestructive?: boolean
}

export default function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDestructive = false
}: ConfirmationDialogProps) {
  // Close dialog on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when dialog is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onCancel}
      />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 transform transition-all">
        {/* Icon */}
        <div className="mb-4 flex justify-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isDestructive ? 'bg-red-100' : 'bg-yellow-100'
          }`}>
            <span className="text-2xl">
              {isDestructive ? '⚠️' : '❓'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {title}
          </h3>
          <p className="text-gray-600">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 text-white rounded-md transition-colors focus:outline-none focus:ring-2 ${
              isDestructive 
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-300' 
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-300'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
} 