import { motion } from 'motion/react';
import { Gem, Rocket, Handshake, Scale } from 'lucide-react';

export const Nosotros = () => {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#0c0c0c] text-white">
      
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-center bg-cover bg-no-repeat opacity-100" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80')" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c0c0c]/40 via-[#0c0c0c]/80 to-[#0c0c0c]"></div>
      </div>

      <div className="relative z-10">
        {/* HERO */}
        <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-8xl font-semibold tracking-tight leading-[1]"
          >
            <span className="block text-white">Somos</span>
            <span className="block text-[#00d2ff]">Innovación</span>
          </motion.h2>
        </section>

        {/* MISIÓN */}
        <section className="py-16 px-6 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.7 }}
            className="liquid-glass rounded-3xl overflow-hidden flex flex-col md:flex-row border border-white/5"
          >
            <div className="w-full md:w-1/2 bg-[url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80')] bg-cover bg-center min-h-[400px]"></div>
            <div className="w-full md:w-1/2 p-12 md:p-16 flex flex-col justify-center bg-[#0c0c0c]/50 backdrop-blur-md">
              <h3 className="text-[#00d2ff] text-3xl mb-6 font-semibold tracking-tight">Nuestra Misión</h3>
              <p className="text-white/70 leading-[1.8] text-base md:text-lg">
                Somos una Institución de Educación Superior que forma profesionales técnicos competentes, integrales y emprendedores. Brindamos una educación de excelencia basada en la innovación tecnológica, con sólidos valores éticos y vocación de servicio.
              </p>
            </div>
          </motion.div>
        </section>

        {/* VISIÓN */}
        <section className="py-16 px-6 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.7 }}
            className="liquid-glass rounded-3xl overflow-hidden flex flex-col md:flex-row-reverse border border-white/5"
          >
            <div className="w-full md:w-1/2 bg-[url('https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80')] bg-cover bg-center min-h-[400px]"></div>
            <div className="w-full md:w-1/2 p-12 md:p-16 flex flex-col justify-center bg-[#0c0c0c]/50 backdrop-blur-md">
              <h3 className="text-[#00d2ff] text-3xl mb-6 font-semibold tracking-tight">Nuestra Visión</h3>
              <p className="text-white/70 leading-[1.8] text-base md:text-lg">
                Al 2030, seremos reconocidos como el instituto líder en innovación y ciencias de la salud a nivel nacional. Nos proyectamos como el principal motor de transformación educativa, garantizando la inserción laboral exitosa de nuestros egresados.
              </p>
            </div>
          </motion.div>
        </section>

        {/* VALORES */}
        <section className="py-24 px-6 max-w-7xl mx-auto text-center">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false }}
            className="text-3xl md:text-5xl font-semibold tracking-tight mb-16"
          >
            Nuestros <span className="text-[#00d2ff]">Valores Institucionales</span>
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Gem, title: "Excelencia", desc: "Buscamos los más altos estándares de calidad académica en todo lo que hacemos." },
              { icon: Rocket, title: "Innovación", desc: "Fomentamos la creatividad y la adopción de nuevas tecnologías en el aula." },
              { icon: Handshake, title: "Compromiso Social", desc: "Formamos profesionales conscientes y dispuestos a servir a su comunidad." },
              { icon: Scale, title: "Integridad", desc: "Actuamos con honestidad, ética profesional y respeto mutuo." }
            ].map((val, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="liquid-glass rounded-2xl p-8 hover:bg-white/[0.05] transition-colors border border-white/5"
              >
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                  <val.icon className="w-8 h-8 text-[#00d2ff]" />
                </div>
                <h3 className="mb-4 text-xl font-bold">{val.title}</h3>
                <p className="text-white/50 leading-relaxed text-sm">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};