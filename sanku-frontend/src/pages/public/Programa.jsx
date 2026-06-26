import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Download, GraduationCap } from 'lucide-react';

const disenoCarreras = {
  "ADMINISTRACION": { icono: "fa-chart-column", badgeText: "Negocios", badgeColor: "bg-[#e50914]", bgImage: "url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80')" },
  "FARMACIA": { icono: "fa-pills", badgeText: "Ciencias de la Salud", badgeColor: "bg-[#4d5ce7]", bgImage: "url('https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80')" },
  "ENFERMERIA": { icono: "fa-user-nurse", badgeText: "Ciencias de la Salud", badgeColor: "bg-[#9829e2]", bgImage: "url('https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80')" },
  "FISIOTERAPIA": { icono: "fa-person-walking-with-cane", badgeText: "Ciencias de la Salud", badgeColor: "bg-[#f3a227]", bgImage: "url('https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80')" },
  "CURSO_CORTO": { icono: "fa-certificate", badgeText: "Curso Corto", badgeColor: "bg-[#0056b3]", bgImage: "url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80')" },
  "DEFAULT": { icono: "fa-graduation-cap", badgeText: "Programa Técnico", badgeColor: "bg-[#0056b3]", bgImage: "url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80')" }
};

export const Programa = () => {
  const { id } = useParams();
  const [programa, setPrograma] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [activeTab, setActiveTab] = useState('perfil');
  const [diseno, setDiseno] = useState(disenoCarreras["DEFAULT"]);
  const [titulo1, setTitulo1] = useState("Cargando...");
  const [titulo2, setTitulo2] = useState("");

  useEffect(() => {
    const fetchPrograma = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/v1/carreras');
        if (response.ok) {
          const data = await response.json();
          const carreraActual = data.find(c => c.idCarrera == id);
          
          if (carreraActual && carreraActual.estado === true) {
            setPrograma(carreraActual);
            
            // --- LÓGICA INTELIGENTE DE MATCHEO A PRUEBA DE ERRORES ---
            const nombreNorm = carreraActual.nombre.toLowerCase();
            let d = disenoCarreras["DEFAULT"];
            
            if (nombreNorm.includes("admin")) d = disenoCarreras["ADMINISTRACION"];
            else if (nombreNorm.includes("farma")) d = disenoCarreras["FARMACIA"];
            else if (nombreNorm.includes("enfermer")) d = disenoCarreras["ENFERMERIA"];
            else if (nombreNorm.includes("fisio") || nombreNorm.includes("rehabilitaci")) d = disenoCarreras["FISIOTERAPIA"];
            else if (carreraActual.tipo === "CURSO_CORTO") d = disenoCarreras["CURSO_CORTO"];
            
            setDiseno(d);

            // Dividir el título para el diseño (primera palabra en cyan, resto en blanco)
            const palabras = carreraActual.nombre.trim().split(" ");
            setTitulo1(palabras.shift());
            setTitulo2(palabras.join(" "));
          }
        }
      } catch (error) {
        console.error("Error cargando el programa:", error);
      } finally {
        setCargando(false);
      }
    };
    fetchPrograma();
    window.scrollTo(0, 0);
  }, [id]);

  if (cargando) return <main className="bg-[#0c0c0c] text-white min-h-screen flex items-center justify-center"><p className="text-white/50">Cargando información del programa...</p></main>;

  if (!programa) return (
    <main className="bg-[#0c0c0c] text-white min-h-screen flex flex-col items-center justify-center p-10 text-center">
      <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex justify-center items-center mb-6"><i className="fa-solid fa-triangle-exclamation text-3xl"></i></div>
      <h2 className="text-3xl font-bold text-white mb-4">Programa no encontrado</h2>
      <p className="text-white/50 max-w-md mb-8">La carrera que buscas no existe o ha sido deshabilitada temporalmente por la coordinación académica.</p>
      <Link to="/" className="bg-white text-black font-bold px-8 py-3 rounded-full hover:bg-white/90 transition-all">Volver al Inicio</Link>
    </main>
  );

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#0c0c0c] text-white">
      
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div 
           className="absolute inset-0 bg-center bg-cover bg-no-repeat opacity-100 mix-blend-luminosity"
           style={{ backgroundImage: diseno.bgImage }} 
         />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c0c0c]/60 via-[#0c0c0c]/80 to-[#0c0c0c]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
         
        <motion.header 
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="mb-16 md:mb-20 text-center md:text-left"
        >
          <span className={`inline-block px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider mb-6 text-white shadow-lg ${diseno.badgeColor}`}>
            {diseno.badgeText}
          </span>
          <h2 className="font-semibold tracking-tight text-5xl md:text-7xl leading-[1.1] mb-6">
            <span className="block text-[#00d2ff]">{titulo1}</span>
            <span className="block text-white">{titulo2}</span>
          </h2>
          <p className="text-white/60 text-lg">Título a Nombre de la Nación | Duración: <strong className="text-white">3 Años (6 Ciclos)</strong></p>
        </motion.header>

        {/* AQUÍ SE APLICA EL items-stretch PARA EVITAR EL DESNIVEL */}
        <div className="flex flex-col lg:flex-row gap-10 items-stretch">
           
          <motion.aside 
             initial={{ opacity: 0, x: -20 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-1/3 liquid-glass p-8 md:p-12 rounded-3xl border border-white/5 bg-[#0c0c0c]/40 backdrop-blur-xl flex flex-col"
          >
            <h3 className="text-white text-xl md:text-2xl font-semibold mb-8 leading-relaxed" dangerouslySetInnerHTML={{ __html: programa.descripcion || "Información en actualización." }}></h3>
            
            <div className="flex justify-center my-12">
              <i className={`fa-solid ${diseno.icono} text-[100px] text-[#00d2ff] opacity-100 drop-shadow-[0_0_30px_rgba(0,210,255,0.3)]`}></i>
            </div>
            
            <div className="flex flex-col gap-4 mt-auto">
              <Link to="/admision" className="w-full bg-[#25D366] text-black font-bold p-4 rounded-full flex justify-center items-center hover:bg-[#20b858] hover:scale-[1.02] transition-all gap-2 shadow-[0_0_20px_rgba(37,211,102,0.3)]">
                <i className="fa-brands fa-whatsapp text-xl"></i> Matricularme Ahora
              </Link>
              <button className="w-full bg-white/5 border border-white/10 text-white font-semibold p-4 rounded-full flex justify-center items-center hover:bg-white/10 transition-colors gap-2">
                <Download className="w-5 h-5"/> Descargar Brochure
              </button>
            </div>
          </motion.aside>

          <motion.div 
             initial={{ opacity: 0, x: 20 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-2/3 liquid-glass p-8 md:p-12 rounded-3xl border border-white/5 bg-[#111111]/80 backdrop-blur-xl flex flex-col"
          >
            <div className="flex overflow-x-auto border-b border-white/10 mb-8 scrollbar-hide gap-2 pb-2">
              {['perfil', 'mercado', 'beneficios', 'requisitos'].map((tab) => (
                <button 
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`px-5 py-2.5 text-sm font-semibold rounded-full whitespace-nowrap transition-all ${activeTab === tab ? 'bg-white text-black' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}
                >
                  {tab === 'perfil' && 'Perfil Académico'}
                  {tab === 'mercado' && 'Mercado Laboral'}
                  {tab === 'beneficios' && 'Beneficios'}
                  {tab === 'requisitos' && 'Requisitos y Horarios'}
                </button>
              ))}
            </div>

            <div className="text-white/70 leading-[1.8] ql-editor-custom text-base flex-1">
              {activeTab === 'perfil' && <div dangerouslySetInnerHTML={{ __html: programa.perfilAcademico || "<p>Información en actualización.</p>" }} />}
              {activeTab === 'mercado' && <div dangerouslySetInnerHTML={{ __html: programa.mercadoLaboral || "<p>Información en actualización.</p>" }} />}
              {activeTab === 'beneficios' && <div dangerouslySetInnerHTML={{ __html: programa.beneficios || "<p>Información en actualización.</p>" }} />}
              {activeTab === 'requisitos' && <div dangerouslySetInnerHTML={{ __html: programa.requisitos || "<p>Información en actualización.</p>" }} />}
            </div>

            <div className="mt-auto pt-16">
              <div className="p-8 md:p-10 rounded-2xl border border-[#0056b3]/30 bg-gradient-to-br from-[#0056b3]/20 to-transparent flex flex-col md:flex-row justify-between items-center text-center md:text-left">
                <div className="mb-6 md:mb-0">
                  <h2 className="text-white text-2xl font-bold mb-2 flex items-center justify-center md:justify-start gap-3">
                    <GraduationCap className="text-[#00d2ff] w-8 h-8"/> Empieza tu carrera hoy
                  </h2>
                  <p className="text-[#A4F4FD] text-sm">Inscríbete ahora y transforma tu futuro profesional.</p>
                </div>
                <Link to="/contactanos" className="bg-white text-black font-bold px-8 py-3.5 rounded-full hover:bg-gray-200 transition-all whitespace-nowrap active:scale-[0.98]">
                  Infórmate
                </Link>
              </div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </main>
  );
};