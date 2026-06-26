import { useState, useEffect } from 'react';
import axios from 'axios';
import { FolderOpen, Plus, Eye, X, FileSignature, Clock } from 'lucide-react';
import { sileo } from 'sileo';

const TramitesSae = () => {
  const [tramites, setTramites] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [secciones, setSecciones] = useState([]);
  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [tramiteActivo, setTramiteActivo] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [form, setForm] = useState({ tipo: '', seccionId: '', descripcion: '' });

  const usuarioId = localStorage.getItem("usuarioId");

  const recargarTramites = async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const resTramites = await axios.get(`http://localhost:8080/api/v1/solicitudes/mis-solicitudes/${usuarioId}`, { headers });
      setTramites(resTramites.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchInicial = async () => {
      if (!usuarioId) {
        if (isMounted) setCargando(false);
        return;
      }
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
        
        const [resTramites, resPerfil, resCarreras, resCursos, resSecciones] = await Promise.all([
          axios.get(`http://localhost:8080/api/v1/solicitudes/mis-solicitudes/${usuarioId}`, { headers }).catch(() => ({ data: [] })),
          axios.get(`http://localhost:8080/api/v1/alumnos/perfil/${usuarioId}`, { headers }).catch(() => ({ data: {} })),
          axios.get(`http://localhost:8080/api/v1/carreras`, { headers }).catch(() => ({ data: [] })),
          axios.get(`http://localhost:8080/api/v1/cursos`, { headers }).catch(() => ({ data: [] })),
          axios.get(`http://localhost:8080/api/v1/secciones/ciclo/2026-I`, { headers }).catch(() => ({ data: [] }))
        ]);

        if (!isMounted) return;

        setTramites(resTramites.data);

        const miCarrera = resPerfil.data.nombreCarrera;
        const idCarreraReal = resCarreras.data.find(c => c.nombre === miCarrera)?.idCarrera;
        const idsCursosValidos = resCursos.data.filter(c => c.carreraId === idCarreraReal).map(c => c.idCurso);
        const misSecciones = resSecciones.data.filter(s => idsCursosValidos.includes(s.cursoId));

        setSecciones(misSecciones);
      } catch (error) {
        console.error(error);
        sileo.error({ title: "Error", description: "No se pudieron cargar los datos." });
      } finally {
        if (isMounted) setCargando(false);
      }
    };

    fetchInicial();
    return () => { isMounted = false; };
  }, [usuarioId]);

  const abrirModalNuevo = () => {
    setForm({ tipo: '', seccionId: '', descripcion: '' });
    setModalNuevo(true);
  };

  const abrirModalDetalle = (tramite) => {
    setTramiteActivo(tramite);
    setModalDetalle(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      const payload = {
        emisorId: parseInt(usuarioId),
        tipo: form.tipo,
        seccionId: form.seccionId ? parseInt(form.seccionId) : null,
        descripcion: form.descripcion
      };
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      await axios.post('http://localhost:8080/api/v1/solicitudes', payload, { headers });
      sileo.success({ title: "Éxito", description: "Solicitud enviada correctamente." });
      setModalNuevo(false);
      recargarTramites();
    } catch (error) {
      console.error(error);
      sileo.error({ title: "Error", description: "No se pudo enviar la solicitud." });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Mesa de Partes Virtual</h2>
          <p className="text-slate-500 text-sm">Consulta el estado de tus solicitudes y la respuesta de coordinación.</p>
        </div>
        <button onClick={abrirModalNuevo} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-colors">
          <Plus size={18}/> Nueva Solicitud SAE
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto p-5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-3 px-4">Nº Trámite</th>
                <th className="py-3 px-4">Fecha Solicitud</th>
                <th className="py-3 px-4">Tipo de Trámite</th>
                <th className="py-3 px-4">Curso/Sección</th>
                <th className="py-3 px-4">Estado Actual</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {cargando ? <tr><td colSpan="6" className="text-center py-10 text-slate-400"><i className="fa-solid fa-spinner fa-spin mr-2"></i> Cargando trámites...</td></tr> : 
                tramites.length === 0 ? <tr><td colSpan="6" className="text-center py-10 text-slate-400">No has realizado trámites aún.</td></tr> :
                tramites.map(s => (
                  <tr key={s.idSolicitud} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-700">#TRM-{s.idSolicitud}</td>
                    <td className="py-4 px-4 text-slate-600">{new Date(s.fechaSolicitud).toLocaleDateString('es-ES')}</td>
                    <td className="py-4 px-4 font-semibold text-slate-800">{s.tipo.replace(/_/g, ' ')}</td>
                    <td className="py-4 px-4 text-slate-500">{s.cursoYSeccion || 'N/A'}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        s.estado === 'APROBADO' ? 'bg-emerald-100 text-emerald-700' : 
                        s.estado === 'RECHAZADO' ? 'bg-rose-100 text-rose-700' : 
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {s.estado}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button onClick={() => abrirModalDetalle(s)} className="bg-sky-50 text-sky-600 hover:bg-sky-500 hover:text-white font-bold px-3 py-1.5 rounded-lg transition-colors text-xs flex items-center gap-1 ml-auto">
                        <Eye size={14}/> Detalle
                      </button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {modalNuevo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-black text-lg text-slate-800 flex items-center gap-2"><FolderOpen className="text-blue-500" size={20}/> Registrar Nueva Solicitud</h3>
              <button onClick={() => setModalNuevo(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-lg shadow-sm"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo de Trámite</label>
                <select required value={form.tipo} onChange={e=>setForm({...form, tipo: e.target.value})} className="w-full p-3 rounded-xl border border-slate-300 focus:ring-blue-500 outline-none text-sm font-semibold bg-white text-slate-800">
                  <option value="" disabled>Selecciona un motivo...</option>
                  <option value="REPROGRAMACION">Reprogramación de Examen / Clase</option>
                  <option value="VERIFICACION_NOTA">Verificación o Reclamo de Nota</option>
                  <option value="OTROS">Consulta General / Otros</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Curso Relacionado (Opcional)</label>
                <select value={form.seccionId} onChange={e=>setForm({...form, seccionId: e.target.value})} className="w-full p-3 rounded-xl border border-slate-300 focus:ring-blue-500 outline-none text-sm bg-white text-slate-800">
                  <option value="">Ninguno / No aplica</option>
                  {secciones.map(s => <option key={s.idSeccion} value={s.idSeccion}>{s.nombreCurso} (SEC-{s.idSeccion})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Justificación / Detalle</label>
                <textarea required rows="4" value={form.descripcion} onChange={e=>setForm({...form, descripcion: e.target.value})} placeholder="Explica detalladamente tu solicitud..." className="w-full p-3 rounded-xl border border-slate-300 focus:ring-blue-500 outline-none text-sm bg-white text-slate-800 resize-y"></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setModalNuevo(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancelar</button>
                <button type="submit" disabled={enviando} className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors disabled:opacity-70 flex items-center gap-2">
                  {enviando ? <i className="fa-solid fa-spinner fa-spin"></i> : <Plus size={16}/>} Enviar Solicitud
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalDetalle && tramiteActivo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white shrink-0">
              <h3 className="font-black text-lg text-slate-800 flex items-center gap-2">
                <FileSignature className="text-blue-500" size={20}/> 
                Detalle <span className="text-slate-400 font-medium text-sm ml-1">#TRM-{tramiteActivo.idSolicitud}</span>
              </h3>
              <button onClick={() => setModalDetalle(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-lg shadow-sm"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Estado Actual</p>
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                    tramiteActivo.estado === 'APROBADO' ? 'bg-emerald-100 text-emerald-700' : 
                    tramiteActivo.estado === 'RECHAZADO' ? 'bg-rose-100 text-rose-700' : 
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {tramiteActivo.estado}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Fecha de Respuesta</p>
                  <p className="font-semibold text-slate-800 text-sm">
                    {tramiteActivo.fechaRespuesta ? new Date(tramiteActivo.fechaRespuesta).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }) : "Aún sin respuesta"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Respuesta del Administrador / Coordinador</p>
                <div className={`p-4 rounded-xl border text-sm leading-relaxed min-h-[80px] ${tramiteActivo.observacionCoordinador ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-50/50 border-dashed border-slate-300 text-slate-400 italic flex flex-col items-center justify-center gap-2'}`}>
                  {tramiteActivo.observacionCoordinador ? (
                    <span dangerouslySetInnerHTML={{ __html: tramiteActivo.observacionCoordinador }}></span>
                  ) : (
                    <><Clock size={24} className="opacity-50"/> Tu solicitud está en bandeja de entrada esperando ser revisada.</>
                  )}
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 text-right">
                <button onClick={() => setModalDetalle(false)} className="bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm">
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TramitesSae;