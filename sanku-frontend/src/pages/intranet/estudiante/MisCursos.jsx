import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Monitor, MapPin, Laptop, DoorOpen, CloudDownload, FileText, X } from 'lucide-react';
import { sileo } from 'sileo';

const coloresCursos = ['#2563eb', '#ea580c', '#0d9488', '#9333ea', '#e11d48'];
const diasSemana = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const getCicloActual = () => {
  const now = new Date();
  return now.getMonth() < 6 ? `${now.getFullYear()}-I` : `${now.getFullYear()}-II`;
};

const getCicloAnterior = () => {
  const now = new Date();
  if (now.getMonth() < 6) return `${now.getFullYear() - 1}-II`;
  return `${now.getFullYear()}-I`;
};

const MisCursos = () => {
  const cicloActual = getCicloActual();
  const cicloAnterior = getCicloAnterior();

  const [cicloSeleccionado, setCicloSeleccionado] = useState(cicloActual);
  const [secciones, setSecciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [modalAula, setModalAula] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState(null);
  const [materiales, setMateriales] = useState([]);
  const [cargandoMateriales, setCargandoMateriales] = useState(false);

  const usuarioId = localStorage.getItem("usuarioId");
  const getHeaders = useCallback(() => ({ Authorization: `Bearer ${localStorage.getItem('token')}` }), []);

  useEffect(() => {
    let isMounted = true;
    setCargando(true);

    const cargarCursos = async () => {
      if (!usuarioId) return;
      try {
        const h = getHeaders();
        const resPerfil = await axios.get(`http://localhost:8080/api/v1/alumnos/perfil/${usuarioId}`, { headers: h });
        const miCarrera = resPerfil.data.nombreCarrera;

        const [resCarreras, resCursos, resSecciones] = await Promise.all([
          axios.get(`http://localhost:8080/api/v1/carreras`, { headers: h }),
          axios.get(`http://localhost:8080/api/v1/cursos`, { headers: h }),
          axios.get(`http://localhost:8080/api/v1/secciones/ciclo/${cicloSeleccionado}`, { headers: h })
        ]);

        if (!isMounted) return;

        const idCarreraReal = resCarreras.data.find(c => c.nombre === miCarrera)?.idCarrera;
        const idsCursosValidos = new Set(resCursos.data.filter(c => c.carreraId === idCarreraReal).map(c => c.idCurso));
        setSecciones(resSecciones.data.filter(s => idsCursosValidos.has(s.cursoId)));
      } catch {
        sileo.error({ title: "Error", description: "No se pudieron cargar tus cursos." });
      } finally {
        if (isMounted) setCargando(false);
      }
    };

    cargarCursos();
    return () => { isMounted = false; };
  }, [usuarioId, cicloSeleccionado, getHeaders]);

  const abrirAula = async (sec) => {
    setSeccionActiva(sec);
    setModalAula(true);
    setCargandoMateriales(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/v1/materiales/seccion/${sec.idSeccion}`, { headers: getHeaders() });
      setMateriales(res.data);
    } catch {
      setMateriales([]);
    } finally {
      setCargandoMateriales(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Mis Cursos</h2>
          <p className="text-slate-500 text-sm">Ciclo Académico: <strong className="text-blue-600">{cicloSeleccionado}</strong></p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setCicloSeleccionado(cicloActual)}
          className={`px-5 py-2 rounded-full font-bold text-sm transition-colors ${cicloSeleccionado === cicloActual ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-white text-slate-500 border border-slate-200 hover:border-blue-300 hover:text-blue-600'}`}
        >
          {cicloActual} (Actual)
        </button>
        <button
          onClick={() => setCicloSeleccionado(cicloAnterior)}
          className={`px-5 py-2 rounded-full font-bold text-sm transition-colors ${cicloSeleccionado === cicloAnterior ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-white text-slate-500 border border-slate-200 hover:border-blue-300 hover:text-blue-600'}`}
        >
          {cicloAnterior}
        </button>
      </div>

      {cargando && (
        <p className="text-center text-slate-400 py-10"><i className="fa-solid fa-spinner fa-spin mr-2"></i> Cargando tus cursos...</p>
      )}
      {!cargando && secciones.length === 0 && (
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200 text-center">
          <Monitor size={48} className="mx-auto text-slate-200 mb-4"/>
          <p className="text-slate-500 font-medium">No hay cursos programados para ti en el ciclo <strong>{cicloSeleccionado}</strong>.</p>
        </div>
      )}
      {!cargando && secciones.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {secciones.map((s) => {
            const colorFondo = coloresCursos[s.cursoId % coloresCursos.length];
            return (
              <div key={s.idSeccion} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow group">
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

                  <button
                    onClick={() => abrirAula(s)}
                    className="w-full bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-bold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 mt-auto border border-blue-100 group-hover:border-blue-600"
                  >
                    <DoorOpen size={16}/> Ver Materiales
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL MATERIALES DEL AULA */}
      {modalAula && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-black text-lg text-slate-800">{seccionActiva?.nombreCurso}</h3>
              <button onClick={() => setModalAula(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-lg shadow-sm">
                <X size={20}/>
              </button>
            </div>
            <p className="px-6 pt-4 text-sm text-slate-500">Prof. <strong>{seccionActiva?.nombreDocente}</strong> — SEC-{seccionActiva?.idSeccion}</p>

            <div className="p-6 overflow-y-auto flex-1 space-y-3">
              {cargandoMateriales && (
                <p className="text-center text-slate-400 py-10"><i className="fa-solid fa-spinner fa-spin mr-2"></i> Cargando materiales...</p>
              )}
              {!cargandoMateriales && materiales.length === 0 && (
                <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center">
                  <FileText size={48} className="mx-auto text-slate-200 mb-4"/>
                  <p className="text-slate-500 font-medium">El docente aún no ha compartido materiales en este curso.</p>
                </div>
              )}
              {!cargandoMateriales && materiales.map(m => (
                <div key={m.idMaterial} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 hover:border-blue-300 transition-colors shadow-sm">
                  <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex justify-center items-center shrink-0">
                    <i className="fa-solid fa-file-pdf text-2xl"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 truncate">{m.titulo}</h4>
                    <p className="text-xs text-slate-500 font-medium">Subido: {new Date(m.fechaSubida).toLocaleDateString('es-ES')}</p>
                  </div>
                  <a href={m.archivoUrl} target="_blank" rel="noreferrer" className="w-10 h-10 bg-blue-50 hover:bg-blue-500 text-blue-600 hover:text-white rounded-xl flex items-center justify-center transition-colors shrink-0">
                    <CloudDownload size={18}/>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MisCursos;
