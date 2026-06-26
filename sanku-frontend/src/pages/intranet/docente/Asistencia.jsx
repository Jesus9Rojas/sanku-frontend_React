import { useState, useEffect } from 'react';
import axios from 'axios';
import {Calendar, Check, X, Save } from 'lucide-react';
import { sileo } from 'sileo';

const Asistencia = () => {
  const [secciones, setSecciones] = useState([]);
  const [cargandoSecciones, setCargandoSecciones] = useState(true);
  
  const [seccionActual, setSeccionActual] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [cargandoAlumnos, setCargandoAlumnos] = useState(false);
  const [guardando, setGuardando] = useState(false);
  
  // Estado para llevar el control de la asistencia: { [alumnoId]: true/false }
  const [asistenciaState, setAsistenciaState] = useState({});

  const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });
  const fechaHoy = new Date();
  const fechaHoyStr = `${fechaHoy.getFullYear()}-${String(fechaHoy.getMonth()+1).padStart(2,'0')}-${String(fechaHoy.getDate()).padStart(2,'0')}`;
  const fechaVisual = fechaHoy.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    let isMounted = true;
    const cargarMisCursos = async () => {
      try {
        const headers = getHeaders();
        let docenteId = localStorage.getItem('docenteId');
        if (!docenteId) {
          const usuarioId = localStorage.getItem('usuarioId');
          const resPerfil = await axios.get(`http://localhost:8080/api/v1/docentes/perfil/${usuarioId}`, { headers });
          docenteId = String(resPerfil.data.idDocente);
          localStorage.setItem('docenteId', docenteId);
        }
        const res = await axios.get(`http://localhost:8080/api/v1/secciones/docente/${docenteId}`, { headers });
        if (isMounted) setSecciones(res.data);
      } catch {
        sileo.error({ title: "Error", description: "No se pudieron cargar tus cursos." });
      } finally {
        if (isMounted) setCargandoSecciones(false);
      }
    };
    cargarMisCursos();
    return () => { isMounted = false; };
  }, []);

  const seleccionarSeccion = async (sec) => {
    setSeccionActual(sec);
    setCargandoAlumnos(true);
    setAsistenciaState({});
    
    try {
      // 1. Obtener alumnos matriculados
      const resAlum = await axios.get(`http://localhost:8080/api/v1/matriculas/seccion/${sec.idSeccion}`, { headers: getHeaders() });
      const listaAlumnos = resAlum.data;
      
      // 2. Obtener asistencia previa de hoy (si existe)
      let asistenciaGuardada = [];
      try {
        const resAsis = await axios.get(`http://localhost:8080/api/v1/asistencias/seccion/${sec.idSeccion}/fecha/${fechaHoyStr}`, { headers: getHeaders() });
        asistenciaGuardada = resAsis.data;
      } catch { /* No hay asistencia previa, ignorar */ }

      // 3. Cruzar datos
      const estadoInicial = {};
      listaAlumnos.forEach(a => {
        const registro = asistenciaGuardada.find(asis => asis.alumnoId === a.alumnoId);
        estadoInicial[a.alumnoId] = registro ? registro.presente : true; // Por defecto Presente
      });

      setAlumnos(listaAlumnos);
      setAsistenciaState(estadoInicial);
    } catch {
      sileo.error({ title: "Error", description: "Fallo al cargar la nómina de estudiantes." });
    } finally {
      setCargandoAlumnos(false);
    }
  };

  const toggleAsistencia = (alumnoId, estado) => {
    setAsistenciaState(prev => ({ ...prev, [alumnoId]: estado }));
  };

  const guardarAsistencia = async () => {
    setGuardando(true);
    let enviadas = 0;

    try {
      // Guardamos en paralelo para mayor velocidad
      const peticiones = alumnos.map(a => 
        axios.post('http://localhost:8080/api/v1/asistencias/registrar', {
          seccionId: seccionActual.idSeccion,
          alumnoId: a.alumnoId,
          presente: asistenciaState[a.alumnoId]
        }, { headers: getHeaders() })
        .then(() => { enviadas++; })
        .catch(() => {})
      );

      await Promise.all(peticiones);

      if (enviadas > 0) {
        sileo.success({ title: "Guardado", description: `Se registró la asistencia de ${enviadas} alumnos.` });
      } else {
        sileo.error({ title: "Error", description: "No se guardó ningún registro." });
      }
    } catch {
      sileo.error({ title: "Error crítico", description: "Fallo de conexión." });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-black text-slate-800">Registro de Asistencia</h2>
        <p className="text-slate-500 text-sm">Selecciona una clase usando el panel de abajo.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {cargandoSecciones && <span className="text-slate-400">Cargando secciones...</span>}
        {!cargandoSecciones && secciones.length === 0 && <span className="text-slate-400">No tienes secciones asignadas.</span>}
        {!cargandoSecciones && secciones.map(s => (
          <button
            key={s.idSeccion}
            onClick={() => seleccionarSeccion(s)}
            className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 shadow-sm ${seccionActual?.idSeccion === s.idSeccion ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'}`}
          >
            {s.nombreCurso} (SEC-{s.idSeccion})
          </button>
        ))}
      </div>

      {seccionActual && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-4">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center bg-slate-50/50 gap-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 capitalize">
              <Calendar className="text-indigo-500" size={20}/> Fecha: {fechaVisual}
            </h3>
            <span className="bg-emerald-50 text-emerald-700 font-bold px-4 py-1.5 rounded-xl border border-emerald-100 text-sm">
              Asistencia Abierta
            </span>
          </div>

          <div className="p-6 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="py-3 px-4 w-16">Nº</th>
                  <th className="py-3 px-4">Alumno</th>
                  <th className="py-3 px-4 text-right">Estado de Asistencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {cargandoAlumnos && <tr><td colSpan="3" className="text-center py-10 text-slate-400"><i className="fa-solid fa-spinner fa-spin mr-2"></i> Cargando estudiantes...</td></tr>}
                {!cargandoAlumnos && alumnos.length === 0 && <tr><td colSpan="3" className="text-center py-10 text-slate-400">No hay alumnos matriculados en esta sección.</td></tr>}
                {!cargandoAlumnos && alumnos.map((a, index) => {
                  const presente = asistenciaState[a.alumnoId];
                  return (
                    <tr key={a.alumnoId} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 font-bold text-slate-400">{index + 1}</td>
                      <td className="py-4 px-4 font-bold text-slate-700">{a.nombreAlumno}</td>
                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex bg-slate-100 p-1 rounded-xl gap-1">
                          <button
                            onClick={() => toggleAsistencia(a.alumnoId, true)}
                            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all ${presente ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}
                          >
                            <Check size={14}/> Presente
                          </button>
                          <button
                            onClick={() => toggleAsistencia(a.alumnoId, false)}
                            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all ${presente ? 'text-slate-500 hover:bg-slate-200' : 'bg-rose-500 text-white shadow-md'}`}
                          >
                            <X size={14}/> Falta
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
            <button 
              onClick={guardarAsistencia} 
              disabled={guardando || alumnos.length === 0} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              {guardando ? <i className="fa-solid fa-spinner fa-spin"></i> : <Save size={18}/>} 
              Guardar Asistencia
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Asistencia;