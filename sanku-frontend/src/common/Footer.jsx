import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="relative z-10 bg-[#0c0c0c] border-t border-white/10 pt-20 pb-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-left mb-16">
          
          <div className="md:col-span-1">
            <img src="/src/assets/Jhalabet.png" alt="Logo SANKU" className="w-auto h-9.5 filter invert brightness-0 mb-2 opacity-80" />
            <p className="text-sm text-white/40 leading-relaxed">
              Formando profesionales técnicos competentes, integrales y emprendedores para la nueva era.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6 tracking-wide text-sm">NOTICIAS</h3>
            <ul className="flex flex-col gap-4">
              <li><Link to="#" className="text-white/50 text-sm hover:text-white transition-colors">Convenio con empresas</Link></li>
              <li><Link to="#" className="text-white/50 text-sm hover:text-white transition-colors">Feria Vocacional 2026</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6 tracking-wide text-sm">INFÓRMATE</h3>
            <ul className="flex flex-col gap-4">
              <li><Link to="/nosotros" className="text-white/50 text-sm hover:text-white transition-colors">¿Quiénes Somos?</Link></li>
              <li><Link to="/nosotros" className="text-white/50 text-sm hover:text-white transition-colors">Misión y Visión</Link></li>
              <li><Link to="/admision" className="text-white/50 text-sm hover:text-white transition-colors">Admisión en Línea</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6 tracking-wide text-sm">PROGRAMAS</h3>
            <ul className="flex flex-col gap-4">
              <li><Link to="/programa/1" className="text-white/50 text-sm hover:text-white transition-colors">Gestión Administrativa</Link></li>
              <li><Link to="/programa/3" className="text-white/50 text-sm hover:text-white transition-colors">Enfermería Técnica</Link></li>
            </ul>
          </div>

        </div>
        
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40">
          <span>© 2026 Instituto SANKU. Todos los derechos reservados.</span>
          <div className="flex gap-6">
            <Link to="#" className="hover:text-white transition-colors">Términos de servicio</Link>
            <Link to="#" className="hover:text-white transition-colors">Política de privacidad</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};