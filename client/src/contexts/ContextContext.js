import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { contextsAPI } from '../services/api';

const ContextContext = createContext();

export const useContexts = () => {
  const context = useContext(ContextContext);
  if (!context) {
    throw new Error('useContexts must be used within a ContextProvider');
  }
  return context;
};

export const ContextProvider = ({ children }) => {
  const [contexts, setContexts] = useState([]);
  const [selectedContext, setSelectedContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContexts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await contextsAPI.getAll();
      setContexts(response.data);
      
      // Set first context as selected if none selected
      if (response.data.length > 0 && !selectedContext) {
        setSelectedContext(response.data[0]);
      }
    } catch (err) {
      setError('Failed to fetch contexts');
      console.error('Error fetching contexts:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedContext]);

  const createContext = async (contextData) => {
    try {
      const response = await contextsAPI.create(contextData);
      setContexts(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError('Failed to create context');
      throw err;
    }
  };

  const updateContext = async (id, contextData) => {
    try {
      const response = await contextsAPI.update(id, contextData);
      setContexts(prev => prev.map(c => c.id === id ? response.data : c));
      if (selectedContext && selectedContext.id === id) {
        setSelectedContext(response.data);
      }
      return response.data;
    } catch (err) {
      setError('Failed to update context');
      throw err;
    }
  };

  const deleteContext = async (id) => {
    try {
      await contextsAPI.delete(id);
      setContexts(prev => prev.filter(c => c.id !== id));
      
      // If deleted context was selected, select another one
      if (selectedContext && selectedContext.id === id) {
        const remainingContexts = contexts.filter(c => c.id !== id);
        setSelectedContext(remainingContexts.length > 0 ? remainingContexts[0] : null);
      }
    } catch (err) {
      setError('Failed to delete context');
      throw err;
    }
  };

  useEffect(() => {
    fetchContexts();
  }, [fetchContexts]);

  const value = {
    contexts,
    selectedContext,
    setSelectedContext,
    loading,
    error,
    createContext,
    updateContext,
    deleteContext,
    fetchContexts,
  };

  return (
    <ContextContext.Provider value={value}>
      {children}
    </ContextContext.Provider>
  );
};
