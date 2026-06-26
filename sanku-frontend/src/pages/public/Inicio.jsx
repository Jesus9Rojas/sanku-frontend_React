import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lightbulb, Presentation, Trophy, Clock, Phone, Mail } from 'lucide-react';

export const Inicio = () => {
  const gradientStyle = {
    backgroundImage: 'linear-gradient(to right, #091020 0%, #0B2551 12.5%, #A4F4FD 32.5%, #00d2ff 50%, #0B2551 67.5%, #091020 87.5%, #091020 100%)',
    backgroundSize: '200% auto',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    WebkitTextFillColor: 'transparent',
    filter: 'url(#c3-noise)'
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#0c0c0c] text-white">
      
      {/* FONDO GLOBAL: Imagen más clara para que resalte */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 bg-center bg-cover bg-no-repeat opacity-100" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c0c0c]/20 via-[#0c0c0c]/60 to-[#0c0c0c]"></div>
      </div>

      {/* Filtro SVG */}
      <svg className="hidden">
        <filter id="c3-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0" />
          <feComposite in2="SourceGraphic" operator="in" result="noise" />
          <feBlend in="SourceGraphic" in2="noise" mode="multiply" />
        </filter>
      </svg>

      <div className="relative z-10">
        
        {/* SECCIÓN 1: HERO / TÍTULO */}
        <section className="pt-24 md:pt-36 pb-20 text-center flex flex-col items-center px-6">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-8xl font-semibold tracking-tight leading-[0.9]"
          >
            <span className="block text-white mb-2">Tu futuro.</span>
            <span className="block animate-shiny pb-4" style={gradientStyle}>Revitalizado</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="mt-8 text-white/80 max-w-lg text-base md:text-lg leading-[1.6]"
          >
            SankuInstituto es la plataforma educativa de la nueva era. Metodología práctica, docentes expertos y tecnología para refinar tus habilidades con total claridad.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="mt-10 flex flex-col sm:flex-row gap-4 items-center"
          >
            <Link to="/admision" className="group inline-flex items-center justify-center gap-2 rounded-full bg-white text-black font-medium text-sm px-6 py-3.5 transition-all hover:bg-white/90 active:scale-[0.98]">
              Postula y Matricúlate
            </Link>
            <Link to="/nosotros" className="text-sm text-white/50 hover:text-white transition-colors">
              Conoce nuestra propuesta →
            </Link>
          </motion.div>
        </section>

        {/* SECCIÓN 2: CUADROS DE BENEFICIOS */}
        <section className="py-20 max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false }}
            className="flex items-center gap-2 mb-10 justify-center"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span className="text-sm font-medium text-white/70 uppercase tracking-widest">Inicia tu camino al éxito</span>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Lightbulb, title: "Ideas de Negocios", desc: "Te impulsamos a alcanzar tus objetivos y el sueño de tu propia empresa." },
              { icon: Presentation, title: "Experiencia", desc: "Nuestros profesores trabajan en lo que enseñan diariamente." },
              { icon: Trophy, title: "Becas", desc: "Reconocemos y premiamos tu esfuerzo académico con incentivos." },
              { icon: Clock, title: "Horarios", desc: "Tenemos horarios flexibles que se ajustan a tu ritmo de vida." }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="liquid-glass rounded-2xl p-6 hover:bg-white/[0.03] transition-colors border border-white/5"
              >
                <item.icon className="w-8 h-8 text-[#00d2ff] mb-6 opacity-80" />
                <h3 className="text-lg font-semibold mb-3">{item.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SECCIÓN 3: MAPA Y CONTACTO */}
        <section className="py-20 max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="liquid-glass rounded-3xl overflow-hidden flex flex-col lg:flex-row shadow-2xl border border-white/5"
          >
            <div className="p-10 md:p-16 flex flex-col justify-center lg:w-1/2 relative z-10 bg-[#0c0c0c]/60 backdrop-blur-md">
              <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4">Conoce nuestras Oficinas</h2>
              <p className="text-white/50 text-lg mb-12">Calle Lima 434 - Ica</p>
              
              <div className="flex flex-col gap-8 w-full">
                <div className="flex items-center gap-5 text-white/70">
                  <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-[#00d2ff]" />
                  </div>
                  <div>
                    <p className="text-sm text-white/50 uppercase tracking-wider mb-1">Llámanos</p>
                    <p className="font-semibold text-white text-lg">956 636 678 / 056 639368</p>
                  </div>
                </div>
                <div className="flex items-center gap-5 text-white/70">
                  <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-[#00d2ff]" />
                  </div>
                  <div>
                    <p className="text-sm text-white/50 uppercase tracking-wider mb-1">Escríbenos</p>
                    <p className="font-semibold text-white text-lg">info@instituto.edu.pe</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 min-h-[400px] relative bg-white">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1847.669865675549!2d-75.7314234!3d-14.0628372!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTTCsDAzJzQ2LjIiUyA3NcKwNDMnNTMuMSJX!5e0!3m2!1ses!2spe!4v1620000000000!5m2!1ses!2spe" 
                className="absolute inset-0 w-full h-full border-0" 
                allowFullScreen="" 
                loading="lazy" 
                title="Mapa de ubicación"
              ></iframe>
            </div>
          </motion.div>
        </section>

      </div>
    </main>
  );
};