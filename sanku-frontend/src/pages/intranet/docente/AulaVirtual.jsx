import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Presentation, DoorOpen, Monitor, X, FileText, UploadCloud, CloudDownload,
  ChevronDown, ChevronUp, Plus, Megaphone, Trash2, Save, Paperclip, ClipboardList
} from 'lucide-react';
import { sileo } from 'sileo';
import { API_BASE, authHeaders, descargarArchivo } from '../../../utils/api';

const SIN_MODULO = { idModulo: null, titulo: 'Sin módulo asignado', descripcion: 'Material y evaluaciones aún no agrupados en un módulo.' };

const agruparPorModulo = (items) => {
  const mapa = new Map();
  items.forEach(item => {
    const key = item.idModulo ?? 'sin-modulo';
    if (!mapa.has(key)) mapa.set(key, []);
    mapa.get(key).push(item);
  });
  return mapa;
};

const EntregasYNotas = ({ evaluacion, seccion, onCerrar }) => {
  const [cargando, setCargando] = useState(true);
  const [alumnos, setAlumnos] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [form, setForm] = useState({});
  const [guardandoId, setGuardandoId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const cargar = async () => {
      setCargando(true);
      try {
        const h = authHeaders();
        const [resAlum, resEntregas, resNotas] = await Promise.all([
          axios.get(`${API_BASE}/matriculas/seccion/${seccion.idSeccion}`, { headers: h }),
          axios.get(`${API_BASE}/entregas/evaluacion/${evaluacion.idEvaluacion}`, { headers: h }).catch(() => ({ data: [] })),
          axios.get(`${API_BASE}/notas/evaluacion/${evaluacion.idEvaluacion}`, { headers: h }).catch(() => ({ data: [] }))
        ]);
        if (!isMounted) return;
        setAlumnos(resAlum.data);
        setEntregas(resEntregas.data);
        const formInicial = {};
        resAlum.data.forEach(a => {
          const n = resNotas.data.find(np => Number.parseInt(np.alumnoId) === Number.parseInt(a.alumnoId));
          formInicial[a.alumnoId] = { nota: n?.nota ?? '', comentario: n?.comentario ?? '' };
        });
        setForm(formInicial);
      } catch {
        sileo.error({ title: "Error", description: "No se pudo cargar la nómina de entregas." });
      } finally {
        if (isMounted) setCargando(false);
      }
    };
    cargar();
    return () => { isMounted = false; };
  }, [evaluacion.idEvaluacion, seccion.idSeccion]);

  const entregaDe = (alumnoId) => entregas.find(e => Number.parseInt(e.idAlumno) === Number.parseInt(alumnoId));

  const guardarNota = async (alumnoId) => {
    const datos = form[alumnoId];
    if (datos?.nota === '' || datos?.nota === undefined) return;
    setGuardandoId(alumnoId);
    try {
      await axios.post(`${API_BASE}/notas/registrar`, {
        evaluacionId: evaluacion.idEvaluacion,
        alumnoId,
        nota: Number.parseFloat(datos.nota),
        comentario: datos.comentario?.trim() || null
      }, { headers: authHeaders() });
      sileo.success({ title: "Guardado", description: "Nota y comentario registrados." });
    } catch (error) {
      sileo.error({ title: "Error", description: error.response?.data?.message || "No se pudo guardar la nota." });
    } finally {
      setGuardandoId(null);
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mt-3">
      <div className="flex justify-between items-center mb-3">
        <h5 className="font-bold text-slate-700 text-sm flex items-center gap-2">
          <ClipboardList size={16} className="text-indigo-500"/> Entregas — {evaluacion.nombreExamen}
        </h5>
        <button onClick={onCerrar} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
      </div>

      {cargando && <p className="text-center text-slate-400 py-6 text-sm">Cargando entregas...</p>}

      {!cargando && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-2 px-3">Alumno</th>
                <th className="py-2 px-3">Entrega</th>
                <th className="py-2 px-3 w-24">Nota</th>
                <th className="py-2 px-3">Comentario</th>
                <th className="py-2 px-3 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {alumnos.map(a => {
                const entrega = entregaDe(a.alumnoId);
                return (
                  <tr key={a.alumnoId}>
                    <td className="py-2 px-3 font-semibold text-slate-700">{a.nombreAlumno}</td>
                    <td className="py-2 px-3">
                      {entrega ? (
                        <button
                          onClick={() => descargarArchivo(`/entregas/${entrega.idEntrega}/archivo`, `entrega-${a.nombreAlumno}`)}
                          className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold"
                        >
                          <Paperclip size={14}/> Descargar
                        </button>
                      ) : <span className="text-slate-400 text-xs">Sin entregar</span>}
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number" min="0" max="20" placeholder="-"
                        value={form[a.alumnoId]?.nota ?? ''}
                        onChange={e => setForm(p => ({ ...p, [a.alumnoId]: { ...p[a.alumnoId], nota: e.target.value } }))}
                        className="w-16 p-1.5 text-center rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-800"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text" placeholder="Feedback para el alumno..."
                        value={form[a.alumnoId]?.comentario ?? ''}
                        onChange={e => setForm(p => ({ ...p, [a.alumnoId]: { ...p[a.alumnoId], comentario: e.target.value } }))}
                        className="w-full p-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-xs"
                      />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={() => guardarNota(a.alumnoId)}
                        disabled={guardandoId === a.alumnoId}
                        className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-60"
                        title="Guardar"
                      >
                        <Save size={14}/>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const ModuloPanel = ({ modulo, materiales, evaluaciones, seccion, onMaterialSubido, onEvaluacionCreada }) => {
  const [formMaterialAbierto, setFormMaterialAbierto] = useState(false);
  const [tituloMaterial, setTituloMaterial] = useState('');
  const [archivoMaterial, setArchivoMaterial] = useState(null);
  const [subiendoMaterial, setSubiendoMaterial] = useState(false);

  const [formEvalAbierto, setFormEvalAbierto] = useState(false);
  const [formEval, setFormEval] = useState({ nombreExamen: '', pesoPorcentaje: '', fechaExamen: '' });
  const [guardandoEval, setGuardandoEval] = useState(false);

  const [evaluacionRevisar, setEvaluacionRevisar] = useState(null);

  const subirMaterial = async (e) => {
    e.preventDefault();
    if (!tituloMaterial.trim() || !archivoMaterial) return;
    setSubiendoMaterial(true);
    try {
      const formData = new FormData();
      formData.append('idSeccion', seccion.idSeccion);
      formData.append('titulo', tituloMaterial.trim());
      if (modulo.idModulo) formData.append('idModulo', modulo.idModulo);
      formData.append('archivo', archivoMaterial);

      const res = await axios.post(`${API_BASE}/materiales`, formData, { headers: authHeaders() });
      onMaterialSubido(res.data);
      setTituloMaterial('');
      setArchivoMaterial(null);
      setFormMaterialAbierto(false);
      sileo.success({ title: "Material subido", description: `"${res.data.titulo}" ya está disponible para los alumnos.` });
    } catch (error) {
      sileo.error({ title: "Error", description: error.response?.data?.message || "No se pudo subir el material." });
    } finally {
      setSubiendoMaterial(false);
    }
  };

  const crearEvaluacion = async (e) => {
    e.preventDefault();
    setGuardandoEval(true);
    try {
      const res = await axios.post(`${API_BASE}/evaluaciones`, {
        seccionId: seccion.idSeccion,
        idModulo: modulo.idModulo || null,
        nombreExamen: formEval.nombreExamen.trim(),
        pesoPorcentaje: Number.parseInt(formEval.pesoPorcentaje),
        fechaExamen: formEval.fechaExamen
      }, { headers: authHeaders() });
      onEvaluacionCreada(res.data);
      setFormEval({ nombreExamen: '', pesoPorcentaje: '', fechaExamen: '' });
      setFormEvalAbierto(false);
      sileo.success({ title: "Evaluación creada", description: `"${res.data.nombreExamen}" añadida al módulo.` });
    } catch (error) {
      sileo.error({ title: "Error", description: error.response?.data?.message || "No se pudo crear la evaluación." });
    } finally {
      setGuardandoEval(false);
    }
  };

  return (
    <div className="space-y-5">
      {modulo.descripcion && <p className="text-slate-500 text-sm">{modulo.descripcion}</p>}

      {/* MATERIALES */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h5 className="font-bold text-slate-700 text-sm flex items-center gap-2"><FileText size={16} className="text-rose-500"/> Materiales</h5>
          <button onClick={() => setFormMaterialAbierto(v => !v)} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
            <UploadCloud size={14}/> Subir material
          </button>
        </div>

        {formMaterialAbierto && (
          <form onSubmit={subirMaterial} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 mb-3">
            <input
              type="text" required placeholder="Título del material"
              value={tituloMaterial} onChange={e => setTituloMaterial(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            />
            <input
              type="file" required
              onChange={e => setArchivoMaterial(e.target.files?.[0] || null)}
              className="w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-indigo-50 file:text-indigo-700 file:font-bold hover:file:bg-indigo-100"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setFormMaterialAbierto(false)} className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancelar</button>
              <button type="submit" disabled={subiendoMaterial} className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-70">
                {subiendoMaterial ? 'Subiendo...' : 'Publicar'}
              </button>
            </div>
          </form>
        )}

        {materiales.length === 0 && <p className="text-slate-400 text-xs">Sin materiales en este módulo.</p>}
        <div className="space-y-2">
          {materiales.map(m => (
            <div key={m.idMaterial} className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center shrink-0">
                <FileText size={16}/>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm truncate">{m.titulo}</p>
                <p className="text-xs text-slate-400">{new Date(m.fechaSubida).toLocaleDateString('es-ES')}</p>
              </div>
              <button onClick={() => descargarArchivo(`/materiales/${m.idMaterial}/archivo`, m.titulo)} className="w-8 h-8 bg-indigo-50 hover:bg-indigo-500 text-indigo-600 hover:text-white rounded-lg flex items-center justify-center transition-colors shrink-0">
                <CloudDownload size={16}/>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* EVALUACIONES */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h5 className="font-bold text-slate-700 text-sm flex items-center gap-2"><ClipboardList size={16} className="text-indigo-500"/> Evaluaciones</h5>
          <button onClick={() => setFormEvalAbierto(v => !v)} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
            <Plus size={14}/> Nueva evaluación
          </button>
        </div>

        {formEvalAbierto && (
          <form onSubmit={crearEvaluacion} className="bg-white border border-slate-200 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <input
              type="text" required placeholder="Nombre del examen"
              value={formEval.nombreExamen} onChange={e => setFormEval(p => ({ ...p, nombreExamen: e.target.value }))}
              className="p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm sm:col-span-1"
            />
            <input
              type="number" required min="1" max="100" placeholder="Peso (%)"
              value={formEval.pesoPorcentaje} onChange={e => setFormEval(p => ({ ...p, pesoPorcentaje: e.target.value }))}
              className="p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            />
            <input
              type="date" required
              value={formEval.fechaExamen} onChange={e => setFormEval(p => ({ ...p, fechaExamen: e.target.value }))}
              className="p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            />
            <div className="sm:col-span-3 flex justify-end gap-2">
              <button type="button" onClick={() => setFormEvalAbierto(false)} className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancelar</button>
              <button type="submit" disabled={guardandoEval} className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-70">
                {guardandoEval ? 'Creando...' : 'Crear'}
              </button>
            </div>
          </form>
        )}

        {evaluaciones.length === 0 && <p className="text-slate-400 text-xs">Sin evaluaciones en este módulo.</p>}
        <div className="space-y-2">
          {evaluaciones.map(ev => (
            <div key={ev.idEvaluacion}>
              <button
                onClick={() => setEvaluacionRevisar(evaluacionRevisar?.idEvaluacion === ev.idEvaluacion ? null : ev)}
                className={`w-full text-left bg-white border rounded-xl p-3 flex items-center justify-between transition-colors ${evaluacionRevisar?.idEvaluacion === ev.idEvaluacion ? 'border-indigo-400 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-300'}`}
              >
                <span className="font-semibold text-slate-800 text-sm">{ev.nombreExamen} <span className="text-slate-400 font-normal">({ev.pesoPorcentaje}%)</span></span>
                <span className="text-xs text-slate-400">{new Date(ev.fechaExamen + 'T00:00:00').toLocaleDateString('es-ES')}</span>
              </button>
              {evaluacionRevisar?.idEvaluacion === ev.idEvaluacion && (
                <EntregasYNotas evaluacion={ev} seccion={seccion} onCerrar={() => setEvaluacionRevisar(null)} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AnunciosPanel = ({ seccion, anuncios, onAnuncioCreado, onAnuncioEliminado }) => {
  const [formAbierto, setFormAbierto] = useState(false);
  const [form, setForm] = useState({ titulo: '', contenido: '' });
  const [guardando, setGuardando] = useState(false);

  const publicar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const res = await axios.post(`${API_BASE}/anuncios`, {
        idSeccion: seccion.idSeccion,
        titulo: form.titulo.trim(),
        contenido: form.contenido.trim()
      }, { headers: authHeaders() });
      onAnuncioCreado(res.data);
      setForm({ titulo: '', contenido: '' });
      setFormAbierto(false);
      sileo.success({ title: "Anuncio publicado", description: "Ya es visible para los alumnos de la sección." });
    } catch (error) {
      sileo.error({ title: "Error", description: error.response?.data?.message || "No se pudo publicar el anuncio." });
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (idAnuncio) => {
    try {
      await axios.delete(`${API_BASE}/anuncios/${idAnuncio}`, { headers: authHeaders() });
      onAnuncioEliminado(idAnuncio);
    } catch (error) {
      sileo.error({ title: "Error", description: error.response?.data?.message || "No se pudo eliminar el anuncio." });
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2"><Megaphone size={16} className="text-amber-500"/> Anuncios de la sección</h4>
        <button onClick={() => setFormAbierto(v => !v)} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
          <Plus size={14}/> Publicar
        </button>
      </div>
      <div className="p-5 space-y-3">
        {formAbierto && (
          <form onSubmit={publicar} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <input
              type="text" required placeholder="Título del anuncio"
              value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            />
            <textarea
              required rows="3" placeholder="Contenido del anuncio..."
              value={form.contenido} onChange={e => setForm(p => ({ ...p, contenido: e.target.value }))}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-y"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setFormAbierto(false)} className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancelar</button>
              <button type="submit" disabled={guardando} className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-70">
                {guardando ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          </form>
        )}
        {anuncios.length === 0 && <p className="text-slate-400 text-xs text-center py-4">Sin anuncios publicados todavía.</p>}
        {anuncios.map(a => (
          <div key={a.idAnuncio} className="bg-amber-50/50 border border-amber-100 rounded-xl p-3 flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-slate-800 text-sm">{a.titulo}</p>
              <p className="text-slate-600 text-xs mt-0.5">{a.contenido}</p>
              <p className="text-slate-400 text-xs mt-1">{new Date(a.fechaPublicacion).toLocaleDateString('es-ES')}</p>
            </div>
            <button onClick={() => eliminar(a.idAnuncio)} className="text-slate-400 hover:text-rose-500 shrink-0"><Trash2 size={16}/></button>
          </div>
        ))}
      </div>
    </div>
  );
};

const AulaVirtual = () => {
  const [secciones, setSecciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [cursoActivo, setCursoActivo] = useState(null);
  const [cargandoAula, setCargandoAula] = useState(false);
  const [modulos, setModulos] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [anuncios, setAnuncios] = useState([]);
  const [moduloExpandido, setModuloExpandido] = useState(null);

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
        sileo.error({ title: "Error", description: "No se pudieron cargar los cursos." });
      } finally {
        if (isMounted) setCargando(false);
      }
    };
    cargarMisCursos();
    return () => { isMounted = false; };
  }, []);

  const abrirAula = async (sec) => {
    setCursoActivo(sec);
    setModalAbierto(true);
    setCargandoAula(true);
    setModuloExpandido(null);
    try {
      const h = authHeaders();
      const [resModulos, resMateriales, resEvaluaciones, resAnuncios] = await Promise.all([
        axios.get(`${API_BASE}/modulos/curso/${sec.cursoId}`, { headers: h }),
        axios.get(`${API_BASE}/materiales/seccion/${sec.idSeccion}`, { headers: h }),
        axios.get(`${API_BASE}/evaluaciones/seccion/${sec.idSeccion}`, { headers: h }),
        axios.get(`${API_BASE}/anuncios/seccion/${sec.idSeccion}`, { headers: h }).catch(() => ({ data: [] }))
      ]);
      setModulos(resModulos.data);
      setMateriales(resMateriales.data);
      setEvaluaciones(resEvaluaciones.data);
      setAnuncios(resAnuncios.data);
    } catch {
      sileo.error({ title: "Error", description: "No se pudo cargar el contenido del aula." });
      setModulos([]); setMateriales([]); setEvaluaciones([]); setAnuncios([]);
    } finally {
      setCargandoAula(false);
    }
  };

  const materialesPorModulo = agruparPorModulo(materiales);
  const evaluacionesPorModulo = agruparPorModulo(evaluaciones);
  const modulosConSinModulo = [
    ...modulos,
    ...((materialesPorModulo.get('sin-modulo')?.length || evaluacionesPorModulo.get('sin-modulo')?.length) ? [SIN_MODULO] : [])
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-black text-slate-800">Mis Clases (Aula Virtual)</h2>
        <p className="text-slate-500 text-sm">Ingresa a tus cursos para gestionar módulos, materiales, evaluaciones y anuncios.</p>
      </div>

      {cargando && <p className="text-center text-slate-400 py-10">Cargando cursos...</p>}
      {!cargando && secciones.length === 0 && <p className="text-center text-slate-400 py-10">No tienes cursos asignados.</p>}
      {!cargando && secciones.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {secciones.map(s => (
            <div key={s.idSeccion} className="bg-white rounded-3xl shadow-sm border border-slate-200 border-t-4 border-t-indigo-600 p-6 flex flex-col items-center text-center hover:shadow-md transition-all hover:-translate-y-1">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                <Presentation size={32}/>
              </div>
              <h4 className="font-black text-slate-800 text-lg mb-1 leading-tight">{s.nombreCurso}</h4>
              <p className="text-xs text-slate-500 font-bold tracking-widest uppercase mb-6 bg-slate-100 px-3 py-1 rounded-full">
                SEC-{s.idSeccion} | {s.modalidad}
              </p>
              <button onClick={() => abrirAula(s)} className="w-full border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-600 hover:text-white font-bold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 mt-auto">
                <DoorOpen size={16}/> Entrar al Curso
              </button>
            </div>
          ))}
        </div>
      )}

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-black text-lg text-slate-800 flex items-center gap-2"><Monitor className="text-indigo-500" size={24}/> {cursoActivo?.nombreCurso}</h3>
              <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-lg shadow-sm"><X size={20}/></button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50 space-y-4">
              {cargandoAula && <p className="text-center text-slate-400 py-10">Cargando contenido del aula...</p>}

              {!cargandoAula && (
                <>
                  {modulosConSinModulo.length === 0 && (
                    <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center">
                      <FileText size={48} className="mx-auto text-slate-200 mb-4"/>
                      <p className="text-slate-500 font-medium">El Coordinador aún no ha definido módulos para este curso.</p>
                    </div>
                  )}

                  {modulosConSinModulo.map(mod => {
                    const key = mod.idModulo ?? 'sin-modulo';
                    const abierto = moduloExpandido === key;
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
                          <div className="px-5 pb-5 border-t border-slate-100 pt-4">
                            <ModuloPanel
                              modulo={mod}
                              materiales={materialesPorModulo.get(key) || []}
                              evaluaciones={evaluacionesPorModulo.get(key) || []}
                              seccion={cursoActivo}
                              onMaterialSubido={(nuevo) => setMateriales(prev => [...prev, nuevo])}
                              onEvaluacionCreada={(nueva) => setEvaluaciones(prev => [...prev, nueva])}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <AnunciosPanel
                    seccion={cursoActivo}
                    anuncios={anuncios}
                    onAnuncioCreado={(nuevo) => setAnuncios(prev => [nuevo, ...prev])}
                    onAnuncioEliminado={(id) => setAnuncios(prev => prev.filter(a => a.idAnuncio !== id))}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AulaVirtual;
