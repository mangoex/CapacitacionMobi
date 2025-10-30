import React, { useState, useEffect } from 'react';
import { Training } from './types';
import Dashboard from './components/Dashboard';
import TrainingFormModal from './components/TrainingFormModal';
import TrainingDetailModal from './components/TrainingDetailModal';
import { PlusIcon, TrashIcon } from './components/icons';

const App: React.FC = () => {
  const [trainings, setTrainings] = useState<Training[]>(() => {
    try {
      const savedTrainings = localStorage.getItem('trainings');
      return savedTrainings ? JSON.parse(savedTrainings) : [];
    } catch (error) {
      console.error("Could not parse trainings from localStorage", error);
      return [];
    }
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [trainingToEdit, setTrainingToEdit] = useState<Training | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('trainings', JSON.stringify(trainings));
    } catch (error) {
       console.error("Could not save trainings to localStorage", error);
    }
  }, [trainings]);
  
  const handleSaveTraining = (trainingData: Training) => {
    const isEditing = trainings.some(t => t.id === trainingData.id);

    if (isEditing) {
        setTrainings(trainings.map(t => t.id === trainingData.id ? trainingData : t));
    } else {
        setTrainings([trainingData, ...trainings]);
    }
  };
  
  const handleBatchAddTrainings = (newTrainings: Training[]) => {
      setTrainings(prevTrainings => [...newTrainings, ...prevTrainings]);
      alert(`${newTrainings.length} capacitaciones importadas con éxito!`);
  };

  const handleOpenFormForNew = () => {
    setTrainingToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenFormForEdit = (training: Training) => {
    setSelectedTraining(null); // Close detail modal if open
    setTrainingToEdit(training);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setTrainingToEdit(null);
  };

  const handleSelectTraining = (training: Training) => {
    setSelectedTraining(training);
  };

  const closeDetailModal = () => {
    setSelectedTraining(null);
  };
  
  const handleClearDatabase = () => {
    if (window.confirm("¿Estás seguro de que quieres eliminar TODOS los datos de capacitaciones? Esta acción no se puede deshacer.")) {
        try {
            localStorage.removeItem('trainings');
            setTrainings([]);
            setSelectedTraining(null); // Close any open detail modal
            alert("La base de datos ha sido limpiada.");
        } catch (error) {
            console.error("Could not clear trainings from localStorage", error);
            alert("Ocurrió un error al limpiar la base de datos.");
        }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-gray-800">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-700">Sistema de Registro de Capacitaciones</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenFormForNew}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <PlusIcon />
              <span>Registrar</span>
            </button>
            <button
                onClick={handleClearDatabase}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                title="Elimina todos los datos de capacitaciones"
            >
                <TrashIcon />
                <span>Limpiar BD</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Dashboard 
            trainings={trainings}
            onSelectTraining={handleSelectTraining}
            onEditTraining={handleOpenFormForEdit}
            onBatchAddTrainings={handleBatchAddTrainings}
        />
      </main>

      <TrainingFormModal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={handleSaveTraining}
        trainingToEdit={trainingToEdit}
      />
      
      <TrainingDetailModal
        training={selectedTraining}
        onClose={closeDetailModal}
        onEdit={handleOpenFormForEdit}
      />
    </div>
  );
};

export default App;