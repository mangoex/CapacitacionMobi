import React, { useState } from 'react';
import { Training } from '../types';
import { CloseIcon, ClockIcon, UsersIcon, EditIcon, CalendarIcon, DocumentTextIcon, CashIcon, MailIcon } from './icons';

interface TrainingDetailModalProps {
  training: Training | null;
  onClose: () => void;
  onEdit: (training: Training) => void;
}

const generateMinutaHTML = (training: Training): string => {
    // Create date in local timezone to avoid off-by-one errors
    const dateParts = training.scheduledDate.split('-').map(s => parseInt(s, 10));
    const startDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

    const fecha = startDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const horaInicio = 'N/A'; // Time is no longer captured
    const horaTermino = 'N/A'; // Time is no longer captured

    const participantRows = training.participants.map(p => `
      <tr>
        <td class="cell participant-cell">${p.name}</td>
        <td class="cell signature-cell"></td>
      </tr>
    `).join('');
    
    const emptyRowsCount = Math.max(0, 15 - training.participants.length);
    const emptyRows = Array(emptyRowsCount).fill(`
      <tr>
        <td class="cell participant-cell">&nbsp;</td>
        <td class="cell signature-cell"></td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title>Minuta de Reunión - ${training.trainingName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
          .container { width: 100%; max-width: 800px; margin: auto; }
          .logo-container { text-align: right; margin-bottom: 20px; }
          .logo-main { color: #005f9e; font-size: 48px; font-weight: bold; margin: 0; letter-spacing: -2px; }
          .logo-sub { margin: 0; font-size: 14px; color: #555; }
          .title { text-align: center; font-weight: bold; font-size: 16px; margin-bottom: 10px; }
          .main-table, .participants-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
          .cell { border: 1px solid black; padding: 6px; font-size: 12px; vertical-align: top; }
          .label { font-weight: bold; }
          .long-text { height: 60px; }
          .participants-table { margin-top: -10px; }
          .participant-cell { width: 50%; }
          .signature-cell { width: 50%; }
          .footer-container { display: flex; justify-content: space-between; font-size: 12px; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo-container">
            <div class="logo-main">mobi.</div>
            <div class="logo-sub">muebles para tu vida</div>
          </div>
          <div class="title">MINUTA DE REUNIÓN</div>
          
          <table class="main-table">
            <tbody>
              <tr>
                <td class="cell label" style="width: 20%;">No. de participantes:</td>
                <td class="cell" style="width: 30%;">${training.participants.length}</td>
                <td class="cell label" style="width: 20%;">No. De sesión:</td>
                <td class="cell" style="width: 30%;">1</td>
              </tr>
              <tr>
                <td class="cell label">Área involucrada:</td>
                <td class="cell">${training.requestingArea}</td>
                <td class="cell label">Hora de inicio:</td>
                <td class="cell">${horaInicio}</td>
              </tr>
              <tr>
                <td class="cell label">Fecha:</td>
                <td class="cell">${fecha}</td>
                <td class="cell label">Hora de término:</td>
                <td class="cell">${horaTermino}</td>
              </tr>
              <tr>
                <td class="cell label">Lugar:</td>
                <td class="cell">${training.location}</td>
                <td class="cell label">Elaboró:</td>
                <td class="cell">${training.trainerName}</td>
              </tr>
              <tr>
                <td class="cell label long-text">ACUERDOS ANTERIORES:</td>
                <td class="cell long-text" colspan="3"></td>
              </tr>
               <tr>
                <td class="cell label">AGENDA:</td>
                <td class="cell" colspan="3">${training.trainingName}</td>
              </tr>
               <tr>
                <td class="cell label long-text">ACUERDOS TOMADOS:</td>
                <td class="cell long-text" colspan="3">${training.objective}</td>
              </tr>
            </tbody>
          </table>

          <table class="participants-table">
            <tbody>
              ${participantRows}
              ${emptyRows}
            </tbody>
          </table>

          <table class="main-table">
            <tbody>
                <tr>
                    <td class="cell label" colspan="2">PRÓXIMA REUNIÓN:</td>
                    <td class="cell label" colspan="2">HORA:</td>
                </tr>
                <tr>
                    <td class="cell" colspan="2" style="height: 30px;">LUGAR:</td>
                    <td class="cell" colspan="2" style="height: 30px;"></td>
                </tr>
            </tbody>
          </table>
          
          <div class="footer-container">
            <span>ASEHF-17-01</span>
            <span>REV-A</span>
          </div>
        </div>
      </body>
      </html>
    `;
};


const TrainingDetailModal: React.FC<TrainingDetailModalProps> = ({ training, onClose, onEdit }) => {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmails, setInviteEmails] = useState('');

  if (!training) return null;

  const formattedDate = training.scheduledDate
    ? new Date(training.scheduledDate.replace(/-/g, '/')).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    : 'No especificada';

  const handleGenerateMinuta = () => {
      const minutaHTML = generateMinutaHTML(training);
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(minutaHTML);
        newWindow.document.close();
      }
  };

  const handleSendInvitation = () => {
    if (!inviteEmails.trim()) {
      alert('Por favor, ingrese al menos una dirección de correo electrónico.');
      return;
    }

    const subject = `Invitación a Capacitación: ${training.trainingName}`;
    const participantsList = training.participants.map(p => `- ${p.name} (${p.id || 'Sin ID'})`).join('\n');
    
    const body = `Hola,

Estás invitado(a) a la siguiente capacitación:

Nombre: ${training.trainingName}
Capacitador: ${training.trainerName}
Fecha: ${formattedDate}
Lugar: ${training.location}
Duración: ${training.duration} horas
Objetivo: ${training.objective}

Participantes Registrados:
${participantsList}

Saludos.
    `.trim();

    const mailtoLink = `mailto:${inviteEmails}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    window.location.href = mailtoLink;

    setInviteEmails('');
    setShowInviteForm(false);
  };


  const InfoBox = ({ title, value }: {title: string, value: string}) => (
    <div className="bg-slate-100 p-3 rounded-lg">
        <span className="font-semibold text-gray-800 block">{title}</span>
        <span className="text-gray-600">{value}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-fade-in-down relative">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">{training.trainingName}</h2>
          <p className="text-sm text-gray-500">Impartido por: <span className="font-medium text-gray-700">{training.trainerName}</span></p>
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
            <CloseIcon />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
            <div>
                <h3 className="font-semibold text-gray-700">Objetivo</h3>
                <p className="text-gray-600 mt-1">{training.objective}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <InfoBox title="Área Solicitante" value={training.requestingArea} />
                <InfoBox title="Lugar" value={training.location} />
                <div className="bg-slate-100 p-3 rounded-lg sm:col-span-2">
                    <span className="font-semibold text-gray-800 block">Fecha Programada</span>
                    <div className="flex items-center mt-1 text-gray-600">
                        <CalendarIcon />
                        <span>{formattedDate}</span>
                    </div>
                </div>
                <div className="bg-slate-100 p-3 rounded-lg sm:col-span-2">
                    <span className="font-semibold text-gray-800 block">Información Adicional</span>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                        <span className="flex items-center text-gray-600"><ClockIcon/> {training.duration} horas</span>
                        <span className="flex items-center text-gray-600"><UsersIcon/> {training.participants.length} participantes</span>
                        <span className="flex items-center text-gray-600"><CashIcon/> ${training.investment.toLocaleString('es-MX')}</span>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="font-semibold text-gray-700 mb-2">Lista de Participantes</h3>
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg bg-gray-50">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Completo</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {training.participants.map((p, index) => (
                            <tr key={p.id || index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.name}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showInviteForm && (
                <div className="border-t pt-4 mt-4 space-y-3">
                    <h3 className="font-semibold text-gray-700">Enviar Invitación por Correo</h3>
                    <div>
                        <label htmlFor="inviteEmails" className="block text-sm font-medium text-gray-700 mb-1">Enviar a (correos separados por coma):</label>
                        <input
                            type="email"
                            id="inviteEmails"
                            multiple
                            value={inviteEmails}
                            onChange={(e) => setInviteEmails(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="ejemplo@correo.com, otro@correo.com"
                        />
                    </div>
                    <div className="flex justify-end">
                        <button 
                            onClick={handleSendInvitation}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
                        >
                            <MailIcon />
                            <span>Enviar Invitación</span>
                        </button>
                    </div>
                </div>
            )}
        </div>

        <div className="p-4 bg-gray-50 rounded-b-xl border-t border-gray-200 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">Cerrar</button>
            <button
                onClick={handleGenerateMinuta}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white font-semibold rounded-md hover:bg-teal-700 transition-colors"
                aria-label="Generar Minuta"
            >
                <DocumentTextIcon/>
                <span>Minuta</span>
            </button>
             <button
                onClick={() => setShowInviteForm(!showInviteForm)}
                className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 transition-colors"
                aria-label="Invitar participantes"
            >
                <MailIcon />
                <span>Invitar</span>
            </button>
            <button 
                onClick={() => onEdit(training)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors"
            >
                <EditIcon />
                <span>Editar</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default TrainingDetailModal;