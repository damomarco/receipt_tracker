import React, { useState, useRef, useEffect } from 'react';
import { askAboutAllReceipts } from '../services/geminiService';
import { XIcon, SpinnerIcon } from './icons';
import { useReceipts } from '../contexts/ReceiptsContext';

interface GlobalChatModalProps {
  onClose: () => void;
}

export const GlobalChatModal: React.FC<GlobalChatModalProps> = ({ onClose }) => {
  const { receipts } = useReceipts();
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState<{ user: string; model: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom on new message or when loading indicator appears
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [history, isLoading]);

  const handleAsk = async () => {
    if (!prompt.trim() || isLoading) return;

    const currentPrompt = prompt;
    setPrompt('');
    setIsLoading(true);
    setError(null);

    // Optimistically add user's prompt to history
    setHistory(prev => [...prev, { user: currentPrompt, model: '' }]);

    try {
      const answer = await askAboutAllReceipts(receipts, currentPrompt);
      // Update the last history item with the model's response
      setHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1].model = answer;
        return newHistory;
      });
    } catch (err: any) {
      setError(err.message || 'Failed to get a response.');
      // Remove the optimistic user prompt from history on error
      setHistory(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const examplePrompts = [
    "How much did I spend in total?",
    "What was my most expensive purchase?",
    "List all my expenses on food.",
    "How many receipts do I have from 7-Eleven?",
  ];

  const handleExamplePrompt = (example: string) => {
    setPrompt(example);
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl h-[85vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-center text-gray-900 dark:text-gray-100">Ask About Receipts</h2>
        </div>

        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all z-10" 
          aria-label="Close chat"
        >
          <XIcon className="w-6 h-6"/>
        </button>

        <div ref={chatContainerRef} className="flex-grow p-6 overflow-y-auto space-y-6">
          {history.length === 0 && !isLoading && (
             <div className="text-center text-gray-500 dark:text-gray-400">
                <p className="mb-4">Ask me anything about your saved receipts.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    {examplePrompts.map((p, i) => (
                        <button key={i} onClick={() => handleExamplePrompt(p)} className="p-3 bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition text-left text-gray-700 dark:text-gray-300">
                            "{p}"
                        </button>
                    ))}
                </div>
             </div>
          )}
          {history.map((chat, index) => (
            <div key={index}>
              <div className="font-semibold text-gray-800 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">{chat.user}</div>
              <div className="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-wrap pl-2 leading-relaxed">{chat.model}</div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-center items-center p-4">
              <SpinnerIcon className="w-6 h-6 text-purple-600" />
            </div>
          )}
          {error && <p className="text-red-500 text-sm p-2 bg-red-50 dark:bg-red-900/50 rounded-md">{error}</p>}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex space-x-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., How much did I spend yesterday?"
              className="flex-grow border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleAsk()}
              disabled={isLoading}
            />
            <button
              onClick={handleAsk}
              disabled={isLoading || !prompt.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition disabled:bg-purple-300 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              Ask
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};