import { useState, useEffect, useCallback } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutGrid, Presentation, CalendarDays, ClipboardCheck, 
  FileSignature, Menu, X, Bell, User, ChevronDown, LogOut, 
  CheckCircle2, ChevronLeft, ChevronRight
} from 'lucide-react';
import { sileo } from 'sileo';
import Swal from 'sweetalert2';
import { API_BASE } from '../../../utils/api';

const customSwal = Swal.mixin({
  customClass: {
    popup: 'rounded-3xl border-0 shadow-2xl',
    confirmButton: 'bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2.5 px-6 rounded-xl border-0 mx-2 transition-colors',
    cancelButton: 'bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 px-6 rounded-xl border-0 mx-2 transition-colors'
  },
  buttonsStyling: false
});

const DocenteDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const usuarioId = localStorage.getItem("usuarioId") || "global";
  const nombreDocente = localStorage.getItem("usuarioNombre") || "Docente";
  const rol = localStorage.getItem("usuarioRol") || "DOCENTE";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [menuPerfilOpen, setMenuPerfilOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
    if (rol !== 'DOCENTE') navigate('/login');
  }, [navigate, rol]);

  // Usamos useCallback para que el linter no marque errores de dependencias infinitas
  const recargarNotificaciones = useCallback(async (idDocente) => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const res = await axios.get(`${API_BASE}/alertas/docente/${idDocente}`, { headers });
      setAlertas(res.data);
    } catch { /* Silencioso */ }
  }, []);

  useEffect(() => {
    let isMounted = true;
    let intervalId;

    const inicializarDocente = async () => {
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
        // 1. Obtener el perfil real del docente para saber su ID interno
        const resPerfil = await axios.get(`${API_BASE}/docentes/perfil/${usuarioId}`, { headers });
        const idDocenteReal = resPerfil.data.idDocente;
        
        if (isMounted) {
          localStorage.setItem('docenteId', idDocenteReal);
          // 2. Cargar notificaciones y activar el polling
          recargarNotificaciones(idDocenteReal);
          intervalId = setInterval(() => recargarNotificaciones(idDocenteReal), 60000); // Cada 60s
        }
      } catch {
        sileo.error({ title: "Error", description: "No se pudo obtener el perfil del docente." });
      }
    };

    inicializarDocente();
    return () => { 
      isMounted = false; 
      if (intervalId) clearInterval(intervalId); 
    };
  }, [usuarioId, recargarNotificaciones]); // Dependencias perfectamente declaradas

  const marcarComoLeida = async (idAlerta, event) => {
    if (event) event.stopPropagation();
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      await axios.put(`${API_BASE}/alertas/${idAlerta}/resolver`, {}, { headers });
      const docenteId = localStorage.getItem('docenteId');
      if (docenteId) recargarNotificaciones(docenteId);
    } catch (error) {
      console.error("No se pudo resolver la alerta:", error);
    }
  };

  const handleLogout = () => {
    customSwal.fire({
      title: '¿Cerrar Sesión?',
      text: "Saldrás de tu panel docente",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        navigate('/login');
      }
    });
  };

  const menuItems = [
    { path: '/docente', Icon: LayoutGrid, label: 'Panel Principal' },
    { path: '/docente/aula-virtual', Icon: Presentation, label: 'Mis Clases' },
    { path: '/docente/horario', Icon: CalendarDays, label: 'Mi Horario' },
    { path: '/docente/asistencia', Icon: ClipboardCheck, label: 'Tomar Asistencia' },
    { path: '/docente/notas', Icon: FileSignature, label: 'Resumen de Notas' }
  ];

  const fechaActual = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden selection:bg-indigo-500 selection:text-white">
      
      <aside className={`relative my-4 ml-4 rounded-[2rem] bg-[#0f172a] shadow-2xl transition-all duration-300 flex flex-col shrink-0 z-50 ${isCollapsed ? 'w-24' : 'w-[280px]'} ${sidebarOpen ? 'absolute inset-y-0 left-0 translate-x-0' : 'hidden md:flex'}`}>
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden md:flex absolute -right-3 top-16 w-7 h-7 bg-indigo-500 hover:bg-indigo-400 text-white rounded-full items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all z-10">
          {isCollapsed ? <ChevronRight size={16} strokeWidth={3} /> : <ChevronLeft size={16} strokeWidth={3} />}
        </button>

        <div className={`pt-10 pb-6 px-6 flex items-center border-b border-white/5 ${isCollapsed ? 'justify-center' : 'gap-4'}`}>
          <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-black text-xl shrink-0 shadow-lg">
            SK
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Portal Docente</span>
              <span className="text-sm font-bold text-white truncate">Instituto SANKU</span>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (location.pathname === '/docente' && item.path === '/docente');
            return (
              <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)} className={`group relative flex items-center p-3.5 rounded-xl cursor-pointer transition-colors ${isActive ? 'bg-white/5 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'} ${isCollapsed ? 'justify-center' : 'gap-4'}`} title={isCollapsed ? item.label : ""}>
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-indigo-500 rounded-r-full shadow-[0_0_12px_rgba(99,102,241,0.6)]"></div>}
                <item.Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-indigo-400" : "group-hover:text-white transition-colors"} />
                {!isCollapsed && <span className="font-semibold text-sm tracking-wide">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="bg-transparent h-24 px-6 md:px-8 flex justify-between items-center z-10 pt-4">
          <button className="md:hidden text-slate-500 bg-white p-2 rounded-xl shadow-sm" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          
          <div className="hidden md:flex items-center gap-6 ml-4">
            <div className="text-xs font-semibold text-slate-500 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm capitalize">
              {fechaActual}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-4 sm:gap-6">
            <div className="relative">
              <button onClick={() => {setNotifOpen(!notifOpen); setMenuPerfilOpen(false);}} className={`relative p-3 rounded-2xl bg-white shadow-sm border border-slate-200 transition-colors ${alertas.length > 0 ? 'text-indigo-600 border-indigo-200' : 'text-slate-500 hover:text-indigo-500'}`}>
                <Bell size={20} className={alertas.length > 0 ? 'animate-pulse' : ''} />
                {alertas.length > 0 && <span className="absolute -top-1 -right-1 flex h-5 w-5 bg-rose-500 rounded-full border-2 border-white text-[10px] font-black text-white items-center justify-center">{alertas.length}</span>}
              </button>

              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)}></div>
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in slide-in-from-top-2">
                    <div className="p-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-black text-slate-800 text-base">Notificaciones Académicas</h3>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto bg-white divide-y divide-slate-50 p-2">
                      {alertas.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                          <CheckCircle2 size={40} className="mx-auto mb-3 opacity-50 text-emerald-500"/> 
                          <p className="text-sm font-medium">¡Todo al día! No tienes tareas pendientes.</p>
                        </div>
                      ) : (
                        alertas.map(a => {
                          const esNota = a.tipo === 'NOTAS_ATRASADAS';
                          return (
                            <div key={a.idAlerta} className={`p-4 rounded-xl mb-2 relative group shadow-sm border ${esNota ? 'bg-rose-50 border-rose-100' : 'bg-amber-50 border-amber-100'}`}>
                              <button onClick={(e) => marcarComoLeida(a.idAlerta, e)} className="absolute top-3 right-3 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><X size={16}/></button>
                              <p className={`text-sm font-bold flex items-center gap-2 mb-1 ${esNota ? 'text-rose-600' : 'text-amber-600'}`}>
                                {esNota ? <FileSignature size={14}/> : <ClipboardCheck size={14}/>} 
                                {esNota ? 'Faltan Calificaciones' : 'Registro de Asistencia'}
                              </p>
                              <p className="text-xs text-slate-700 mb-2">{a.mensaje}</p>
                              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">SEC-{a.nombreSeccion}</p>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="hidden sm:block w-px h-8 bg-slate-200"></div>

            <div className="relative">
              <button onClick={() => {setMenuPerfilOpen(!menuPerfilOpen); setNotifOpen(false);}} className="flex items-center gap-3 bg-white p-2 pr-4 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300">
                <div className="w-10 h-10 bg-[#0f172a] text-white rounded-xl flex items-center justify-center font-black">{nombreDocente.charAt(0)}</div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-bold text-slate-800 leading-tight">{nombreDocente}</p>
                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{rol}</p>
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${menuPerfilOpen ? 'rotate-180' : ''}`}/>
              </button>

              {menuPerfilOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuPerfilOpen(false)}></div>
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-xl border border-slate-100 z-50 overflow-hidden py-2 animate-in slide-in-from-top-2">
                    <Link to="/docente/perfil" onClick={() => setMenuPerfilOpen(false)} className="px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-3"><User size={18}/> Mi Perfil</Link>
                    <div className="h-px bg-slate-100 my-1 mx-3"></div>
                    <button onClick={handleLogout} className="w-full px-5 py-3 text-sm font-semibold text-rose-500 hover:bg-rose-50 flex items-center gap-3"><LogOut size={18}/> Cerrar Sesión</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar text-left text-slate-800">
          <Outlet /> 
        </div>
      </main>

      {sidebarOpen && <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setSidebarOpen(false)}></div>}
    </div>
  );
};

export default DocenteDashboard;