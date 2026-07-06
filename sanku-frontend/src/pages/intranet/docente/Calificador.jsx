import { useState, useEffect } from 'react';
import axios from 'axios';
import { FileSignature } from 'lucide-react';
import { sileo } from 'sileo';
import { API_BASE, authHeaders } from '../../../utils/api';

const notaBadge = (nota) => {
  if (nota === null || nota === undefined || nota === '') return 'bg-slate-100 text-slate-400';
  if (nota >= 14) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (nota >= 11) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-rose-50 text-rose-700 border-rose-200';
};

const Calificador = () => {
  const [secciones, setSecciones] = useState([]);
  const [cargandoSecciones, setCargandoSecciones] = useState(true);

  const [seccionActual, setSeccionActual] = useState(null);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [cargandoEvals, setCargandoEvals] = useState(false);

  const [evalActual, setEvalActual] = useState(null);
  const [notas, setNotas] = useState([]);
  const [cargandoNotas, setCargandoNotas] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const cargarMisCursos = async () => {
      try {
        const headers = authHeaders();
        let docenteId = localStorage.getItem('docenteId');
        if (!docenteId) {
          const usuarioId = localStorage.getItem('usuarioId');
          const resPerfil = await axios.get(`${API_BASE}/docentes/perfil/${usuarioId}`, { headers });
          docenteId = String(resPerfil.data.idDocente);
          localStorage.setItem('docenteId', docenteId);
        }
        const res = await axios.get(`${API_BASE}/secciones/docente/${docenteId}`, { headers });
        if (isMounted) setSecciones(res.data);
      } catch {
        sileo.error({ title: "Error", description: "No se pudieron cargar tus cursos." });
      } finally {
        if (isMounted) setCargandoSecciones(false);
      }
    };
    cargarMisCursos();
    return () => { isMounted = false; };
  }, []);

  const cargarEvaluaciones = async (sec) => {
    setCargandoEvals(true);
    try {
      const res = await axios.get(`${API_BASE}/evaluaciones/seccion/${sec.idSeccion}`, { headers: authHeaders() });
      setEvaluaciones(res.data);
    } catch {
      setEvaluaciones([]);
    } finally {
      setCargandoEvals(false);
    }
  };

  const seleccionarSeccion = (sec) => {
    setSeccionActual(sec);
    setEvalActual(null);
    setNotas([]);
    cargarEvaluaciones(sec);
  };

  const seleccionarEvaluacion = async (ev) => {
    setEvalActual(ev);
    setCargandoNotas(true);
    try {
      const res = await axios.get(`${API_BASE}/notas/evaluacion/${ev.idEvaluacion}`, { headers: authHeaders() });
      setNotas(res.data);
    } catch {
      sileo.error({ title: "Error", description: "Fallo al cargar las notas registradas." });
      setNotas([]);
    } finally {
      setCargandoNotas(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-black text-slate-800">Resumen de Calificaciones</h2>
        <p className="text-slate-500 text-sm">Consulta rápida de notas y comentarios ya registrados. Para crear evaluaciones y calificar, hazlo desde Aula Virtual (por módulo).</p>
      </div>

      <div className="space-y-4">
        <p className="font-bold text-slate-700 text-sm">1. Selecciona tu curso:</p>
        <div className="flex flex-wrap gap-3">
          {cargandoSecciones && <span className="text-slate-400">Cargando...</span>}
          {!cargandoSecciones && secciones.length === 0 && <span className="text-slate-400">Sin cursos asignados.</span>}
          {!cargandoSecciones && secciones.map(s => (
            <button
              key={s.idSeccion}
              onClick={() => seleccionarSeccion(s)}
              className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 shadow-sm ${seccionActual?.idSeccion === s.idSeccion ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'}`}
            >
              {s.nombreCurso} (SEC-{s.idSeccion})
            </button>
          ))}
        </div>

        <p className="font-bold text-slate-700 text-sm pt-4 border-t border-slate-200">2. Selecciona la evaluación:</p>
        <div className="flex flex-wrap gap-3 min-h-[44px]">
          {seccionActual === null && <span className="text-slate-400 text-sm">Elige un curso primero...</span>}
          {seccionActual && cargandoEvals && <span className="text-slate-400 text-sm">Buscando evaluaciones...</span>}
          {seccionActual && !cargandoEvals && evaluaciones.length === 0 && (
            <span className="text-slate-400 text-sm">Aún no hay evaluaciones para este curso.</span>
          )}
          {seccionActual && !cargandoEvals && evaluaciones.map(ev => (
            <button
              key={ev.idEvaluacion}
              onClick={() => seleccionarEvaluacion(ev)}
              className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 shadow-sm ${evalActual?.idEvaluacion === ev.idEvaluacion ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'}`}
            >
              {ev.nombreExamen} ({ev.pesoPorcentaje}%)
            </button>
          ))}
        </div>
      </div>

      {evalActual && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-4">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <FileSignature className="text-indigo-500" size={20}/>
              Notas: <span className="text-indigo-600">{evalActual.nombreExamen}</span>
            </h3>
          </div>

          <div className="p-6 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Alumno</th>
                  <th className="py-3 px-4 text-center w-28">Nota</th>
                  <th className="py-3 px-4">Comentario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {cargandoNotas && <tr><td colSpan="3" className="text-center py-10 text-slate-400">Cargando notas...</td></tr>}
                {!cargandoNotas && notas.length === 0 && <tr><td colSpan="3" className="text-center py-10 text-slate-400">Aún no hay notas registradas para esta evaluación.</td></tr>}
                {!cargandoNotas && notas.map((n, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-700">{n.nombreAlumno || `Alumno #${n.alumnoId}`}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-sm font-black px-3 py-1 rounded-xl border ${notaBadge(n.nota)}`}>
                        {n.nota !== null && n.nota !== undefined ? Number(n.nota).toFixed(2) : '---'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{n.comentario || <span className="text-slate-300">Sin comentario</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calificador;
