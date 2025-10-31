import React, { useState } from 'react';
import { Receipt } from '../types';
import { TrashIcon, EditIcon, SaveIcon, CancelIcon, CloudSlashIcon, SpinnerIcon, CheckCircleIcon } from './icons';
import { askAboutImage } from '../services/geminiService';

interface ReceiptItemProps {
  receipt: Receipt;
  onDelete: (id: string) => void;
  onUpdate: (receipt: Receipt) => void;
}

const StatusIndicator: React.FC<{ status: Receipt['status'] }> = ({ status }) => {
  switch (status) {
    case 'pending':
      return <CloudSlashIcon className="w-5 h-5 text-amber-500" title="Pending upload" />;
    case 'syncing':
      return <SpinnerIcon className="w-5 h-5 text-blue-500" title="Syncing..." />;
    case 'synced':
      return <CheckCircleIcon className="w-5 h-5 text-green-500" title="Synced" />;
    default:
      return null;
  }
}

export const ReceiptItem: React.FC<ReceiptItemProps> = ({ receipt, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedReceipt, setEditedReceipt] = useState<Receipt>(receipt);

  // State for chat feature
  const [chatPrompt, setChatPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState<{user: string, model: string}[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('merchant.')) {
        const key = name.split('.')[1] as 'original' | 'translated';
        setEditedReceipt(prev => ({ ...prev, merchant: { ...prev.merchant, [key]: value } }));
    } else {
        setEditedReceipt(prev => ({ ...prev, [name]: name === 'total' ? parseFloat(value) || 0 : value }));
    }
  };

  const handleSave = () => {
    onUpdate(editedReceipt);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditedReceipt(receipt);
    // Reset chat state on cancel
    setChatHistory([]);
    setChatPrompt('');
    setChatError(null);
    setIsEditing(false);
  }

  const handleAskGemini = async () => {
    if (!chatPrompt.trim() || !receipt.image) return;

    setIsChatLoading(true);
    setChatError(null);
    const currentPrompt = chatPrompt;
    setChatPrompt('');

    try {
        const base64Image = receipt.image.split(',')[1];
        const answer = await askAboutImage(base64Image, currentPrompt);
        setChatHistory(prev => [...prev, { user: currentPrompt, model: answer }]);
    } catch (err: any) {
        setChatError(err.message || 'Failed to get a response.');
    } finally {
        setIsChatLoading(false);
    }
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg flex flex-col sm:flex-row sm:space-x-4 hover:bg-gray-50 transition-colors">
      <img src={receipt.image} alt="Receipt thumbnail" className="w-full sm:w-24 h-auto sm:h-24 object-contain rounded-md flex-shrink-0 bg-gray-100 mb-4 sm:mb-0" />
      <div className="flex-grow">
        {isEditing ? (
             <div className="space-y-2">
                <input type="text" name="merchant.translated" value={editedReceipt.merchant.translated} onChange={handleEditChange} className="w-full p-1 border rounded text-lg font-semibold" placeholder="Merchant (EN)"/>
                <input type="text" name="merchant.original" value={editedReceipt.merchant.original} onChange={handleEditChange} className="w-full p-1 border rounded text-sm text-gray-500" placeholder="Merchant (JP)"/>
                <input type="date" name="date" value={editedReceipt.date} onChange={handleEditChange} className="w-full p-1 border rounded"/>
                <div className="flex space-x-2">
                    <input type="number" name="total" value={editedReceipt.total} onChange={handleEditChange} className="w-1/2 p-1 border rounded" placeholder="Total"/>
                    <input type="text" name="currency" value={editedReceipt.currency} onChange={handleEditChange} className="w-1/2 p-1 border rounded" placeholder="Currency"/>
                </div>

                {/* AI Chat Section */}
                <div className="mt-6 pt-4 border-t">
                  <h3 className="text-md font-semibold text-gray-800">Ask about this receipt</h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto my-2 p-2 bg-gray-50 rounded-md border">
                    {chatHistory.map((chat, index) => (
                      <div key={index}>
                        <p className="font-semibold text-gray-700 text-sm">{chat.user}</p>
                        <p className="text-gray-600 text-sm whitespace-pre-wrap">{chat.model}</p>
                      </div>
                    ))}
                    {isChatLoading && (
                      <div className="flex justify-center items-center p-2">
                          <SpinnerIcon className="w-5 h-5 text-blue-600" />
                      </div>
                    )}
                    {chatError && <p className="text-red-500 text-sm">{chatError}</p>}
                    {chatHistory.length === 0 && !isChatLoading && !chatError && (
                      <p className="text-gray-400 text-sm text-center p-2">Ask a question to get more details.</p>
                    )}
                  </div>
            
                  <div className="flex space-x-2">
                    <input 
                      type="text" 
                      value={chatPrompt}
                      onChange={(e) => setChatPrompt(e.target.value)}
                      placeholder="e.g., What items are listed?"
                      className="flex-grow border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      onKeyDown={(e) => e.key === 'Enter' && !isChatLoading && handleAskGemini()}
                      disabled={isChatLoading}
                    />
                    <button 
                      onClick={handleAskGemini} 
                      disabled={isChatLoading || !chatPrompt.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition disabled:bg-blue-300 disabled:cursor-not-allowed"
                      aria-label="Ask Gemini about the receipt"
                    >
                      Ask
                    </button>
                  </div>
                </div>
            </div>
        ) : (
            <>
                <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{receipt.merchant.translated}</h3>
                      <p className="text-sm text-gray-500 italic">{receipt.merchant.original}</p>
                    </div>
                    <StatusIndicator status={receipt.status} />
                </div>
                <p className="mt-2 text-2xl font-bold text-blue-600">
                  {new Intl.NumberFormat('ja-JP', { style: 'currency', currency: receipt.currency, minimumFractionDigits: 0 }).format(receipt.total)}
                </p>
            </>
        )}
      </div>
      <div className="flex flex-col space-y-2 flex-shrink-0 mt-4 sm:mt-0 sm:ml-4">
          {isEditing ? (
            <>
              <button onClick={handleSave} className="p-2 text-green-600 hover:bg-green-100 rounded-full" aria-label="Save changes"><SaveIcon className="w-5 h-5"/></button>
              <button onClick={handleCancel} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full" aria-label="Cancel edit"><CancelIcon className="w-5 h-5"/></button>
            </>
          ) : (
            <>
                <button onClick={() => setIsEditing(true)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full" aria-label="Edit receipt"><EditIcon className="w-5 h-5"/></button>
                <button onClick={() => onDelete(receipt.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full" aria-label="Delete receipt"><TrashIcon className="w-5 h-5"/></button>
            </>
          )}
      </div>
    </div>
  );
};