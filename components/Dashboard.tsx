import React, { useState, useMemo, useEffect } from 'react';
import { Training, Participant } from '../types';
import TrainingList from './TrainingList';
import ParticipantFilterModal from './ParticipantFilterModal';
import { ChartBarIcon, FilterIcon, UsersIcon, ClockIcon, SearchIcon, DownloadIcon, CurrencyDollarIcon, CashIcon } from './icons';

interface DashboardProps {
  trainings: Training[];
  onSelectTraining: (training: Training) => void;
  onEditTraining: (training: Training) => void;
  onBatchAddTrainings: (trainings: Training[]) => void;
}

const normalizeString = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
    <div className="bg-blue-100 text-blue-600 rounded-full p-3 mr-4">{icon}</div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const TrainingChart: React.FC<{ data: { area: string; value: number }[], metricLabel: string }> = ({ data, metricLabel }) => {
  const AREA_COLORS: { [key: string]: string } = {
    'Administracion': 'bg-sky-500 hover:bg-sky-600',
    'Comercial': 'bg-emerald-500 hover:bg-emerald-600',
    'Produccion': 'bg-indigo-500 hover:bg-indigo-600',
    'default': 'bg-slate-500 hover:bg-slate-600'
  };

  const maxValue = useMemo(() => {
    const max = Math.max(...data.map(d => d.value), 0);
    if (max === 0) return 10;
    // Calculate a "nice" top value for the y-axis
    const exponent = Math.pow(10, Math.floor(Math.log10(max)));
    const niceMax = Math.ceil(max / exponent) * exponent;
    return niceMax > 0 ? niceMax : 1;
  }, [data]);
  
  const yAxisSteps = useMemo(() => {
    const numSteps = 4;
    const stepSize = maxValue / numSteps;
    return Array.from({ length: numSteps + 1 }, (_, i) => i * stepSize).reverse();
  }, [maxValue]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 bg-slate-50 rounded-lg">
        <p className="text-gray-500">No hay datos para mostrar con los filtros actuales.</p>
      </div>
    );
  }

  const formatValue = (value: number) => {
      if (metricLabel === '$') {
          return `$${value.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`;
      }
      return value.toLocaleString('es-MX');
  };

  return (
    <div className="h-80 flex gap-4">
      {/* Y-Axis Labels */}
      <div className="flex flex-col justify-between text-right text-xs text-slate-500 w-12 py-3 shrink-0">
        {yAxisSteps.map(step => (
          <span key={step}>{formatValue(step)}</span>
        ))}
      </div>
      
      {/* Chart Area */}
      <div className="flex-grow flex items-end justify-around gap-4 border-l border-b border-slate-200 relative px-2">
        {/* Grid Lines */}
        {yAxisSteps.slice(1, -1).map(step => (
           <div key={`grid-${step}`} className="absolute w-full border-t border-dashed border-slate-200" style={{ bottom: `${(step / maxValue) * 100}%` }}></div>
        ))}

        {/* Bars */}
        {data.map(({ area, value }) => (
          <div key={area} className="flex flex-col items-center w-full h-full text-center justify-end group">
            <div className="relative w-3/4 h-full flex items-end justify-center">
              <div
                className={`${AREA_COLORS[area] || AREA_COLORS['default']} w-full max-w-16 rounded-t transition-all duration-300 ease-in-out relative`}
                style={{ height: `${(value / maxValue) * 100}%` }}
              >
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-800 opacity-0 group-hover:opacity-100 transition-opacity bg-white/70 px-1.5 py-0.5 rounded backdrop-blur-sm">
                      {formatValue(value)}
                  </div>
              </div>
            </div>
            <p className="text-xs font-medium text-slate-600 mt-2 truncate w-full h-8" title={area}>{area}</p>
          </div>
        ))}
      </div>
    </div>
  );
};


const Dashboard: React.FC<DashboardProps> = ({ trainings, onSelectTraining, onEditTraining, onBatchAddTrainings }) => {
  const [filterArea, setFilterArea] = useState('all');
  const [filterParticipantId, setFilterParticipantId] = useState('all');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [chartMetric, setChartMetric] = useState<'participants' | 'hours' | 'investment'>('participants');
  const [searchQuery, setSearchQuery] = useState('');
  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);

  const allParticipants = useMemo(() => {
    const participantMap = new Map<string, Participant>();
    trainings.forEach(training => {
      training.participants.forEach(p => {
        const trimmedName = p.name?.trim();
        if (!trimmedName) return;

        const normalizedName = normalizeString(trimmedName);

        if (!participantMap.has(normalizedName)) {
          // First time seeing this normalized name, add it.
          participantMap.set(normalizedName, { id: p.id?.trim() || '', name: trimmedName });
        } else {
          // If we've seen this name, prefer the version that has an ID.
          const existing = participantMap.get(normalizedName)!;
          if (!existing.id && p.id?.trim()) {
            participantMap.set(normalizedName, { id: p.id.trim(), name: trimmedName });
          }
        }
      });
    });
    return Array.from(participantMap.values()).sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
  }, [trainings]);

  const filteredTrainings = useMemo(() => {
    return trainings.filter(training => {
        const areaMatch = filterArea === 'all' || training.requestingArea === filterArea;
        
        const normalizedFilterParticipantName = normalizeString(filterParticipantId);
        const participantMatch = filterParticipantId === 'all' || 
            training.participants.some(p => normalizeString(p.name) === normalizedFilterParticipantName);

        const startDate = filterStartDate ? new Date(filterStartDate.replace(/-/g, '/')) : null;
        const endDate = filterEndDate ? new Date(filterEndDate.replace(/-/g, '/')) : null;
        const scheduledDate = training.scheduledDate ? new Date(training.scheduledDate.replace(/-/g, '/')) : null;

        const startDateMatch = !startDate || (scheduledDate && scheduledDate >= startDate);
        const endDateMatch = !endDate || (scheduledDate && scheduledDate <= endDate);
        
        const normalizedSearch = normalizeString(searchQuery);
        const searchMatch = !normalizedSearch.trim() ||
            normalizeString(training.trainingName).includes(normalizedSearch) ||
            normalizeString(training.trainerName).includes(normalizedSearch);

        return areaMatch && participantMatch && startDateMatch && endDateMatch && searchMatch;
    });
  }, [trainings, filterArea, filterParticipantId, filterStartDate, filterEndDate, searchQuery]);
  
  const selectedParticipantName = useMemo(() => {
    if (filterParticipantId === 'all') return 'Todos los Participantes';
    return filterParticipantId;
  }, [filterParticipantId]);

  const handleSelectParticipant = (participant: Participant) => {
    setFilterParticipantId(participant.name);
  };
  
  const handleClearParticipantFilter = () => {
    setFilterParticipantId('all');
  };

  const chartData = useMemo(() => {
    if (filteredTrainings.length === 0) {
        return [];
    }

    const dataByArea = filteredTrainings.reduce((acc, training) => {
        const area = training.requestingArea;
        if (!acc[area]) {
            acc[area] = { participants: 0, hours: 0, investment: 0 };
        }
        acc[area].participants += training.participants.length;
        acc[area].hours += training.duration;
        acc[area].investment += training.investment;
        return acc;
    }, {} as Record<string, { participants: number; hours: number; investment: number }>);

    return Object.entries(dataByArea).map(([area, values]) => ({
        area,
        value: values[chartMetric],
    }));
  }, [filteredTrainings, chartMetric]);

  const totalTrainings = filteredTrainings.length;
  const totalUniqueParticipants = useMemo(() => {
    const uniqueParticipantKeys = new Set<string>();
    filteredTrainings.forEach(training => {
        training.participants.forEach(p => {
            const id = p.id?.trim();
            const name = p.name?.trim();
            if (id) {
                uniqueParticipantKeys.add(`id:${id}`);
            } else if (name) {
                uniqueParticipantKeys.add(`name:${normalizeString(name)}`);
            }
        });
    });
    return uniqueParticipantKeys.size;
  }, [filteredTrainings]);
  const totalHours = filteredTrainings.reduce((sum, t) => sum + t.duration, 0);
  const totalInvestment = filteredTrainings.reduce((sum, t) => sum + t.investment, 0);
  
  const resetFilters = () => {
    setFilterArea('all');
    setFilterParticipantId('all');
    setFilterStartDate('');
    setFilterEndDate('');
    setSearchQuery('');
  };

  const exportToCSV = () => {
    if (filteredTrainings.length === 0) {
      alert("No hay capacitaciones para exportar con los filtros actuales.");
      return;
    }

    const headers = ["ID", "Nombre Capacitación", "Capacitador", "Objetivo", "Duración (hrs)", "Inversión ($)", "Área Solicitante", "Lugar", "Fecha Programada", "Participantes"];
    
    const csvRows = [
      headers.join(','),
      ...filteredTrainings.map(t => {
        const participantsStr = `"${t.participants.map(p => `${p.id || ''}:${p.name}`).join('|')}"`;
        const row = [t.id, `"${t.trainingName}"`, `"${t.trainerName}"`, `"${t.objective.replace(/"/g, '""')}"`, t.duration, t.investment, t.requestingArea, `"${t.location}"`, t.scheduledDate, participantsStr];
        return row.join(',');
      })
    ];
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "reporte_capacitaciones.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <>
      <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><FilterIcon/> Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
            <select value={filterArea} onChange={e => setFilterArea(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">Todas las Áreas</option>
              <option value="Administracion">Administracion</option>
              <option value="Comercial">Comercial</option>
              <option value="Produccion">Produccion</option>
            </select>
            <button 
                onClick={() => setIsParticipantModalOpen(true)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-left bg-white truncate"
                title={selectedParticipantName}
            >
                {selectedParticipantName}
            </button>
            <input type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            <input type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            <button onClick={resetFilters} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">Limpiar</button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Capacitaciones" value={totalTrainings} icon={<ChartBarIcon />} />
          <StatCard title="Participantes Únicos" value={totalUniqueParticipants} icon={<UsersIcon />} />
          <StatCard title="Total Horas" value={totalHours} icon={<ClockIcon />} />
          <StatCard title="Total Inversión" value={`$${totalInvestment.toLocaleString('es-MX')}`} icon={<CurrencyDollarIcon />} />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <h2 className="text-xl font-bold text-gray-800">Análisis por Área</h2>
              <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 w-full sm:w-auto">
                  <button 
                      onClick={() => setChartMetric('participants')}
                      className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors w-full ${chartMetric === 'participants' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-white/60'}`}
                  >
                      <UsersIcon/> <span>Participantes</span>
                  </button>
                  <button 
                      onClick={() => setChartMetric('hours')}
                      className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors w-full ${chartMetric === 'hours' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-white/60'}`}
                  >
                      <ClockIcon/> <span>Horas</span>
                  </button>
                  <button 
                      onClick={() => setChartMetric('investment')}
                      className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors w-full ${chartMetric === 'investment' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-white/60'}`}
                  >
                      <CashIcon/> <span>Inversión</span>
                  </button>
              </div>
          </div>
          <TrainingChart data={chartData} metricLabel={chartMetric === 'participants' ? 'Participantes' : chartMetric === 'hours' ? 'Horas' : '$'} />
        </div>

        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold text-gray-800">Capacitaciones Registradas</h2>
                  {trainings.length > 0 && (
                      <button
                          onClick={exportToCSV}
                          className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 text-white text-sm font-semibold rounded-md hover:bg-teal-700 transition-colors"
                          aria-label="Exportar a CSV"
                      >
                          <DownloadIcon />
                          <span>Exportar a CSV</span>
                      </button>
                  )}
              </div>
              <div className="relative w-full sm:w-auto">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <SearchIcon />
                  </span>
                  <input
                      type="text"
                      placeholder="Buscar por nombre o capacitador..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full sm:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
              </div>
          </div>
          <TrainingList 
            trainings={filteredTrainings} 
            onSelectTraining={onSelectTraining}
            onEditTraining={onEditTraining}
            onBatchAdd={onBatchAddTrainings}
          />
        </div>
      </div>
      <ParticipantFilterModal
          isOpen={isParticipantModalOpen}
          onClose={() => setIsParticipantModalOpen(false)}
          participants={allParticipants}
          onSelectParticipant={handleSelectParticipant}
          onClearFilter={handleClearParticipantFilter}
      />
    </>
  );
};

export default Dashboard;