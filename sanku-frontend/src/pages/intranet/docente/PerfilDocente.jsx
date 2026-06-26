import { useEffect, useState } from 'react';
import axios from 'axios';
import { Mail, CreditCard, GraduationCap } from 'lucide-react';
import { sileo } from 'sileo';

const PerfilDocente = () => {
  const [docente, setDocente] = useState({});
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const userId = localStorage.getItem("usuarioId");
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    
    axios.get(`http://localhost:8080/api/v1/docentes/perfil/${userId}`, { headers })
      .then(res => { if (isMounted) setDocente(res.data); })
      .catch(() => sileo.error({ title: "Error", description: "No se pudo cargar la información del perfil." }))
      .finally(() => { if (isMounted) setCargando(false); });

    return () => { isMounted = false; };
  }, []);

  if (cargando) return <div className="p-10 text-center text-slate-500 animate-pulse">Cargando perfil...</div>;

  return (
    <div className="max-w-3xl space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-black text-slate-800">Mi Perfil Profesional</h2>
        <p className="text-slate-500 text-sm">Información de contacto y especialidad académica.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8 items-center md:items-start">
        <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-5xl font-black text-white shadow-xl shrink-0 border-4 border-white">
          {docente.usuario?.nombreCompleto ? docente.usuario.nombreCompleto.charAt(0) : 'D'}
        </div>
        <div className="flex-1 w-full text-center md:text-left">
          <h3 className="text-3xl font-black text-slate-800 mb-1">{docente.usuario?.nombreCompleto || 'Docente SANKU'}</h3>
          <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest mb-8 border border-indigo-100">
            <GraduationCap size={14}/> Especialidad: {docente.especialidad || 'General'}
          </span>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DNI</label>
              <p className="font-semibold text-slate-700 flex items-center justify-center md:justify-start gap-2"><CreditCard size={16} className="text-indigo-500"/> {docente.usuario?.dni}</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Correo Institucional</label>
              <p className="font-semibold text-slate-700 flex items-center justify-center md:justify-start gap-2"><Mail size={16} className="text-indigo-500"/> {docente.usuario?.email}</p>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado Institucional</label>
              <p className="font-bold text-emerald-600 uppercase tracking-widest text-sm">{docente.estado}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PerfilDocente;