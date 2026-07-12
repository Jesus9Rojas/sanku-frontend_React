import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronDown, Menu } from 'lucide-react';
import { API_BASE } from '../utils/api';

export const Navbar = () => {
  const location = useLocation();
  const [programas, setProgramas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchProgramas = async () => {
      try {
        const response = await fetch(`${API_BASE}/carreras`);
        if (response.ok) {
          const data = await response.json();
          setProgramas(data.filter(c => c.tipo === 'CARRERA' && c.estado === true));
        }
      } catch (error) {
        console.error("Error cargando programas:", error);
      } finally {
        setCargando(false);
      }
    };
    fetchProgramas();
  }, []);

  const isActive = (path) => location.pathname === path ? 'text-white' : 'text-white/70 hover:text-white';

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex justify-between items-center w-full px-6 md:px-12 py-4 bg-[#0c0c0c]/40 backdrop-blur-md border-b border-white/10 sticky top-0 z-50"
    >
      <div className="flex items-center">
        <Link to="/">
          <img src="/src/assets/Jhalabet.png" alt="Logo SANKU" className="w-auto h-13 filter invert brightness-0" />
        </Link>
      </div>

      <div className="hidden md:flex items-center gap-8 h-full">
        <Link to="/" className={`text-sm font-medium transition-all ${isActive('/')}`}>Inicio</Link>
        <Link to="/nosotros" className={`text-sm font-medium transition-all ${isActive('/nosotros')}`}>Nosotros</Link>
        
        <div className="relative group flex items-center h-full cursor-pointer py-2">
          <span className="text-white/70 font-medium group-hover:text-white flex items-center text-sm transition-all">
            Programas <ChevronDown className="w-4 h-4 ml-1 opacity-70" />
          </span>
          <div className="hidden group-hover:block absolute top-full left-0 bg-[#161616] min-w-[250px] shadow-2xl rounded-xl border border-white/10 z-10 overflow-hidden backdrop-blur-xl">
            {cargando ? (
              <p className="p-4 text-white/50 text-xs">Cargando programas...</p>
            ) : programas.length > 0 ? (
              programas.map(prog => (
                <Link key={prog.idCarrera} to={`/programa/${prog.idCarrera}`} className="block px-5 py-3 text-sm text-white/70 border-b border-white/5 hover:bg-white/10 hover:text-white transition-colors">
                  {prog.nombre}
                </Link>
              ))
            ) : (
              <p className="p-4 text-white/50 text-xs">No hay programas disponibles</p>
            )}
          </div>
        </div>

        <Link to="/cursos" className={`text-sm font-medium transition-all ${isActive('/cursos')}`}>Cursos Cortos</Link>
        <Link to="/admision" className={`text-sm font-medium transition-all ${isActive('/admision')}`}>Admisión 2026</Link>
      </div>

      <div className="flex items-center gap-4">
        <Link to="/login" className="group inline-flex items-center justify-center gap-2 rounded-full bg-white text-black font-medium text-sm px-5 py-2.5 transition-all hover:bg-white/90 active:scale-[0.98]">
          Intranet
        </Link>
        <button className="md:hidden w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white">
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </motion.nav>
  );
};