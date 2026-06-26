import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Mail, CreditCard, Calendar, BookOpen, ShieldCheck, User } from 'lucide-react';
import { sileo } from 'sileo';

const PerfilEstudiante = () => {
  const [alumno, setAlumno] = useState({});
  const [cargando, setCargando] = useState(true);

  const getHeaders = useCallback(() => ({ Authorization: `Bearer ${localStorage.getItem('token')}` }), []);

  useEffect(() => {
    let isMounted = true;
    const userId = localStorage.getItem("usuarioId");
    
    axios.get(`http://localhost:8080/api/v1/alumnos/perfil/${userId}`, { headers: getHeaders() })
      .then(res => { if (isMounted) setAlumno(res.data); })
      .catch(() => sileo.error({ title: "Error", description: "No se pudo cargar la información del perfil." }))
      .finally(() => { if (isMounted) setCargando(false); });

    return () => { isMounted = false; };
  }, [getHeaders]);

  if (cargando) return <div className="p-10 text-center text-slate-500 animate-pulse">Cargando perfil...</div>;

  const fechaIngresoVisual = alumno.fechaIngreso ? new Date(alumno.fechaIngreso + "T00:00:00").toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : '---';

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-black text-slate-800">Mi Perfil</h2>
        <p className="text-slate-500 text-sm">Información personal y estado académico.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-10 items-center md:items-start">
        
        <div className="flex flex-col items-center text-center shrink-0 w-48">
          <div className="w-32 h-32 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-5xl border-4 border-blue-100 shadow-inner mb-4">
            <User size={56} strokeWidth={1.5}/>
          </div>
          <h3 className="text-xl font-black text-slate-800 leading-tight mb-2">{alumno.usuario?.nombreCompleto || 'Estudiante'}</h3>
          <p className="text-xs font-bold text-slate-500 flex items-center gap-1 justify-center bg-slate-100 px-3 py-1 rounded-full">
            <CreditCard size={14}/> DNI: {alumno.usuario?.dni || '---'}
          </p>
        </div>

        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-100">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Mail size={12}/> CORREO INSTITUCIONAL</label>
            <p className="font-bold text-slate-700">{alumno.usuario?.email || '---'}</p>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><BookOpen size={12}/> CARRERA PROFESIONAL</label>
            <p className="font-bold text-slate-700">{alumno.nombreCarrera || 'General'}</p>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Calendar size={12}/> FECHA DE INGRESO</label>
            <p className="font-bold text-slate-700 capitalize">{fechaIngresoVisual}</p>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><ShieldCheck size={12}/> ESTADO ACADÉMICO</label>
            <p className="mt-1"><span className={`px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-lg ${alumno.estado === 'ACTIVO' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>{alumno.estado || '---'}</span></p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PerfilEstudiante;