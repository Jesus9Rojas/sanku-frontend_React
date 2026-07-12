import { useState, useEffect, useCallback } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  LayoutGrid, CalendarDays, Monitor, Wallet,
  FolderOpen, FileText, GraduationCap, CalendarCheck, Menu, X, Bell, User, ChevronDown,
  LogOut, ChevronLeft, ChevronRight, 
} from 'lucide-react';
import Swal from 'sweetalert2';
import { API_BASE } from '../../../utils/api';

const customSwal = Swal.mixin({
  customClass: {
    popup: 'rounded-3xl border-0 shadow-2xl',
    confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl border-0 mx-2 transition-colors',
    cancelButton: 'bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 px-6 rounded-xl border-0 mx-2 transition-colors'
  },
  buttonsStyling: false
});

const EstudianteDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const usuarioId = localStorage.getItem("usuarioId");
  const nombreEstudiante = localStorage.getItem("usuarioNombre") || "Estudiante";
  const rol = localStorage.getItem("usuarioRol") || "ALUMNO";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [menuPerfilOpen, setMenuPerfilOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);

  useEffect(() => {
    if (rol !== 'ALUMNO') navigate('/login');
  }, [navigate, rol]);

  const getHeaders = useCallback(() => ({ Authorization: `Bearer ${localStorage.getItem('token')}` }), []);

  const recargarNotificaciones = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/solicitudes/mis-solicitudes/${usuarioId}`, { headers: getHeaders() });
      const leidas = JSON.parse(localStorage.getItem(`notif_leidas_${usuarioId}`)) || [];
      const respondidos = res.data.filter(s => s.estado !== "PENDIENTE" && !leidas.includes(s.idSolicitud));
      setNotificaciones(respondidos);
    } catch (error) { 
      console.error(error); 
    }
  }, [usuarioId, getHeaders]);

  useEffect(() => {
    let isMounted = true;
    let intervalId;

    const inicializarAlumno = async () => {
      try {
        const resPerfil = await axios.get(`${API_BASE}/alumnos/perfil/${usuarioId}`, { headers: getHeaders() });
        if (isMounted) {
          localStorage.setItem('alumnoId', resPerfil.data.idAlumno);
          recargarNotificaciones();
          intervalId = setInterval(recargarNotificaciones, 60000);
        }
      } catch (error) { 
        console.error(error); 
      }
    };

    if (usuarioId) inicializarAlumno();
    return () => { 
      isMounted = false; 
      if (intervalId) clearInterval(intervalId); 
    };
  }, [usuarioId, getHeaders, recargarNotificaciones]);

    const fechaActual = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const marcarComoLeida = (idSolicitud, event) => {
    if (event) event.stopPropagation();
    let leidas = JSON.parse(localStorage.getItem(`notif_leidas_${usuarioId}`)) || [];
    if (!leidas.includes(idSolicitud)) {
      leidas.push(idSolicitud);
      localStorage.setItem(`notif_leidas_${usuarioId}`, JSON.stringify(leidas));
    }
    recargarNotificaciones();
  };

  const limpiarTodas = () => {
    let leidas = JSON.parse(localStorage.getItem(`notif_leidas_${usuarioId}`)) || [];
    const nuevasLeidas = notificaciones.map(n => n.idSolicitud);
    localStorage.setItem(`notif_leidas_${usuarioId}`, JSON.stringify([...leidas, ...nuevasLeidas]));
    recargarNotificaciones();
  };

  const handleLogout = () => {
    customSwal.fire({
      title: '¿Cerrar Sesión?',
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
    { path: '/estudiante', Icon: LayoutGrid, label: 'Panel' },
    { path: '/estudiante/horario', Icon: CalendarDays, label: 'Horario' },
    { path: '/estudiante/cursos', Icon: Monitor, label: 'Mis Cursos' },
    { path: '/estudiante/calificaciones', Icon: GraduationCap, label: 'Calificaciones' },
    { path: '/estudiante/asistencia', Icon: CalendarCheck, label: 'Mi Asistencia' },
    { path: '/estudiante/finanzas', Icon: Wallet, label: 'Finanzas' },
    { path: '/estudiante/tramites', Icon: FolderOpen, label: 'Trámites' },
    { path: '/estudiante/matricula', Icon: FileText, label: 'Matrícula en Línea' }
  ];

  return (
    <div className="flex h-screen bg-[#f4f7f6] font-sans overflow-hidden selection:bg-blue-600 selection:text-white">
      <aside className={`relative my-4 ml-4 rounded-[2rem] bg-[#0c1322] shadow-2xl transition-all duration-300 flex flex-col shrink-0 z-50 ${isCollapsed ? 'w-24' : 'w-[280px]'} ${sidebarOpen ? 'absolute inset-y-0 left-0 translate-x-0' : 'hidden md:flex'}`}>
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden md:flex absolute -right-3 top-16 w-7 h-7 bg-blue-500 text-white rounded-full items-center justify-center shadow-lg transition-all z-10">
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className={`pt-10 pb-6 px-6 flex items-center border-b border-white/5 ${isCollapsed ? 'justify-center' : 'gap-4'}`}>
          <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-sky-400 rounded-2xl flex items-center justify-center text-white font-black text-xl shrink-0">SK</div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Portal</span>
              <span className="text-sm font-bold text-white truncate">Estudiante SANKU</span>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (location.pathname === '/estudiante' && item.path === '/estudiante');
            return (
              <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)} className={`flex items-center p-3.5 rounded-xl cursor-pointer transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'} ${isCollapsed ? 'justify-center' : 'gap-4'}`}>
                <item.Icon size={20} />
                {!isCollapsed && <span className="font-semibold text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="bg-transparent h-24 px-6 md:px-8 flex justify-between items-center z-10 pt-4">
          <button className="md:hidden text-slate-500 bg-white p-2 rounded-xl shadow-sm" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
          <div className="hidden md:flex items-center gap-6 ml-4">
                        <div className="text-xs font-semibold text-slate-500 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm capitalize">
              {fechaActual}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-4 sm:gap-6">
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)} className="p-3 rounded-2xl bg-white shadow-sm border border-slate-200">
                <Bell size={20} className={notificaciones.length > 0 ? "text-blue-600 animate-pulse" : "text-slate-500"} />
                {notificaciones.length > 0 && <span className="absolute -top-1 -right-1 flex h-5 w-5 bg-rose-500 rounded-full text-[10px] font-black text-white items-center justify-center">{notificaciones.length}</span>}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-xl border border-slate-100 z-50 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-sm text-slate-800">Notificaciones</h3>
                    {notificaciones.length > 0 && <button onClick={limpiarTodas} className="text-xs text-blue-600 font-bold">Marcar leídas</button>}
                  </div>
                  <div className="max-h-64 overflow-y-auto p-2">
                    {notificaciones.length === 0 ? (
                      <p className="text-center text-slate-400 text-xs py-6">No hay notificaciones nuevas</p>
                    ) : (
                      notificaciones.map(n => (
                        <div key={n.idSolicitud} className="p-3 bg-slate-50 border border-slate-100 rounded-xl mb-2 relative group cursor-pointer" onClick={() => { setNotifOpen(false); navigate('/estudiante/tramites'); }}>
                          <button onClick={(e) => marcarComoLeida(n.idSolicitud, e)} className="absolute top-2 right-2 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100"><X size={14}/></button>
                          <p className="text-xs font-bold text-blue-600 mb-1">ACTUALIZACIÓN SAE</p>
                          <p className="text-xs text-slate-700">Solicitud <strong>#TRM-{n.idSolicitud}</strong> fue <strong>{n.estado}</strong></p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="hidden sm:block w-px h-8 bg-slate-200"></div>

            <div className="relative">
              <button onClick={() => setMenuPerfilOpen(!menuPerfilOpen)} className="flex items-center gap-3 bg-white p-2 pr-4 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-300">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black">{nombreEstudiante.charAt(0)}</div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-bold text-slate-800 leading-tight">{nombreEstudiante}</p>
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{rol}</p>
                </div>
                <ChevronDown size={16} className="text-slate-400" />
              </button>
              {menuPerfilOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-xl border border-slate-100 p-2 z-50">
                  <Link to="/estudiante/perfil" className="block px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-colors">
                    <div className="flex items-center gap-3"><User size={16}/> Mi Perfil</div>
                  </Link>
                  <div className="h-px bg-slate-100 my-1 mx-3"></div>
                  <button onClick={handleLogout} className="w-full px-5 py-3 text-sm font-semibold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors text-left flex items-center gap-3">
                    <LogOut size={16}/> Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar">
          <Outlet /> 
        </div>
      </main>
    </div>
  );
};

export default EstudianteDashboard;