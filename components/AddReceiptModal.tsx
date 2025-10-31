import React, { useState, useRef } from 'react';
import { processReceiptImage, askAboutImage } from '../services/geminiService';
import { Receipt, ExtractedReceiptData } from '../types';
import { CameraIcon, SpinnerIcon, XIcon, PhotoIcon, ReceiptIcon } from './icons';

interface AddReceiptModalProps {
  onClose: () => void;
  onAddReceipt: (receipt: Omit<Receipt, 'id' | 'status'>) => void;
}

export const AddReceiptModal: React.FC<AddReceiptModalProps> = ({ onClose, onAddReceipt }) => {
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedReceiptData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // State for chat feature
  const [chatPrompt, setChatPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState<{user: string, model: string}[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImage(result);
        processImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (imageDataUrl: string) => {
    setIsLoading(true);
    setError(null);
    setExtractedData(null);
    try {
      const base64Image = imageDataUrl.split(',')[1];
      const data = await processReceiptImage(base64Image);
      setExtractedData(data);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAskGemini = async () => {
    if (!chatPrompt.trim() || !image) return;

    setIsChatLoading(true);
    setChatError(null);
    const currentPrompt = chatPrompt;
    setChatPrompt('');

    try {
      const base64Image = image.split(',')[1];
      const answer = await askAboutImage(base64Image, currentPrompt);
      setChatHistory(prev => [...prev, { user: currentPrompt, model: answer }]);
    } catch (err: any) {
      setChatError(err.message || 'Failed to get a response.');
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleSave = () => {
    if (extractedData && image) {
      onAddReceipt({
        image,
        ...extractedData,
      });
    }
  };

  const handleDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!extractedData) return;

    if(name.startsWith('merchant.')) {
        const key = name.split('.')[1] as 'original' | 'translated';
        setExtractedData(prev => prev ? { ...prev, merchant: { ...prev.merchant, [key]: value }} : null);
    } else {
        setExtractedData(prev => prev ? { ...prev, [name]: name === 'total' ? parseFloat(value) || 0 : value } : null);
    }
  };
  
  const triggerCameraInput = () => {
    cameraInputRef.current?.click();
  };

  const triggerGalleryInput = () => {
    galleryInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Add New Receipt</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><XIcon className="w-6 h-6"/></button>
        </div>

        <div className="p-6 overflow-y-auto">
          {!image ? (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg text-center p-6">
              <ReceiptIcon className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-700">Add a receipt</h3>
              <p className="text-sm text-gray-500 mb-6">Choose how you'd like to add your receipt image.</p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full justify-center">
                <button onClick={triggerCameraInput} className="flex items-center justify-center space-x-2 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition w-full sm:w-auto">
                    <CameraIcon className="w-6 h-6"/>
                    <span>Take Photo</span>
                </button>
                <button onClick={triggerGalleryInput} className="flex items-center justify-center space-x-2 bg-gray-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-800 transition w-full sm:w-auto">
                    <PhotoIcon className="w-6 h-6"/>
                    <span>From Gallery</span>
                </button>
              </div>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img src={image} alt="Receipt preview" className="w-full max-h-60 object-contain rounded-lg bg-gray-100" />
                {isLoading && (
                  <div className="absolute inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center rounded-lg">
                    <SpinnerIcon className="w-12 h-12 text-blue-600" />
                    <p className="mt-2 text-gray-700 font-medium">Analyzing receipt...</p>
                  </div>
                )}
              </div>
              
              {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}
              
              {extractedData && (
                <>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Merchant (English)</label>
                      <input type="text" name="merchant.translated" value={extractedData.merchant.translated} onChange={handleDataChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Merchant (Original)</label>
                      <input type="text" name="merchant.original" value={extractedData.merchant.original} onChange={handleDataChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date</label>
                      <input type="date" name="date" value={extractedData.date} onChange={handleDataChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                        <input type="number" name="total" value={extractedData.total} onChange={handleDataChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Currency</label>
                        <input type="text" name="currency" value={extractedData.currency} onChange={handleDataChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <h3 className="text-lg font-medium text-gray-800">Ask about this receipt</h3>
                    <p className="text-sm text-gray-500 mb-3">Get more details from the image, like a list of items.</p>
                    
                    <div className="space-y-2 max-h-32 overflow-y-auto mb-3 p-2 bg-gray-50 rounded-md border">
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
                        <p className="text-gray-400 text-sm text-center p-4">Ask a question to start the conversation.</p>
                      )}
                    </div>
              
                    <div className="flex space-x-2">
                      <input 
                        type="text" 
                        value={chatPrompt}
                        onChange={(e) => setChatPrompt(e.target.value)}
                        placeholder="e.g., What items were purchased?"
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
                </>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end space-x-3">
          <button onClick={onClose} className="bg-white hover:bg-gray-100 text-gray-700 font-semibold py-2 px-4 border border-gray-300 rounded-md shadow-sm transition">Cancel</button>
          <button onClick={handleSave} disabled={!extractedData || isLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition disabled:bg-blue-300 disabled:cursor-not-allowed">
            {isLoading ? 'Processing...' : 'Save Receipt'}
          </button>
        </div>
      </div>
    </div>
  );
};