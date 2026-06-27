import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Mail, CreditCard, Calendar, BookOpen, ShieldCheck, User, Lock, KeyRound, ArrowRight, X, CheckCircle2 } from 'lucide-react';
import { sileo } from 'sileo';

const PerfilEstudiante = () => {
  const [alumno, setAlumno] = useState({});
  const [cargando, setCargando] = useState(true);

  const [modalPassAbierto, setModalPassAbierto] = useState(false);
  const [pasoPass, setPasoPass] = useState(1);
  const [procesandoPass, setProcesandoPass] = useState(false);
  
  const [codigoIngresado, setCodigoIngresado] = useState('');
  const [nuevaPass, setNuevaPass] = useState('');
  const [confirmaPass, setConfirmaPass] = useState('');

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

  const abrirModalPassword = () => {
    setPasoPass(1);
    setCodigoIngresado('');
    setNuevaPass('');
    setConfirmaPass('');
    setModalPassAbierto(true);
  };

  const solicitarCodigoCorreo = async () => {
    setProcesandoPass(true);
    try {
      await axios.post(`http://localhost:8080/api/v1/usuarios/${alumno.usuario.idUsuario}/enviar-codigo`, {}, { headers: getHeaders() });
      sileo.success({ title: "Código Enviado", description: "Revisa tu bandeja de entrada o spam." });
      setPasoPass(2);
    } catch {
      sileo.error({ title: "Error", description: "No se pudo enviar el código al correo." });
    } finally {
      setProcesandoPass(false);
    }
  };

  const verificarCodigo = async () => {
    if (!codigoIngresado || codigoIngresado.length !== 6) {
      sileo.error({ title: "Inválido", description: "El código debe tener exactamente 6 dígitos." });
      return;
    }
    setProcesandoPass(true);
    try {
      await axios.post(`http://localhost:8080/api/v1/usuarios/${alumno.usuario.idUsuario}/verificar-codigo`, { codigo: codigoIngresado }, { headers: getHeaders() });
      setPasoPass(3);
    } catch {
      sileo.error({ title: "Código Incorrecto", description: "El código ingresado no es válido o ya expiró." });
    } finally {
      setProcesandoPass(false);
    }
  };

  const actualizarPassword = async () => {
    if (nuevaPass.length < 6) {
      sileo.error({ title: "Contraseña Débil", description: "La contraseña debe tener al menos 6 caracteres." });
      return;
    }
    if (nuevaPass !== confirmaPass) {
      sileo.error({ title: "No coinciden", description: "Las contraseñas ingresadas no son iguales." });
      return;
    }
    setProcesandoPass(true);
    try {
      await axios.put(`http://localhost:8080/api/v1/usuarios/${alumno.usuario.idUsuario}/password`, 
        { nuevaPassword: nuevaPass }, 
        { headers: getHeaders() }
      );
      sileo.success({ title: "Actualizado", description: "Tu contraseña ha sido cambiada con éxito." });
      setModalPassAbierto(false);
    } catch {
      sileo.error({ title: "Error", description: "Hubo un problema actualizando la contraseña." });
    } finally {
      setProcesandoPass(false);
    }
  };

  if (cargando) return <div className="p-10 text-center text-slate-500 animate-pulse">Cargando perfil...</div>;

  const fechaIngresoVisual = alumno.fechaIngreso ? new Date(alumno.fechaIngreso + "T00:00:00").toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : '---';

  const enmascararCorreo = (email) => {
    if (!email) return '';
    const [nombre, dominio] = email.split('@');
    if (!dominio) return email;
    return `${nombre.substring(0, 3)}***@${dominio}`;
  };

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Mi Perfil</h2>
          <p className="text-slate-500 text-sm">Información personal y estado académico.</p>
        </div>
        <button onClick={abrirModalPassword} className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold px-5 py-2.5 rounded-xl shadow-sm flex items-center gap-2 transition-colors">
          <Lock size={16} className="text-slate-400"/> Cambiar Contraseña
        </button>
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

      {modalPassAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-black text-lg text-slate-800 flex items-center gap-2"><KeyRound className="text-blue-600" size={20}/> Seguridad de Cuenta</h3>
              <button onClick={() => setModalPassAbierto(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-lg shadow-sm"><X size={20}/></button>
            </div>
            
            <div className="p-6">
              {pasoPass === 1 && (
                <div className="text-center animate-in slide-in-from-right-2">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail size={32} strokeWidth={1.5}/>
                  </div>
                  <h4 className="font-bold text-slate-800 text-lg mb-2">Validación de Identidad</h4>
                  <p className="text-slate-500 text-sm mb-6">
                    Para cambiar tu contraseña, enviaremos un código de seguridad de 6 dígitos al correo electrónico: <br/>
                    <strong className="text-slate-800">{enmascararCorreo(alumno.usuario?.email)}</strong>
                  </p>
                  <button onClick={solicitarCodigoCorreo} disabled={procesandoPass} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-md disabled:opacity-70 flex justify-center items-center gap-2">
                    {procesandoPass ? <i className="fa-solid fa-spinner fa-spin"></i> : <>Enviar Código <ArrowRight size={18}/></>}
                  </button>
                </div>
              )}

              {pasoPass === 2 && (
                <div className="text-center animate-in slide-in-from-right-2">
                  <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck size={32} strokeWidth={1.5}/>
                  </div>
                  <h4 className="font-bold text-slate-800 text-lg mb-2">Ingresa el Código</h4>
                  <p className="text-slate-500 text-sm mb-6">Hemos enviado un código de 6 dígitos a tu correo. Ingrésalo a continuación para continuar.</p>
                  <input 
                    type="text" 
                    maxLength="6"
                    value={codigoIngresado}
                    onChange={(e) => setCodigoIngresado(e.target.value)}
                    placeholder="000000"
                    className="w-full text-center tracking-[0.5em] font-black text-2xl p-4 rounded-xl border border-slate-300 focus:ring-blue-500 outline-none bg-slate-50 text-slate-800 mb-6"
                  />
                  <button onClick={verificarCodigo} disabled={procesandoPass || codigoIngresado.length < 6} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-md disabled:opacity-70 flex justify-center items-center gap-2">
                    {procesandoPass ? <i className="fa-solid fa-spinner fa-spin"></i> : <>Verificar Código <CheckCircle2 size={18}/></>}
                  </button>
                  <button onClick={() => setPasoPass(1)} className="mt-4 text-xs font-bold text-slate-400 hover:text-slate-600">Volver a enviar correo</button>
                </div>
              )}

              {pasoPass === 3 && (
                <div className="animate-in slide-in-from-right-2">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock size={32} strokeWidth={1.5}/>
                  </div>
                  <h4 className="font-bold text-slate-800 text-lg mb-2 text-center">Nueva Contraseña</h4>
                  <p className="text-slate-500 text-sm mb-6 text-center">Crea una contraseña segura que no hayas usado antes en este sitio.</p>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nueva Contraseña</label>
                      <input 
                        type="password" 
                        value={nuevaPass}
                        onChange={(e) => setNuevaPass(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full p-3 rounded-xl border border-slate-300 focus:ring-blue-500 outline-none text-sm bg-white text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Confirmar Contraseña</label>
                      <input 
                        type="password" 
                        value={confirmaPass}
                        onChange={(e) => setConfirmaPass(e.target.value)}
                        placeholder="Vuelve a escribir la contraseña"
                        className="w-full p-3 rounded-xl border border-slate-300 focus:ring-blue-500 outline-none text-sm bg-white text-slate-800"
                      />
                    </div>
                  </div>

                  <button onClick={actualizarPassword} disabled={procesandoPass || !nuevaPass || !confirmaPass} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-md disabled:opacity-70 flex justify-center items-center gap-2">
                    {procesandoPass ? <i className="fa-solid fa-spinner fa-spin"></i> : <>Actualizar Contraseña <CheckCircle2 size={18}/></>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PerfilEstudiante;