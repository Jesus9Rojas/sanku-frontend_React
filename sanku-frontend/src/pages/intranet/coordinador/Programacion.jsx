import { useState, useEffect } from 'react';
import axios from 'axios';
import { CalendarCheck, Search, Plus, UserPen, Trash2, X, Save } from 'lucide-react';
import { sileo } from 'sileo';
import Swal from 'sweetalert2';
import { API_BASE } from '../../../utils/api';

const customSwal = Swal.mixin({
  customClass: {
    popup: 'rounded-3xl border-0 shadow-2xl',
    confirmButton: 'bg-teal-500 hover:bg-teal-600 text-white font-bold py-2.5 px-6 rounded-xl border-0 mx-2 transition-colors',
    cancelButton: 'bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 px-6 rounded-xl border-0 mx-2 transition-colors'
  },
  buttonsStyling: false
});

const anioActual = new Date().getFullYear();
const opcionesCiclos = Array.from({ length: 5 }, (_, i) => anioActual - 2 + i).flatMap(y => [`${y}-I`, `${y}-II`]);

const Programacion = () => {
  const [secciones, setSecciones] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [cursosList, setCursosList] = useState([]);
  const [docentesList, setDocentesList] = useState([]);
  const [guardando, setGuardando] = useState(false);

  const [form, setForm] = useState({
    idSeccion: '', cursoId: '', docenteId: '', cicloAcademico: `${anioActual}-I`,
    modalidad: 'PRESENCIAL', diaSemana: '', horaInicio: '', horaFin: ''
  });

  const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  const recargarSecciones = async () => {
    try {
      const res = await axios.get(`${API_BASE}/secciones`, { headers: getHeaders() });
      setSecciones(res.data);
    } catch {
      sileo.error({ title: "Error", description: "No se pudo actualizar la tabla de programación." });
    }
  };

  useEffect(() => {
    let isMounted = true;

    const iniciarDatos = async () => {
      try {
        const h = getHeaders();
        const [resSecciones, resCursos, resDocentes] = await Promise.all([
          axios.get(`${API_BASE}/secciones`, { headers: h }),
          axios.get(`${API_BASE}/cursos`, { headers: h }),
          axios.get(`${API_BASE}/docentes`, { headers: h })
        ]);

        if (isMounted) {
          setSecciones(resSecciones.data);
          setCursosList(resCursos.data);
          setDocentesList(resDocentes.data);
        }
      } catch {
        sileo.error({ title: "Error", description: "No se pudo cargar la información." });
      } finally {
        if (isMounted) setCargando(false);
      }
    };

    iniciarDatos();
    return () => { isMounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtradas = secciones.filter(s =>
    s.nombreCurso.toLowerCase().includes(busqueda.toLowerCase()) ||
    s.nombreDocente.toLowerCase().includes(busqueda.toLowerCase())
  );

  const abrirModal = (sec = null) => {
    setForm(sec ? {
      idSeccion: sec.idSeccion, cursoId: sec.cursoId, docenteId: sec.docenteId,
      cicloAcademico: sec.cicloAcademico, modalidad: sec.modalidad, diaSemana: sec.diaSemana,
      horaInicio: sec.horaInicio?.substring(0, 5) || '', horaFin: sec.horaFin?.substring(0, 5) || ''
    } : {
      idSeccion: '', cursoId: '', docenteId: '', cicloAcademico: `${anioActual}-I`,
      modalidad: 'PRESENCIAL', diaSemana: '', horaInicio: '', horaFin: ''
    });
    setModalAbierto(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.horaInicio >= form.horaFin) {
      customSwal.fire("Aviso", "La hora de inicio debe ser anterior a la hora de fin.", "warning");
      return;
    }
    setGuardando(true);
    const url = form.idSeccion
      ? `${API_BASE}/secciones/${form.idSeccion}`
      : `${API_BASE}/secciones`;
    const method = form.idSeccion ? 'PUT' : 'POST';

    try {
      await axios({ method, url, data: form, headers: getHeaders() });
      sileo.success({ title: "Éxito", description: form.idSeccion ? "Asignación actualizada." : "Nueva sección creada." });
      setModalAbierto(false);
      recargarSecciones();
    } catch (error) {
      customSwal.fire("Error", error.response?.data?.message || "Revisa los datos ingresados.", "error");
    } finally {
      setGuardando(false);
    }
  };

  const eliminarSeccion = async (sec) => {
    const result = await customSwal.fire({
      title: `¿Eliminar SEC-${sec.idSeccion}?`,
      text: `Se eliminará "${sec.nombreCurso}". Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_BASE}/secciones/${sec.idSeccion}`, { headers: getHeaders() });
      setSecciones(prev => prev.filter(s => s.idSeccion !== sec.idSeccion));
      sileo.success({ title: "Eliminado", description: `SEC-${sec.idSeccion} eliminada correctamente.` });
    } catch {
      sileo.error({ title: "Error", description: "No se pudo eliminar la sección." });
    }
  };

  const setField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Programación de Cursos</h2>
          <p className="text-slate-500 text-sm">Visualiza las secciones, modalidades y horarios del ciclo.</p>
        </div>
        <button onClick={() => abrirModal()} className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-colors">
          <Plus size={18}/> Abrir Nuevo Curso
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-3 text-slate-400" size={18}/>
            <input
              type="text"
              placeholder="Buscar curso o docente..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-teal-500 outline-none text-sm bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto p-5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-3 px-4">Sección ID</th>
                <th className="py-3 px-4">Nombre del Curso</th>
                <th className="py-3 px-4">Docente Asignado</th>
                <th className="py-3 px-4">Ciclo</th>
                <th className="py-3 px-4">Modalidad</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {cargando && <tr><td colSpan="6" className="text-center py-8 text-slate-400">Cargando programación...</td></tr>}
              {!cargando && filtradas.length === 0 && <tr><td colSpan="6" className="text-center py-8 text-slate-400">No hay secciones programadas.</td></tr>}
              {!cargando && filtradas.map(s => (
                <tr key={s.idSeccion} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-700">SEC-{s.idSeccion}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{s.nombreCurso}</td>
                  <td className="py-3 px-4"><span className="bg-teal-50 text-teal-700 px-3 py-1 rounded-lg font-semibold text-xs">{s.nombreDocente}</span></td>
                  <td className="py-3 px-4"><span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg font-bold text-xs">{s.cicloAcademico}</span></td>
                  <td className="py-3 px-4">{s.modalidad}</td>
                  <td className="py-3 px-4 text-center flex items-center justify-center gap-1">
                    <button onClick={() => abrirModal(s)} className="p-2 text-slate-400 hover:text-teal-500 hover:bg-teal-50 rounded-lg transition-colors" title="Editar">
                      <UserPen size={18}/>
                    </button>
                    <button onClick={() => eliminarSeccion(s)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Eliminar">
                      <Trash2 size={18}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-lg text-slate-800 flex items-center gap-2">
                <CalendarCheck className="text-teal-500" size={20}/>
                {form.idSeccion ? `Editar SEC-${form.idSeccion}` : 'Abrir Nuevo Curso'}
              </h3>
              <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-lg"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label htmlFor="prog-curso" className="block text-xs font-bold text-slate-500 uppercase mb-1">Curso</label>
                  <select id="prog-curso" required value={form.cursoId} onChange={e => setField('cursoId', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-teal-500 outline-none text-sm font-semibold bg-white text-slate-800">
                    <option value="" disabled>Seleccione curso...</option>
                    {cursosList.map(c => <option key={c.idCurso} value={c.idCurso}>{c.nombre}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label htmlFor="prog-docente" className="block text-xs font-bold text-slate-500 uppercase mb-1">Docente</label>
                  <select id="prog-docente" required value={form.docenteId} onChange={e => setField('docenteId', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-teal-500 outline-none text-sm font-semibold bg-white text-slate-800">
                    <option value="" disabled>Seleccione docente...</option>
                    {docentesList.map(d => <option key={d.idDocente} value={d.idDocente}>{d.usuario.nombreCompleto}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="prog-ciclo" className="block text-xs font-bold text-slate-500 uppercase mb-1">Ciclo Académico</label>
                  <select id="prog-ciclo" required value={form.cicloAcademico} onChange={e => setField('cicloAcademico', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-teal-500 outline-none text-sm bg-white text-slate-800">
                    {opcionesCiclos.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="prog-modalidad" className="block text-xs font-bold text-slate-500 uppercase mb-1">Modalidad</label>
                  <select id="prog-modalidad" required value={form.modalidad} onChange={e => setField('modalidad', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-teal-500 outline-none text-sm bg-white text-slate-800">
                    <option value="PRESENCIAL">Presencial</option>
                    <option value="VIRTUAL">Virtual</option>
                    <option value="HIBRIDO">Híbrido</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="prog-dia" className="block text-xs font-bold text-slate-500 uppercase mb-1">Día de la Semana</label>
                  <select id="prog-dia" required value={form.diaSemana} onChange={e => setField('diaSemana', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-teal-500 outline-none text-sm bg-white text-slate-800">
                    <option value="" disabled>Seleccione un día...</option>
                    <option value="1">Lunes</option>
                    <option value="2">Martes</option>
                    <option value="3">Miércoles</option>
                    <option value="4">Jueves</option>
                    <option value="5">Viernes</option>
                    <option value="6">Sábado</option>
                    <option value="7">Domingo</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="prog-inicio" className="block text-xs font-bold text-slate-500 uppercase mb-1">Horario (Inicio — Fin)</label>
                  <div className="flex gap-2">
                    <input id="prog-inicio" type="time" required value={form.horaInicio} onChange={e => setField('horaInicio', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-teal-500 outline-none text-sm bg-white text-slate-800"/>
                    <input id="prog-fin" type="time" required value={form.horaFin} onChange={e => setField('horaFin', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-teal-500 outline-none text-sm bg-white text-slate-800"/>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setModalAbierto(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancelar</button>
                <button type="submit" disabled={guardando} className="px-5 py-2.5 text-sm font-bold text-white bg-teal-500 hover:bg-teal-600 rounded-xl shadow-md transition-colors disabled:opacity-70 flex items-center gap-2">
                  {guardando ? <i className="fa-solid fa-spinner fa-spin"></i> : <Save size={16}/>} Guardar Sección
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Programacion;
