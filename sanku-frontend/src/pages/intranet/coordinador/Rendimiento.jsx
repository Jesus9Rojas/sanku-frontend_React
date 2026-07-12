import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, GraduationCap } from 'lucide-react';
import { sileo } from 'sileo';
import Swal from 'sweetalert2';
import { API_BASE } from '../../../utils/api';

const customSwal = Swal.mixin({
  customClass: {
    popup: 'rounded-3xl border-0 shadow-2xl',
    confirmButton: 'bg-teal-500 hover:bg-teal-600 text-white font-bold py-2.5 px-6 rounded-xl border-0'
  },
  buttonsStyling: false
});

const Rendimiento = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  useEffect(() => {
    let isMounted = true;
    axios.get(`${API_BASE}/reportes/rendimiento`, { headers: getHeaders() })
      .then(res => { if (isMounted) setAlumnos(res.data); })
      .catch(() => sileo.error({ title: "Error", description: "No se pudo cargar el rendimiento" }))
      .finally(() => { if (isMounted) setCargando(false); });
    return () => { isMounted = false; };
  }, []);

  const filtrados = alumnos.filter(a => 
    a.alumno?.toLowerCase().includes(busqueda.toLowerCase()) || 
    a.dni?.includes(busqueda)
  );

  const verKardex = () => {
    // En vez de eliminar funcionalidades inexistentes, las comentamos y ponemos un aviso visual
    customSwal.fire({
      title: 'En Desarrollo',
      text: 'El historial detallado (Kárdex) estará disponible en la próxima actualización.',
      icon: 'info',
      confirmButtonText: 'Entendido'
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-black text-slate-800">Seguimiento Académico</h2>
        <p className="text-slate-500 text-sm">Visualiza el avance de los estudiantes, sus promedios y asistencia global.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="relative w-full max-w-md mx-auto">
            <Search className="absolute left-3 top-3 text-slate-400" size={18}/>
            <input type="text" placeholder="Buscar alumno por DNI o Nombres..." value={busqueda} onChange={e=>setBusqueda(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-teal-500 outline-none text-sm bg-white text-slate-800 placeholder-slate-400"/>
          </div>
        </div>
        
        <div className="overflow-x-auto p-5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-3 px-4">DNI</th>
                <th className="py-3 px-4">Estudiante</th>
                <th className="py-3 px-4">Carrera</th>
                <th className="py-3 px-4">Promedio Histórico</th>
                <th className="py-3 px-4">Asistencia Global</th>
                <th className="py-3 px-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {cargando ? <tr><td colSpan="6" className="text-center py-8 text-slate-400">Cargando rendimiento...</td></tr> : 
                filtrados.length === 0 ? <tr><td colSpan="6" className="text-center py-8 text-slate-400">No se encontraron estudiantes.</td></tr> :
                filtrados.map((a, i) => {
                  const asisPorcentaje = a.dias_totales > 0 ? Math.round((a.dias_asistidos / a.dias_totales) * 100) : 0;
                  const colorNota = a.promedio_historico >= 13 ? 'text-emerald-600' : 'text-rose-600';
                  const colorAsis = asisPorcentaje >= 70 ? 'text-emerald-600' : 'text-rose-600';
                  
                  return (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 font-bold text-slate-700">{a.dni}</td>
                      <td className="py-4 px-4 font-semibold text-slate-800">{a.alumno}</td>
                      <td className="py-4 px-4 text-slate-500">{a.carrera || 'General'}</td>
                      <td className="py-4 px-4"><strong className={`${colorNota} text-base`}>{parseFloat(a.promedio_historico || 0).toFixed(2)}</strong></td>
                      <td className="py-4 px-4">
                        <strong className={`${colorAsis} text-base block`}>{asisPorcentaje}%</strong>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">({a.dias_asistidos} de {a.dias_totales} clases)</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button onClick={verKardex} className="border border-slate-200 text-slate-500 hover:text-teal-600 hover:border-teal-300 font-bold px-4 py-2 rounded-xl transition-colors text-xs flex items-center gap-2 mx-auto">
                          <GraduationCap size={14}/> Ver Kárdex
                        </button>
                      </td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default Rendimiento;