import { useState, useEffect } from 'react';
import axios from 'axios';
import { Wallet, CheckCheck, HandCoins, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { sileo } from 'sileo';

// Configuración Premium de SweetAlert2 para Finanzas
const customSwal = Swal.mixin({
  customClass: {
    popup: 'rounded-3xl border-0 shadow-2xl',
    confirmButton: 'bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-6 rounded-xl border-0 mx-2 transition-colors',
    cancelButton: 'bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 px-6 rounded-xl border-0 mx-2 transition-colors'
  },
  buttonsStyling: false
});

const FinanzasAdmin = () => {
  const [cuotas, setCuotas] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Usamos token directamente en las llamadas para evitar warnings de dependencias
  const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  const recargarFinanzas = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/v1/cuotas/todas', { headers: getHeaders() });
      setCuotas(res.data);
    } catch {
      sileo.error({ title: "Error", description: "No se pudieron recargar los datos financieros." });
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const cargarFinanzasIniciales = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/v1/cuotas/todas', { headers: getHeaders() });
        if (isMounted) setCuotas(res.data);
      } catch {
        sileo.error({ title: "Error de Conexión", description: "No se conectó al módulo de finanzas." });
      } finally {
        if (isMounted) setCargando(false);
      }
    };

    cargarFinanzasIniciales();
    return () => { isMounted = false; };
  }, []);

  const ejecutarCobroManual = (idCuota, monto) => {
    customSwal.fire({
      title: '¿Confirmar cobro?',
      html: `Se registrará un pago manual en <strong>EFECTIVO</strong> por:<br><span class="text-3xl font-black text-emerald-600 mt-3 block">S/ ${monto.toFixed(2)}</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, registrar pago',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.post('http://localhost:8080/api/v1/pagos/pagar', {
            idCuota: idCuota,
            monto: monto,
            metodoPago: 'EFECTIVO'
          }, { headers: getHeaders() });
          
          sileo.success({ title: "Pago Registrado", description: `La cuota #${idCuota} ha sido cancelada con éxito.` });
          recargarFinanzas();
        } catch {
          customSwal.fire("Error", "Hubo un problema al registrar el pago en el servidor.", "error");
        }
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Recaudación y Caja</h2>
          <p className="text-slate-500 text-sm">Gestiona los pagos de cuotas y matrículas de los estudiantes.</p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl flex items-center gap-2 border border-emerald-100 font-semibold shadow-sm">
          <Wallet size={18} />
          <span>Caja Activa</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto p-5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-3 px-4">Estudiante (ID)</th>
                <th className="py-3 px-4">Ciclo</th>
                <th className="py-3 px-4">Mes a Pagar</th>
                <th className="py-3 px-4">Monto</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {cargando ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-400 font-medium">
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i> Cargando información financiera...
                  </td>
                </tr>
              ) : cuotas.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-400 flex flex-col items-center justify-center gap-2">
                    <AlertCircle size={32} className="opacity-30" />
                    No hay cuotas registradas en el sistema.
                  </td>
                </tr>
              ) : (
                cuotas.map((c) => (
                  <tr key={c.idCuota} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-700">Estudiante #{c.idAlumno}</td>
                    <td className="py-4 px-4 font-semibold text-slate-600">{c.cicloAcademico}</td>
                    <td className="py-4 px-4 text-slate-600 capitalize">{c.mesCorrespondiente}</td>
                    <td className="py-4 px-4 font-black text-emerald-600">S/ {c.montoTotal?.toFixed(2)}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        c.estado === 'PAGADO' ? 'bg-emerald-100 text-emerald-700' : 
                        c.estado === 'VENCIDO' ? 'bg-rose-100 text-rose-700' : 
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {c.estado}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {c.estado === 'PAGADO' ? (
                        <span className="inline-flex items-center gap-1 text-slate-400 text-xs font-bold bg-slate-100 px-3 py-1.5 rounded-lg">
                          <CheckCheck size={14} /> Cancelado
                        </span>
                      ) : (
                        <button 
                          onClick={() => ejecutarCobroManual(c.idCuota, c.montoTotal)} 
                          className="inline-flex items-center gap-2 bg-sky-100 hover:bg-sky-500 text-sky-700 hover:text-white font-bold px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 text-xs"
                        >
                          <HandCoins size={14} /> Cobrar
                        </button>
                      )}
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

export default FinanzasAdmin;