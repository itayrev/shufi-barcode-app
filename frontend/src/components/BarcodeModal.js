import React, { useState } from 'react';
import { 
  XMarkIcon, 
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowsPointingOutIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { useBarcode } from '../context/BarcodeContext';
import { formatDate } from '../utils/dateUtils';
import toast from 'react-hot-toast';

const BarcodeModal = ({ barcode, onClose }) => {
  const { updateBarcode, deleteBarcode } = useBarcode();
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [amount, setAmount] = useState(barcode.amount || 0);
  const [isUpdating, setIsUpdating] = useState(false);

  const imageUrl = `${process.env.REACT_APP_API_URL || 'http://192.168.44.114:5001'}/uploads/${barcode.filename}`;

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
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
        onClose();
      } else {
        toast.error(result.error);
      }
    }
  };

  // Handle ESC key to close modal
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isFullscreen, onClose]);

  return (
    <div className={`fixed inset-0 bg-black z-50 flex items-center justify-center ${
      isFullscreen ? 'bg-opacity-100' : 'bg-opacity-75'
    }`}>
      <div className={`relative max-w-4xl w-full mx-4 ${
        isFullscreen ? 'h-full flex items-center justify-center' : 'max-h-[90vh]'
      }`}>
        {!isFullscreen && (
          <div className="bg-white rounded-lg overflow-hidden animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-medium text-gray-900 truncate">
                  {barcode.original_name}
                </h2>
                <div className="flex items-center mt-1 text-sm text-gray-500">
                  <span>Uploaded by {barcode.uploaded_by_username}</span>
                  <span className="mx-2">•</span>
                  <span>{formatDate(barcode.created_at)}</span>
                </div>
              </div>
              
              {/* Status Badge */}
              <div className="flex items-center space-x-3">
                {barcode.is_used ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Used
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Available
                  </span>
                )}
                
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col lg:flex-row">
              {/* Image Section */}
              <div className="flex-1 bg-gray-100 flex items-center justify-center p-4 relative">
                {/* Zoom Controls */}
                <div className="absolute top-4 right-4 flex items-center space-x-2 bg-white rounded-lg shadow-md p-2 z-10">
                  <button
                    onClick={handleZoomOut}
                    className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
                    title="Zoom out"
                  >
                    <MagnifyingGlassMinusIcon className="h-5 w-5" />
                  </button>
                  <span className="text-sm text-gray-600 px-2">
                    {Math.round(scale * 100)}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
                    title="Zoom in"
                  >
                    <MagnifyingGlassPlusIcon className="h-5 w-5" />
                  </button>
                  <div className="h-4 w-px bg-gray-300" />
                  <button
                    onClick={handleFullscreen}
                    className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
                    title="Fullscreen"
                  >
                    <ArrowsPointingOutIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Image */}
                <img
                  src={imageUrl}
                  alt={barcode.original_name}
                  className="max-w-full max-h-96 object-contain cursor-pointer transition-transform"
                  style={{ transform: `scale(${scale})` }}
                  onClick={handleFullscreen}
                  onError={(e) => {
                    e.target.src = '/api/placeholder/400/300';
                    e.target.alt = 'Image not found';
                  }}
                />
              </div>

              {/* Details Section */}
              <div className="w-full lg:w-80 p-4 space-y-6">
                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount
                  </label>
                  {isEditing ? (
                    <form onSubmit={handleAmountSubmit} className="flex items-center space-x-2">
                      <input
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="input-field flex-1"
                        placeholder="Enter amount"
                        disabled={isUpdating}
                      />
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="p-2 text-green-600 hover:text-green-700"
                        title="Save"
                      >
                        <CheckCircleIcon className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setAmount(barcode.amount || 0);
                        }}
                        className="p-2 text-red-600 hover:text-red-700"
                        title="Cancel"
                      >
                        <XCircleIcon className="h-5 w-5" />
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center text-gray-900">
                        <CurrencyDollarIcon className="h-5 w-5 mr-2 text-gray-400" />
                        <span className="font-medium">${barcode.amount || 0}</span>
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

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={handleToggleUsed}
                    disabled={isUpdating}
                    className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                      barcode.is_used
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {barcode.is_used ? (
                      <>
                        <CheckCircleIcon className="h-5 w-5 mr-2" />
                        Mark as Available
                      </>
                    ) : (
                      <>
                        <XCircleIcon className="h-5 w-5 mr-2" />
                        Mark as Used
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                  >
                    <TrashIcon className="h-5 w-5 mr-2" />
                    Delete Barcode
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fullscreen Mode */}
        {isFullscreen && (
          <div className="relative">
            {/* Exit Fullscreen Button */}
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors z-10"
              title="Exit fullscreen"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            {/* Fullscreen Image */}
            <img
              src={imageUrl}
              alt={barcode.original_name}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                e.target.src = '/api/placeholder/800/600';
                e.target.alt = 'Image not found';
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BarcodeModal;