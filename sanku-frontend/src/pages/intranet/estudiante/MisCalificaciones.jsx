import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { GraduationCap, TrendingUp, Award, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { sileo } from 'sileo';
import { API_BASE } from '../../../utils/api';

const getCicloActual = () => {
  const now = new Date();
  return now.getMonth() < 6 ? `${now.getFullYear()}-I` : `${now.getFullYear()}-II`;
};

const getCicloAnterior = () => {
  const now = new Date();
  if (now.getMonth() < 6) return `${now.getFullYear() - 1}-II`;
  return `${now.getFullYear()}-I`;
};

const notaColor = (nota) => {
  if (nota === null || nota === undefined) return 'text-slate-400';
  if (nota >= 14) return 'text-emerald-600';
  if (nota >= 11) return 'text-amber-500';
  return 'text-rose-500';
};

const notaBadge = (nota) => {
  if (nota === null || nota === undefined) return 'bg-slate-100 text-slate-400';
  if (nota >= 14) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (nota >= 11) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-rose-50 text-rose-700 border-rose-200';
};

const CursoCalificacionCard = ({ nombreCurso, notas }) => {
  const [expandido, setExpandido] = useState(true);
  const pesoTotal = notas.reduce((s, n) => s + (n.pesoPorcentaje || 0), 0);
  
  const promedioPonderado = pesoTotal > 0
    ? notas.reduce((s, n) => s + (Number(n.nota) * (n.pesoPorcentaje || 0)), 0) / pesoTotal
    : null;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpandido(e => !e)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <BookOpen size={18} />
          </div>
          <div className="text-left">
            <h3 className="font-black text-slate-800">{nombreCurso}</h3>
            <p className="text-xs text-slate-400 font-semibold">{notas.length} evaluación{notas.length !== 1 ? 'es' : ''} calificada{notas.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {promedioPonderado !== null && (
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Promedio</p>
              <p className={`text-2xl font-black ${notaColor(promedioPonderado)}`}>
                {promedioPonderado.toFixed(2)}
              </p>
            </div>
          )}
          {expandido ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
        </div>
      </button>

      {expandido && (
        <div className="border-t border-slate-100">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-3 px-6">Evaluación</th>
                <th className="py-3 px-4 text-center">Peso</th>
                <th className="py-3 px-4 text-center">Nota</th>
                <th className="py-3 px-4 hidden sm:table-cell">Fecha</th>
                <th className="py-3 px-4 hidden md:table-cell">Feedback del docente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {notas.map((n, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-6 font-semibold text-slate-800 text-sm">{n.nombreExamen}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                      {n.pesoPorcentaje ?? '---'}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`text-sm font-black px-3 py-1 rounded-xl border ${notaBadge(n.nota)}`}>
                      {n.nota !== null && n.nota !== undefined ? Number(n.nota).toFixed(2) : '---'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-400 font-medium hidden sm:table-cell">
                    {n.fechaExamen ? new Date(n.fechaExamen + 'T00:00:00').toLocaleDateString('es-ES') : '---'}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500 hidden md:table-cell">
                    {n.comentario || <span className="text-slate-300">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const MisCalificaciones = () => {
  const cicloActual = getCicloActual();
  const cicloAnterior = getCicloAnterior();
  const [cicloSeleccionado, setCicloSeleccionado] = useState(cicloActual);
  const [todasLasNotas, setTodasLasNotas] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  const alumnoId = localStorage.getItem('alumnoId');
  const getHeaders = useCallback(() => ({ Authorization: `Bearer ${localStorage.getItem('token')}` }), []);

  useEffect(() => {
    let isMounted = true;
    
    const fetchNotas = async () => {
      if (!alumnoId) {
        if (isMounted) setCargando(false);
        return;
      }
      try {
        const res = await axios.get(`${API_BASE}/notas/alumno/${alumnoId}`, { headers: getHeaders() });
        if (isMounted) setTodasLasNotas(res.data);
      } catch (error) {
        console.error(error);
        sileo.error({ title: 'Error', description: 'No se pudieron cargar las calificaciones.' });
      } finally {
        if (isMounted) setCargando(false);
      }
    };

    fetchNotas();
    return () => { isMounted = false; };
  }, [alumnoId, getHeaders]);

  const notasFiltradas = todasLasNotas.filter(n => n.cicloAcademico === cicloSeleccionado);
  
  const porCurso = notasFiltradas.reduce((acc, n) => {
    const key = n.nombreCurso || 'Sin curso';
    if (!acc[key]) acc[key] = [];
    acc[key].push(n);
    return acc;
  }, {});
  
  const cursos = Object.entries(porCurso);
  
  const promedioGeneral = (() => {
    if (notasFiltradas.length === 0) return null;
    const pesoTotal = notasFiltradas.reduce((s, n) => s + (n.pesoPorcentaje || 0), 0);
    if (pesoTotal === 0) return null;
    return notasFiltradas.reduce((s, n) => s + (Number(n.nota) * (n.pesoPorcentaje || 0)), 0) / pesoTotal;
  })();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Mis Calificaciones</h2>
          <p className="text-slate-500 text-sm">Ciclo Académico: <strong className="text-blue-600">{cicloSeleccionado}</strong></p>
        </div>
        
        {promedioGeneral !== null && (
          <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Promedio del ciclo</p>
              <p className={`text-xl font-black ${notaColor(promedioGeneral)}`}>{promedioGeneral.toFixed(2)}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setCicloSeleccionado(cicloActual)}
          className={`px-5 py-2 rounded-full font-bold text-sm transition-colors ${cicloSeleccionado === cicloActual ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-white text-slate-500 border border-slate-200 hover:border-blue-300 hover:text-blue-600'}`}
        >
          {cicloActual} (Actual)
        </button>
        <button
          onClick={() => setCicloSeleccionado(cicloAnterior)}
          className={`px-5 py-2 rounded-full font-bold text-sm transition-colors ${cicloSeleccionado === cicloAnterior ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-white text-slate-500 border border-slate-200 hover:border-blue-300 hover:text-blue-600'}`}
        >
          {cicloAnterior}
        </button>
      </div>

      {cargando && (
        <p className="text-center text-slate-400 py-16">
          <i className="fa-solid fa-spinner fa-spin mr-2"></i> Cargando calificaciones...
        </p>
      )}

      {!cargando && cursos.length === 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-16 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Award size={36} className="text-slate-300" />
          </div>
          <h3 className="font-bold text-slate-700 text-lg mb-2">Sin calificaciones registradas</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            Aún no hay notas publicadas para el ciclo <strong>{cicloSeleccionado}</strong>.
            Las calificaciones aparecerán aquí una vez que el docente las registre.
          </p>
        </div>
      )}

      {!cargando && cursos.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
            <GraduationCap size={14} />
            <span>{cursos.length} curso{cursos.length !== 1 ? 's' : ''} con calificaciones</span>
          </div>
          {cursos.map(([nombreCurso, notas]) => (
            <CursoCalificacionCard key={nombreCurso} nombreCurso={nombreCurso} notas={notas} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MisCalificaciones;