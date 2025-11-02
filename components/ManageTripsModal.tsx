import React, { useState, useEffect } from 'react';
import { XIcon, EditIcon, TrashIcon, SaveIcon, CancelIcon, BriefcaseIcon } from './icons';
import { Trip } from '../types';
import { useTrips } from '../contexts/TripsContext';
import { useCurrency } from '../contexts/CurrencyContext';

interface ManageTripsModalProps {
  onClose: () => void;
  onAddTrip: (tripData: Omit<Trip, 'id'>) => void;
  onUpdateTrip: (trip: Trip) => void;
  onDeleteTrip: (id: string) => void;
}

export const ManageTripsModal: React.FC<ManageTripsModalProps> = ({
  onClose,
  onAddTrip,
  onUpdateTrip,
  onDeleteTrip,
}) => {
  const { trips } = useTrips();
  const { formatDate } = useCurrency();
  const [newTrip, setNewTrip] = useState({ name: '', startDate: '', endDate: '' });
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDeleteTripId, setConfirmingDeleteTripId] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, [newTrip, editingTrip]);

  const validateTrip = (trip: { name: string; startDate: string; endDate: string }, existingId?: string): boolean => {
    if (!trip.name.trim() || !trip.startDate || !trip.endDate) {
      setError('All fields are required.');
      return false;
    }
    if (new Date(trip.startDate) > new Date(trip.endDate)) {
      setError('Start date cannot be after end date.');
      return false;
    }
    const isDuplicate = trips.some(t => t.name.toLowerCase() === trip.name.trim().toLowerCase() && t.id !== existingId);
    if (isDuplicate) {
        setError(`A trip named "${trip.name.trim()}" already exists.`);
        return false;
    }
    return true;
  };

  const handleAdd = () => {
    if (!validateTrip(newTrip)) return;
    onAddTrip({ name: newTrip.name.trim(), startDate: newTrip.startDate, endDate: newTrip.endDate });
    setNewTrip({ name: '', startDate: '', endDate: '' });
  };

  const handleUpdate = () => {
    if (!editingTrip || !validateTrip(editingTrip, editingTrip.id)) return;
    onUpdateTrip({ ...editingTrip, name: editingTrip.name.trim()});
    setEditingTrip(null);
  };
  
  const handleDelete = (id: string) => {
    onDeleteTrip(id);
    setConfirmingDeleteTripId(null);
  }

  const handleStartEdit = (trip: Trip) => {
    setEditingTrip({ ...trip });
    setConfirmingDeleteTripId(null);
  };
  
  const handleCancelEdit = () => {
    setEditingTrip(null);
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Manage Trips</h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"><XIcon className="w-6 h-6"/></button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div>
            <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">My Trips</h3>
            <div className="space-y-2">
              {trips.length > 0 ? trips.map(trip => (
                <div key={trip.id} className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md">
                  {editingTrip?.id === trip.id ? (
                     <div className="space-y-3">
                        <input 
                            type="text"
                            value={editingTrip.name}
                            onChange={(e) => setEditingTrip({ ...editingTrip, name: e.target.value })}
                            className="w-full bg-white dark:bg-gray-600 border border-blue-500 rounded-md py-1 px-2 text-gray-900 dark:text-white"
                            autoFocus
                        />
                        <div className="grid grid-cols-2 gap-2">
                           <input type="date" value={editingTrip.startDate} onChange={(e) => setEditingTrip({...editingTrip, startDate: e.target.value})} className="w-full bg-white dark:bg-gray-600 border border-blue-500 rounded-md py-1 px-2 text-gray-900 dark:text-white" />
                           <input type="date" value={editingTrip.endDate} onChange={(e) => setEditingTrip({...editingTrip, endDate: e.target.value})} min={editingTrip.startDate} className="w-full bg-white dark:bg-gray-600 border border-blue-500 rounded-md py-1 px-2 text-gray-900 dark:text-white" />
                        </div>
                        <div className="flex justify-end items-center">
                            <button onClick={handleUpdate} className="p-1 text-green-600 hover:text-green-800" aria-label="Save"><SaveIcon className="w-5 h-5" /></button>
                            <button onClick={handleCancelEdit} className="p-1 text-gray-500 hover:text-gray-700" aria-label="Cancel"><CancelIcon className="w-5 h-5" /></button>
                        </div>
                     </div>
                  ) : (
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-200">{trip.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(trip.startDate)} to {formatDate(trip.endDate)}</p>
                        </div>
                        <div className="flex items-center">
                            {confirmingDeleteTripId === trip.id ? (
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-semibold text-red-600 dark:text-red-400">Delete?</span>
                                    <button onClick={() => handleDelete(trip.id)} className="p-1 text-green-600 hover:text-green-800" aria-label="Confirm delete"><SaveIcon className="w-5 h-5"/></button>
                                    <button onClick={() => setConfirmingDeleteTripId(null)} className="p-1 text-gray-500 hover:text-gray-700" aria-label="Cancel delete"><CancelIcon className="w-5 h-5"/></button>
                                </div>
                            ) : (
                                <>
                                    <button onClick={() => handleStartEdit(trip)} className="p-1 text-blue-600 hover:text-blue-800" aria-label="Edit"><EditIcon className="w-5 h-5"/></button>
                                    <button onClick={() => setConfirmingDeleteTripId(trip.id)} className="p-1 text-red-600 hover:text-red-800" aria-label="Delete"><TrashIcon className="w-5 h-5"/></button>
                                </>
                            )}
                        </div>
                    </div>
                  )}
                </div>
              )) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">You haven't added any trips yet.</p>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">Add New Trip</h3>
            <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                <input
                    type="text"
                    value={newTrip.name}
                    onChange={(e) => setNewTrip({...newTrip, name: e.target.value})}
                    placeholder="Trip Name (e.g., Japan 2024)"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Start Date</label>
                        <input type="date" value={newTrip.startDate} onChange={(e) => setNewTrip({...newTrip, startDate: e.target.value})} className="w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"/>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">End Date</label>
                        <input type="date" value={newTrip.endDate} onChange={(e) => setNewTrip({...newTrip, endDate: e.target.value})} min={newTrip.startDate} className="w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"/>
                    </div>
                </div>
                <button
                    onClick={handleAdd}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition"
                >
                    Add Trip
                </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
          <button onClick={onClose} className="bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm transition">Done</button>
        </div>
      </div>
    </div>
  );
};