import { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, BookPlus, Save } from 'lucide-react';
import { sileo } from 'sileo';
import Swal from 'sweetalert2';
import { API_BASE } from '../../../utils/api';

const RegistrosBase = () => {
  const [carreras, setCarreras] = useState([]);
  const [formDocente, setFormDocente] = useState({ dni: '', nombres: '', apellidos: '', correo: '', especialidad: '' });
  const [formCurso, setFormCurso] = useState({ carreraId: '', nombre: '', creditos: 3, descripcionInformativa: '' });
  const [guardandoD, setGuardandoD] = useState(false);
  const [guardandoC, setGuardandoC] = useState(false);

  const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  useEffect(() => {
    let isMounted = true;
    axios.get(`${API_BASE}/carreras`, { headers: getHeaders() })
      .then(res => {
        if (isMounted) {
          setCarreras(res.data.filter(c => c.tipo === 'CARRERA' && c.estado === true));
        }
      }).catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const handleRegistroDocente = async (e) => {
    e.preventDefault();
    setGuardandoD(true);
    try {
      await axios.post(`${API_BASE}/docentes/registro`, formDocente, { headers: getHeaders() });
      sileo.success({ title: "Éxito", description: "Docente registrado. Clave inicial: DNI." });
      setFormDocente({ dni: '', nombres: '', apellidos: '', correo: '', especialidad: '' });
    } catch (error) {
      Swal.fire("Error", error.response?.data?.mensaje || "Error al registrar docente", "error");
    } finally { setGuardandoD(false); }
  };

  const handleCrearCurso = async (e) => {
    e.preventDefault();
    setGuardandoC(true);
    try {
      await axios.post(`${API_BASE}/cursos`, formCurso, { headers: getHeaders() });
      sileo.success({ title: "Curso Creado", description: `El curso ${formCurso.nombre} ha sido guardado.` });
      setFormCurso({ carreraId: '', nombre: '', creditos: 3, descripcionInformativa: '' });
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Revisa los datos ingresados.", "error");
    } finally { setGuardandoC(false); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-black text-slate-800">Registros Base (Catálogos)</h2>
        <p className="text-slate-500 text-sm">Crea los cursos y docentes necesarios antes de abrir una programación.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* FORMULARIO DOCENTE */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 text-lg mb-6 border-b border-slate-100 pb-3 flex items-center gap-2"><UserPlus className="text-teal-500"/> Registrar Docente</h3>
          <form onSubmit={handleRegistroDocente} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">DNI</label>
              <input type="text" maxLength="8" required value={formDocente.dni} onChange={e=>setFormDocente({...formDocente, dni: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-teal-500 outline-none text-sm bg-slate-50"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombres</label>
                <input type="text" required value={formDocente.nombres} onChange={e=>setFormDocente({...formDocente, nombres: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-teal-500 outline-none text-sm bg-slate-50"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Apellidos</label>
                <input type="text" required value={formDocente.apellidos} onChange={e=>setFormDocente({...formDocente, apellidos: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-teal-500 outline-none text-sm bg-slate-50"/>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Correo Electrónico</label>
              <input type="email" required value={formDocente.correo} onChange={e=>setFormDocente({...formDocente, correo: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-teal-500 outline-none text-sm bg-slate-50"/>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Especialidad</label>
              <input type="text" required placeholder="Ej. Ingeniero de Software" value={formDocente.especialidad} onChange={e=>setFormDocente({...formDocente, especialidad: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-teal-500 outline-none text-sm bg-slate-50"/>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <button type="submit" disabled={guardandoD} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 transition-colors disabled:opacity-70">
                {guardandoD ? <i className="fa-solid fa-spinner fa-spin"></i> : <Save size={18}/>} Guardar Docente
              </button>
            </div>
          </form>
        </div>

        {/* FORMULARIO CURSO */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 text-lg mb-6 border-b border-slate-100 pb-3 flex items-center gap-2"><BookPlus className="text-teal-500"/> Crear Nuevo Curso</h3>
          <form onSubmit={handleCrearCurso} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre del Curso</label>
              <input type="text" required placeholder="Ej. Base de Datos II" value={formCurso.nombre} onChange={e=>setFormCurso({...formCurso, nombre: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-teal-500 outline-none text-sm bg-slate-50"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Programa / Carrera</label>
                <select required value={formCurso.carreraId} onChange={e=>setFormCurso({...formCurso, carreraId: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-teal-500 outline-none text-sm font-semibold bg-slate-50">
                  <option value="" disabled>Seleccione...</option>
                  {carreras.map(c => <option key={c.idCarrera} value={c.idCarrera}>{c.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Créditos</label>
                <input type="number" min="1" max="10" required value={formCurso.creditos} onChange={e=>setFormCurso({...formCurso, creditos: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-teal-500 outline-none text-sm bg-slate-50"/>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descripción Informativa</label>
              <textarea rows="3" required placeholder="Detalles del curso..." value={formCurso.descripcionInformativa} onChange={e=>setFormCurso({...formCurso, descripcionInformativa: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-teal-500 outline-none text-sm bg-slate-50 resize-y"></textarea>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <button type="submit" disabled={guardandoC} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 transition-colors disabled:opacity-70">
                {guardandoC ? <i className="fa-solid fa-spinner fa-spin"></i> : <Save size={18}/>} Guardar Curso
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};
export default RegistrosBase;