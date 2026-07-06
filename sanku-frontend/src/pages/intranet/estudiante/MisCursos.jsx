import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Monitor, MapPin, Laptop, DoorOpen, CloudDownload, FileText, X, ChevronDown, ChevronUp, ClipboardList, UploadCloud, Paperclip } from 'lucide-react';
import { sileo } from 'sileo';
import { API_BASE, authHeaders, descargarArchivo } from '../../../utils/api';

const coloresCursos = ['#2563eb', '#ea580c', '#0d9488', '#9333ea', '#e11d48'];
const diasSemana = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const getCicloActual = () => {
  const now = new Date();
  return now.getMonth() < 6 ? `${now.getFullYear()}-I` : `${now.getFullYear()}-II`;
};

const getCicloAnterior = () => {
  const now = new Date();
  if (now.getMonth() < 6) return `${now.getFullYear() - 1}-II`;
  return `${now.getFullYear()}-I`;
};

const agruparPorModulo = (items) => {
  const mapa = new Map();
  items.forEach(item => {
    const key = item.idModulo ?? 'sin-modulo';
    if (!mapa.has(key)) mapa.set(key, []);
    mapa.get(key).push(item);
  });
  return mapa;
};

const SIN_MODULO = { idModulo: null, titulo: 'Sin módulo asignado' };

const EvaluacionAlumno = ({ evaluacion, entrega, nota, alumnoId, onEntregada }) => {
  const [archivo, setArchivo] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const entregar = async (e) => {
    e.preventDefault();
    if (!archivo) return;
    setEnviando(true);
    try {
      const formData = new FormData();
      formData.append('idEvaluacion', evaluacion.idEvaluacion);
      formData.append('idAlumno', alumnoId);
      formData.append('archivo', archivo);
      const res = await axios.post(`${API_BASE}/entregas`, formData, { headers: authHeaders() });
      onEntregada(res.data);
      sileo.success({ title: "Entrega registrada", description: `Tu entrega para "${evaluacion.nombreExamen}" fue enviada.` });
    } catch (error) {
      sileo.error({ title: "Error", description: error.response?.data?.message || "No se pudo registrar la entrega." });
      if (error.response?.status === 400) onEntregada(null, true);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-slate-800 text-sm">{evaluacion.nombreExamen} <span className="text-slate-400 font-normal">({evaluacion.pesoPorcentaje}%)</span></p>
          <p className="text-xs text-slate-400">{new Date(evaluacion.fechaExamen + 'T00:00:00').toLocaleDateString('es-ES')}</p>
        </div>
        {nota && (
          <span className={`text-sm font-black px-3 py-1 rounded-xl border ${nota.nota >= 14 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : nota.nota >= 11 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
            {Number(nota.nota).toFixed(2)}
          </span>
        )}
      </div>

      {nota?.comentario && (
        <p className="text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-lg p-2">
          <strong className="text-slate-600">Feedback del docente:</strong> {nota.comentario}
        </p>
      )}

      {entrega ? (
        <button
          onClick={() => descargarArchivo(`/entregas/${entrega.idEntrega}/archivo`, `mi-entrega-${evaluacion.nombreExamen}`)}
          className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 text-sm font-semibold"
        >
          <Paperclip size={14}/> Ver mi entrega ({new Date(entrega.fechaEntrega).toLocaleDateString('es-ES')})
        </button>
      ) : (
        <form onSubmit={entregar} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <input
            type="file" required
            onChange={e => setArchivo(e.target.files?.[0] || null)}
            className="flex-1 text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-bold hover:file:bg-blue-100"
          />
          <button type="submit" disabled={enviando} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl transition-colors text-xs flex items-center justify-center gap-1.5 disabled:opacity-60">
            <UploadCloud size={14}/> {enviando ? 'Enviando...' : 'Entregar'}
          </button>
        </form>
      )}
    </div>
  );
};

const MisCursos = () => {
  const cicloActual = getCicloActual();
  const cicloAnterior = getCicloAnterior();

  const [cicloSeleccionado, setCicloSeleccionado] = useState(cicloActual);
  const [secciones, setSecciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [modalAula, setModalAula] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState(null);
  const [cargandoAula, setCargandoAula] = useState(false);
  const [modulos, setModulos] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [notas, setNotas] = useState([]);
  const [moduloExpandido, setModuloExpandido] = useState(null);

  const usuarioId = localStorage.getItem("usuarioId");
  const alumnoId = localStorage.getItem("alumnoId");

  useEffect(() => {
    let isMounted = true;

    const cargarCursos = async () => {
      if (!usuarioId) return;
      setCargando(true);
      try {
        const h = authHeaders();
        const resPerfil = await axios.get(`${API_BASE}/alumnos/perfil/${usuarioId}`, { headers: h });
        const miCarrera = resPerfil.data.nombreCarrera;

        const [resCarreras, resCursos, resSecciones] = await Promise.all([
          axios.get(`${API_BASE}/carreras`, { headers: h }),
          axios.get(`${API_BASE}/cursos`, { headers: h }),
          axios.get(`${API_BASE}/secciones/ciclo/${cicloSeleccionado}`, { headers: h })
        ]);

        if (!isMounted) return;

        const idCarreraReal = resCarreras.data.find(c => c.nombre === miCarrera)?.idCarrera;
        const idsCursosValidos = new Set(resCursos.data.filter(c => c.carreraId === idCarreraReal).map(c => c.idCurso));
        setSecciones(resSecciones.data.filter(s => idsCursosValidos.has(s.cursoId)));
      } catch {
        sileo.error({ title: "Error", description: "No se pudieron cargar tus cursos." });
      } finally {
        if (isMounted) setCargando(false);
      }
    };

    cargarCursos();
    return () => { isMounted = false; };
  }, [usuarioId, cicloSeleccionado]);

  const abrirAula = async (sec) => {
    setSeccionActiva(sec);
    setModalAula(true);
    setCargandoAula(true);
    setModuloExpandido(null);
    try {
      const h = authHeaders();
      const [resModulos, resMateriales, resEvaluaciones, resEntregas, resNotas] = await Promise.all([
        axios.get(`${API_BASE}/modulos/curso/${sec.cursoId}`, { headers: h }),
        axios.get(`${API_BASE}/materiales/seccion/${sec.idSeccion}`, { headers: h }),
        axios.get(`${API_BASE}/evaluaciones/seccion/${sec.idSeccion}`, { headers: h }),
        alumnoId ? axios.get(`${API_BASE}/entregas/alumno/${alumnoId}`, { headers: h }).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        alumnoId ? axios.get(`${API_BASE}/notas/alumno/${alumnoId}`, { headers: h }).catch(() => ({ data: [] })) : Promise.resolve({ data: [] })
      ]);
      setModulos(resModulos.data);
      setMateriales(resMateriales.data);
      setEvaluaciones(resEvaluaciones.data);
      setEntregas(resEntregas.data);
      setNotas(resNotas.data);
    } catch {
      sileo.error({ title: "Error", description: "No se pudo cargar el contenido del aula." });
      setModulos([]); setMateriales([]); setEvaluaciones([]);
    } finally {
      setCargandoAula(false);
    }
  };

  const entregaDe = useCallback((idEvaluacion) => entregas.find(e => Number.parseInt(e.idEvaluacion) === Number.parseInt(idEvaluacion)), [entregas]);
  const notaDe = useCallback((idEvaluacion) => notas.find(n => Number.parseInt(n.evaluacionId) === Number.parseInt(idEvaluacion)), [notas]);

  const materialesPorModulo = agruparPorModulo(materiales);
  const evaluacionesPorModulo = agruparPorModulo(evaluaciones);
  const modulosConSinModulo = [
    ...modulos,
    ...((materialesPorModulo.get('sin-modulo')?.length || evaluacionesPorModulo.get('sin-modulo')?.length) ? [SIN_MODULO] : [])
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Mis Cursos</h2>
          <p className="text-slate-500 text-sm">Ciclo Académico: <strong className="text-blue-600">{cicloSeleccionado}</strong></p>
        </div>
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
        <p className="text-center text-slate-400 py-10"><i className="fa-solid fa-spinner fa-spin mr-2"></i> Cargando tus cursos...</p>
      )}
      {!cargando && secciones.length === 0 && (
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200 text-center">
          <Monitor size={48} className="mx-auto text-slate-200 mb-4"/>
          <p className="text-slate-500 font-medium">No hay cursos programados para ti en el ciclo <strong>{cicloSeleccionado}</strong>.</p>
        </div>
      )}
      {!cargando && secciones.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {secciones.map((s) => {
            const colorFondo = coloresCursos[s.cursoId % coloresCursos.length];
            return (
              <div key={s.idSeccion} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow group">
                <div className="h-2 w-full transition-all group-hover:h-3" style={{ backgroundColor: colorFondo }}></div>
                <div className="p-6 flex flex-col flex-1">
                  <h4 className="font-black text-slate-800 text-lg mb-1 leading-tight">{s.nombreCurso}</h4>
                  <p className="text-xs font-bold text-slate-400 mb-4">Prof. {s.nombreDocente}</p>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 mb-6">
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span>Día</span><strong className="text-slate-800">{diasSemana[s.diaSemana]}</strong>
                    </div>
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span>Modalidad</span>
                      <strong className="text-blue-600 flex items-center gap-1">
                        {s.modalidad === 'VIRTUAL' ? <Laptop size={12}/> : <MapPin size={12}/>} {s.modalidad}
                      </strong>
                    </div>
                  </div>

                  <button
                    onClick={() => abrirAula(s)}
                    className="w-full bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-bold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 mt-auto border border-blue-100 group-hover:border-blue-600"
                  >
                    <DoorOpen size={16}/> Ver Aula Virtual
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalAula && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-black text-lg text-slate-800">{seccionActiva?.nombreCurso}</h3>
              <button onClick={() => setModalAula(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-lg shadow-sm">
                <X size={20}/>
              </button>
            </div>
            <p className="px-6 pt-4 text-sm text-slate-500">Prof. <strong>{seccionActiva?.nombreDocente}</strong> — SEC-{seccionActiva?.idSeccion}</p>

            <div className="p-6 overflow-y-auto flex-1 space-y-3">
              {cargandoAula && (
                <p className="text-center text-slate-400 py-10"><i className="fa-solid fa-spinner fa-spin mr-2"></i> Cargando aula...</p>
              )}

              {!cargandoAula && modulosConSinModulo.length === 0 && (
                <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center">
                  <FileText size={48} className="mx-auto text-slate-200 mb-4"/>
                  <p className="text-slate-500 font-medium">El docente aún no ha compartido materiales en este curso.</p>
                </div>
              )}

              {!cargandoAula && modulosConSinModulo.map(mod => {
                const key = mod.idModulo ?? 'sin-modulo';
                const abierto = moduloExpandido === key;
                const mats = materialesPorModulo.get(key) || [];
                const evals = evaluacionesPorModulo.get(key) || [];
                return (
                  <div key={key} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <button
                      onClick={() => setModuloExpandido(abierto ? null : key)}
                      className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <span className="font-black text-slate-800">{mod.titulo}</span>
                      {abierto ? <ChevronUp size={18} className="text-slate-400"/> : <ChevronDown size={18} className="text-slate-400"/>}
                    </button>
                    {abierto && (
                      <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-5">
                        {mod.descripcion && <p className="text-slate-500 text-sm">{mod.descripcion}</p>}

                        <div>
                          <h5 className="font-bold text-slate-700 text-sm flex items-center gap-2 mb-2"><FileText size={16} className="text-rose-500"/> Materiales</h5>
                          {mats.length === 0 && <p className="text-slate-400 text-xs">Sin materiales en este módulo.</p>}
                          <div className="space-y-2">
                            {mats.map(m => (
                              <div key={m.idMaterial} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
                                <div className="w-9 h-9 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center shrink-0">
                                  <FileText size={16}/>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-slate-800 text-sm truncate">{m.titulo}</p>
                                  <p className="text-xs text-slate-400">{new Date(m.fechaSubida).toLocaleDateString('es-ES')}</p>
                                </div>
                                <button onClick={() => descargarArchivo(`/materiales/${m.idMaterial}/archivo`, m.titulo)} className="w-8 h-8 bg-blue-50 hover:bg-blue-500 text-blue-600 hover:text-white rounded-lg flex items-center justify-center transition-colors shrink-0">
                                  <CloudDownload size={16}/>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h5 className="font-bold text-slate-700 text-sm flex items-center gap-2 mb-2"><ClipboardList size={16} className="text-blue-500"/> Evaluaciones</h5>
                          {evals.length === 0 && <p className="text-slate-400 text-xs">Sin evaluaciones en este módulo.</p>}
                          <div className="space-y-2">
                            {evals.map(ev => (
                              <EvaluacionAlumno
                                key={ev.idEvaluacion}
                                evaluacion={ev}
                                entrega={entregaDe(ev.idEvaluacion)}
                                nota={notaDe(ev.idEvaluacion)}
                                alumnoId={alumnoId}
                                onEntregada={(nuevaEntrega, refrescar) => {
                                  if (nuevaEntrega) setEntregas(prev => [...prev, nuevaEntrega]);
                                  else if (refrescar && alumnoId) {
                                    axios.get(`${API_BASE}/entregas/alumno/${alumnoId}`, { headers: authHeaders() })
                                      .then(res => setEntregas(res.data)).catch(() => {});
                                  }
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MisCursos;
