import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { CalendarCheck, CheckCircle, XCircle, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { sileo } from 'sileo';

const getCicloActual = () => {
  const now = new Date();
  return now.getMonth() < 6 ? `${now.getFullYear()}-I` : `${now.getFullYear()}-II`;
};

const getCicloAnterior = () => {
  const now = new Date();
  if (now.getMonth() < 6) return `${now.getFullYear() - 1}-II`;
  return `${now.getFullYear()}-I`;
};

const CursoAsistenciaCard = ({ nombreCurso, registros }) => {
  const [expandido, setExpandido] = useState(true);
  const presentes = registros.filter(r => r.presente).length;
  const total = registros.length;
  const porcentaje = total > 0 ? Math.round((presentes / total) * 100) : 0;
  
  const colorBarra = porcentaje >= 75 ? 'bg-emerald-500' : porcentaje >= 50 ? 'bg-amber-400' : 'bg-rose-500';
  const colorTexto = porcentaje >= 75 ? 'text-emerald-600' : porcentaje >= 50 ? 'text-amber-500' : 'text-rose-500';

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpandido(e => !e)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center shrink-0">
            <BookOpen size={18} />
          </div>
          <div className="text-left">
            <h3 className="font-black text-slate-800">{nombreCurso}</h3>
            <p className="text-xs text-slate-400 font-semibold">{total} clase{total !== 1 ? 's' : ''} registrada{total !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Asistencia</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${colorBarra}`} style={{ width: `${porcentaje}%` }} />
              </div>
              <span className={`text-sm font-black ${colorTexto}`}>{porcentaje}%</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">{presentes}P</span>
            <span className="text-rose-500 bg-rose-50 px-2 py-1 rounded-lg">{total - presentes}F</span>
          </div>
          {expandido ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
        </div>
      </button>

      {expandido && (
        <div className="border-t border-slate-100">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-3 px-6">Fecha</th>
                <th className="py-3 px-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {registros.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-6 text-sm font-semibold text-slate-700">
                    {r.fecha ? new Date(r.fecha + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }) : '---'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {r.presente ? (
                      <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                        <CheckCircle size={12} /> Presente
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-600 text-xs font-bold px-3 py-1 rounded-full border border-rose-200">
                        <XCircle size={12} /> Falta
                      </span>
                    )}
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

const MiAsistencia = () => {
  const cicloActual = getCicloActual();
  const cicloAnterior = getCicloAnterior();
  const [cicloSeleccionado, setCicloSeleccionado] = useState(cicloActual);
  const [todasLasAsistencias, setTodasLasAsistencias] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  const alumnoId = localStorage.getItem('alumnoId');
  const getHeaders = useCallback(() => ({ Authorization: `Bearer ${localStorage.getItem('token')}` }), []);

  useEffect(() => {
    let isMounted = true;
    
    const fetchAsistencias = async () => {
      if (!alumnoId) {
        if (isMounted) setCargando(false);
        return;
      }
      try {
        const res = await axios.get(`http://localhost:8080/api/v1/asistencias/alumno/${alumnoId}`, { headers: getHeaders() });
        if (isMounted) setTodasLasAsistencias(res.data);
      } catch (error) {
        console.error(error);
        sileo.error({ title: 'Error', description: 'No se pudo cargar el historial de asistencia.' });
      } finally {
        if (isMounted) setCargando(false);
      }
    };

    fetchAsistencias();
    return () => { isMounted = false; };
  }, [alumnoId, getHeaders]);

  const filtradas = todasLasAsistencias.filter(r => r.cicloAcademico === cicloSeleccionado);
  
  const porCurso = filtradas.reduce((acc, r) => {
    const key = r.nombreCurso || 'Sin curso';
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});
  
  const cursos = Object.entries(porCurso);
  
  const totalPresentes = filtradas.filter(r => r.presente).length;
  const totalClases = filtradas.length;
  const porcentajeGlobal = totalClases > 0 ? Math.round((totalPresentes / totalClases) * 100) : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Mi Asistencia</h2>
          <p className="text-slate-500 text-sm">Ciclo Académico: <strong className="text-blue-600">{cicloSeleccionado}</strong></p>
        </div>
        
        {porcentajeGlobal !== null && (
          <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
              <CalendarCheck size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Asistencia global</p>
              <p className={`text-xl font-black ${porcentajeGlobal >= 75 ? 'text-emerald-600' : porcentajeGlobal >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                {porcentajeGlobal}%
                <span className="text-xs font-semibold text-slate-400 ml-2">{totalPresentes}/{totalClases} clases</span>
              </p>
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
          <i className="fa-solid fa-spinner fa-spin mr-2"></i> Cargando historial...
        </p>
      )}

      {!cargando && cursos.length === 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-16 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CalendarCheck size={36} className="text-slate-300" />
          </div>
          <h3 className="font-bold text-slate-700 text-lg mb-2">Sin registros de asistencia</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            No hay registros de asistencia para el ciclo <strong>{cicloSeleccionado}</strong>. Aparecerán aquí una vez que el docente los registre.
          </p>
        </div>
      )}

      {!cargando && cursos.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
            {cursos.length} curso{cursos.length !== 1 ? 's' : ''} • {totalClases} clase{totalClases !== 1 ? 's' : ''} registrada{totalClases !== 1 ? 's' : ''}
          </p>
          {cursos.map(([nombreCurso, registros]) => (
            <CursoAsistenciaCard key={nombreCurso} nombreCurso={nombreCurso} registros={registros} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MiAsistencia;