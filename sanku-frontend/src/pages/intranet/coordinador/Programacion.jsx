import { useState, useEffect } from 'react';
import axios from 'axios';
import { CalendarCheck, Search, Plus, UserPen, X, Save } from 'lucide-react';
import { sileo } from 'sileo';
import Swal from 'sweetalert2';

const customSwal = Swal.mixin({
  customClass: {
    popup: 'rounded-3xl border-0 shadow-2xl',
    confirmButton: 'bg-teal-500 hover:bg-teal-600 text-white font-bold py-2.5 px-6 rounded-xl border-0 mx-2 transition-colors',
    cancelButton: 'bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 px-6 rounded-xl border-0 mx-2 transition-colors'
  },
  buttonsStyling: false
});

const Programacion = () => {
  const [secciones, setSecciones] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cursosList, setCursosList] = useState([]);
  const [docentesList, setDocentesList] = useState([]);
  const [guardando, setGuardando] = useState(false);
  
  const anioActual = new Date().getFullYear();
  const [form, setForm] = useState({
    idSeccion: '', cursoId: '', docenteId: '', cicloAcademico: `${anioActual}-I`,
    modalidad: 'PRESENCIAL', diaSemana: '', horaInicio: '', horaFin: ''
  });

  const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  const recargarDespuesDeGuardar = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/v1/secciones', { headers: getHeaders() });
      setSecciones(res.data);
    } catch {
      sileo.error({ title: "Error", description: "No se pudo actualizar la tabla de programación" });
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    // Función centralizada para cumplir reglas de Hooks
    const iniciarDatos = async () => {
      try {
        const h = { Authorization: `Bearer ${localStorage.getItem('token')}` };
        const [resSecciones, resCursos, resDocentes] = await Promise.all([
          axios.get('http://localhost:8080/api/v1/secciones', { headers: h }),
          axios.get('http://localhost:8080/api/v1/cursos', { headers: h }),
          axios.get('http://localhost:8080/api/v1/docentes', { headers: h })
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
  }, []);

  const filtradas = secciones.filter(s => 
    s.nombreCurso.toLowerCase().includes(busqueda.toLowerCase()) || 
    s.nombreDocente.toLowerCase().includes(busqueda.toLowerCase())
  );

  const opcionesCiclos = [];
  for (let i = -2; i <= 2; i++) {
    opcionesCiclos.push(`${anioActual + i}-I`);
    opcionesCiclos.push(`${anioActual + i}-II`);
  }

  const abrirModal = (sec = null) => {
    if (sec) {
      setForm({
        idSeccion: sec.idSeccion, cursoId: sec.cursoId, docenteId: sec.docenteId,
        cicloAcademico: sec.cicloAcademico, modalidad: sec.modalidad, diaSemana: sec.diaSemana,
        horaInicio: sec.horaInicio?.substring(0, 5) || '', horaFin: sec.horaFin?.substring(0, 5) || ''
      });
    } else {
      setForm({
        idSeccion: '', cursoId: '', docenteId: '', cicloAcademico: `${anioActual}-I`,
        modalidad: 'PRESENCIAL', diaSemana: '', horaInicio: '', horaFin: ''
      });
    }
    setModalAbierto(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.horaInicio >= form.horaFin) {
      return customSwal.fire("Aviso", "La hora de inicio debe ser anterior a la hora de fin.", "warning");
    }
    setGuardando(true);
    
    const payload = { ...form };
    const url = form.idSeccion ? `http://localhost:8080/api/v1/secciones/${form.idSeccion}` : `http://localhost:8080/api/v1/secciones`;
    const method = form.idSeccion ? 'PUT' : 'POST';

    try {
      await axios({ method, url, data: payload, headers: getHeaders() });
      sileo.success({ title: "Éxito", description: form.idSeccion ? "Asignación actualizada." : "Nueva sección creada." });
      setModalAbierto(false);
      recargarDespuesDeGuardar();
    } catch (error) {
      customSwal.fire("Error", error.response?.data?.message || "Revisa los datos ingresados.", "error");
    } finally {
      setGuardando(false);
    }
  };

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
            <input type="text" placeholder="Buscar curso o docente..." value={busqueda} onChange={e=>setBusqueda(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-teal-500 outline-none text-sm bg-white"/>
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
              {cargando ? <tr><td colSpan="6" className="text-center py-8 text-slate-400">Cargando programación...</td></tr> : 
                filtradas.length === 0 ? <tr><td colSpan="6" className="text-center py-8 text-slate-400">No hay secciones programadas.</td></tr> :
                filtradas.map(s => (
                  <tr key={s.idSeccion} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-700">SEC-{s.idSeccion}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{s.nombreCurso}</td>
                    <td className="py-3 px-4"><span className="bg-teal-50 text-teal-700 px-3 py-1 rounded-lg font-semibold text-xs">{s.nombreDocente}</span></td>
                    <td className="py-3 px-4"><span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg font-bold text-xs">{s.cicloAcademico}</span></td>
                    <td className="py-3 px-4">{s.modalidad}</td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => abrirModal(s)} className="p-2 text-slate-400 hover:text-teal-500 hover:bg-teal-50 rounded-lg transition-colors" title="Editar Asignación">
                        <UserPen size={18}/>
                      </button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAILWIND */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-lg text-slate-800 flex items-center gap-2"><CalendarCheck className="text-teal-500" size={20}/> {form.idSeccion ? `Editar Asignación SEC-${form.idSeccion}` : 'Abrir Nuevo Curso'}</h3>
              <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-lg"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Curso</label>
                  <select required value={form.cursoId} onChange={e=>setForm({...form, cursoId: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-teal-500 outline-none text-sm font-semibold bg-white text-slate-800">
                    <option value="" disabled>Seleccione curso...</option>
                    {cursosList.map(c => <option key={c.idCurso} value={c.idCurso}>{c.nombre}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Docente</label>
                  <select required value={form.docenteId} onChange={e=>setForm({...form, docenteId: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-teal-500 outline-none text-sm font-semibold bg-white text-slate-800">
                    <option value="" disabled>Seleccione docente...</option>
                    {docentesList.map(d => <option key={d.idDocente} value={d.idDocente}>{d.usuario.nombreCompleto}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ciclo Académico</label>
                  <select required value={form.cicloAcademico} onChange={e=>setForm({...form, cicloAcademico: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-teal-500 outline-none text-sm bg-white text-slate-800">
                    {opcionesCiclos.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Modalidad</label>
                  <select required value={form.modalidad} onChange={e=>setForm({...form, modalidad: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-teal-500 outline-none text-sm bg-white text-slate-800">
                    <option value="PRESENCIAL">Presencial</option>
                    <option value="VIRTUAL">Virtual</option>
                    <option value="HIBRIDO">Híbrido</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Día de la Semana</label>
                  <select required value={form.diaSemana} onChange={e=>setForm({...form, diaSemana: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-teal-500 outline-none text-sm bg-white text-slate-800">
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
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Horario (Inicio - Fin)</label>
                  <div className="flex gap-2">
                    <input type="time" required value={form.horaInicio} onChange={e=>setForm({...form, horaInicio: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-teal-500 outline-none text-sm bg-white text-slate-800"/>
                    <input type="time" required value={form.horaFin} onChange={e=>setForm({...form, horaFin: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-teal-500 outline-none text-sm bg-white text-slate-800"/>
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