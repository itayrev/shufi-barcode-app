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

const BarcodeCard = ({ barcode }) => {
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
    <div className="card overflow-hidden hover:shadow-lg transition-shadow animate-fade-in">
      {/* Image */}
      <div className="relative">
        <img
          src={imageUrl}
          alt={barcode.original_name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.src = '/api/placeholder/300/200';
            e.target.alt = 'Image not found';
          }}
        />
        
        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          {barcode.is_used ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Used
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Available
            </span>
          )}
        </div>

        {/* View Button */}
        <button
          onClick={handleView}
          className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100"
        >
          <EyeIcon className="h-8 w-8 text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Filename */}
        <h3 className="text-sm font-medium text-gray-900 truncate mb-2">
          {barcode.original_name}
        </h3>

        {/* Amount */}
        <div className="mb-3">
          {isEditing ? (
            <form onSubmit={handleAmountSubmit} className="flex items-center space-x-2">
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-field text-sm py-1"
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
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                <span>${barcode.amount || 0}</span>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-gray-400 hover:text-gray-600"
                title="Edit amount"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Meta Info */}
        <div className="text-xs text-gray-500 mb-3">
          <div>Uploaded by: {barcode.uploaded_by_username}</div>
          <div>{formatDate(barcode.created_at)}</div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleToggleUsed}
            disabled={isUpdating}
            className={`flex items-center text-sm px-3 py-1 rounded-md transition-colors ${
              barcode.is_used
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {barcode.is_used ? (
              <>
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                Mark Available
              </>
            ) : (
              <>
                <XCircleIcon className="h-4 w-4 mr-1" />
                Mark Used
              </>
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
  );
};

export default BarcodeCard;