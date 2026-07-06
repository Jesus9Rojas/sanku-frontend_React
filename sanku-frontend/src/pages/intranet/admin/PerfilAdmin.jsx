import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, Mail, CreditCard, UserCircle } from 'lucide-react';

const PerfilAdmin = () => {
  const [admin, setAdmin] = useState(null);
  const usuarioId = localStorage.getItem("usuarioId");
  const rol = localStorage.getItem("usuarioRol");

  useEffect(() => {
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    axios.get('http://localhost:8080/api/v1/usuarios', { headers })
      .then(res => {
        const found = res.data.find(u => u.idUsuario == usuarioId || u.id == usuarioId);
        if (found) setAdmin(found);
      }).catch(e => console.error("Perfil no cargado", e));
  }, [usuarioId]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto mt-6">
      <div>
        <h2 className="text-2xl font-black text-slate-800">Configuración de Perfil</h2>
        <p className="text-slate-500 text-sm">Gestión de tu información personal y cuenta administrativa.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 flex flex-col md:flex-row gap-10 items-center md:items-start">
        <div className="text-center shrink-0">
          <div className="w-32 h-32 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center text-5xl font-black border-4 border-orange-200 mx-auto mb-4 shadow-inner">
            {admin ? admin.nombres?.charAt(0) || 'A' : 'A'}
          </div>
          <h3 className="font-black text-slate-800 text-lg">
            {admin ? `${admin.nombres || ''} ${admin.apellidos || ''}` : 'Cargando...'}
          </h3>
          <p className="text-slate-400 text-xs mt-1 font-bold flex items-center justify-center gap-1">
            <ShieldCheck size={14} className="text-emerald-500"/> Acceso: <span className="text-slate-600">{rol}</span>
          </p>
        </div>

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-start gap-4">
            <div className="p-3 bg-sky-50 text-sky-600 rounded-xl"><CreditCard size={20}/></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Número de DNI</p>
              <p className="text-slate-700 font-bold text-sm">{admin?.dni || '---'}</p>
            </div>
          </div>
          
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-start gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Mail size={20}/></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Correo Electrónico</p>
              <p className="text-slate-700 font-bold text-sm break-all">{admin?.email || admin?.correo || '---'}</p>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-start gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><UserCircle size={20}/></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Rol del Sistema</p>
              <span className="inline-block mt-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-black uppercase tracking-wider">{rol} GLOBAL</span>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-start gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle size={20}/></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Estado de Cuenta</p>
              <span className="inline-block mt-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider">ACTIVO</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckCircle = ({size}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;

export default PerfilAdmin;