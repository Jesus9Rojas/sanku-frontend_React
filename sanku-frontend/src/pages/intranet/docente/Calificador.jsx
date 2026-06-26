import { useState, useEffect } from 'react';
import axios from 'axios';
import { FileSignature, CheckCircle2, Save, AlertCircle, Plus, X, CalendarCheck } from 'lucide-react';
import { sileo } from 'sileo';

const Calificador = () => {
  const [secciones, setSecciones] = useState([]);
  const [cargandoSecciones, setCargandoSecciones] = useState(true);

  const [seccionActual, setSeccionActual] = useState(null);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [cargandoEvals, setCargandoEvals] = useState(false);

  const [evalActual, setEvalActual] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [notas, setNotas] = useState({});
  const [cargandoNotas, setCargandoNotas] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [estadoSincronizacion, setEstadoSincronizacion] = useState('');

  const [modalEval, setModalEval] = useState(false);
  const [formEval, setFormEval] = useState({ nombreExamen: '', pesoPorcentaje: '', fechaExamen: '' });
  const [guardandoEval, setGuardandoEval] = useState(false);

  const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  useEffect(() => {
    let isMounted = true;
    const docenteId = localStorage.getItem('docenteId');
    const cargarMisCursos = async () => {
      if (!docenteId) return;
      try {
        const res = await axios.get(`http://localhost:8080/api/v1/secciones/docente/${docenteId}`, { headers: getHeaders() });
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
      const res = await axios.get(`http://localhost:8080/api/v1/evaluaciones/seccion/${sec.idSeccion}`, { headers: getHeaders() });
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
    setAlumnos([]);
    cargarEvaluaciones(sec);
  };

  const seleccionarEvaluacion = async (ev) => {
    setEvalActual(ev);
    setCargandoNotas(true);
    setEstadoSincronizacion('');

    try {
      const [resAlum, resNotas] = await Promise.all([
        axios.get(`http://localhost:8080/api/v1/matriculas/seccion/${seccionActual.idSeccion}`, { headers: getHeaders() }),
        axios.get(`http://localhost:8080/api/v1/notas/evaluacion/${ev.idEvaluacion}`, { headers: getHeaders() }).catch(() => ({ data: [] }))
      ]);

      const listaAlumnos = resAlum.data;
      const notasPrevias = resNotas.data;

      const objNotas = {};
      listaAlumnos.forEach(a => {
        const n = notasPrevias.find(np => Number.parseInt(np.alumnoId) === Number.parseInt(a.alumnoId));
        objNotas[a.alumnoId] = n ? n.nota : '';
      });

      setAlumnos(listaAlumnos);
      setNotas(objNotas);
    } catch {
      sileo.error({ title: "Error", description: "Fallo al cargar la nómina de estudiantes." });
    } finally {
      setCargandoNotas(false);
    }
  };

  const manejarCambioNota = (alumnoId, valorStr) => {
    let valor = valorStr.slice(0, 2);
    if (valor !== '' && Number.parseInt(valor) > 20) valor = '20';
    if (valor !== '' && Number.parseInt(valor) < 0) valor = '0';
    setNotas(prev => ({ ...prev, [alumnoId]: valor }));
    setEstadoSincronizacion('Cambios sin guardar');
  };

  const guardarCalificaciones = async () => {
    setGuardando(true);
    let enviadas = 0;

    try {
      const peticiones = alumnos.map(a => {
        const notaStr = notas[a.alumnoId];
        if (notaStr !== '' && notaStr !== null && notaStr !== undefined) {
          return axios.post('http://localhost:8080/api/v1/notas/registrar', {
            evaluacionId: evalActual.idEvaluacion,
            alumnoId: a.alumnoId,
            nota: Number.parseFloat(notaStr)
          }, { headers: getHeaders() }).then(() => { enviadas++; }).catch(() => {});
        }
        return Promise.resolve();
      });

      await Promise.all(peticiones);

      if (enviadas > 0) {
        setEstadoSincronizacion('Sincronizado');
        sileo.success({ title: "Guardado", description: `Se guardaron ${enviadas} calificaciones.` });
      } else {
        setEstadoSincronizacion('');
      }
    } catch {
      sileo.error({ title: "Error crítico", description: "Fallo al conectar con el servidor." });
    } finally {
      setGuardando(false);
      setTimeout(() => setEstadoSincronizacion(''), 3000);
    }
  };

  const abrirModalEval = () => {
    setFormEval({ nombreExamen: '', pesoPorcentaje: '', fechaExamen: '' });
    setModalEval(true);
  };

  const crearEvaluacion = async (e) => {
    e.preventDefault();
    setGuardandoEval(true);
    try {
      await axios.post('http://localhost:8080/api/v1/evaluaciones', {
        seccionId: seccionActual.idSeccion,
        nombreExamen: formEval.nombreExamen.trim(),
        pesoPorcentaje: Number.parseInt(formEval.pesoPorcentaje),
        fechaExamen: formEval.fechaExamen
      }, { headers: getHeaders() });
      setModalEval(false);
      sileo.success({ title: "Evaluación creada", description: `"${formEval.nombreExamen}" añadida al curso.` });
      cargarEvaluaciones(seccionActual);
    } catch {
      sileo.error({ title: "Error", description: "No se pudo crear la evaluación." });
    } finally {
      setGuardandoEval(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-black text-slate-800">Calificador de Evaluaciones</h2>
        <p className="text-slate-500 text-sm">Las notas (0-20) se guardan al hacer clic en guardar.</p>
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

        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <p className="font-bold text-slate-700 text-sm">2. Selecciona la evaluación:</p>
          {seccionActual && (
            <button onClick={abrirModalEval} className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
              <Plus size={14}/> Nueva Evaluación
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-3 min-h-[44px]">
          {seccionActual === null && <span className="text-slate-400 text-sm">Elige un curso primero...</span>}
          {seccionActual && cargandoEvals && <span className="text-slate-400 text-sm"><i className="fa-solid fa-spinner fa-spin"></i> Buscando evaluaciones...</span>}
          {seccionActual && !cargandoEvals && evaluaciones.length === 0 && (
            <span className="text-rose-500 text-sm font-semibold flex items-center gap-1">
              <AlertCircle size={16}/> Aún no hay evaluaciones para este curso.
              <button onClick={abrirModalEval} className="ml-2 underline text-indigo-600 hover:text-indigo-800">Crear una</button>
            </span>
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
            {estadoSincronizacion === 'Sincronizado' && <span className="text-emerald-500 font-bold text-sm flex items-center gap-1"><CheckCircle2 size={16}/> Sincronizado</span>}
            {estadoSincronizacion === 'Cambios sin guardar' && <span className="text-amber-500 font-bold text-sm flex items-center gap-1"><AlertCircle size={16}/> Cambios pendientes</span>}
          </div>

          <div className="p-6 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Alumno</th>
                  <th className="py-3 px-4 text-center w-40">Nota (0 a 20)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {cargandoNotas && <tr><td colSpan="2" className="text-center py-10 text-slate-400"><i className="fa-solid fa-spinner fa-spin mr-2"></i> Cargando nómina...</td></tr>}
                {!cargandoNotas && alumnos.length === 0 && <tr><td colSpan="2" className="text-center py-10 text-slate-400">No hay alumnos matriculados.</td></tr>}
                {!cargandoNotas && alumnos.map((a) => (
                  <tr key={a.alumnoId} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-3 px-4 font-bold text-slate-700">{a.nombreAlumno}</td>
                    <td className="py-3 px-4 text-center bg-slate-50 group-hover:bg-indigo-50/50 transition-colors">
                      <input
                        type="number"
                        placeholder="-"
                        value={notas[a.alumnoId] || ''}
                        onChange={(e) => manejarCambioNota(a.alumnoId, e.target.value)}
                        className="w-20 p-2 text-center rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none font-black text-slate-800 bg-white shadow-inner"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
            <button
              onClick={guardarCalificaciones}
              disabled={guardando || alumnos.length === 0}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              {guardando ? <i className="fa-solid fa-spinner fa-spin"></i> : <Save size={18}/>}
              Guardar Calificaciones
            </button>
          </div>
        </div>
      )}

      {/* MODAL NUEVA EVALUACIÓN */}
      {modalEval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-lg text-slate-800 flex items-center gap-2"><CalendarCheck className="text-indigo-500" size={20}/> Nueva Evaluación</h3>
              <button onClick={() => setModalEval(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <form onSubmit={crearEvaluacion} className="p-6 space-y-4">
              <div>
                <label htmlFor="eval-nombre" className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre del Examen</label>
                <input
                  id="eval-nombre"
                  type="text"
                  required
                  placeholder="Ej: Práctica Calificada 3"
                  value={formEval.nombreExamen}
                  onChange={e => setFormEval(p => ({ ...p, nombreExamen: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
              </div>
              <div>
                <label htmlFor="eval-peso" className="block text-xs font-bold text-slate-500 uppercase mb-1">Peso (%)</label>
                <input
                  id="eval-peso"
                  type="number"
                  required
                  min="1"
                  max="100"
                  placeholder="Ej: 20"
                  value={formEval.pesoPorcentaje}
                  onChange={e => setFormEval(p => ({ ...p, pesoPorcentaje: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
              </div>
              <div>
                <label htmlFor="eval-fecha" className="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha del Examen</label>
                <input
                  id="eval-fecha"
                  type="date"
                  required
                  value={formEval.fechaExamen}
                  onChange={e => setFormEval(p => ({ ...p, fechaExamen: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setModalEval(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancelar</button>
                <button type="submit" disabled={guardandoEval} className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-colors disabled:opacity-70 flex items-center gap-2">
                  {guardandoEval ? <i className="fa-solid fa-spinner fa-spin"></i> : <Plus size={16}/>} Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calificador;
