import { useState, useEffect } from 'react';
import axios from 'axios';
import { Layers, Plus, Pen, Trash2, X, Save, ArrowUp, ArrowDown } from 'lucide-react';
import { sileo } from 'sileo';
import Swal from 'sweetalert2';
import { API_BASE, authHeaders } from '../../../utils/api';

const customSwal = Swal.mixin({
  customClass: {
    popup: 'rounded-3xl border-0 shadow-2xl',
    confirmButton: 'bg-teal-500 hover:bg-teal-600 text-white font-bold py-2.5 px-6 rounded-xl border-0 mx-2 transition-colors',
    cancelButton: 'bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 px-6 rounded-xl border-0 mx-2 transition-colors'
  },
  buttonsStyling: false
});

const ModulosCurso = () => {
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState('');
  const [modulos, setModulos] = useState([]);
  const [cargandoCursos, setCargandoCursos] = useState(true);
  const [cargandoModulos, setCargandoModulos] = useState(false);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState({ idModulo: '', titulo: '', descripcion: '', orden: 1 });

  useEffect(() => {
    let isMounted = true;
    axios.get(`${API_BASE}/cursos`, { headers: authHeaders() })
      .then(res => { if (isMounted) setCursos(res.data); })
      .catch(() => sileo.error({ title: "Error", description: "No se pudieron cargar los cursos." }))
      .finally(() => { if (isMounted) setCargandoCursos(false); });
    return () => { isMounted = false; };
  }, []);

  const cargarModulos = async (idCurso) => {
    if (!idCurso) { setModulos([]); return; }
    setCargandoModulos(true);
    try {
      const res = await axios.get(`${API_BASE}/modulos/curso/${idCurso}`, { headers: authHeaders() });
      setModulos(res.data);
    } catch {
      sileo.error({ title: "Error", description: "No se pudieron cargar los módulos de este curso." });
      setModulos([]);
    } finally {
      setCargandoModulos(false);
    }
  };

  const seleccionarCurso = (idCurso) => {
    setCursoSeleccionado(idCurso);
    cargarModulos(idCurso);
  };

  const abrirModal = (mod = null) => {
    setForm(mod ? {
      idModulo: mod.idModulo, titulo: mod.titulo, descripcion: mod.descripcion || '', orden: mod.orden
    } : {
      idModulo: '', titulo: '', descripcion: '', orden: modulos.length + 1
    });
    setModalAbierto(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    const payload = {
      idCurso: Number.parseInt(cursoSeleccionado),
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim(),
      orden: Number.parseInt(form.orden)
    };
    const url = form.idModulo ? `${API_BASE}/modulos/${form.idModulo}` : `${API_BASE}/modulos`;
    const method = form.idModulo ? 'PUT' : 'POST';

    try {
      await axios({ method, url, data: payload, headers: authHeaders() });
      sileo.success({ title: "Éxito", description: form.idModulo ? "Módulo actualizado." : "Nuevo módulo creado." });
      setModalAbierto(false);
      cargarModulos(cursoSeleccionado);
    } catch (error) {
      customSwal.fire("Error", error.response?.data?.message || "Revisa los datos ingresados.", "error");
    } finally {
      setGuardando(false);
    }
  };

  const eliminarModulo = async (mod) => {
    let materiales = [];
    let evaluaciones = [];
    try {
      const h = authHeaders();
      const [resMat, resEval] = await Promise.all([
        axios.get(`${API_BASE}/materiales/modulo/${mod.idModulo}`, { headers: h }).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/evaluaciones/modulo/${mod.idModulo}`, { headers: h }).catch(() => ({ data: [] }))
      ]);
      materiales = resMat.data;
      evaluaciones = resEval.data;
    } catch {
      // si falla la consulta de conteo, se sigue con la confirmación simple
    }

    const tieneContenido = materiales.length > 0 || evaluaciones.length > 0;
    const result = await customSwal.fire({
      title: `¿Eliminar "${mod.titulo}"?`,
      text: tieneContenido
        ? `Este módulo tiene ${materiales.length} material(es) y ${evaluaciones.length} evaluación(es). Al eliminarlo, quedarán sin agrupar (no se borran) — ¿continuar?`
        : "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_BASE}/modulos/${mod.idModulo}`, { headers: authHeaders() });
      sileo.success({
        title: "Eliminado",
        description: tieneContenido
          ? `"${mod.titulo}" eliminado. Su material y evaluaciones quedaron sin agrupar.`
          : `"${mod.titulo}" eliminado correctamente.`
      });
      cargarModulos(cursoSeleccionado);
    } catch (error) {
      customSwal.fire("Error", error.response?.data?.message || "No se pudo eliminar el módulo.", "error");
    }
  };

  const moverModulo = async (index, direccion) => {
    const otroIndex = index + direccion;
    if (otroIndex < 0 || otroIndex >= modulos.length) return;

    const actual = modulos[index];
    const otro = modulos[otroIndex];

    try {
      await Promise.all([
        axios.put(`${API_BASE}/modulos/${actual.idModulo}`, {
          idCurso: actual.idCurso, titulo: actual.titulo, descripcion: actual.descripcion, orden: otro.orden
        }, { headers: authHeaders() }),
        axios.put(`${API_BASE}/modulos/${otro.idModulo}`, {
          idCurso: otro.idCurso, titulo: otro.titulo, descripcion: otro.descripcion, orden: actual.orden
        }, { headers: authHeaders() })
      ]);
      cargarModulos(cursoSeleccionado);
    } catch (error) {
      customSwal.fire("Error", error.response?.data?.message || "No se pudo reordenar los módulos.", "error");
    }
  };

  const setField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Módulos del Curso</h2>
          <p className="text-slate-500 text-sm">Define las unidades/semanas del syllabus que comparten todas las secciones de un curso.</p>
        </div>
        {cursoSeleccionado && (
          <button onClick={() => abrirModal()} className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-colors">
            <Plus size={18}/> Nuevo Módulo
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5">
        <label htmlFor="mod-curso" className="block text-xs font-bold text-slate-500 uppercase mb-1">Curso</label>
        <select
          id="mod-curso"
          value={cursoSeleccionado}
          onChange={e => seleccionarCurso(e.target.value)}
          disabled={cargandoCursos}
          className="w-full md:w-96 p-2.5 rounded-xl border border-slate-300 focus:ring-teal-500 outline-none text-sm font-semibold bg-white text-slate-800"
        >
          <option value="">{cargandoCursos ? 'Cargando cursos...' : 'Seleccione un curso...'}</option>
          {cursos.map(c => <option key={c.idCurso} value={c.idCurso}>{c.nombre}</option>)}
        </select>
      </div>

      {cursoSeleccionado && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto p-5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="py-3 px-4 w-20">Orden</th>
                  <th className="py-3 px-4">Título</th>
                  <th className="py-3 px-4">Descripción</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {cargandoModulos && <tr><td colSpan="4" className="text-center py-8 text-slate-400">Cargando módulos...</td></tr>}
                {!cargandoModulos && modulos.length === 0 && <tr><td colSpan="4" className="text-center py-8 text-slate-400">Este curso aún no tiene módulos.</td></tr>}
                {!cargandoModulos && modulos.map((m, i) => (
                  <tr key={m.idModulo} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-700">
                      <div className="flex items-center gap-1">
                        <span className="bg-teal-50 text-teal-700 px-2.5 py-1 rounded-lg font-bold text-xs">{m.orden}</span>
                        <div className="flex flex-col">
                          <button onClick={() => moverModulo(i, -1)} disabled={i === 0} className="text-slate-400 hover:text-teal-600 disabled:opacity-20 disabled:cursor-not-allowed" title="Subir">
                            <ArrowUp size={14}/>
                          </button>
                          <button onClick={() => moverModulo(i, 1)} disabled={i === modulos.length - 1} className="text-slate-400 hover:text-teal-600 disabled:opacity-20 disabled:cursor-not-allowed" title="Bajar">
                            <ArrowDown size={14}/>
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{m.titulo}</td>
                    <td className="py-3 px-4 text-slate-500 max-w-md truncate">{m.descripcion || '—'}</td>
                    <td className="py-3 px-4 text-center flex items-center justify-center gap-1">
                      <button onClick={() => abrirModal(m)} className="p-2 text-slate-400 hover:text-teal-500 hover:bg-teal-50 rounded-lg transition-colors" title="Editar">
                        <Pen size={18}/>
                      </button>
                      <button onClick={() => eliminarModulo(m)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Eliminar">
                        <Trash2 size={18}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-lg text-slate-800 flex items-center gap-2">
                <Layers className="text-teal-500" size={20}/>
                {form.idModulo ? 'Editar Módulo' : 'Nuevo Módulo'}
              </h3>
              <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-lg"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="mod-titulo" className="block text-xs font-bold text-slate-500 uppercase mb-1">Título</label>
                <input
                  id="mod-titulo"
                  type="text"
                  required
                  placeholder="Ej: Semana 1 — Introducción"
                  value={form.titulo}
                  onChange={e => setField('titulo', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                />
              </div>
              <div>
                <label htmlFor="mod-descripcion" className="block text-xs font-bold text-slate-500 uppercase mb-1">Descripción</label>
                <textarea
                  id="mod-descripcion"
                  rows="3"
                  value={form.descripcion}
                  onChange={e => setField('descripcion', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-sm resize-y"
                />
              </div>
              <div>
                <label htmlFor="mod-orden" className="block text-xs font-bold text-slate-500 uppercase mb-1">Orden</label>
                <input
                  id="mod-orden"
                  type="number"
                  required
                  min="1"
                  value={form.orden}
                  onChange={e => setField('orden', e.target.value)}
                  className="w-32 p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setModalAbierto(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancelar</button>
                <button type="submit" disabled={guardando} className="px-5 py-2.5 text-sm font-bold text-white bg-teal-500 hover:bg-teal-600 rounded-xl shadow-md transition-colors disabled:opacity-70 flex items-center gap-2">
                  {guardando ? <i className="fa-solid fa-spinner fa-spin"></i> : <Save size={16}/>} Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModulosCurso;
