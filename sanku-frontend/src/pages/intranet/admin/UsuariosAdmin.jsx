import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Edit2, Trash2, ShieldCheck, X, User } from 'lucide-react';
import Swal from 'sweetalert2';
import { sileo } from 'sileo';

// Configuración de SweetAlert2 Premium
const customSwal = Swal.mixin({
  customClass: {
    popup: 'rounded-3xl border-0 shadow-2xl',
    confirmButton: 'bg-sky-500 hover:bg-sky-600 text-white font-bold py-2.5 px-6 rounded-xl border-0 mx-2',
    cancelButton: 'bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 px-6 rounded-xl border-0 mx-2'
  },
  buttonsStyling: false
});

const UsuariosAdmin = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('TODOS');
  
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState({ idUsuario: '', dni: '', nombres: '', apellidos: '', email: '', rol: 'ALUMNO' });

  const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

  const recargarTabla = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/v1/usuarios', { headers });
      setUsuarios(res.data);
    } catch { 
      sileo.error({ title: "Error", description: "No se pudieron cargar los usuarios" }); 
    }
  };

  useEffect(() => {
    let isMounted = true;
    const cargarUsuariosIniciales = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/v1/usuarios', { headers });
        if (isMounted) setUsuarios(res.data);
      } catch {
        sileo.error({ title: "Error", description: "No se pudieron cargar los usuarios" });
      }
    };
    cargarUsuariosIniciales();
    return () => { isMounted = false; };
  }, []);

  const filtrados = usuarios.filter(u => {
    const txtMatch = u.nombres.toLowerCase().includes(busqueda.toLowerCase()) || 
                     u.apellidos.toLowerCase().includes(busqueda.toLowerCase()) || 
                     u.dni.includes(busqueda);
    const rolMatch = filtroRol === 'TODOS' || u.rol === filtroRol;
    return txtMatch && rolMatch;
  });

  const abrirModal = (user = null) => {
    if (user) {
      setForm({ idUsuario: user.idUsuario, dni: user.dni, nombres: user.nombres, apellidos: user.apellidos, email: user.email, rol: user.rol });
    } else {
      setForm({ idUsuario: '', dni: '', nombres: '', apellidos: '', email: '', rol: 'ALUMNO' });
    }
    setModalAbierto(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      if (form.idUsuario) {
        await axios.put(`http://localhost:8080/api/v1/usuarios/${form.idUsuario}`, form, { headers });
        sileo.success({ title: "Actualizado", description: "El usuario ha sido modificado exitosamente." });
      } else {
        await axios.post('http://localhost:8080/api/v1/usuarios', form, { headers });
        sileo.success({ title: "Creado", description: "Usuario creado. La clave es su DNI." });
      }
      setModalAbierto(false);
      recargarTabla();
    } catch (error) {
      customSwal.fire("Error", error.response?.data?.message || "Error al procesar la solicitud", "error");
    } finally { 
      setGuardando(false); 
    }
  };

  const eliminarUsuario = (id) => {
    customSwal.fire({
      title: '¿Eliminar usuario?',
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:8080/api/v1/usuarios/${id}`, { headers });
          sileo.success({ title: "Eliminado", description: "El usuario fue borrado del sistema." });
          recargarTabla();
        } catch { 
          customSwal.fire("Error", "No se pudo eliminar el usuario", "error"); 
        }
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Gestión de Usuarios</h2>
          <p className="text-slate-500 text-sm">Administra las cuentas de alumnos, docentes y personal.</p>
        </div>
        <button onClick={() => abrirModal()} className="bg-sky-500 hover:bg-sky-600 text-white font-bold px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-colors">
          <Plus size={18}/> Nuevo Usuario
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-slate-400" size={18}/>
            {/* CORRECCIÓN DE COLOR AQUÍ */}
            <input 
              type="text" 
              placeholder="Buscar por DNI o nombres..." 
              value={busqueda} 
              onChange={e => setBusqueda(e.target.value)} 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-none text-sm text-slate-800 bg-white placeholder-slate-400"
            />
          </div>
          {/* CORRECCIÓN DE COLOR AQUÍ */}
          <select 
            value={filtroRol} 
            onChange={e => setFiltroRol(e.target.value)} 
            className="py-2.5 px-4 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-sky-500 text-sm font-semibold text-slate-800 bg-white min-w-[200px]"
          >
            <option value="TODOS">Todos los Roles</option>
            <option value="ALUMNO">Solo Alumnos</option>
            <option value="DOCENTE">Solo Docentes</option>
            <option value="ADMINISTRADOR">Administradores</option>
          </select>
        </div>

        <div className="overflow-x-auto p-5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-3 px-4">DNI</th>
                <th className="py-3 px-4">Nombres Completos</th>
                <th className="py-3 px-4">Correo</th>
                <th className="py-3 px-4">Rol</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtrados.length === 0 ? <tr><td colSpan="5" className="text-center py-8 text-slate-400">No se encontraron usuarios.</td></tr> : 
                filtrados.map(u => (
                  <tr key={u.idUsuario} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-700">{u.dni}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{u.nombres} {u.apellidos}</td>
                    <td className="py-3 px-4 text-slate-500">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${u.rol==='ALUMNO' ? 'bg-indigo-100 text-indigo-700' : u.rol==='DOCENTE' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{u.rol}</span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button onClick={() => abrirModal(u)} className="p-2 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-lg transition-colors"><Edit2 size={16}/></button>
                      <button onClick={() => eliminarUsuario(u.idUsuario)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAILWIND (CORRECCIÓN DE COLORES DE TEXTO EN TODOS LOS INPUTS) */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-lg text-slate-800 flex items-center gap-2"><User size={20} className="text-sky-500"/> {form.idUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
              <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-lg"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">DNI</label>
                  <input type="text" required maxLength="8" pattern="\d{8}" disabled={!!form.idUsuario} value={form.dni} onChange={e => setForm({...form, dni: e.target.value})} 
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-sky-500 focus:border-sky-500 outline-none text-sm text-slate-800 bg-white placeholder-slate-400 disabled:bg-slate-100 disabled:text-slate-500"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Rol</label>
                  <select required disabled={!!form.idUsuario} value={form.rol} onChange={e => setForm({...form, rol: e.target.value})} 
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-sky-500 outline-none text-sm font-semibold text-slate-800 bg-white disabled:bg-slate-100 disabled:text-slate-500">
                    <option value="ALUMNO">Alumno</option>
                    <option value="DOCENTE">Docente</option>
                    <option value="COORDINADOR">Coordinador</option>
                    <option value="ADMINISTRADOR">Administrador</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombres</label>
                  <input type="text" required value={form.nombres} onChange={e => setForm({...form, nombres: e.target.value})} 
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-sky-500 outline-none text-sm text-slate-800 bg-white placeholder-slate-400"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Apellidos</label>
                  <input type="text" required value={form.apellidos} onChange={e => setForm({...form, apellidos: e.target.value})} 
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-sky-500 outline-none text-sm text-slate-800 bg-white placeholder-slate-400"/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Correo Electrónico</label>
                <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} 
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-sky-500 outline-none text-sm text-slate-800 bg-white placeholder-slate-400"/>
              </div>

              {!form.idUsuario && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-xl flex gap-3 items-start text-xs font-medium">
                  <ShieldCheck size={18} className="shrink-0 mt-0.5"/>
                  <p>La contraseña inicial será el <strong>número de DNI</strong>. El sistema la encriptará por seguridad.</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setModalAbierto(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancelar</button>
                <button type="submit" disabled={guardando} className="px-5 py-2.5 text-sm font-bold text-white bg-sky-500 hover:bg-sky-600 rounded-xl shadow-md transition-colors disabled:opacity-70">
                  {guardando ? 'Guardando...' : 'Guardar Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuariosAdmin;