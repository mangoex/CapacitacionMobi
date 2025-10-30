import React, { useState, useEffect } from 'react';
import { Training, Participant } from '../types';
import { PlusIcon, TrashIcon, CloseIcon } from './icons';

interface TrainingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (training: Training) => void;
  trainingToEdit: Training | null;
}

const TrainingFormModal: React.FC<TrainingFormModalProps> = ({ isOpen, onClose, onSave, trainingToEdit }) => {
  const isEditMode = !!trainingToEdit;
  
  const [trainingName, setTrainingName] = useState('');
  const [trainerName, setTrainerName] = useState('');
  const [objective, setObjective] = useState('');
  const [duration, setDuration] = useState<number | ''>('');
  const [investment, setInvestment] = useState<number | ''>('');
  const [requestingArea, setRequestingArea] = useState('');
  const [location, setLocation] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([{ id: '', name: '' }]);
  const [batchParticipants, setBatchParticipants] = useState('');

  const resetForm = () => {
    setTrainingName('');
    setTrainerName('');
    setObjective('');
    setDuration('');
    setInvestment('');
    setRequestingArea('');
    setLocation('');
    setScheduledDate('');
    setParticipants([{ id: '', name: '' }]);
    setBatchParticipants('');
  };

  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        setTrainingName(trainingToEdit.trainingName);
        setTrainerName(trainingToEdit.trainerName);
        setObjective(trainingToEdit.objective);
        setDuration(trainingToEdit.duration);
        setInvestment(trainingToEdit.investment);
        setRequestingArea(trainingToEdit.requestingArea);
        setLocation(trainingToEdit.location);
        setScheduledDate(trainingToEdit.scheduledDate);
        setParticipants(trainingToEdit.participants.length > 0 ? [...trainingToEdit.participants] : [{ id: '', name: '' }]);
        setBatchParticipants('');
      } else {
        resetForm();
      }
    }
  }, [isOpen, trainingToEdit, isEditMode]);

  const handleParticipantChange = (index: number, field: keyof Participant, value: string) => {
    const newParticipants = [...participants];
    newParticipants[index][field] = value;
    setParticipants(newParticipants);
  };

  const addParticipant = () => {
    setParticipants([...participants, { id: '', name: '' }]);
  };

  const removeParticipant = (index: number) => {
    const newParticipants = participants.filter((_, i) => i !== index);
    setParticipants(newParticipants);
  };

  const handleBatchAdd = () => {
    if (!batchParticipants.trim()) {
      alert("El área de texto para carga en lote está vacía.");
      return;
    }

    const newP: Participant[] = batchParticipants
      .trim()
      .split('\n')
      .map(line => {
          line = line.trim();
          if (!line) return null;

          const parts = line.split(',');
          if (parts.length === 1) {
              return { id: '', name: parts[0].trim() };
          }
          
          const id = parts[0].trim();
          const name = parts.slice(1).join(',').trim();
          return { id, name };
      })
      .filter((p): p is Participant => p !== null && !!p.name);

    if (newP.length === 0) {
      alert("No se encontraron participantes válidos. Asegúrese de que cada línea tenga al menos un nombre.");
      return;
    }

    const currentParticipants = participants.filter(p => p.name.trim() !== '');
    
    setParticipants([...currentParticipants, ...newP]);
    setBatchParticipants('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainingName || !trainerName || !objective || !duration || duration <= 0 || investment === '' || investment < 0 || !requestingArea || !location || !scheduledDate) {
        alert("Por favor, complete todos los campos de la capacitación, incluyendo la fecha programada, el lugar y la inversión.");
        return;
    }
    
    const validParticipants = participants
      .map(p => ({ id: p.id.trim(), name: p.name.trim() }))
      .filter(p => p.name !== '');

    if(validParticipants.length === 0) {
        alert("Debe agregar al menos un participante válido (con nombre).");
        return;
    }

    const trainingData: Training = {
      id: isEditMode ? trainingToEdit.id : new Date().toISOString(),
      trainingName,
      trainerName,
      objective,
      duration: Number(duration),
      investment: Number(investment),
      requestingArea,
      location,
      scheduledDate,
      participants: validParticipants,
      dateAdded: isEditMode ? trainingToEdit.dateAdded : new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    };
    onSave(trainingData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-10 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 my-8 relative animate-fade-in-down">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">{isEditMode ? 'Editar Capacitación' : 'Registrar Nueva Capacitación'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <CloseIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="trainingName" className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Capacitación</label>
              <input type="text" id="trainingName" value={trainingName} onChange={(e) => setTrainingName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label htmlFor="trainerName" className="block text-sm font-medium text-gray-700 mb-1">Nombre del Capacitador</label>
              <input type="text" id="trainerName" value={trainerName} onChange={(e) => setTrainerName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
          </div>
          <div>
            <label htmlFor="objective" className="block text-sm font-medium text-gray-700 mb-1">Objetivo</label>
            <textarea id="objective" value={objective} onChange={(e) => setObjective(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
              <label htmlFor="requestingArea" className="block text-sm font-medium text-gray-700 mb-1">Área Solicitante</label>
              <select id="requestingArea" value={requestingArea} onChange={(e) => setRequestingArea(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                <option value="" disabled>Seleccione un área</option>
                <option value="Administracion">Administracion</option>
                <option value="Comercial">Comercial</option>
                <option value="Produccion">Produccion</option>
              </select>
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Lugar</label>
              <input type="text" id="location" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
          </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">Duración (horas)</label>
                <input type="number" id="duration" value={duration} onChange={(e) => setDuration(e.target.value === '' ? '' : Number(e.target.value))} min="1" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
                <label htmlFor="investment" className="block text-sm font-medium text-gray-700 mb-1">Inversión ($)</label>
                <input type="number" id="investment" value={investment} onChange={(e) => setInvestment(e.target.value === '' ? '' : Number(e.target.value))} min="0" placeholder="Ej: 5000" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div className="md:col-span-1">
                <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-1">Fecha Programada</label>
                <input type="date" id="scheduledDate" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Participantes</h3>
            
            <div className="mb-4 p-4 bg-slate-50 rounded-lg border">
              <label htmlFor="batchParticipants" className="block text-sm font-medium text-gray-700 mb-2">
                Carga en Lote
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Pegue la lista de participantes, uno por línea. Formatos aceptados: <code className="bg-gray-200 px-1 rounded">ID,Nombre Completo</code> o solo <code className="bg-gray-200 px-1 rounded">Nombre Completo</code>.
              </p>
              <textarea
                id="batchParticipants"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="12345,Juan Pérez&#10;Ana García&#10;67890,Maria Lopez"
                value={batchParticipants}
                onChange={(e) => setBatchParticipants(e.target.value)}
              />
              <button
                type="button"
                onClick={handleBatchAdd}
                className="mt-2 px-4 py-2 bg-indigo-100 text-indigo-800 text-sm font-semibold rounded-md hover:bg-indigo-200 transition-colors"
              >
                Procesar Lote
              </button>
            </div>

            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
              {participants.map((p, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input type="text" placeholder="ID (Opcional)" value={p.id} onChange={(e) => handleParticipantChange(index, 'id', e.target.value)} className="w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="text" placeholder="Nombre completo" value={p.name} onChange={(e) => handleParticipantChange(index, 'name', e.target.value)} className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required/>
                  <button type="button" onClick={() => removeParticipant(index)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors">
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addParticipant} className="mt-4 flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
              <PlusIcon /> <span className="ml-2">Añadir Participante</span>
            </button>
          </div>

          <div className="p-6 bg-gray-50 -mx-6 -mb-6 mt-6 rounded-b-xl border-t border-gray-200 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">Cancelar</button>
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm">
                {isEditMode ? 'Guardar Cambios' : 'Guardar Capacitación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrainingFormModal;