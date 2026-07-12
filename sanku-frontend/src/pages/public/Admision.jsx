import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { GraduationCap, CheckCircle2, FileSignature, ArrowRight, ArrowLeft } from 'lucide-react';
import { API_BASE } from '../../utils/api';

export const Admision = () => {
  const [paso, setPaso] = useState(1);
  const [carreras, setCarreras] = useState([]);
  const [cursosCortos, setCursosCortos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);
  
  const [formData, setFormData] = useState({ dni: '', correo: '', nombres: '', apellidos: '', sedeTurno: 'Ica - Mañana', carreraIdSeleccionada: null });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE}/carreras`);
        if (response.ok) {
          const data = await response.json();
          setCarreras(data.filter(c => c.tipo === 'CARRERA' && c.estado === true));
          setCursosCortos(data.filter(c => c.tipo === 'CURSO_CORTO' && c.estado === true));
        }
      } catch (error) {
        console.error("Error cargando:", error);
      } finally {
        setCargando(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const seleccionarCarrera = (id) => setFormData({ ...formData, carreraIdSeleccionada: id });

  const irAPaso = (nuevoPaso) => {
    if (nuevoPaso === 2) {
      if(!formData.dni || !formData.correo || !formData.nombres || !formData.apellidos) {
        return alert("Por favor, completa todos tus datos personales obligatorios antes de continuar.");
      }
    }
    if (nuevoPaso === 3 && !formData.carreraIdSeleccionada) {
      return alert("Por favor, selecciona un programa de estudios o curso corto antes de continuar.");
    }
    setPaso(nuevoPaso);
  };

  const procesarPago = async () => {
    if(!formData.dni || !formData.correo || !formData.nombres || !formData.apellidos || !formData.carreraIdSeleccionada) {
      return alert("Faltan datos requeridos.");
    }
    setEnviando(true);
    const partesSede = formData.sedeTurno.split(' - '); 
    const payload = {
      dni: formData.dni, nombres: formData.nombres, apellidos: formData.apellidos, correo: formData.correo,
      carreraId: formData.carreraIdSeleccionada, sede: partesSede[0] || "Ica", turno: partesSede[1] || "Mañana"
    };

    try {
      const response = await fetch(`${API_BASE}/postulantes`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      if (response.ok) {
        setExito(true);
      } else {
        const errorData = await response.json();
        alert("Error: " + (errorData.error || "Datos inválidos o el DNI ya está registrado."));
      }
    } catch {
      alert("Error de conexión con el servidor.");
    } finally {
      setEnviando(false);
    }
  };

  const circleClass = (num) => `w-10 h-10 rounded-full flex justify-center items-center font-bold transition-all duration-300 ${paso >= num ? 'bg-white text-black' : 'bg-white/10 text-white/50'}`;

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#0c0c0c] text-white py-24">
      <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-b from-[#0c0c0c] via-[#0c0c0c]/90 to-[#0c0c0c]"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: -20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false }} className="text-center mb-16">
          <h2 className="text-5xl font-semibold tracking-tight text-white mb-4">Postula y Matricúlate Hoy</h2>
          <p className="text-white/50 text-lg">Inicia tu futuro profesional en 3 simples pasos sin salir de casa.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: false }} className="liquid-glass rounded-3xl p-8 md:p-12 border border-white/5 shadow-2xl">
          {!exito ? (
            <>
              {/* Stepper Moderno */}
              <div className="flex justify-between items-center mb-12 relative">
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 -z-10 -translate-y-1/2"></div>
                {[1, 2, 3].map(num => (
                  <div key={num} className="flex flex-col items-center gap-2 bg-[#0c0c0c] px-4">
                    <div className={circleClass(num)}>{paso > num ? <CheckCircle2 className="w-5 h-5" /> : num}</div>
                    <span className={`text-xs font-semibold uppercase tracking-wider hidden sm:block ${paso >= num ? 'text-white' : 'text-white/50'}`}>
                      {num === 1 ? 'Tus Datos' : num === 2 ? 'Programa' : 'Confirmación'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Contenido Paso 1 */}
              {paso === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h3 className="mb-8 text-xl font-bold text-[#00d2ff]">1. Información Personal</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {['dni', 'correo', 'nombres', 'apellidos'].map(field => (
                      <div key={field}>
                        <label className="block text-xs font-semibold mb-2 text-white/50 uppercase tracking-wider">{field}</label>
                        <input 
                          type={field === 'correo' ? 'email' : 'text'} name={field} value={formData[field]} onChange={handleChange} 
                          className="w-full p-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-[#00d2ff] text-white transition-colors" 
                          maxLength={field === 'dni' ? 8 : undefined} required 
                        />
                      </div>
                    ))}
                  </div>
                  <div className="text-right mt-10">
                    <button onClick={() => irAPaso(2)} className="bg-white text-black font-bold px-8 py-3 rounded-full hover:bg-white/90 transition-all flex items-center gap-2 ml-auto">Continuar <ArrowRight className="w-4 h-4" /></button>
                  </div>
                </motion.div>
              )}

              {/* Contenido Paso 2 */}
              {paso === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h3 className="mb-8 text-xl font-bold text-[#00d2ff]">2. Selecciona tu Programa</h3>
                  {cargando ? <p className="text-white/50">Cargando programas...</p> : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      
                      {/* --- Programas de Estudio --- */}
                      {carreras.length > 0 && <h4 className="col-span-full text-white/70 border-b border-white/10 pb-2 mt-2 font-bold uppercase tracking-wider text-xs">Programas de Estudio</h4>}
                      {carreras.map(c => (
                        <div key={c.idCarrera} onClick={() => seleccionarCarrera(c.idCarrera)} className={`border rounded-2xl p-6 text-center cursor-pointer transition-all ${formData.carreraIdSeleccionada === c.idCarrera ? 'border-[#00d2ff] bg-[#00d2ff]/10 shadow-[0_0_15px_rgba(0,210,255,0.2)]' : 'border-white/10 bg-white/5 hover:border-white/30'}`}>
                          <GraduationCap className={`w-8 h-8 mx-auto mb-4 ${formData.carreraIdSeleccionada === c.idCarrera ? 'text-[#00d2ff]' : 'text-white/50'}`} />
                          <h4 className="text-sm font-semibold text-white">{c.nombre}</h4>
                        </div>
                      ))}

                      {/* --- Cursos Cortos (AQUÍ SE USA LA VARIABLE QUE FALTABA) --- */}
                      {cursosCortos.length > 0 && <h4 className="col-span-full text-white/70 border-b border-white/10 pb-2 mt-4 font-bold uppercase tracking-wider text-xs">Cursos Cortos</h4>}
                      {cursosCortos.map(c => (
                        <div key={c.idCarrera} onClick={() => seleccionarCarrera(c.idCarrera)} className={`border rounded-2xl p-6 text-center cursor-pointer transition-all ${formData.carreraIdSeleccionada === c.idCarrera ? 'border-[#00d2ff] bg-[#00d2ff]/10 shadow-[0_0_15px_rgba(0,210,255,0.2)]' : 'border-white/10 bg-white/5 hover:border-white/30'}`}>
                          <i className={`fa-solid fa-certificate text-3xl mx-auto mb-4 block ${formData.carreraIdSeleccionada === c.idCarrera ? 'text-[#00d2ff]' : 'text-white/50'}`}></i>
                          <h4 className="text-sm font-semibold text-white">{c.nombre}</h4>
                        </div>
                      ))}

                    </div>
                  )}
                  <div className="mt-10">
                    <label className="block text-xs font-semibold mb-2 text-white/50 uppercase tracking-wider">Sede y Turno</label>
                    <select name="sedeTurno" value={formData.sedeTurno} onChange={handleChange} className="w-full p-4 bg-[#1a1a1a] border border-white/10 rounded-xl outline-none focus:border-[#00d2ff] text-white transition-colors">
                      <option value="Ica - Mañana">Sede Ica - Turno Mañana</option>
                      <option value="Ica - Noche">Sede Ica - Turno Noche</option>
                    </select>
                  </div>
                  <div className="flex justify-between mt-10">
                    <button onClick={() => irAPaso(1)} className="px-6 py-3 rounded-full border border-white/20 text-white/70 hover:bg-white/5 flex items-center gap-2"><ArrowLeft className="w-4 h-4"/> Volver</button>
                    <button onClick={() => irAPaso(3)} className="bg-white text-black font-bold px-8 py-3 rounded-full hover:bg-white/90 transition-all flex items-center gap-2">Continuar <ArrowRight className="w-4 h-4" /></button>
                  </div>
                </motion.div>
              )}

              {/* Contenido Paso 3 */}
              {paso === 3 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h3 className="mb-6 text-xl font-bold text-[#00d2ff]">3. Confirmar y Enviar</h3>
                  <div className="bg-white/5 p-8 rounded-2xl border border-white/10 mb-10">
                    <h4 className="text-white font-bold mb-4">Información Importante</h4>
                    <ul className="text-white/60 leading-relaxed pl-5 list-disc space-y-2 text-sm">
                      <li>Tus datos pasarán a evaluación por el Coordinador.</li>
                      <li><strong className="text-white">No requieres realizar ningún pago en este momento.</strong></li>
                      <li>Una vez aprobada, recibirás tus credenciales por correo electrónico.</li>
                      <li>El pago por Derecho de Matrícula lo realizarás desde tu nueva Intranet.</li>
                    </ul>
                  </div>
                  <div className="flex justify-between">
                    <button onClick={() => irAPaso(2)} disabled={enviando} className="px-6 py-3 rounded-full border border-white/20 text-white/70 hover:bg-white/5 flex items-center gap-2 disabled:opacity-50"><ArrowLeft className="w-4 h-4"/> Volver</button>
                    <button onClick={procesarPago} disabled={enviando} className="bg-[#00d2ff] text-black font-bold px-8 py-3 rounded-full hover:bg-[#00b8e6] transition-all disabled:opacity-50 flex items-center gap-2">
                      {enviando ? <><i className="fa-solid fa-spinner fa-spin"></i> Procesando...</> : <><CheckCircle2 className="w-5 h-5"/> Enviar Postulación</>}
                    </button>
                  </div>
                </motion.div>
              )}
            </>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
              <div className="w-24 h-24 bg-green-500/20 border border-green-500 text-green-500 rounded-full flex justify-center items-center mx-auto mb-8">
                <FileSignature className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">¡Solicitud Recibida!</h2>
              <p className="text-white/60 mb-10 leading-relaxed max-w-md mx-auto">
                Tu postulación se encuentra en estado <strong>EN REVISIÓN</strong>. Nuestro equipo académico evaluará tus datos y te enviaremos tus credenciales al correo registrado.
              </p>
              <Link to="/" className="bg-white text-black font-bold px-8 py-4 rounded-full inline-block hover:bg-white/90 transition-all">Volver al Inicio</Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </main>
  );
};