import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

// Subcomponente para manejar el estado de las pestañas individualmente por curso
const CursoCard = ({ curso }) => {
  const [activeTab, setActiveTab] = useState('contenido');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{ duration: 0.6 }}
      className="liquid-glass rounded-3xl overflow-hidden border border-white/5 shadow-xl flex flex-col md:flex-row mb-8"
    >
      <div className="p-8 md:p-12 md:w-1/3 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/10 bg-[#0c0c0c]/40 backdrop-blur-md">
        <h3 className="text-2xl font-bold mb-4 text-white">{curso.nombre}</h3>
        <p className="text-white/50 text-sm leading-relaxed mb-6">Especialízate rápidamente y adquiere habilidades prácticas de alta demanda en corto tiempo.</p>
        <i className="fa-solid fa-certificate text-6xl text-[#00d2ff] opacity-40 mt-auto"></i>
      </div>
      
      <div className="p-8 md:p-12 md:w-2/3 flex flex-col bg-[#111111]/80 backdrop-blur-xl">
        {/* Pestañas */}
        <div className="flex overflow-x-auto border-b border-white/10 mb-8 scrollbar-hide pb-2 gap-4">
          {['contenido', 'mercado', 'beneficios', 'requisitos'].map((tab) => (
            <button 
              key={tab} onClick={() => setActiveTab(tab)} 
              className={`px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-white text-black' : 'text-white/50 hover:bg-white/10'}`}
            >
              {tab === 'contenido' && 'Contenido'}
              {tab === 'mercado' && 'Mercado Laboral'}
              {tab === 'beneficios' && 'Beneficios'}
              {tab === 'requisitos' && 'Requisitos'}
            </button>
          ))}
        </div>

        {/* Contenido inyectado desde Backend */}
        <div className="text-white/70 leading-[1.8] text-sm">
          {activeTab === 'contenido' && (
            <div>
              <p className="mb-4">{curso.descripcion}</p>
              <div dangerouslySetInnerHTML={{ __html: curso.perfilAcademico || '' }} />
            </div>
          )}
          {activeTab === 'mercado' && <div dangerouslySetInnerHTML={{ __html: curso.mercadoLaboral || '<p>Amplio campo laboral.</p>' }} />}
          {activeTab === 'beneficios' && <div dangerouslySetInnerHTML={{ __html: curso.beneficios || '<p>Múltiples beneficios institucionales.</p>' }} />}
          {activeTab === 'requisitos' && <div dangerouslySetInnerHTML={{ __html: curso.requisitos || '<p>Consulta los requisitos con admisión.</p>' }} />}
        </div>
      </div>
    </motion.div>
  );
};

export const Cursos = () => {
  const [cursos, setCursos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/v1/carreras');
        if (response.ok) {
          const data = await response.json();
          setCursos(data.filter(c => c.tipo === 'CURSO_CORTO' && c.estado === true));
        }
      } catch (error) {
        console.error("Error cargando cursos:", error);
      } finally {
        setCargando(false);
      }
    };
    fetchCursos();
  }, []);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#0c0c0c] text-white">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-center bg-cover bg-no-repeat opacity-100" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80')" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c0c0c]/40 via-[#0c0c0c]/80 to-[#0c0c0c]"></div>
      </div>

      <div className="relative z-10">
        <header className="pt-32 pb-16 px-6 max-w-7xl mx-auto text-center md:text-left">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1]"
          >
            <span className="block text-[#00d2ff] mb-2">Cursos Cortos de</span>
            <span className="block text-white">Especialización</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-lg mt-6 max-w-2xl"
          >
            Mejora tu perfil laboral y adquiere habilidades prácticas de alta demanda en corto tiempo.
          </motion.p>
        </header>

        <section className="py-10 px-6 max-w-7xl mx-auto">
          {cargando ? (
            <h3 className="text-center text-white/50 py-20">Cargando cursos disponibles...</h3>
          ) : cursos.length > 0 ? (
            cursos.map(curso => <CursoCard key={curso.idCarrera} curso={curso} />)
          ) : (
            <h3 className="text-center text-white/50 py-20">No hay cursos disponibles por el momento.</h3>
          )}

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            className="mt-20 liquid-glass p-12 rounded-3xl flex flex-col md:flex-row justify-between items-center text-center md:text-left border border-white/5"
          >
            <div className="mb-6 md:mb-0">
              <h2 className="text-3xl font-bold mb-2">Da el Siguiente <span className="text-[#00d2ff]">Paso</span></h2>
              <p className="text-white/60">Mejora tu CV y especialízate rápidamente. ¡Consulta nuestras fechas!</p>
            </div>
            <Link to="/contactanos" className="bg-white text-black font-semibold px-8 py-4 rounded-full hover:bg-white/90 transition-all active:scale-95">Solicitar Información</Link>
          </motion.div>
        </section>
      </div>
    </main>
  );
};