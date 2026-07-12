import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Clock, Users, AlertTriangle } from 'lucide-react';
import { sileo } from 'sileo';
import { API_BASE } from '../../../utils/api';

const coloresCursos = ['#2563eb', '#ea580c', '#0d9488', '#9333ea', '#e11d48', '#2563eb'];
const diasCabecera = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const HorarioEstudiante = () => {
  const [secciones, setSecciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [hoveredSeccion, setHoveredSeccion] = useState(null); 

  const usuarioId = localStorage.getItem("usuarioId");

  const getHeaders = useCallback(() => ({ Authorization: `Bearer ${localStorage.getItem('token')}` }), []);

  useEffect(() => {
    let isMounted = true;

    const cargarHorario = async () => {
      if (!usuarioId) return;

      try {
        const h = getHeaders();
        const resPerfil = await axios.get(`${API_BASE}/alumnos/perfil/${usuarioId}`, { headers: h });
        const miCarrera = resPerfil.data.nombreCarrera;

        const [resCarreras, resCursos, resSecciones] = await Promise.all([
          axios.get(`${API_BASE}/carreras`, { headers: h }),
          axios.get(`${API_BASE}/cursos`, { headers: h }),
          axios.get(`${API_BASE}/secciones/ciclo/2026-I`, { headers: h })
        ]);

        if (!isMounted) return;

        const idCarreraReal = resCarreras.data.find(c => c.nombre === miCarrera)?.idCarrera;
        const idsCursosValidos = resCursos.data.filter(c => c.carreraId === idCarreraReal).map(c => c.idCurso);
        const misSecciones = resSecciones.data.filter(s => idsCursosValidos.includes(s.cursoId));

        setSecciones(misSecciones);
      } catch {
        sileo.error({ title: "Error", description: "No se pudo cargar el horario." });
      } finally {
        if (isMounted) setCargando(false);
      }
    };

    cargarHorario();
    return () => { isMounted = false; };
  }, [usuarioId, getHeaders]);

  const procesarSecciones = (seccionesData) => {
    const procesadas = seccionesData.map(s => ({ ...s }));
    const porDia = {};
    
    procesadas.forEach(s => {
      if (!porDia[s.diaSemana]) porDia[s.diaSemana] = [];
      porDia[s.diaSemana].push(s);
    });

    Object.values(porDia).forEach(clasesDia => {
      clasesDia.forEach(claseA => {
        const solapadas = clasesDia.filter(claseB =>
          claseA.horaInicio < claseB.horaFin && claseA.horaFin > claseB.horaInicio
        );
        claseA.overlapTotal = solapadas.length;
        
        solapadas.sort((a, b) => {
            if (a.horaInicio === b.horaInicio) return a.idSeccion - b.idSeccion;
            return a.horaInicio.localeCompare(b.horaInicio);
        });
        claseA.overlapIndex = solapadas.findIndex(c => c.idSeccion === claseA.idSeccion);
      });
    });
    return procesadas;
  };

  const seccionesProcesadas = procesarSecciones(secciones);

  let minHora = 8;
  let maxHora = 15;

  if (seccionesProcesadas.length > 0) {
    let calMin = 24;
    let calMax = 0;
    seccionesProcesadas.forEach(s => {
      const hInicio = parseInt(s.horaInicio?.split(":")[0] || "8");
      const hFin = parseInt(s.horaFin?.split(":")[0] || "9") + (s.horaFin?.split(":")[1] > "00" ? 1 : 0);
      if (hInicio < calMin) calMin = hInicio;
      if (hFin > calMax) calMax = hFin;
    });
    if (calMin < minHora) minHora = calMin;
    if (calMax > maxHora) maxHora = calMax;
  }

  const horasFondo = [];
  for (let h = minHora; h < maxHora; h++) {
    horasFondo.push(h);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-black text-slate-800">Mi Horario de Clases</h2>
        <p className="text-slate-500 text-sm">Cursos matriculados ordenados por día y hora.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 overflow-x-auto custom-scrollbar">
        {cargando ? <p className="text-center text-slate-400 py-10">Generando calendario...</p> : 
           seccionesProcesadas.length === 0 ? <p className="text-center text-slate-400 py-10">No tienes horarios programados.</p> : (
            <div className="min-w-[950px]" style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, minmax(130px, 1fr))', gap: '1px', backgroundColor: '#e2e8f0', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
              
              <div className="bg-slate-50 font-bold text-xs text-slate-500 text-center py-3 flex items-center justify-center">Horas</div>
              {diasCabecera.map((dia, i) => (
                <div key={i} className="bg-slate-50 font-bold text-sm text-slate-700 text-center py-3">{dia}</div>
              ))}

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

              {seccionesProcesadas.map((c, index) => {
                const startDecimal = parseInt(c.horaInicio.split(":")[0]) + (parseInt(c.horaInicio.split(":")[1]) / 60);
                const endDecimal = parseInt(c.horaFin.split(":")[0]) + (parseInt(c.horaFin.split(":")[1]) / 60);
                
                const inicioFila = Math.floor(startDecimal) - minHora + 2;
                const finFila = Math.ceil(endDecimal) - minHora + 2;
                const spanFilas = finFila - inicioFila;
                
                const color = coloresCursos[c.idSeccion % coloresCursos.length];
                
                const isOverlap = c.overlapTotal > 1;
                const isHovered = hoveredSeccion === c.idSeccion;
                
                const widthPorcentaje = 100 / (c.overlapTotal || 1);
                const offsetLeft = widthPorcentaje * (c.overlapIndex || 0);

                let currentWidth = `calc(100% - 8px)`;
                let currentMl = `4px`;
                let currentZ = 1;

                if (isOverlap) {
                  if (isHovered) {
                    currentWidth = `calc(100% - 8px)`; 
                    currentMl = `4px`;
                    currentZ = 50; // Lo trae al frente
                  } else {
                    currentWidth = `calc(${widthPorcentaje}% - 8px)`; 
                    currentMl = `calc(${offsetLeft}% + 4px)`;
                    currentZ = 10 + c.overlapIndex;
                  }
                }

                return (
                  <div 
                    key={`curso-${c.idSeccion}-${index}`} 
                    onMouseEnter={() => setHoveredSeccion(c.idSeccion)}
                    onMouseLeave={() => setHoveredSeccion(null)}
                    className={`relative m-1 rounded-xl p-2 text-white shadow-md flex flex-col justify-start transition-all duration-300 cursor-pointer overflow-hidden ${isOverlap ? 'ring-2 ring-rose-500' : ''}`}
                    style={{ 
                      gridColumn: c.diaSemana + 1, 
                      gridRow: `${inicioFila} / span ${spanFilas}`, 
                      backgroundColor: color,
                      width: currentWidth,
                      marginLeft: currentMl,
                      zIndex: currentZ
                    }}
                  >
                    {/* Alerta de cruce visible cuando NO se está enfocando con el mouse */}
                    {isOverlap && !isHovered && (
                      <div className="absolute top-0 right-0 bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-bl-lg shadow-md flex items-center justify-center z-10" title="Cruce de horario">
                        <AlertTriangle size={12} />
                      </div>
                    )}
                    
                    {/* Nombre del curso: Se trunca si está apretado, se muestra completo si se expande */}
                    <div className={`font-black text-xs md:text-sm drop-shadow-sm transition-all duration-300 ${isOverlap && !isHovered ? 'truncate mt-2' : 'break-words line-clamp-3 mb-1'}`}>
                      {c.nombreCurso}
                    </div>

                    {/* Detalles de hora/sección: Se ocultan si está apretado para no saturar la vista */}
                    <div className={`text-[10px] font-semibold opacity-90 transition-all duration-300 ${isOverlap && !isHovered ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto space-y-1'}`}>
                      <div className="flex items-center gap-1"><Clock size={10}/> {c.horaInicio?.substring(0,5)} - {c.horaFin?.substring(0,5)}</div>
                      <div className="flex items-center gap-1"><Users size={10}/> SEC-{c.idSeccion}</div>
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

export default HorarioEstudiante;