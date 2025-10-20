import React, { useState } from 'react';
import { 
  EyeIcon, 
  PencilIcon, 
  TrashIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  CurrencyDollarIcon 
} from '@heroicons/react/24/outline';
import { useBarcode } from '../context/BarcodeContext';
import { formatDate } from '../utils/dateUtils';
import toast from 'react-hot-toast';

const BarcodeListItem = ({ barcode }) => {
  const { selectBarcode, updateBarcode, deleteBarcode } = useBarcode();
  const [isEditing, setIsEditing] = useState(false);
  const [amount, setAmount] = useState(barcode.amount || 0);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleView = () => {
    selectBarcode(barcode);
  };

  const handleToggleUsed = async () => {
    setIsUpdating(true);
    const result = await updateBarcode(barcode.id, { 
      isUsed: !barcode.is_used 
    });
    
    if (result.success) {
      toast.success(`Barcode marked as ${!barcode.is_used ? 'used' : 'unused'}`);
    } else {
      toast.error(result.error);
    }
    setIsUpdating(false);
  };

  const handleAmountSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    
    const result = await updateBarcode(barcode.id, { amount: parseFloat(amount) });
    
    if (result.success) {
      toast.success('Amount updated successfully');
      setIsEditing(false);
    } else {
      toast.error(result.error);
    }
    setIsUpdating(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this barcode?')) {
      const result = await deleteBarcode(barcode.id);
      
      if (result.success) {
        toast.success('Barcode deleted successfully');
      } else {
        toast.error(result.error);
      }
    }
  };

  const imageUrl = `${process.env.REACT_APP_API_URL || 'http://192.168.44.114:5001'}/uploads/${barcode.filename}`;

  return (
    <li className="hover:bg-gray-50 transition-colors">
      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center min-w-0 flex-1">
            {/* Thumbnail */}
            <div className="flex-shrink-0">
              <img
                className="h-16 w-16 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                src={imageUrl}
                alt={barcode.original_name}
                onClick={handleView}
                onError={(e) => {
                  e.target.src = '/api/placeholder/64/64';
                  e.target.alt = 'Image not found';
                }}
              />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1 ml-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {barcode.original_name}
                </p>
                
                {/* Status Badge */}
                {barcode.is_used ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 ml-2">
                    Used
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
                    Available
                  </span>
                )}
              </div>

              {/* Amount */}
              <div className="flex items-center mb-2">
                {isEditing ? (
                  <form onSubmit={handleAmountSubmit} className="flex items-center space-x-2">
                    <input
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="input-field text-sm py-1 w-24"
                      placeholder="Amount"
                      disabled={isUpdating}
                    />
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="p-1 text-green-600 hover:text-green-700"
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setAmount(barcode.amount || 0);
                      }}
                      className="p-1 text-red-600 hover:text-red-700"
                    >
                      <XCircleIcon className="h-4 w-4" />
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-4 w-4 mr-1 text-gray-400" />
                    <span className="text-sm text-gray-600 mr-2">${barcode.amount || 0}</span>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Edit amount"
                    >
                      <PencilIcon className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Meta info */}
              <div className="flex items-center text-xs text-gray-500">
                <span>Uploaded by {barcode.uploaded_by_username}</span>
                <span className="mx-2">•</span>
                <span>{formatDate(barcode.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={handleView}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="View fullscreen"
            >
              <EyeIcon className="h-4 w-4" />
            </button>

            <button
              onClick={handleToggleUsed}
              disabled={isUpdating}
              className={`p-2 transition-colors ${
                barcode.is_used
                  ? 'text-green-400 hover:text-green-600'
                  : 'text-red-400 hover:text-red-600'
              } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={barcode.is_used ? 'Mark as available' : 'Mark as used'}
            >
              {barcode.is_used ? (
                <CheckCircleIcon className="h-4 w-4" />
              ) : (
                <XCircleIcon className="h-4 w-4" />
              )}
            </button>

            <button
              onClick={handleDelete}
              className="p-2 text-red-400 hover:text-red-600 transition-colors"
              title="Delete barcode"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </li>
  );
};

export default BarcodeListItem;