import { useState, useEffect } from 'react';
import axios from 'axios';
import {CheckCircle2, AlertCircle, History, Lock } from 'lucide-react';
import { sileo } from 'sileo';
import Swal from 'sweetalert2';

const customSwal = Swal.mixin({
  customClass: {
    popup: 'rounded-3xl border-0 shadow-2xl',
    confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl border-0 mx-2 transition-colors'
  },
  buttonsStyling: false
});

const FinanzasEstudiante = () => {
  const [pagadas, setPagadas] = useState([]);
  const [pendientes, setPendientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cuotasSeleccionadas, setCuotasSeleccionadas] = useState([]);

  const alumnoId = localStorage.getItem("alumnoId");

  const recargarFinanzas = async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const res = await axios.get(`http://localhost:8080/api/v1/cuotas/alumno/${alumnoId}`, { headers });
      const cuotas = res.data;
      setPagadas(cuotas.filter(c => c.estado === 'PAGADO'));
      setPendientes(cuotas.filter(c => c.estado === 'PENDIENTE' || c.estado === 'VENCIDO').sort((a,b) => new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento)));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const inicializarFinanzas = async () => {
      if (!alumnoId) {
        if (isMounted) setCargando(false);
        return;
      }
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
        const res = await axios.get(`http://localhost:8080/api/v1/cuotas/alumno/${alumnoId}`, { headers });
        if (isMounted) {
          const cuotas = res.data;
          setPagadas(cuotas.filter(c => c.estado === 'PAGADO'));
          setPendientes(cuotas.filter(c => c.estado === 'PENDIENTE' || c.estado === 'VENCIDO').sort((a,b) => new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento)));
        }
      } catch (error) {
        console.error(error);
        sileo.error({ title: "Error", description: "No se pudo cargar el estado de cuenta." });
      } finally {
        if (isMounted) setCargando(false);
      }
    };

    inicializarFinanzas();
    return () => { isMounted = false; };
  }, [alumnoId]);

  const handleCheckboxChange = (cuota) => {
    setCuotasSeleccionadas(prev => {
      const existe = prev.find(c => c.idCuota === cuota.idCuota);
      if (existe) return prev.filter(c => c.idCuota !== cuota.idCuota);
      return [...prev, cuota];
    });
  };

  const totalPagar = cuotasSeleccionadas.reduce((sum, c) => sum + c.montoTotal, 0);

  const procesarPagoSimulado = async () => {
    customSwal.fire({
      title: 'Procesando Pago Seguro',
      html: `Estás a punto de cancelar <strong>${cuotasSeleccionadas.length} cuota(s)</strong> por un total de <strong class="text-blue-600">S/ ${totalPagar.toFixed(2)}</strong>.<br><br><span class="text-sm text-slate-500">¿Deseas confirmar la transacción con tu tarjeta guardada?</span>`,
      icon: 'info',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: '<i class="fa-solid fa-lock"></i> Confirmar y Pagar',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
          const peticiones = cuotasSeleccionadas.map(c => 
            axios.post(`http://localhost:8080/api/v1/pagos/pagar?idCuota=${c.idCuota}&monto=${c.montoTotal}&metodoPago=TARJETA_CREDITO`, {}, { headers })
          );
          await Promise.all(peticiones);
          return true;
        } catch (error) {
          console.error(error);
          Swal.showValidationMessage(`Fallo en la transacción. Contacta a tu banco.`);
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        customSwal.fire('¡Pago Exitoso!', 'Tus cuotas han sido canceladas y registradas en el sistema.', 'success');
        setCuotasSeleccionadas([]);
        recargarFinanzas();
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-black text-slate-800">Gestión Financiera</h2>
        <p className="text-slate-500 text-sm">Revisa tu estado de cuenta y realiza tus pagos en línea.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <h3 className="p-6 border-b border-slate-100 font-bold text-lg text-rose-600 flex items-center gap-2">
            <AlertCircle size={20}/> Cuotas Pendientes
          </h3>
          
          <div className="flex-1 p-6 overflow-y-auto max-h-[400px] custom-scrollbar space-y-3">
            {cargando ? <p className="text-center text-slate-400 py-10">Buscando cuotas...</p> : 
             pendientes.length === 0 ? (
               <div className="text-center py-10 px-4">
                 <CheckCircle2 size={48} className="mx-auto text-emerald-400 mb-4"/>
                 <h4 className="text-emerald-600 font-bold text-lg mb-1">¡Estás al día!</h4>
                 <p className="text-slate-500 text-sm">No registras cuotas pendientes.</p>
               </div>
             ) : (
               pendientes.map(c => {
                 const isVencido = c.estado === 'VENCIDO';
                 const seleccionado = cuotasSeleccionadas.some(sel => sel.idCuota === c.idCuota);
                 return (
                   <label key={c.idCuota} className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all ${seleccionado ? 'border-blue-500 bg-blue-50/50 shadow-sm' : 'border-slate-200 hover:border-blue-300'}`}>
                     <div className="flex items-center gap-4">
                       <input 
                         type="checkbox" 
                         checked={seleccionado}
                         onChange={() => handleCheckboxChange(c)}
                         className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                       />
                       <div>
                         <h4 className="font-bold text-slate-800 mb-1">{c.mesCorrespondiente}</h4>
                         <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg ${isVencido ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'}`}>
                           Vence: {c.fechaVencimiento} {isVencido && '(VENCIDO)'}
                         </span>
                       </div>
                     </div>
                     <strong className="text-lg font-black text-slate-800">S/ {c.montoTotal.toFixed(2)}</strong>
                   </label>
                 );
               })
             )
            }
          </div>

          <div className="bg-slate-50 p-6 border-t border-slate-200 mt-auto">
            <div className="flex justify-between items-end mb-4">
              <span className="text-slate-500 font-semibold text-sm">Total Seleccionado:</span>
              <h3 className="text-3xl font-black text-slate-800">S/ {totalPagar.toFixed(2)}</h3>
            </div>
            <button 
              onClick={procesarPagoSimulado}
              disabled={cuotasSeleccionadas.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
            >
              <Lock size={18}/> Procesar Pago Seguro
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <h3 className="p-6 border-b border-slate-100 font-bold text-lg text-emerald-600 flex items-center gap-2">
            <History size={20}/> Historial de Pagos
          </h3>
          <div className="flex-1 p-6 overflow-y-auto max-h-[550px] custom-scrollbar space-y-0">
            {cargando ? <p className="text-center text-slate-400 py-10">Cargando historial...</p> : 
             pagadas.length === 0 ? <p className="text-center text-slate-400 py-10">Aún no tienes pagos registrados.</p> :
             pagadas.map(c => (
               <div key={c.idCuota} className="flex justify-between items-center py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 px-2 transition-colors rounded-xl">
                 <div>
                   <h4 className="font-bold text-slate-800 mb-1">{c.mesCorrespondiente}</h4>
                   <span className="text-xs font-semibold text-slate-500">Ciclo: {c.cicloAcademico}</span>
                 </div>
                 <div className="text-right">
                   <strong className="block text-base font-black text-slate-800">S/ {c.montoTotal.toFixed(2)}</strong>
                   <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Pagado</span>
                 </div>
               </div>
             ))
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanzasEstudiante;