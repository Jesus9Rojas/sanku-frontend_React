import { useState, useEffect } from 'react';
import axios from 'axios';
import { Presentation, DoorOpen, Monitor, X, FileText, UploadCloud, CloudDownload } from 'lucide-react';
import { sileo } from 'sileo';

const AulaVirtual = () => {
  const [secciones, setSecciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cursoActivo, setCursoActivo] = useState(null);
  const [materiales, setMateriales] = useState([]);
  const [cargandoTemas, setCargandoTemas] = useState(false);

  const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  useEffect(() => {
    let isMounted = true;
    const docenteId = localStorage.getItem('docenteId');

    const cargarMisCursos = async () => {
      if (!docenteId) return;
      try {
        const res = await axios.get(`http://localhost:8080/api/v1/secciones/docente/${docenteId}`, { headers: getHeaders() });
        if (isMounted) setSecciones(res.data);
      } catch {
        sileo.error({ title: "Error", description: "No se pudieron cargar los cursos." });
      } finally {
        if (isMounted) setCargando(false);
      }
    };

    cargarMisCursos();
    return () => { isMounted = false; };
  }, []);

  const abrirAula = async (sec) => {
    setCursoActivo(sec);
    setModalAbierto(true);
    setCargandoTemas(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/v1/materiales/seccion/${sec.idSeccion}`, { headers: getHeaders() });
      setMateriales(res.data);
    } catch {
      setMateriales([]);
    } finally {
      setCargandoTemas(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-black text-slate-800">Mis Clases (Aula Virtual)</h2>
        <p className="text-slate-500 text-sm">Ingresa a tus cursos para gestionar los temas y materiales de estudio.</p>
      </div>

      {cargando ? (
        <p className="text-center text-slate-400 py-10">Cargando cursos...</p>
      ) : secciones.length === 0 ? (
        <p className="text-center text-slate-400 py-10">No tienes cursos asignados.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {secciones.map(s => (
            <div key={s.idSeccion} className="bg-white rounded-3xl shadow-sm border border-slate-200 border-t-4 border-t-indigo-600 p-6 flex flex-col items-center text-center hover:shadow-md transition-all hover:-translate-y-1">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                <Presentation size={32}/>
              </div>
              <h4 className="font-black text-slate-800 text-lg mb-1 leading-tight">{s.nombreCurso}</h4>
              <p className="text-xs text-slate-500 font-bold tracking-widest uppercase mb-6 bg-slate-100 px-3 py-1 rounded-full">
                SEC-{s.idSeccion} | {s.modalidad}
              </p>
              <button onClick={() => abrirAula(s)} className="w-full border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-600 hover:text-white font-bold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 mt-auto">
                <DoorOpen size={16}/> Entrar al Curso
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MODAL AULA VIRTUAL */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              {/* AQUÍ CAMBIAMOS LaptopFile POR Monitor */}
              <h3 className="font-black text-lg text-slate-800 flex items-center gap-2"><Monitor className="text-indigo-500" size={24}/> {cursoActivo?.nombreCurso}</h3>
              <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-lg shadow-sm"><X size={20}/></button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50">
              <p className="text-slate-500 text-sm font-semibold mb-6">Listado de temas y materiales compartidos con los alumnos de la SEC-{cursoActivo?.idSeccion}.</p>
              
              <div className="space-y-4">
                {cargandoTemas ? (
                  <p className="text-center text-slate-400 py-10"><i className="fa-solid fa-spinner fa-spin mr-2"></i> Conectando con el aula...</p>
                ) : materiales.length === 0 ? (
                  <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center">
                    <FileText size={48} className="mx-auto text-slate-200 mb-4"/>
                    <p className="text-slate-500 font-medium">Aún no has compartido temas en este curso.</p>
                  </div>
                ) : (
                  materiales.map(m => (
                    <div key={m.idMaterial} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 hover:border-indigo-300 transition-colors shadow-sm">
                      <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex justify-center items-center shrink-0">
                        <i className="fa-solid fa-file-pdf text-2xl"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-800 truncate">{m.titulo}</h4>
                        <p className="text-xs text-slate-500 font-medium">Subido: {new Date(m.fechaSubida).toLocaleDateString('es-ES')}</p>
                      </div>
                      <a href={m.archivoUrl} target="_blank" rel="noreferrer" className="w-10 h-10 bg-indigo-50 hover:bg-indigo-500 text-indigo-600 hover:text-white rounded-xl flex items-center justify-center transition-colors shrink-0">
                        <CloudDownload size={18}/>
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-white shrink-0 text-right">
              <button onClick={() => sileo.loading({title: 'Módulo en construcción', description: 'Pronto podrás subir tus PDFs.'})} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm flex items-center gap-2 ml-auto shadow-md">
                <UploadCloud size={18}/> Subir Nuevo Material
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AulaVirtual;