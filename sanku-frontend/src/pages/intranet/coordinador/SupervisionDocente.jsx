import { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, BookOpen, X } from 'lucide-react';
import { sileo } from 'sileo';

const SupervisionDocente = () => {
  const [docentes, setDocentes] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  const [modalAbierto, setModalAbierto] = useState(false);
  const [docenteSeleccionado, setDocenteSeleccionado] = useState(null);
  const [cargaHoraria, setCargaHoraria] = useState([]);
  const [cargandoHorario, setCargandoHorario] = useState(false);

  const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  useEffect(() => {
    let isMounted = true;
    axios.get('http://localhost:8080/api/v1/docentes', { headers: getHeaders() })
      .then(res => { if (isMounted) setDocentes(res.data); })
      .catch(() => sileo.error({ title: "Error", description: "No se cargaron los docentes." }))
      .finally(() => { if (isMounted) setCargando(false); });
    return () => { isMounted = false; };
  }, []);

  const verDetalle = async (docente) => {
    setDocenteSeleccionado(docente);
    setModalAbierto(true);
    setCargandoHorario(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/v1/secciones/docente/${docente.idDocente}`, { headers: getHeaders() });
      setCargaHoraria(res.data);
    } catch {
      setCargaHoraria([]);
      sileo.error({ title: "Error", description: "Fallo al obtener la carga horaria." });
    } finally {
      setCargandoHorario(false);
    }
  };

  const dias = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-black text-slate-800">Supervisión Docente</h2>
        <p className="text-slate-500 text-sm">Monitorea a los profesores activos y su carga académica asignada.</p>
      </div>

      {cargando ? <p className="text-center text-slate-400 py-10">Cargando docentes...</p> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {docentes.map(d => (
            <div key={d.idDocente} className="bg-white rounded-3xl shadow-sm border border-slate-200 border-t-4 border-t-teal-600 p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-teal-50 text-teal-600 text-2xl font-black rounded-full flex items-center justify-center mb-4">
                {d.usuario.nombreCompleto.charAt(0)}
              </div>
              <h4 className="font-bold text-slate-800 mb-1">{d.usuario.nombreCompleto}</h4>
              <p className="text-xs text-slate-500 mb-6 font-semibold line-clamp-1">Especialidad: {d.especialidad}</p>
              <button onClick={() => verDetalle(d)} className="w-full border border-teal-200 text-teal-700 bg-teal-50 hover:bg-teal-500 hover:text-white font-bold py-2 rounded-xl transition-colors text-sm">
                Ver Detalle Académico
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DETALLE HORARIO */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-black text-lg text-slate-800 flex items-center gap-2"><BookOpen className="text-teal-500" size={20}/> Carga Horaria: {docenteSeleccionado?.usuario.nombreCompleto}</h3>
              <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-lg"><X size={20}/></button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="py-2 px-3">Curso</th>
                    <th className="py-2 px-3">Ciclo</th>
                    <th className="py-2 px-3">Día</th>
                    <th className="py-2 px-3">Horario</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cargandoHorario ? <tr><td colSpan="4" className="text-center py-8 text-slate-400">Cargando horario...</td></tr> : 
                    cargaHoraria.length === 0 ? <tr><td colSpan="4" className="text-center py-8 text-slate-400">Sin carga asignada.</td></tr> :
                    cargaHoraria.map(s => (
                      <tr key={s.idSeccion} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-700">{s.nombreCurso}</td>
                        <td className="py-3 px-3 text-slate-500">{s.cicloAcademico}</td>
                        <td className="py-3 px-3 text-slate-600">{dias[s.diaSemana]}</td>
                        <td className="py-3 px-3">
                          <span className="bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-lg text-xs flex items-center gap-1 w-max">
                            <Clock size={12}/> {s.horaInicio?.substring(0,5)} - {s.horaFin?.substring(0,5)}
                          </span>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default SupervisionDocente;