import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Presentation, TrendingUp, Wallet, Clock,
  BookOpen, GraduationCap, Headset, Briefcase, MapPin, Laptop, LayoutGrid, Megaphone
} from 'lucide-react';
import { sileo } from 'sileo';
import { API_BASE, authHeaders } from '../../../utils/api';

const getCicloActual = () => {
  const now = new Date();
  return now.getMonth() < 6 ? `${now.getFullYear()}-I` : `${now.getFullYear()}-II`;
};

const PanelEstudiante = () => {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [clasesHoy, setClasesHoy] = useState([]);
  const [deudaPendiente, setDeudaPendiente] = useState(0);
  const [anuncios, setAnuncios] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const usuarioId = localStorage.getItem("usuarioId");
    
    const fetchInicial = async () => {
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
        
        const resPerfil = await axios.get(`http://localhost:8080/api/v1/alumnos/perfil/${usuarioId}`, { headers });
        const dataPerfil = resPerfil.data;
        const alumnoId = dataPerfil.idAlumno;
        const miCarrera = dataPerfil.nombreCarrera;

        const [resPagos, resCarreras, resCursos, resSecciones, resAnuncios] = await Promise.all([
          axios.get(`http://localhost:8080/api/v1/cuotas/alumno/${alumnoId}`, { headers }).catch(() => ({ data: [] })),
          axios.get(`http://localhost:8080/api/v1/carreras`, { headers }).catch(() => ({ data: [] })),
          axios.get(`http://localhost:8080/api/v1/cursos`, { headers }).catch(() => ({ data: [] })),
          axios.get(`http://localhost:8080/api/v1/secciones/ciclo/${getCicloActual()}`, { headers }).catch(() => ({ data: [] })),
          axios.get(`${API_BASE}/anuncios/alumno/${alumnoId}`, { headers: authHeaders() }).catch(() => ({ data: [] }))
        ]);

        if (!isMounted) return;

        setPerfil(dataPerfil);
        setAnuncios(resAnuncios.data);

        let totalDeuda = 0;
        resPagos.data.forEach(c => {
          if (c.estado === 'PENDIENTE' || c.estado === 'VENCIDO') totalDeuda += c.montoTotal;
        });
        setDeudaPendiente(totalDeuda);

        const idCarreraReal = resCarreras.data.find(c => c.nombre === miCarrera)?.idCarrera;
        const idsCursosValidos = new Set(resCursos.data.filter(c => c.carreraId === idCarreraReal).map(c => c.idCurso));
        const misSecciones = resSecciones.data.filter(s => idsCursosValidos.has(s.cursoId));

        let diaActual = new Date().getDay();
        diaActual = diaActual === 0 ? 7 : diaActual; 
        setClasesHoy(misSecciones.filter(s => s.diaSemana === diaActual));

      } catch (error) {
        console.error(error);
        sileo.error({ title: "Error", description: "No se pudieron cargar los datos del panel." });
      } finally {
        if (isMounted) setCargando(false);
      }
    };

    fetchInicial();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Resumen Académico</h2>
          <p className="text-slate-500">Un vistazo rápido de tu actividad y progreso.</p>
        </div>
        <span className="bg-sky-50 text-sky-700 px-4 py-2 rounded-xl font-bold border border-sky-100 shadow-sm flex items-center gap-2 text-sm">
          <Presentation size={16} /> Modalidad Presencial
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-5">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex justify-center items-center"><Presentation size={24}/></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Clases Hoy</p>
            <h3 className="text-2xl font-black text-slate-800">{cargando ? '...' : clasesHoy.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex justify-center items-center"><TrendingUp size={24}/></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Promedio Actual</p>
            <h3 className="text-2xl font-black text-slate-800">{cargando ? '...' : perfil?.promedioHistorico || '0.00'}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border-l-4 border-l-rose-500 border-slate-200 flex items-center gap-5">
          <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex justify-center items-center"><Wallet size={24}/></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pago Pendiente</p>
            <h3 className="text-2xl font-black text-rose-600">S/ {cargando ? '...' : deudaPendiente.toFixed(2)}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Clock className="text-blue-500"/> Tu Agenda de Hoy</h3>
            <button onClick={() => navigate('/estudiante/horario')} className="text-xs font-bold text-blue-600 hover:text-blue-800">Ver horario</button>
          </div>
          <div className="p-6 flex-1 bg-slate-50/50 rounded-b-3xl">
            {cargando && <p className="text-center text-slate-400 py-10">Cargando agenda...</p>}
            {!cargando && clasesHoy.length === 0 && (
              <p className="text-center text-slate-400 py-10 font-medium">¡Día libre! No tienes clases programadas para hoy.</p>
            )}
            {!cargando && clasesHoy.length > 0 && (
              <div className="space-y-4">
                {clasesHoy.map(s => (
                  <div key={s.idSeccion} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-blue-300 transition-colors">
                    <div className="bg-slate-50 px-3 py-2 rounded-xl text-center shrink-0 border border-slate-100">
                      <p className="font-black text-blue-600">{s.horaInicio?.substring(0,5)}</p>
                      <p className="text-[10px] font-bold text-slate-400">a {s.horaFin?.substring(0,5)}</p>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800 leading-tight">{s.nombreCurso}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-2">
                        {s.modalidad === 'VIRTUAL' ? <Laptop size={12}/> : <MapPin size={12}/>} {s.modalidad} | Prof. {s.nombreDocente.split(" ")[0]}
                      </p>
                    </div>
                    <button onClick={() => navigate('/estudiante/cursos')} className="text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Ver Curso</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col">
          <h3 className="font-bold text-slate-800 p-6 border-b border-slate-100 flex items-center gap-2"><LayoutGrid className="text-blue-500"/> Accesos Rápidos</h3>
          <div className="p-6 grid grid-cols-2 gap-4">
            <button type="button" onClick={() => navigate('/estudiante/cursos')} className="bg-slate-50 hover:bg-blue-50 p-4 rounded-2xl border border-slate-200 hover:border-blue-200 flex flex-col items-center justify-center text-center gap-3 transition-colors group">
              <BookOpen size={24} className="text-sky-500 group-hover:scale-110 transition-transform"/>
              <span className="text-xs font-bold text-slate-600">Mis Cursos</span>
            </button>
            <button type="button" onClick={() => navigate('/estudiante/calificaciones')} className="bg-slate-50 hover:bg-indigo-50 p-4 rounded-2xl border border-slate-200 hover:border-indigo-200 flex flex-col items-center justify-center text-center gap-3 transition-colors group">
              <GraduationCap size={24} className="text-indigo-500 group-hover:scale-110 transition-transform"/>
              <span className="text-xs font-bold text-slate-600">Calificaciones</span>
            </button>
            <button type="button" onClick={() => navigate('/estudiante/tramites')} className="bg-slate-50 hover:bg-emerald-50 p-4 rounded-2xl border border-slate-200 hover:border-emerald-200 flex flex-col items-center justify-center text-center gap-3 transition-colors group">
              <Headset size={24} className="text-emerald-500 group-hover:scale-110 transition-transform"/>
              <span className="text-xs font-bold text-slate-600">Soporte / SAE</span>
            </button>
            <button type="button" onClick={() => navigate('/estudiante/finanzas')} className="bg-slate-50 hover:bg-amber-50 p-4 rounded-2xl border border-slate-200 hover:border-amber-200 flex flex-col items-center justify-center text-center gap-3 transition-colors group">
              <Briefcase size={24} className="text-amber-500 group-hover:scale-110 transition-transform"/>
              <span className="text-xs font-bold text-slate-600">Mis Pagos</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <h3 className="font-bold text-slate-800 p-6 border-b border-slate-100 flex items-center gap-2"><Megaphone className="text-amber-500"/> Anuncios Recientes</h3>
        <div className="p-6 space-y-3">
          {cargando && <p className="text-center text-slate-400 py-6">Cargando anuncios...</p>}
          {!cargando && anuncios.length === 0 && (
            <p className="text-center text-slate-400 py-6 font-medium">No hay anuncios recientes de tus secciones.</p>
          )}
          {!cargando && anuncios.slice(0, 5).map(a => (
            <div key={a.idAnuncio} className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-bold text-slate-800 text-sm">{a.titulo}</p>
                <span className="text-xs text-slate-400 shrink-0">{new Date(a.fechaPublicacion).toLocaleDateString('es-ES')}</span>
              </div>
              <p className="text-slate-600 text-sm mt-1">{a.contenido}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PanelEstudiante;