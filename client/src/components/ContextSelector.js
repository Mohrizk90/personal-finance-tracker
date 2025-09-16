import React, { useState } from 'react';
import { useContexts } from '../contexts/ContextContext';
import ContextModal from './ContextModal';

const ContextSelector = () => {
  const { contexts, selectedContext, setSelectedContext, loading } = useContexts();
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 w-48 bg-gray-200 rounded-md"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center space-x-3">
        <select
          value={selectedContext?.id || ''}
          onChange={(e) => {
            const context = contexts.find(c => c.id === e.target.value);
            setSelectedContext(context);
          }}
          className="block w-48 px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm font-medium bg-white"
        >
          {contexts.map((context) => (
            <option key={context.id} value={context.id}>
              {context.name} ({context.type})
            </option>
          ))}
        </select>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-semibold rounded-xl text-gray-700 bg-white hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
        >
          <span className="mr-2">⚙️</span>
          Manage
        </button>
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl z-50 border border-gray-200">
          <div className="py-2">
            <button
              onClick={() => {
                setShowModal(true);
                setIsOpen(false);
              }}
              className="block w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 hover:text-primary-700 transition-all duration-200"
            >
              <span className="mr-2">➕</span>
              Add New Context
            </button>
            {contexts.length > 0 && (
              <button
                onClick={() => {
                  // TODO: Implement edit context
                  setIsOpen(false);
                }}
                className="block w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-gray-900 transition-all duration-200"
              >
                <span className="mr-2">✏️</span>
                Edit Contexts
              </button>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {showModal && (
        <ContextModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
          }}
        />
      )}
    </>
  );
};

export default ContextSelector;
