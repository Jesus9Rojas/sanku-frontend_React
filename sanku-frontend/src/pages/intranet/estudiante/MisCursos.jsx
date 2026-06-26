import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Monitor, MapPin, Laptop, DoorOpen } from 'lucide-react';
import { sileo } from 'sileo';

const coloresCursos = ['#2563eb', '#ea580c', '#0d9488', '#9333ea', '#e11d48'];
const diasSemana = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const MisCursos = () => {
  const [secciones, setSecciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const usuarioId = localStorage.getItem("usuarioId");

  const getHeaders = useCallback(() => ({ Authorization: `Bearer ${localStorage.getItem('token')}` }), []);

  useEffect(() => {
    let isMounted = true;

    const cargarCursos = async () => {
      if (!usuarioId) return;
      try {
        const h = getHeaders();
        const resPerfil = await axios.get(`http://localhost:8080/api/v1/alumnos/perfil/${usuarioId}`, { headers: h });
        const miCarrera = resPerfil.data.nombreCarrera;

        const [resCarreras, resCursos, resSecciones] = await Promise.all([
          axios.get(`http://localhost:8080/api/v1/carreras`, { headers: h }),
          axios.get(`http://localhost:8080/api/v1/cursos`, { headers: h }),
          axios.get(`http://localhost:8080/api/v1/secciones/ciclo/2026-I`, { headers: h })
        ]);

        if (!isMounted) return;

        const idCarreraReal = resCarreras.data.find(c => c.nombre === miCarrera)?.idCarrera;
        const idsCursosValidos = resCursos.data.filter(c => c.carreraId === idCarreraReal).map(c => c.idCurso);
        const misSecciones = resSecciones.data.filter(s => idsCursosValidos.includes(s.cursoId));

        setSecciones(misSecciones);
      } catch {
        sileo.error({ title: "Error", description: "No se pudieron cargar tus cursos." });
      } finally {
        if (isMounted) setCargando(false);
      }
    };

    cargarCursos();
    return () => { isMounted = false; };
  }, [usuarioId, getHeaders]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Mis Cursos</h2>
          <p className="text-slate-500 text-sm">Ciclo Académico: <strong className="text-blue-600">2026-I</strong></p>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="px-5 py-2 rounded-full font-bold text-sm bg-blue-600 text-white shadow-md shadow-blue-200">2026-I (Actual)</button>
        <button className="px-5 py-2 rounded-full font-bold text-sm bg-white text-slate-500 border border-slate-200 hover:border-blue-300 hover:text-blue-600 transition-colors">2025-II</button>
      </div>

      {cargando ? (
        <p className="text-center text-slate-400 py-10"><i className="fa-solid fa-spinner fa-spin mr-2"></i> Cargando tus cursos...</p>
      ) : secciones.length === 0 ? (
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200 text-center">
          <Monitor size={48} className="mx-auto text-slate-200 mb-4"/>
          <p className="text-slate-500 font-medium">No hay cursos programados para ti en este ciclo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {secciones.map((s) => {
            const colorFondo = coloresCursos[s.cursoId % coloresCursos.length];
            return (
              <div key={s.idSeccion} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow group cursor-pointer">
                <div className="h-2 w-full transition-all group-hover:h-3" style={{ backgroundColor: colorFondo }}></div>
                <div className="p-6 flex flex-col flex-1">
                  <h4 className="font-black text-slate-800 text-lg mb-1 leading-tight">{s.nombreCurso}</h4>
                  <p className="text-xs font-bold text-slate-400 mb-4">Prof. {s.nombreDocente}</p>
                  
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 mb-6">
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span>Día</span><strong className="text-slate-800">{diasSemana[s.diaSemana]}</strong>
                    </div>
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span>Modalidad</span>
                      <strong className="text-blue-600 flex items-center gap-1">
                        {s.modalidad === 'VIRTUAL' ? <Laptop size={12}/> : <MapPin size={12}/>} {s.modalidad}
                      </strong>
                    </div>
                  </div>

                  <button className="w-full bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-bold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 mt-auto border border-blue-100 group-hover:border-blue-600">
                    <DoorOpen size={16}/> Entrar al Aula Virtual
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MisCursos;