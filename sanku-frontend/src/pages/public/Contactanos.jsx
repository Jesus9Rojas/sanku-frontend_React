import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Phone, Mail, MapPin, Send } from 'lucide-react';
import { API_BASE } from '../../utils/api';

export const Contactanos = () => {
  const [programas, setProgramas] = useState([]);
  const [formData, setFormData] = useState({ nombreCompleto: '', correo: '', celular: '', programaInteres: '', mensaje: '' });
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const fetchProgramas = async () => {
      try {
        const response = await fetch(`${API_BASE}/carreras`);
        if (response.ok) {
          const data = await response.json();
          setProgramas(data.filter(c => c.estado === true));
        }
      } catch (error) {
        console.error("Error al cargar programas", error);
      }
    };
    fetchProgramas();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      const response = await fetch(`${API_BASE}/mensajes`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData)
      });
      if (response.ok) {
        alert("¡Gracias por comunicarte! Hemos recibido tu mensaje y te contactaremos pronto.");
        setFormData({ nombreCompleto: '', correo: '', celular: '', programaInteres: '', mensaje: '' });
      } else {
        alert("Hubo un problema al enviar tu mensaje. Verifica tus datos.");
      }
    } catch {
      alert("Error de conexión con el servidor.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#0c0c0c] text-white">
      
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-center bg-cover bg-no-repeat opacity-100" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80')" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c0c0c]/40 via-[#0c0c0c]/80 to-[#0c0c0c]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <span className="w-1.5 h-1.5 inline-block rounded-full bg-[#00d2ff] mr-2 mb-1" />
          <span className="text-sm font-medium text-white/70 uppercase tracking-widest">Atención al Estudiante</span>
          <h2 className="text-6xl md:text-8xl font-semibold tracking-tight leading-[1] mt-4 text-[#00d2ff]">Contáctanos</h2>
          <p className="mt-6 text-white/60 max-w-xl text-lg leading-[1.6]">Estamos aquí para resolver todas tus dudas sobre matrículas, programas y cursos.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="liquid-glass rounded-3xl overflow-hidden flex flex-col md:flex-row border border-white/5 shadow-2xl"
        >
          {/* Lado Informativo */}
          <div className="p-10 md:p-16 flex flex-col justify-center bg-[#0c0c0c]/50 backdrop-blur-md md:w-5/12">
            <h2 className="text-white text-2xl font-bold mb-10 leading-relaxed">¿Tienes alguna consulta o sugerencia?<br/>Estamos gustosos de atenderte.</h2>
            <div className="flex flex-col gap-6 text-white/70">
              <p className="flex items-center gap-4 text-base"><MapPin className="text-[#00d2ff] w-6 h-6 shrink-0" /> Ca. Lima 434, Ica 11001, Perú</p>
              <p className="flex items-center gap-4 text-base"><Phone className="text-[#00d2ff] w-6 h-6 shrink-0" /> 956 636 678 / 056 639368</p>
              <p className="flex items-center gap-4 text-base"><Mail className="text-[#00d2ff] w-6 h-6 shrink-0" /> info@instituto.edu.pe</p>
            </div>
          </div>

          {/* Formulario */}
          <div className="p-10 md:p-16 bg-[#111111]/80 backdrop-blur-xl md:w-7/12 border-l border-white/5">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-semibold mb-2 text-white/50 uppercase tracking-wider">Nombres y Apellidos</label>
                <input type="text" name="nombreCompleto" value={formData.nombreCompleto} onChange={handleChange} className="w-full p-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-[#00d2ff] text-white transition-colors" required />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2 text-white/50 uppercase tracking-wider">Correo electrónico</label>
                <input type="email" name="correo" value={formData.correo} onChange={handleChange} className="w-full p-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-[#00d2ff] text-white transition-colors" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold mb-2 text-white/50 uppercase tracking-wider">Celular</label>
                  <input type="tel" name="celular" value={formData.celular} onChange={handleChange} className="w-full p-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-[#00d2ff] text-white transition-colors" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2 text-white/50 uppercase tracking-wider">Programa</label>
                  <select name="programaInteres" value={formData.programaInteres} onChange={handleChange} className="w-full p-4 bg-[#1a1a1a] border border-white/10 rounded-xl outline-none focus:border-[#00d2ff] text-white transition-colors cursor-pointer appearance-none" required>
                    <option value="" disabled>Selecciona un programa</option>
                    {programas.map(p => <option key={p.idCarrera} value={p.nombre}>{p.nombre}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2 text-white/50 uppercase tracking-wider">Mensaje</label>
                <textarea name="mensaje" value={formData.mensaje} onChange={handleChange} rows="4" className="w-full p-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-[#00d2ff] text-white transition-colors" required></textarea>
              </div>
              <button type="submit" disabled={enviando} className="w-full p-4 mt-4 bg-white text-black font-semibold rounded-full hover:bg-white/90 transition-all disabled:opacity-70 flex justify-center items-center gap-2 active:scale-[0.98]">
                {enviando ? <><i className="fa-solid fa-spinner fa-spin"></i> Enviando...</> : <><Send className="w-5 h-5" /> Enviar Consulta</>}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </main>
  );
};