import { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Users } from 'lucide-react';
import { sileo } from 'sileo';
import { API_BASE } from '../../../utils/api';

const coloresCursos = ['#4f46e5', '#ea580c', '#0d9488', '#9333ea', '#e11d48', '#2563eb'];
const diasCabecera = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const HorarioDocente = () => {
  const [secciones, setSecciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  useEffect(() => {
    let isMounted = true;
    const docenteId = localStorage.getItem('docenteId');

    const cargarMisCursos = async () => {
      if (!docenteId) return;
      try {
        const res = await axios.get(`${API_BASE}/secciones/docente/${docenteId}`, { headers: getHeaders() });
        if (isMounted) setSecciones(res.data);
      } catch {
        sileo.error({ title: "Error", description: "No se pudo cargar el horario." });
      } finally {
        if (isMounted) setCargando(false);
      }
    };

    cargarMisCursos();
    return () => { isMounted = false; };
  }, []);

  // Lógica de cálculo del Grid (Igual a tu JS Vanilla, pero en React)
  let minHora = 8;
  let maxHora = 15;

  if (secciones.length > 0) {
    let calMin = 24;
    let calMax = 0;
    secciones.forEach(s => {
      const hInicio = parseInt(s.horaInicio?.split(":")[0] || "8");
      const hFin = parseInt(s.horaFin?.split(":")[0] || "9") + (s.horaFin?.split(":")[1] > "00" ? 1 : 0);
      if (hInicio < calMin) calMin = hInicio;
      if (hFin > calMax) calMax = hFin;
    });
    if (calMin < minHora) minHora = calMin;
    if (calMax > maxHora) maxHora = calMax;
  }

  // Arrays auxiliares para dibujar el fondo
  const horasFondo = [];
  for (let h = minHora; h < maxHora; h++) {
    horasFondo.push(h);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-black text-slate-800">Mi Horario de Clases</h2>
        <p className="text-slate-500 text-sm">Cursos asignados ordenados por día y hora.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 overflow-x-auto">
        {cargando ? <p className="text-center text-slate-400 py-10">Generando calendario...</p> : 
          secciones.length === 0 ? <p className="text-center text-slate-400 py-10">No tienes horarios programados.</p> : (
            <div className="min-w-[800px]" style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', gap: '1px', backgroundColor: '#e2e8f0', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
              
              {/* Cabecera (Días) */}
              <div className="bg-slate-100 font-bold text-xs text-slate-500 text-center py-3 flex items-center justify-center">Horas</div>
              {diasCabecera.map((dia, i) => (
                <div key={i} className="bg-slate-100 font-bold text-sm text-slate-700 text-center py-3">{dia}</div>
              ))}

              {/* Fondo Vacio y Horas (Eje Y) */}
              {horasFondo.map((horaActual) => {
                const fila = horaActual - minHora + 2;
                return (
                  <div style={{ display: 'contents' }} key={`bg-${horaActual}`}>
                    <div className="bg-white text-xs font-bold text-slate-400 text-center py-2 border-t border-slate-100" style={{ gridColumn: 1, gridRow: fila }}>
                      {`${horaActual.toString().padStart(2, '0')}:00`}
                    </div>
                    {[1,2,3,4,5,6,7].map(dia => (
                      <div key={`celda-${dia}-${horaActual}`} className="bg-white border-t border-slate-100" style={{ gridColumn: dia + 1, gridRow: fila }}></div>
                    ))}
                  </div>
                );
              })}

              {/* Bloques de Clases Flotantes encima del Grid */}
              {secciones.map((c, index) => {
                // Cálculo matemático para la posición en el grid
                const startDecimal = parseInt(c.horaInicio.split(":")[0]) + (parseInt(c.horaInicio.split(":")[1]) / 60);
                const endDecimal = parseInt(c.horaFin.split(":")[0]) + (parseInt(c.horaFin.split(":")[1]) / 60);
                
                const inicioFila = Math.floor(startDecimal) - minHora + 2;
                const finFila = Math.ceil(endDecimal) - minHora + 2;
                const spanFilas = finFila - inicioFila;
                
                const color = coloresCursos[c.idSeccion % coloresCursos.length];

                return (
                  <div 
                    key={`curso-${c.idSeccion}-${index}`} 
                    className="m-1 rounded-xl p-3 text-white shadow-md flex flex-col justify-center transition-transform hover:scale-[1.02] cursor-pointer"
                    style={{ gridColumn: c.diaSemana + 1, gridRow: `${inicioFila} / span ${spanFilas}`, backgroundColor: color }}
                  >
                    <div className="font-black text-sm leading-tight mb-2 drop-shadow-sm">{c.nombreCurso}</div>
                    <div className="text-[10px] font-semibold opacity-90 space-y-1">
                      <div className="flex items-center gap-1"><Clock size={12}/> {c.horaInicio?.substring(0,5)} - {c.horaFin?.substring(0,5)}</div>
                      <div className="flex items-center gap-1"><Users size={12}/> SEC-{c.idSeccion}</div>
                    </div>
                  </div>
                );
              })}

            </div>
          )
        }
      </div>
    </div>
  );
};

export default HorarioDocente;