import { useState, useEffect } from 'react';
import axios from 'axios';
import { Globe, UserPlus, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { sileo } from 'sileo';
import Swal from 'sweetalert2';

const customSwal = Swal.mixin({
  customClass: {
    popup: 'rounded-3xl border-0 shadow-2xl',
    confirmButton: 'bg-teal-500 hover:bg-teal-600 text-white font-bold py-2.5 px-6 rounded-xl border-0 mx-2 transition-colors',
    cancelButton: 'bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 px-6 rounded-xl border-0 mx-2 transition-colors'
  },
  buttonsStyling: false
});

const MatriculasAdmision = () => {
  const [postulantes, setPostulantes] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [cargandoPostulantes, setCargandoPostulantes] = useState(true);
  const [aprobandoId, setAprobandoId] = useState(null);

  // Estados del Wizard Manual
  const [paso, setPaso] = useState(1);
  const [formManual, setFormManual] = useState({ dni: '', nombres: '', apellidos: '', correo: '', carreraId: '' });
  const [registrando, setRegistrando] = useState(false);
  const [registroExitoso, setRegistroExitoso] = useState(null);

  const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  // Función exclusiva para el botón de "Aprobar" (fuera del useEffect)
  const recargarPostulantes = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/v1/postulantes/pendientes', { headers: getHeaders() });
      setPostulantes(res.data);
    } catch {
      sileo.error({ title: "Error", description: "No se pudieron recargar los postulantes." });
    }
  };

  // Carga inicial protegida para cumplir con las reglas del linter
  useEffect(() => {
    let isMounted = true;
    
    const fetchInicial = async () => {
      try {
        const headersLocal = { Authorization: `Bearer ${localStorage.getItem('token')}` };
        const [resP, resC] = await Promise.all([
          axios.get('http://localhost:8080/api/v1/postulantes/pendientes', { headers: headersLocal }),
          axios.get('http://localhost:8080/api/v1/carreras', { headers: headersLocal })
        ]);
        
        if (isMounted) {
          setPostulantes(resP.data);
          setCarreras(resC.data.filter(c => c.tipo === 'CARRERA' && c.estado === true));
        }
      } catch {
        sileo.error({ title: "Error", description: "Error al cargar los datos iniciales." });
      } finally {
        if (isMounted) setCargandoPostulantes(false);
      }
    };

    fetchInicial();
    return () => { isMounted = false; };
  }, []);

  const aprobarPostulante = async (id) => {
    setAprobandoId(id);
    try {
      const res = await axios.post(`http://localhost:8080/api/v1/postulantes/${id}/aprobar`, {}, { headers: getHeaders() });
      sileo.success({ title: "Aprobado", description: res.data || "El postulante ahora es alumno." });
      recargarPostulantes();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || "Error interno de base de datos";
      customSwal.fire("No se pudo aprobar", errorMsg, "error");
    } finally {
      setAprobandoId(null);
    }
  };

  const registrarAlumnoManual = async () => {
    setRegistrando(true);
    try {
      const res = await axios.post('http://localhost:8080/api/v1/alumnos/registro-manual', formManual, { headers: getHeaders() });
      setRegistroExitoso(res.data);
    } catch (error) {
      customSwal.fire("Error al registrar", error.response?.data?.message || "Datos duplicados o inválidos", "error");
    } finally {
      setRegistrando(false);
    }
  };

  const reiniciarWizard = () => {
    setFormManual({ dni: '', nombres: '', apellidos: '', correo: '', carreraId: '' });
    setRegistroExitoso(null);
    setPaso(1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-black text-slate-800">Matrículas y Admisión Interna</h2>
        <p className="text-slate-500 text-sm">Gestiona las solicitudes web o registra alumnos manualmente.</p>
      </div>

      {/* SOLICITUDES WEB PENDIENTES */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-8 p-6">
        <h3 className="font-bold text-slate-800 text-lg mb-6 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Globe className="text-teal-500"/> Solicitudes Web Pendientes
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-3 px-4">DNI</th>
                <th className="py-3 px-4">Postulante</th>
                <th className="py-3 px-4">Programa</th>
                <th className="py-3 px-4">Turno</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {cargandoPostulantes ? <tr><td colSpan="5" className="text-center py-8 text-slate-400">Cargando postulantes...</td></tr> : 
                postulantes.length === 0 ? <tr><td colSpan="5" className="text-center py-8 text-slate-400">No hay solicitudes web pendientes.</td></tr> :
                postulantes.map(p => (
                  <tr key={p.idPostulante} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-700">{p.dni}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{p.nombres} {p.apellidos}</p>
                      <p className="text-xs text-slate-500">{p.correo}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{p.nombreCarrera}</td>
                    <td className="py-3 px-4 text-slate-600">{p.sede} - {p.turno}</td>
                    <td className="py-3 px-4 text-right">
                      <button 
                        onClick={() => aprobarPostulante(p.idPostulante)} 
                        disabled={aprobandoId === p.idPostulante}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl transition-colors text-xs flex items-center gap-2 ml-auto disabled:opacity-70"
                      >
                        {aprobandoId === p.idPostulante ? <i className="fa-solid fa-spinner fa-spin"></i> : <CheckCircle2 size={14}/>} Aprobar
                      </button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* WIZARD REGISTRO MANUAL */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden p-6 md:p-8">
        <h3 className="font-bold text-slate-800 text-lg mb-8 border-b border-slate-100 pb-3 flex items-center gap-2">
          <UserPlus className="text-teal-500"/> Registro Manual
        </h3>

        {!registroExitoso ? (
          <div className="max-w-3xl mx-auto">
            {/* Indicadores de Paso */}
            <div className="flex items-center justify-between mb-12 relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 -z-10"></div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-teal-500 -z-10 transition-all duration-500" style={{ width: paso === 1 ? '0%' : paso === 2 ? '50%' : '100%' }}></div>
              
              {[1, 2, 3].map(num => (
                <div key={num} className="flex flex-col items-center gap-2 bg-white px-2">
                  <div className={`w-10 h-10 rounded-full flex justify-center items-center font-bold text-sm transition-all duration-300 ${paso >= num ? 'bg-teal-500 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                    {paso > num ? <CheckCircle2 size={20}/> : num}
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${paso >= num ? 'text-teal-600' : 'text-slate-400'}`}>
                    {num === 1 ? 'Datos' : num === 2 ? 'Programa' : 'Confirmar'}
                  </span>
                </div>
              ))}
            </div>

            {/* Paso 1: Datos Personales */}
            {paso === 1 && (
              <div className="space-y-4 animate-in slide-in-from-right-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">DNI</label>
                    <input type="text" maxLength="8" required value={formManual.dni} onChange={e=>setFormManual({...formManual, dni: e.target.value})} className="w-full p-3 rounded-xl border border-slate-300 focus:ring-teal-500 outline-none text-sm bg-white"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Correo Electrónico</label>
                    <input type="email" required value={formManual.correo} onChange={e=>setFormManual({...formManual, correo: e.target.value})} className="w-full p-3 rounded-xl border border-slate-300 focus:ring-teal-500 outline-none text-sm bg-white"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombres</label>
                    <input type="text" required value={formManual.nombres} onChange={e=>setFormManual({...formManual, nombres: e.target.value})} className="w-full p-3 rounded-xl border border-slate-300 focus:ring-teal-500 outline-none text-sm bg-white"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Apellidos</label>
                    <input type="text" required value={formManual.apellidos} onChange={e=>setFormManual({...formManual, apellidos: e.target.value})} className="w-full p-3 rounded-xl border border-slate-300 focus:ring-teal-500 outline-none text-sm bg-white"/>
                  </div>
                </div>
                <div className="text-right pt-6">
                  <button onClick={() => setPaso(2)} disabled={!formManual.dni || !formManual.nombres || !formManual.apellidos || !formManual.correo} className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-6 py-3 rounded-xl transition-colors disabled:opacity-50 inline-flex items-center gap-2">
                    Siguiente Paso <ArrowRight size={18}/>
                  </button>
                </div>
              </div>
            )}

            {/* Paso 2: Programa */}
            {paso === 2 && (
              <div className="space-y-4 animate-in slide-in-from-right-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Programa / Carrera</label>
                  <select required value={formManual.carreraId} onChange={e=>setFormManual({...formManual, carreraId: e.target.value})} className="w-full p-3 rounded-xl border border-slate-300 focus:ring-teal-500 outline-none text-sm bg-white font-semibold">
                    <option value="" disabled>Seleccione un programa...</option>
                    {carreras.map(c => <option key={c.idCarrera} value={c.idCarrera}>{c.nombre}</option>)}
                  </select>
                </div>
                <div className="flex justify-between pt-6">
                  <button onClick={() => setPaso(1)} className="border border-slate-300 text-slate-600 hover:bg-slate-50 font-bold px-6 py-3 rounded-xl transition-colors inline-flex items-center gap-2">
                    <ArrowLeft size={18}/> Volver
                  </button>
                  <button onClick={() => setPaso(3)} disabled={!formManual.carreraId} className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-6 py-3 rounded-xl transition-colors disabled:opacity-50 inline-flex items-center gap-2">
                    Siguiente Paso <ArrowRight size={18}/>
                  </button>
                </div>
              </div>
            )}

            {/* Paso 3: Confirmación */}
            {paso === 3 && (
              <div className="space-y-4 animate-in slide-in-from-right-4 text-center">
                <p className="text-slate-500 mb-6">Al confirmar, se generará el usuario, contraseña y la cuota inicial (S/ 150.00) automáticamente en el sistema.</p>
                <div className="flex justify-between pt-6 border-t border-slate-100">
                  <button onClick={() => setPaso(2)} disabled={registrando} className="border border-slate-300 text-slate-600 hover:bg-slate-50 font-bold px-6 py-3 rounded-xl transition-colors inline-flex items-center gap-2">
                    <ArrowLeft size={18}/> Volver
                  </button>
                  <button onClick={registrarAlumnoManual} disabled={registrando} className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-6 py-3 rounded-xl transition-colors disabled:opacity-50 inline-flex items-center gap-2">
                    {registrando ? <i className="fa-solid fa-spinner fa-spin"></i> : <CheckCircle2 size={18}/>} Registrar Alumno
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* PANTALLA DE ÉXITO */
          <div className="text-center py-6 animate-in zoom-in-95">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex justify-center items-center text-4xl mx-auto mb-6 shadow-sm">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-2xl font-black text-emerald-600 mb-6">¡Alumno Registrado Exitosamente!</h3>
            
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl text-left max-w-md mx-auto mb-8 shadow-inner">
              <p className="font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Datos de Acceso a la Intranet:</p>
              <p className="mb-2 text-sm"><strong className="text-slate-500">Usuario / Correo:</strong> <span className="text-sky-600 font-bold ml-2 select-all">{registroExitoso.usuario.email}</span></p>
              <p className="text-sm"><strong className="text-slate-500">Contraseña:</strong> <span className="text-sky-600 font-bold ml-2 select-all">{registroExitoso.usuario.dni}</span></p>
            </div>
            
            <p className="text-slate-500 text-xs mb-8">La primera cuota de matrícula (S/ 150.00) se ha generado automáticamente en estado PENDIENTE.</p>
            <button onClick={reiniciarWizard} className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-8 py-3.5 rounded-xl transition-colors w-full max-w-md">
              Finalizar y Nuevo Registro
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatriculasAdmision;