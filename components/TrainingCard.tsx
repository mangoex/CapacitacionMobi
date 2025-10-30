import React from 'react';
import { Training } from '../types';
import { ClockIcon, UsersIcon, CalendarIcon, EditIcon } from './icons';

interface TrainingCardProps {
  training: Training;
  onSelect: (training: Training) => void;
  onEdit: (training: Training) => void;
}

const TrainingCard: React.FC<TrainingCardProps> = ({ training, onSelect, onEdit }) => {

  const formattedDate = training.scheduledDate
    ? new Date(training.scheduledDate.replace(/-/g, '/')).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    : 'N/A';

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden">
      <div className="p-5 flex-grow">
        <p className="text-sm text-blue-600 font-semibold">{training.requestingArea}</p>
        <h3 className="text-lg font-bold text-gray-800 mt-1 mb-2 truncate">{training.trainingName}</h3>
        <p className="text-sm text-gray-500 mb-4">Capacitador: <span className="font-medium text-gray-600">{training.trainerName}</span></p>

        <div className="flex items-center text-xs text-gray-500 space-x-4">
            <span className="flex items-center"><CalendarIcon /> {formattedDate}</span>
            <span className="flex items-center"><ClockIcon /> {training.duration} horas</span>
            <span className="flex items-center"><UsersIcon /> {training.participants.length}</span>
        </div>
      </div>
      <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center gap-2">
        <button
          onClick={() => onSelect(training)}
          className="flex-1 text-center px-4 py-2 bg-blue-100 text-blue-800 text-sm font-semibold rounded-md hover:bg-blue-200 transition-colors"
        >
          Ver Detalles
        </button>
        <button
          onClick={() => onEdit(training)}
          className="p-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 hover:text-gray-800 transition-colors"
          aria-label="Editar capacitación"
        >
            <EditIcon/>
        </button>
      </div>
    </div>
  );
};

export default TrainingCard;