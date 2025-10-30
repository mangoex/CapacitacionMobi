import React, { useState, useMemo } from 'react';
import { Participant } from '../types';
import { CloseIcon, SearchIcon } from './icons';

interface ParticipantFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  onSelectParticipant: (participant: Participant) => void;
  onClearFilter: () => void;
}

const normalizeString = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

const ParticipantFilterModal: React.FC<ParticipantFilterModalProps> = ({
  isOpen,
  onClose,
  participants,
  onSelectParticipant,
  onClearFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredParticipants = useMemo(() => {
    const normalizedTerm = normalizeString(searchTerm);
    if (!normalizedTerm) return participants;
    return participants.filter(
      p =>
        normalizeString(p.name).includes(normalizedTerm) ||
        normalizeString(p.id).includes(normalizedTerm)
    );
  }, [participants, searchTerm]);
  
  const handleSelect = (participant: Participant) => {
    onSelectParticipant(participant);
    onClose();
  };

  const handleClear = () => {
    onClearFilter();
    onClose();
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-fade-in-down flex flex-col">
        <div className="p-5 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Seleccionar Participante</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <CloseIcon />
          </button>
        </div>

        <div className="p-5 border-b border-gray-200">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Buscar por nombre o ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-grow p-5 overflow-y-auto" style={{ maxHeight: '60vh' }}>
            {filteredParticipants.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                    {filteredParticipants.map(p => (
                        <li key={p.id || p.name} >
                            <button 
                                onClick={() => handleSelect(p)}
                                className="w-full text-left p-3 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <p className="font-semibold text-gray-800">{p.name}</p>
                                <p className="text-sm text-gray-500">ID: {p.id || 'N/D'}</p>
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-center text-gray-500 py-8">No se encontraron participantes.</p>
            )}
        </div>
        
        <div className="p-4 bg-gray-50 rounded-b-xl border-t border-gray-200 flex justify-end gap-3">
          <button onClick={handleClear} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
            Mostrar Todos
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParticipantFilterModal;