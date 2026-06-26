import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, Users, Building2, FileBarChart, Inbox, 
  Menu, X, Bell, User, ChevronDown, LogOut, CheckCircle2, 
  Archive, ArrowLeft, BellOff, ChevronLeft, ChevronRight
} from 'lucide-react';
import { sileo } from 'sileo';
import Swal from 'sweetalert2';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const usuarioId = localStorage.getItem("usuarioId") || "global";
  const nombreAdmin = localStorage.getItem("usuarioNombre") || "Administrador";
  const rol = localStorage.getItem("usuarioRol") || "ADMINISTRADOR";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [menuPerfilOpen, setMenuPerfilOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mostrandoLeidos, setMostrandoLeidos] = useState(false);
  
  const [notificaciones, setNotificaciones] = useState([]);

  const [ocultas, setOcultas] = useState(() => {
    const idsOcultos = localStorage.getItem(`notif_ocultas_admin_${usuarioId}`);
    return idsOcultos ? JSON.parse(idsOcultos) : [];
  });

  useEffect(() => {
    if (rol !== 'ADMINISTRADOR' && rol !== 'COORDINADOR') {
      navigate('/login');
    }
  }, [navigate, rol]);

  useEffect(() => {
    let isMounted = true;

    const cargarNotificaciones = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/v1/notificaciones/admin', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (isMounted) setNotificaciones(res.data);
      } catch (error) {
        console.error("Error cargando campana", error);
      }
    };

    cargarNotificaciones();
    const interval = setInterval(cargarNotificaciones, 15000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const notifPendientes = notificaciones.filter(n => !ocultas.includes(`${n.tipo}_${n.idOrigen}`));
  const notifArchivadas = notificaciones.filter(n => ocultas.includes(`${n.tipo}_${n.idOrigen}`));
  const notifAMostrar = mostrandoLeidos ? notifArchivadas : notifPendientes;

  const archivarNotif = (idOrigen, tipo) => {
    const nuevaOculta = `${tipo}_${idOrigen}`;
    if (!ocultas.includes(nuevaOculta)) {
      const actualizadas = [...ocultas, nuevaOculta];
      setOcultas(actualizadas);
      localStorage.setItem(`notif_ocultas_admin_${usuarioId}`, JSON.stringify(actualizadas));
    }
  };

  const restaurarNotif = (idOrigen, tipo) => {
    const nuevaOculta = `${tipo}_${idOrigen}`;
    const actualizadas = ocultas.filter(id => id !== nuevaOculta);
    setOcultas(actualizadas);
    localStorage.setItem(`notif_ocultas_admin_${usuarioId}`, JSON.stringify(actualizadas));
  };

  const limpiarTodas = () => {
    const nuevosOcultos = [...ocultas, ...notifPendientes.map(n => `${n.tipo}_${n.idOrigen}`)];
    setOcultas(nuevosOcultos);
    localStorage.setItem(`notif_ocultas_admin_${usuarioId}`, JSON.stringify(nuevosOcultos));
    sileo.success({ title: "Bandeja limpia", description: "Las notificaciones se movieron al historial." });
  };

  const handleLogout = () => {
    Swal.fire({
      title: '¿Cerrar Sesión?',
      text: "Saldrás del panel de administración",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0ea5e9',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-3xl shadow-2xl border-0',
        confirmButton: 'px-6 py-2.5 rounded-xl font-bold',
        cancelButton: 'px-6 py-2.5 rounded-xl font-bold'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        navigate('/login');
      }
    });
  };

  const menuItems = [
    { path: '/admin', Icon: LayoutDashboard, label: 'Panel General' },
    { path: '/admin/usuarios', Icon: Users, label: 'Usuarios' },
    { path: '/admin/finanzas', Icon: Building2, label: 'Finanzas' },
    { path: '/admin/reportes', Icon: FileBarChart, label: 'Reportes (BI)' },
    { path: '/admin/sae', Icon: Inbox, label: 'Buzón SAE' }
  ];

  const fechaActual = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="flex h-screen bg-[#f3f4f6] font-sans overflow-hidden selection:bg-sky-500 selection:text-white">
      
      <aside className={`relative my-4 ml-4 rounded-[2rem] bg-[#121520] shadow-2xl transition-all duration-300 flex flex-col shrink-0 z-50 ${isCollapsed ? 'w-24' : 'w-72'} ${sidebarOpen ? 'absolute inset-y-0 left-0 translate-x-0' : 'hidden md:flex'}`}>
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3 top-16 w-7 h-7 bg-[#00d2ff] hover:bg-sky-400 text-slate-900 rounded-full items-center justify-center shadow-[0_0_15px_rgba(0,210,255,0.4)] transition-all z-10"
        >
          {isCollapsed ? <ChevronRight size={16} strokeWidth={3} /> : <ChevronLeft size={16} strokeWidth={3} />}
        </button>

        <div className={`pt-10 pb-6 px-6 flex items-center border-b border-white/5 ${isCollapsed ? 'justify-center' : 'gap-4'}`}>
          <div className="w-12 h-12 bg-gradient-to-tr from-sky-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white font-black text-xl shrink-0 shadow-lg">
            SK
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">Portal Admin</span>
              <span className="text-sm font-bold text-white truncate">Instituto SANKU</span>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (location.pathname === '/admin' && item.path === '/admin');
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                onClick={() => setSidebarOpen(false)}
                className={`group relative flex items-center p-3 rounded-xl mb-1 cursor-pointer transition-colors ${
                  isActive 
                  ? 'bg-white/5 text-white' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                } ${isCollapsed ? 'justify-center' : 'gap-4'}`}
                title={isCollapsed ? item.label : ""}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-[#22c55e] rounded-r-full shadow-[0_0_12px_rgba(34,197,94,0.6)]"></div>
                )}
                <item.Icon size={22} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-white" : "group-hover:text-white transition-colors"} />
                {!isCollapsed && <span className="font-semibold text-sm tracking-wide">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="bg-transparent h-24 px-6 md:px-8 flex justify-between items-center z-10 pt-4">
          <button className="md:hidden text-slate-500 bg-white p-2 rounded-xl shadow-sm" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          
          {/* BARRA DE BÚSQUEDA Y FECHA (Llena el espacio vacío) */}
          <div className="hidden md:flex items-center gap-6 ml-4">
            <div className="text-xs font-semibold text-slate-500 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm capitalize">
              {fechaActual}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-4 sm:gap-6">
            
            {/* CAMPANITA */}
            <div className="relative">
              <button onClick={() => {setNotifOpen(!notifOpen); setMenuPerfilOpen(false); setMostrandoLeidos(false);}} className={`relative p-3 rounded-2xl bg-white shadow-sm border border-slate-200 transition-colors ${notifPendientes.length > 0 ? 'text-sky-600' : 'text-slate-500 hover:text-sky-500 hover:border-sky-200'}`}>
                <Bell size={20} className={notifPendientes.length > 0 ? 'animate-pulse' : ''} />
                {notifPendientes.length > 0 && <span className="absolute -top-1 -right-1 flex h-5 w-5 bg-rose-500 rounded-full border-2 border-white text-[10px] font-black text-white items-center justify-center">{notifPendientes.length}</span>}
              </button>

              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)}></div>
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in slide-in-from-top-2">
                    <div className="p-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-black text-slate-800 text-base">Notificaciones</h3>
                      {!mostrandoLeidos && notifPendientes.length > 0 && (
                        <button onClick={limpiarTodas} className="text-xs font-bold text-sky-500 hover:text-sky-700 bg-sky-50 px-3 py-1.5 rounded-lg">Limpiar todas</button>
                      )}
                    </div>
                    <div className="max-h-[300px] overflow-y-auto bg-white divide-y divide-slate-50">
                      {notifAMostrar.length === 0 ? (
                        <div className="p-8 text-center text-slate-400"><BellOff size={32} className="mx-auto mb-3 opacity-50"/> <p className="text-sm font-medium">Bandeja vacía</p></div>
                      ) : (
                        notifAMostrar.map(n => (
                          <div key={`${n.tipo}_${n.idOrigen}`} className="p-4 flex gap-3 hover:bg-slate-50 transition-colors group">
                            <div className="mt-1 text-sky-500"><CheckCircle2 size={16} /></div>
                            <div className="flex-1 text-left">
                              <p className="text-sm font-bold text-slate-700">{n.titulo}</p>
                              <p className="text-xs text-slate-500 mt-1">{n.desc}</p>
                              <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase block">{n.tiempo}</span>
                            </div>
                            {!mostrandoLeidos ? (
                              <button onClick={() => archivarNotif(n.idOrigen, n.tipo)} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><X size={16}/></button>
                            ) : (
                              <button onClick={() => restaurarNotif(n.idOrigen, n.tipo)} className="text-slate-300 hover:text-sky-500 opacity-0 group-hover:opacity-100 transition-all"><ArrowLeft size={16}/></button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                      <button onClick={() => setMostrandoLeidos(!mostrandoLeidos)} className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-2 w-full py-2">
                        {mostrandoLeidos ? <><ArrowLeft size={14}/> Ver Pendientes</> : <><Archive size={14}/> Ver Historial</>}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* SEPARADOR VISUAL */}
            <div className="hidden sm:block w-px h-8 bg-slate-200"></div>

            {/* MENÚ DE USUARIO DESPLEGABLE (Restaurado y mejorado) */}
            <div className="relative">
              <button onClick={() => {setMenuPerfilOpen(!menuPerfilOpen); setNotifOpen(false);}} className="flex items-center gap-3 bg-white p-2 pr-4 rounded-2xl shadow-sm border border-slate-200 transition-colors hover:border-sky-300">
                <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black">
                  {nombreAdmin.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-bold text-slate-800 leading-tight">{nombreAdmin}</p>
                  <p className="text-[10px] font-bold text-sky-500 uppercase tracking-widest">{rol}</p>
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${menuPerfilOpen ? 'rotate-180' : ''}`}/>
              </button>

              {menuPerfilOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuPerfilOpen(false)}></div>
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-xl border border-slate-100 z-50 overflow-hidden py-2 animate-in slide-in-from-top-2">
                    <div className="px-5 py-3 border-b border-slate-50 mb-1">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Conectado como</p>
                      <p className="text-sm font-black text-slate-800 truncate">{nombreAdmin}</p>
                    </div>
                    {/* ENLACE RESTAURADO A "MI PERFIL" */}
                    <Link to="/admin/perfil" onClick={() => setMenuPerfilOpen(false)} className="px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-sky-600 flex items-center gap-3 transition-colors">
                      <User size={18}/> Mi Perfil
                    </Link>
                    <div className="h-px bg-slate-100 my-1 mx-3"></div>
                    <button onClick={handleLogout} className="w-full px-5 py-3 text-sm font-semibold text-rose-500 hover:bg-rose-50 flex items-center gap-3 transition-colors">
                      <LogOut size={18}/> Cerrar Sesión
                    </button>
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

export default AdminDashboard;