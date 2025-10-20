import React from 'react';
import BarcodeCard from './BarcodeCard';
import BarcodeListItem from './BarcodeListItem';

const BarcodeGrid = ({ barcodes, viewMode }) => {
  if (viewMode === 'list') {
    return (
      <div className="card overflow-hidden">
        <div className="px-4 py-5 sm:p-0">
          <ul className="divide-y divide-gray-200">
            {barcodes.map((barcode) => (
              <BarcodeListItem key={barcode.id} barcode={barcode} />
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {barcodes.map((barcode) => (
        <BarcodeCard key={barcode.id} barcode={barcode} />
      ))}
    </div>
  );
};

export default BarcodeGrid;