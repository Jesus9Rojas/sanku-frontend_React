import { useState, useEffect } from 'react';
import axios from 'axios';
import { Layers, CalendarCheck, Clock, Users } from 'lucide-react';
import { sileo } from 'sileo';

const diasSemana = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const PanelPrincipal = () => {
  const [secciones, setSecciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const docenteId = localStorage.getItem('docenteId');

    const cargarAgenda = async () => {
      if (!docenteId) return; // Si aún no ha cargado el ID, espera.
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
        const res = await axios.get(`http://localhost:8080/api/v1/secciones/docente/${docenteId}`, { headers });
        if (isMounted) setSecciones(res.data);
      } catch {
        sileo.error({ title: "Error", description: "No se pudo cargar la agenda." });
      } finally {
        if (isMounted) setCargando(false);
      }
    };

    cargarAgenda();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Panel Académico Docente</h2>
          <p className="text-slate-500">Resumen de tu carga lectiva y tareas del día.</p>
        </div>
        <span className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-bold border border-indigo-100 shadow-sm flex items-center gap-2 text-sm">
          <CalendarCheck size={16} /> Ciclo 2026-I
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-5">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex justify-center items-center"><Layers size={24}/></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Secciones a Cargo</p>
            <h3 className="text-2xl font-black text-slate-800">{cargando ? '...' : secciones.length}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <h3 className="font-bold text-slate-800 p-6 border-b border-slate-100 flex items-center gap-2">
          <Clock className="text-indigo-500"/> Tus Clases Asignadas
        </h3>
        <div className="p-6">
          {cargando ? (
            <p className="text-center text-slate-400 py-6">Cargando tu agenda...</p>
          ) : secciones.length === 0 ? (
            <p className="text-center text-slate-400 py-6">No tienes carga asignada para este ciclo.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {secciones.map(s => (
                <div key={s.idSeccion} className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-colors">
                  <div className="bg-white px-4 py-3 rounded-xl shadow-sm border border-slate-200 text-center shrink-0 min-w-[120px]">
                    <p className="text-lg font-black text-indigo-600">{s.horaInicio?.substring(0,5)}</p>
                    <p className="text-xs font-bold text-slate-400">a {s.horaFin?.substring(0,5)}</p>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-lg text-slate-800 mb-1">{s.nombreCurso}</h4>
                    <div className="flex flex-wrap gap-3 text-sm font-semibold text-slate-500">
                      <span className="flex items-center gap-1"><Users size={14} className="text-slate-400"/> SEC-{s.idSeccion}</span>
                      <span className="text-slate-300">|</span>
                      <span>{diasSemana[s.diaSemana]}</span>
                      <span className="text-slate-300">|</span>
                      <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-xs">{s.modalidad}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PanelPrincipal;