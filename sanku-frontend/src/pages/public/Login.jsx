import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { API_BASE } from '../../utils/api';
import logoSanku from '../../assets/Jhalabet.png';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password })
      });

      if (response.ok) {
        const data = await response.json();
        
        localStorage.setItem("sesionActiva", "true");
        localStorage.setItem("token", data.token);
        localStorage.setItem("usuarioRol", data.rol.toUpperCase());
        localStorage.setItem("usuarioNombre", data.nombre);
        localStorage.setItem("usuarioId", data.usuarioId);

        const rolStr = data.rol.toUpperCase();
        
        // CORRECCIÓN: Rutas actualizadas para que coincidan con App.jsx
        if (rolStr === "ALUMNO") navigate("/estudiante"); 
        else if (rolStr === "DOCENTE") navigate("/docente");
        else if (rolStr === "ADMINISTRADOR") navigate("/admin");
        else if (rolStr === "COORDINADOR") navigate("/coordinador");
        else setErrorMsg("Rol no reconocido por el sistema.");
        
      } else {
        setErrorMsg("Credenciales incorrectas o usuario inactivo.");
      }
    } catch (error) {
      console.error("Error en la petición:", error);
      setErrorMsg("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex bg-[#0c0c0c] text-white overflow-hidden">
      
      {/* Lado Izquierdo (Imagen a pantalla completa) */}
      <div className="hidden md:block md:w-1/2 relative bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80')" }}>
        {/* Degradado para fusionar sutilmente la imagen con el lado derecho */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c0c0c]/10 via-[#0c0c0c]/40 to-[#0c0c0c]"></div>
        {/* Un aura azul sutil en la imagen */}
        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-[#00d2ff] rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
      </div>

      {/* Lado Derecho (Formulario) */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 relative bg-[#0c0c0c]">
         
        {/* Brillo ambiental detrás del cuadro */}
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute -top-[20%] -right-[20%] w-[60%] h-[60%] bg-[#00d2ff] rounded-full blur-[150px] opacity-10"></div>
        </div>

        {/* Cuadro del Formulario (Animado y con Liquid Glass) */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[440px] liquid-glass p-8 md:p-10 rounded-[2rem] border border-white/10 shadow-2xl bg-[#111111]/80 backdrop-blur-xl relative z-10"
        >
          <div className="text-center mb-10">
            {/* Logo invertido a blanco */}
            <img src={logoSanku} alt="Logo Instituto SANKU" className="max-w-[200px] w-full h-auto mx-auto block mb-6 filter invert brightness-0 opacity-90" />
            <h2 className="font-semibold text-xl tracking-wide text-white">INTRANET <span className="text-[#00d2ff]">SANKU</span></h2>
            <p className="text-white/50 text-sm mt-2">Acceso para Estudiantes y Docentes</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <label className="block text-xs font-semibold mb-2 text-white/50 uppercase tracking-wider ml-1">Usuario / DNI</label>
              <input 
                type="text" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingresa tu correo o DNI" 
                required 
                autoComplete="off"
                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-[#00d2ff] text-white transition-colors placeholder:text-white/20"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 px-1">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Contraseña</label>
                <a href="#" className="text-[#00d2ff] text-xs font-medium no-underline hover:text-white transition-colors">¿Olvidaste tu clave?</a>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  required 
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-[#00d2ff] text-white transition-colors placeholder:text-white/20 font-mono tracking-widest"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            {errorMsg && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 text-red-400 p-4 rounded-xl text-sm text-center border border-red-500/20 font-medium">
                {errorMsg}
              </motion.div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-white text-black font-bold tracking-wide py-4 rounded-full mt-2 hover:bg-gray-200 transition-all disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> CONECTANDO...</> : "INICIAR SESIÓN"}
            </button>
          </form>
          
          <div className="mt-8 text-center pt-8 border-t border-white/10">
            <Link to="/" className="inline-flex items-center justify-center gap-2 text-white/50 font-medium text-sm hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> Volver al portal público
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
};