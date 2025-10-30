import React, { useRef } from 'react';
import { Training, Participant } from '../types';
import TrainingCard from './TrainingCard';
import { DownloadIcon, UploadIcon } from './icons';

interface TrainingListProps {
  trainings: Training[];
  onSelectTraining: (training: Training) => void;
  onEditTraining: (training: Training) => void;
  onBatchAdd: (trainings: Training[]) => void;
}

const TrainingList: React.FC<TrainingListProps> = ({ trainings, onSelectTraining, onEditTraining, onBatchAdd }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleDownloadTemplate = () => {
    const headers = [
      "trainingName", "trainerName", "objective", "duration", "investment", "requestingArea", 
      "location", "scheduledDate", "participants"
    ];
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + 
    '\n"Curso de Ejemplo","Entrenador Ejemplo","Objetivo de ejemplo",8,5000,"Produccion","Sala de Juntas","2025-01-15","101:Juan Perez|102:Maria Lopez"';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "plantilla_capacitaciones.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text !== 'string') return;
      
      try {
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const requiredHeaders = ["trainingName", "trainerName", "objective", "duration", "investment", "requestingArea", "location", "scheduledDate", "participants"];
        
        if(!requiredHeaders.every(h => headers.includes(h))) {
            throw new Error("El archivo CSV no tiene las columnas requeridas.");
        }

        const newTrainings: Training[] = lines.slice(1).map(line => {
          const data = line.split(',').map(d => d.trim().replace(/"/g, ''));
          const trainingObject: any = {};
          headers.forEach((header, index) => {
            trainingObject[header] = data[index];
          });

          const participants: Participant[] = (trainingObject.participants || '')
            .split('|')
            .map((pStr: string) => {
              const [id, ...nameParts] = pStr.split(':');
              const name = nameParts.join(':');
              return (id && name) ? { id: id.trim(), name: name.trim() } : null;
            })
            .filter((p: Participant | null): p is Participant => p !== null);

          return {
            id: new Date().toISOString() + Math.random(),
            trainingName: trainingObject.trainingName,
            trainerName: trainingObject.trainerName,
            objective: trainingObject.objective,
            duration: Number(trainingObject.duration),
            investment: Number(trainingObject.investment),
            requestingArea: trainingObject.requestingArea,
            location: trainingObject.location,
            scheduledDate: trainingObject.scheduledDate,
            participants,
            dateAdded: new Date().toLocaleDateString('es-ES'),
          };
        });
        
        const validTrainings = newTrainings.filter(t => t.trainingName && t.trainerName && t.scheduledDate && t.duration > 0 && t.investment >= 0);
        if(validTrainings.length === 0){
           throw new Error("No se encontraron capacitaciones válidas en el archivo.");
        }

        onBatchAdd(validTrainings);
      } catch (error) {
        alert(`Error al procesar el archivo: ${error instanceof Error ? error.message : "Formato inválido"}`);
      } finally {
        // Reset file input
        if (event.target) {
            event.target.value = '';
        }
      }
    };
    reader.readAsText(file, 'UTF-8');
  };


  if (trainings.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">No hay capacitaciones registradas</h3>
        <p className="mt-1 text-sm text-gray-500">Comience registrando una nueva capacitación o importe datos en lote.</p>
        
        <div className="mt-6 border-t pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 w-full sm:w-auto justify-center px-4 py-2 bg-teal-600 text-white font-semibold rounded-md hover:bg-teal-700 transition-colors"
            >
              <DownloadIcon />
              <span>Descargar Plantilla</span>
            </button>
            <button
               onClick={handleImportClick}
               className="flex items-center gap-2 w-full sm:w-auto justify-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors"
            >
              <UploadIcon />
              <span>Importar desde CSV</span>
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".csv"
                onChange={handleFileImport}
            />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {trainings.map((training) => (
        <TrainingCard 
            key={training.id} 
            training={training} 
            onSelect={onSelectTraining}
            onEdit={onEditTraining} 
        />
      ))}
    </div>
  );
};

export default TrainingList;