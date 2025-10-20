import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { io } from 'socket.io-client';
import { barcodeAPI } from '../services/api';
import { useAuth } from './AuthContext';

const BarcodeContext = createContext();

// Barcode state management
const barcodeReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_BARCODES':
      return { ...state, barcodes: action.payload, loading: false };
    case 'ADD_BARCODE':
      return { 
        ...state, 
        barcodes: [action.payload, ...state.barcodes] 
      };
    case 'UPDATE_BARCODE':
      return {
        ...state,
        barcodes: state.barcodes.map(barcode =>
          barcode.id === action.payload.id ? action.payload : barcode
        )
      };
    case 'DELETE_BARCODE':
      return {
        ...state,
        barcodes: state.barcodes.filter(barcode => barcode.id !== action.payload.id)
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_SELECTED_BARCODE':
      return { ...state, selectedBarcode: action.payload };
    default:
      return state;
  }
};

const initialState = {
  barcodes: [],
  selectedBarcode: null,
  loading: true,
  error: null,
};

export const BarcodeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(barcodeReducer, initialState);
  const { isAuthenticated, user } = useAuth();
  const [socket, setSocket] = React.useState(null);

  // Initialize socket connection
  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem('authToken');
      const socketInstance = io(process.env.REACT_APP_API_URL || 'http://192.168.44.114:5001', {
        auth: { token }
      });

      setSocket(socketInstance);

      // Listen for real-time events
      socketInstance.on('barcode:created', (barcode) => {
        dispatch({ type: 'ADD_BARCODE', payload: barcode });
      });

      socketInstance.on('barcode:updated', (barcode) => {
        dispatch({ type: 'UPDATE_BARCODE', payload: barcode });
      });

      socketInstance.on('barcode:deleted', (data) => {
        dispatch({ type: 'DELETE_BARCODE', payload: data });
      });

      return () => {
        socketInstance.close();
      };
    }
  }, [isAuthenticated, user]);

  // Load barcodes on authentication
  useEffect(() => {
    if (isAuthenticated) {
      loadBarcodes();
    }
  }, [isAuthenticated]);

  const loadBarcodes = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await barcodeAPI.getAll();
      dispatch({ type: 'SET_BARCODES', payload: response.data });
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.response?.data?.message || 'Failed to load barcodes' 
      });
    }
  };

  const uploadBarcode = async (file) => {
    try {
      const formData = new FormData();
      formData.append('barcode', file);
      
      const response = await barcodeAPI.upload(formData);
      // Real-time update will handle adding to state
      return { success: true, barcode: response.data.barcode };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to upload barcode';
      return { success: false, error: errorMessage };
    }
  };

  const updateBarcode = async (id, data) => {
    try {
      const response = await barcodeAPI.update(id, data);
      // Real-time update will handle state update
      return { success: true, barcode: response.data.barcode };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update barcode';
      return { success: false, error: errorMessage };
    }
  };

  const deleteBarcode = async (id) => {
    try {
      await barcodeAPI.delete(id);
      // Real-time update will handle state update
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete barcode';
      return { success: false, error: errorMessage };
    }
  };

  const selectBarcode = (barcode) => {
    dispatch({ type: 'SET_SELECTED_BARCODE', payload: barcode });
  };

  const clearSelectedBarcode = () => {
    dispatch({ type: 'SET_SELECTED_BARCODE', payload: null });
  };

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const value = {
    ...state,
    loadBarcodes,
    uploadBarcode,
    updateBarcode,
    deleteBarcode,
    selectBarcode,
    clearSelectedBarcode,
    clearError,
  };

  return (
    <BarcodeContext.Provider value={value}>
      {children}
    </BarcodeContext.Provider>
  );
};

export const useBarcode = () => {
  const context = useContext(BarcodeContext);
  if (!context) {
    throw new Error('useBarcode must be used within a BarcodeProvider');
  }
  return context;
};