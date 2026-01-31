'use client';

import { useState } from 'react';

interface WishListItem {
  id: string;
  name: string;
  price: string;
}

const wishListItems: WishListItem[] = [
  { id: '1', name: 'Hisense Freezer Inverter 198L', price: '₦320,500' },
  { id: '2', name: 'LG Split AC 1.5HP Dual Inverter with Gen Mode', price: '₦519,600' },
  { id: '3', name: 'LG 1HP Gen Cool Mode AC', price: '₦460,000' },
  { id: '4', name: 'Solar Generator', price: '₦500,000' },
  { id: '5', name: 'Maxi Air Fryer 8.5L', price: '₦94,500' },
  { id: '6', name: 'Maxi Hand Blender/Mixer 600W', price: '₦38,000' },
  { id: '7', name: 'Buchymix Premium Masticating Cold Pressed Juicer with High Torque Motor', price: '₦220,000' },
  { id: '8', name: 'Trip to Umrah / Trip to Qatar', price: 'Contact Us' },
  { id: '9', name: 'Granite Pot Set', price: '₦230,000' },
  { id: '10', name: 'Ceramic Dinner Set', price: '₦86,000' },
  { id: '11', name: 'Nexus Gas Cooker 60×60 4G Wood', price: '₦299,900' },
  { id: '12', name: 'Maxi Pressure Cooker 6L, 1000W', price: '₦69,500' },
  { id: '13', name: 'Cash Gift', price: 'Any Amount' },
];

// Account Details Modal Component
function AccountDetailsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const accountNumber = '2208829386';
  const bank = 'Zenith Bank';
  const accountName = 'Salami Rofiyat Oyindamola';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = accountNumber;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-amber-900 hover:text-amber-600 text-2xl font-bold leading-none focus:outline-none focus:ring-2 focus:ring-amber-600 rounded"
          aria-label="Close modal"
        >
          ×
        </button>

        {/* Modal Content */}
        <div className="mt-2">
          <h2 id="modal-title" className="text-2xl font-bold text-amber-900 mb-6">
            Account Details
          </h2>

          <div className="space-y-4">
            {/* Account Number */}
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-2">
                Account Number
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <span className="text-lg font-mono font-semibold text-amber-900">
                    {accountNumber}
                  </span>
                </div>
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-2 flex items-center gap-2 min-w-[100px] justify-center"
                  aria-label="Copy account number"
                >
                  {copied ? (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Bank */}
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-2">
                Bank
              </label>
              <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                <span className="text-lg font-semibold text-amber-900">
                  {bank}
                </span>
              </div>
            </div>

            {/* Account Name */}
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-2">
                Account Name
              </label>
              <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                <span className="text-lg font-semibold text-amber-900">
                  {accountName}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-6 pt-4 border-t border-amber-200">
            <p className="text-sm text-amber-700 text-center">
              Thank you for your generous gift!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WishListPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-amber-900 mb-4">Wish List</h1>
          <p className="text-lg text-amber-800 max-w-2xl mx-auto">
            Your presence is enough, but for those who wish to give…
          </p>
        </div>

        {/* Wish List Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishListItems.map((item) => {
            const isCashGift = item.id === '13';
            return (
              <div
                key={item.id}
                className="bg-white border border-amber-900/20 rounded-lg p-6 hover:border-amber-600 hover:shadow-md transition-all duration-200"
              >
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-amber-900 mb-3">
                    {item.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-amber-700">
                      {item.price}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (isCashGift) {
                      setIsModalOpen(true);
                    } else {
                      window.open('https://wa.me/2348160364243', '_blank');
                    }
                  }}
                  className="w-full mt-4 px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-2"
                >
                  Contact Us to Gift
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Account Details Modal */}
      <AccountDetailsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
