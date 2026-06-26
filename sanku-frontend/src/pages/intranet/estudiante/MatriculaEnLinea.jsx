import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Wallet, ArrowRight, ArrowLeft, Check, GraduationCap, X } from 'lucide-react';
import { sileo } from 'sileo';

const MatriculaEnLinea = () => {
  const navigate = useNavigate();
  const [paso, setPaso] = useState(1);
  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [procesando, setProcesando] = useState(false);
  
  const [deudasBloqueantes, setDeudasBloqueantes] = useState([]);
  const [seccionesDisponibles, setSeccionesDisponibles] = useState([]);
  const [cursosData, setCursosData] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [alumnoId, setAlumnoId] = useState(null);

  const usuarioId = localStorage.getItem("usuarioId");
  const getHeaders = useCallback(() => ({ Authorization: `Bearer ${localStorage.getItem('token')}` }), []);

  useEffect(() => {
    let isMounted = true;

    const inicializarModulo = async () => {
      if (!usuarioId) return;
      try {
        const h = getHeaders();
        const resPerfil = await axios.get(`http://localhost:8080/api/v1/alumnos/perfil/${usuarioId}`, { headers: h });
        const idAlum = resPerfil.data.idAlumno;
        const miCarrera = resPerfil.data.nombreCarrera;
        
        if (isMounted) setAlumnoId(idAlum);

        const [resPagos, resCarreras, resCursos, resSecciones] = await Promise.all([
          axios.get(`http://localhost:8080/api/v1/cuotas/alumno/${idAlum}`, { headers: h }).catch(() => ({ data: [] })),
          axios.get(`http://localhost:8080/api/v1/carreras`, { headers: h }).catch(() => ({ data: [] })),
          axios.get(`http://localhost:8080/api/v1/cursos`, { headers: h }).catch(() => ({ data: [] })),
          axios.get(`http://localhost:8080/api/v1/secciones/ciclo/2026-II`, { headers: h }).catch(() => ({ data: [] }))
        ]);

        if (!isMounted) return;

        const cuotas = resPagos.data;
        const bloqueantes = cuotas.filter(c => c.estado === 'VENCIDO' || (c.estado === 'PENDIENTE' && c.mesCorrespondiente.toLowerCase().includes("matr")));
        setDeudasBloqueantes(bloqueantes);

        const idCarreraReal = resCarreras.data.find(c => c.nombre === miCarrera)?.idCarrera;
        const cursosValidos = resCursos.data.filter(c => c.carreraId === idCarreraReal);
        const idsCursosValidos = cursosValidos.map(c => c.idCurso);
        
        const secciones2026II = resSecciones.data.filter(s => idsCursosValidos.includes(s.cursoId));

        setCursosData(cursosValidos);
        setSeccionesDisponibles(secciones2026II);

      } catch {
        sileo.error({ title: "Error", description: "No se pudo cargar la información de matrícula." });
      } finally {
        if (isMounted) setCargandoInicial(false);
      }
    };

    inicializarModulo();
    return () => { isMounted = false; };
  }, [usuarioId, getHeaders]);

  const handleCheckbox = (idSeccion) => {
    setSeleccionados(prev => {
      if (prev.includes(idSeccion)) return prev.filter(id => id !== idSeccion);
      return [...prev, idSeccion];
    });
  };

  const calcularCreditos = () => {
    let total = 0;
    seleccionados.forEach(idSec => {
      const seccion = seccionesDisponibles.find(s => s.idSeccion === idSec);
      if (seccion) {
        const cursoInfo = cursosData.find(c => c.idCurso === seccion.cursoId);
        if (cursoInfo) total += cursoInfo.creditos;
      }
    });
    return total;
  };

  const matricular = async () => {
    if (seleccionados.length === 0) return sileo.error({ title: "Aviso", description: "Selecciona al menos un curso." });
    setProcesando(true);

    try {
      const peticiones = seleccionados.map(idSec => 
        axios.post('http://localhost:8080/api/v1/matriculas/automatricula', {
          idAlumno: alumnoId,
          idSeccion: parseInt(idSec),
          montoPago: 350.00
        }, { headers: getHeaders() })
      );

      await Promise.all(peticiones);
      
      setTimeout(() => {
        setPaso(3);
        setProcesando(false);
      }, 800);
    } catch {
      sileo.error({ title: "Error", description: "Ocurrió un problema en la inscripción." });
      setProcesando(false);
    }
  };

  if (cargandoInicial) {
    return <div className="p-10 text-center text-slate-500 animate-pulse">Verificando estado académico e historial...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-slate-800">Matrícula en Línea 2026-II</h2>
        <p className="text-slate-500 text-sm">Proceso de inscripción para el siguiente ciclo académico.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-10 min-h-[400px]">
        {paso === 1 && (
          <div className="animate-in slide-in-from-right-4">
            {deudasBloqueantes.length > 0 ? (
              <>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-rose-50 border border-rose-200 p-8 rounded-2xl">
                  <div className="w-14 h-14 bg-rose-500 text-white rounded-full flex items-center justify-center shrink-0">
                    <X size={32} strokeWidth={2}/>
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-xl font-bold text-rose-600 mb-2">No habilitado para matrícula</h3>
                    <p className="text-slate-600 leading-relaxed text-sm">
                      Registras <strong>{deudasBloqueantes.length} cuota(s) pendiente(s) o vencida(s)</strong>. 
                      Por reglamento, debes regularizar tus pagos en la sección de Finanzas para poder habilitar tu selección de cursos.
                    </p>
                  </div>
                </div>
                <div className="mt-8 text-center sm:text-right">
                  <button onClick={() => navigate('/estudiante/finanzas')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-xl transition-colors shadow-md inline-flex items-center gap-2">
                    <Wallet size={18}/> Pagar mi deuda
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-emerald-50 border border-emerald-200 p-8 rounded-2xl">
                  <div className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center shrink-0">
                    <Check size={32} strokeWidth={2}/>
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-xl font-bold text-emerald-600 mb-2">Habilitado para matrícula</h3>
                    <p className="text-slate-600 leading-relaxed text-sm">
                      No registras deudas pendientes ni bloqueos académicos. 
                      Puedes proceder a seleccionar tus cursos para el ciclo 2026-II.
                    </p>
                  </div>
                </div>
                <div className="mt-8 text-center sm:text-right">
                  <button onClick={() => setPaso(2)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-xl transition-colors shadow-md inline-flex items-center gap-2">
                    Siguiente Paso <ArrowRight size={18}/>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {paso === 2 && (
          <div className="animate-in slide-in-from-right-4 flex flex-col h-full">
            <h3 className="font-bold text-slate-800 text-lg mb-6 border-b border-slate-100 pb-4">Selección de Cursos Programados</h3>
            
            <div className="flex-1 space-y-3 mb-8">
              {seccionesDisponibles.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
                  <GraduationCap size={40} className="mx-auto text-blue-300 mb-3"/>
                  <p className="text-slate-500 font-medium">¡Felicidades! Parece que ya no tienes cursos pendientes por programar en este ciclo.</p>
                </div>
              ) : (
                seccionesDisponibles.map(sec => {
                  const cursoInfo = cursosData.find(c => c.idCurso === sec.cursoId);
                  const creditos = cursoInfo ? cursoInfo.creditos : 3;
                  const seleccionado = seleccionados.includes(sec.idSeccion);

                  return (
                    <label key={sec.idSeccion} className={`flex items-start gap-4 p-5 rounded-2xl border cursor-pointer transition-all ${seleccionado ? 'bg-blue-50/50 border-blue-400 shadow-sm' : 'bg-slate-50 border-slate-200 hover:border-blue-300'}`}>
                      <input 
                        type="checkbox" 
                        checked={seleccionado}
                        onChange={() => handleCheckbox(sec.idSeccion)}
                        className="mt-1 w-5 h-5 accent-blue-600 rounded cursor-pointer"
                      />
                      <div>
                        <h4 className="font-bold text-slate-800 mb-1">{sec.nombreCurso} <span className="text-blue-600 text-xs ml-1">(SEC-{sec.idSeccion})</span></h4>
                        <p className="text-xs font-semibold text-slate-500">Créditos: {creditos} | Modalidad: {sec.modalidad} | Prof: {sec.nombreDocente}</p>
                      </div>
                    </label>
                  );
                })
              )}
            </div>

            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 mt-auto">
              <button onClick={() => setPaso(1)} className="px-6 py-3 rounded-xl font-bold text-slate-500 border border-slate-200 hover:bg-slate-50 transition-colors inline-flex items-center gap-2 w-full sm:w-auto justify-center">
                <ArrowLeft size={18}/> Volver
              </button>
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
                <span className="font-bold text-slate-500 text-sm">Total Créditos: <span className="text-blue-600 text-xl ml-1">{calcularCreditos()}</span></span>
                <button 
                  onClick={matricular} 
                  disabled={procesando || seleccionados.length === 0} 
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-xl transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {procesando ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Confirmar Matrícula'}
                </button>
              </div>
            </div>
          </div>
        )}

        {paso === 3 && (
          <div className="animate-in zoom-in-95 text-center py-10">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex justify-center items-center text-5xl mx-auto mb-6 shadow-inner border-4 border-white">
              <Check size={48} strokeWidth={3}/>
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-2">¡Matrícula Exitosa!</h2>
            <p className="text-slate-500 mb-10">Tus cursos han sido registrados correctamente en el sistema.</p>
            <button onClick={() => navigate('/estudiante')} className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-10 py-3.5 rounded-xl transition-colors shadow-md">
              Ir al Panel Principal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatriculaEnLinea;