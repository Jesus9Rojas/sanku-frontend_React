import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react'; // Eliminados los iconos que no se usaban en el HTML
import Swal from 'sweetalert2';
import { sileo } from 'sileo';

const BuzonSae = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  
  // Función aislada para poder recargar manualmente la tabla después de aprobar/rechazar
  const recargarSAE = async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const res = await axios.get('http://localhost:8080/api/v1/solicitudes/pendientes', { headers });
      setSolicitudes(res.data);
    } catch { 
      // Eliminamos la (e) para que el linter no se queje
      sileo.error({ title: "Error", description: "No se conectó al SAE" }); 
    }
  };

  useEffect(() => {
    let isMounted = true;

    const cargarSaeInicial = async () => {
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
        const res = await axios.get('http://localhost:8080/api/v1/solicitudes/pendientes', { headers });
        if (isMounted) setSolicitudes(res.data);
      } catch {
        // Eliminamos la (e)
        sileo.error({ title: "Error", description: "No se conectó al SAE" });
      }
    };

    cargarSaeInicial();

    return () => { isMounted = false; };
  }, []);

  const filtrados = solicitudes.filter(s => 
    s.nombreEmisor?.toLowerCase().includes(busqueda.toLowerCase()) || 
    s.idSolicitud.toString().includes(busqueda)
  );

  const atenderTramite = (tramite) => {
    Swal.fire({
      title: `Trámite #${tramite.idSolicitud}`,
      html: `<div class="text-left text-sm mt-2 p-3 bg-slate-50 rounded-xl">
               <p><strong>Alumno:</strong> ${tramite.nombreEmisor}</p>
               <p><strong>Motivo:</strong> ${tramite.tipo}</p>
               <p class="mt-2 text-slate-500 italic">"${tramite.descripcion}"</p>
             </div>`,
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: '<i class="fa-solid fa-check"></i> Aprobar',
      denyButtonText: 'Rechazar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#10b981',
      denyButtonColor: '#e3342f'
    }).then(async (result) => {
      if (result.isConfirmed) {
        enviarRespuesta(tramite.idSolicitud, 'APROBADO', 'Aprobado según normativa.');
      } else if (result.isDenied) {
        const { value: obs } = await Swal.fire({ 
          title: 'Motivo de rechazo', 
          input: 'text', 
          inputValidator: (val) => !val && 'Debes ingresar un motivo' 
        });
        if (obs) enviarRespuesta(tramite.idSolicitud, 'RECHAZADO', obs);
      }
    });
  };

  const enviarRespuesta = async (id, estado, obs) => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      await axios.put(`http://localhost:8080/api/v1/solicitudes/${id}/responder`, { estado, observacion: obs }, { headers });
      sileo.success({ title: `Trámite ${estado}` });
      recargarSAE();
    } catch { 
      // Eliminamos la (e)
      Swal.fire("Error", "Ocurrió un problema", "error"); 
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-black text-slate-800">Servicio de Atención al Estudiante (SAE)</h2>
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-3 text-slate-400" size={18}/>
            <input type="text" placeholder="Buscar por alumno o número..." value={busqueda} onChange={e=>setBusqueda(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-sky-500 outline-none text-sm"/>
          </div>
        </div>
        <div className="overflow-x-auto p-5">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase"><tr className="border-b"><th className="p-3">Cod.</th><th className="p-3">Estudiante</th><th className="p-3">Trámite</th><th className="p-3">Estado</th><th className="p-3 text-right">Acción</th></tr></thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtrados.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-8 text-slate-400">No hay trámites pendientes.</td></tr>
              ) : (
                filtrados.map(s => (
                  <tr key={s.idSolicitud} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-700">#TRM-{s.idSolicitud}</td>
                    <td className="p-3 font-semibold">{s.nombreEmisor}</td>
                    <td className="p-3 text-slate-600">{s.tipo}</td>
                    <td className="p-3"><span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${s.estado==='PENDIENTE' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100'}`}>{s.estado}</span></td>
                    <td className="p-3 text-right">
                      <button onClick={() => atenderTramite(s)} className="bg-sky-100 hover:bg-sky-200 text-sky-700 font-bold px-3 py-1.5 rounded-lg transition-colors text-xs">Revisar</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BuzonSae;