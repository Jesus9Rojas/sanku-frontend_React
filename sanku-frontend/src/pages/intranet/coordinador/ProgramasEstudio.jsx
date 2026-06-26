import { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Plus, Pen, X, Save } from 'lucide-react';
import { sileo } from 'sileo';
import Swal from 'sweetalert2';

// IMPORTACIONES NUEVAS Y COMPATIBLES CON REACT 19
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const customSwal = Swal.mixin({
  customClass: {
    popup: 'rounded-3xl border-0 shadow-2xl',
    confirmButton: 'bg-teal-500 hover:bg-teal-600 text-white font-bold py-2.5 px-6 rounded-xl border-0 mx-2 transition-colors',
    cancelButton: 'bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 px-6 rounded-xl border-0 mx-2 transition-colors'
  },
  buttonsStyling: false
});

const modules = {
  toolbar: [
    ['bold', 'italic'],
    [{ 'list': 'bullet' }, { 'list': 'ordered' }],
    ['clean']
  ]
};

const ProgramasEstudio = () => {
  const [programas, setProgramas] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  
  const [form, setForm] = useState({
    idCarrera: '', tipo: 'CARRERA', estado: 'true', nombre: '', descripcion: '', 
    perfilAcademico: '', mercadoLaboral: '', requisitos: ''
  });

  const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  const recargarProgramas = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/v1/carreras', { headers: getHeaders() });
      setProgramas(res.data);
    } catch {
      sileo.error({ title: "Error", description: "No se pudieron recargar los programas." });
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const fetchInicial = async () => {
      try {
        const headersLocal = { Authorization: `Bearer ${localStorage.getItem('token')}` };
        const res = await axios.get('http://localhost:8080/api/v1/carreras', { headers: headersLocal });
        if (isMounted) setProgramas(res.data);
      } catch {
        sileo.error({ title: "Error", description: "No se pudieron cargar los programas iniciales." });
      } finally {
        if (isMounted) setCargando(false);
      }
    };

    fetchInicial();
    return () => { isMounted = false; };
  }, []);

  const abrirModal = (prog = null) => {
    if (prog) {
      setForm({
        idCarrera: prog.idCarrera || '', 
        tipo: prog.tipo || 'CARRERA', 
        estado: prog.estado === false ? 'false' : 'true', 
        nombre: prog.nombre || '', 
        descripcion: prog.descripcion || '', 
        perfilAcademico: prog.perfilAcademico || '', 
        mercadoLaboral: prog.mercadoLaboral || '', 
        requisitos: prog.requisitos || ''
      });
    } else {
      setForm({
        idCarrera: '', tipo: 'CARRERA', estado: 'true', nombre: '', descripcion: '', 
        perfilAcademico: '', mercadoLaboral: '', requisitos: ''
      });
    }
    setModalAbierto(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    
    const payload = { 
      ...form,
      estado: form.estado === 'true'
    };
    
    const url = form.idCarrera ? `http://localhost:8080/api/v1/carreras/${form.idCarrera}` : `http://localhost:8080/api/v1/carreras`;
    const method = form.idCarrera ? 'PUT' : 'POST';

    try {
      await axios({ method, url, data: payload, headers: getHeaders() });
      sileo.success({ title: "Éxito", description: form.idCarrera ? "Programa actualizado." : "Nuevo programa creado." });
      setModalAbierto(false);
      recargarProgramas();
    } catch (error) {
      customSwal.fire("Error", error.response?.data?.message || "Verifique que el nombre no esté duplicado.", "error");
    } finally { 
      setGuardando(false); 
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Programas y Cursos Cortos</h2>
          <p className="text-slate-500 text-sm">Gestiona la oferta académica del instituto (visible en la web pública).</p>
        </div>
        <button onClick={() => abrirModal()} className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-colors">
          <Plus size={18}/> Nuevo Programa
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto p-5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Nombre</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {cargando ? <tr><td colSpan="5" className="text-center py-8 text-slate-400">Cargando programas...</td></tr> : 
                programas.length === 0 ? <tr><td colSpan="5" className="text-center py-8 text-slate-400">No hay programas registrados.</td></tr> :
                programas.map(p => (
                  <tr key={p.idCarrera} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-700">PRG-{p.idCarrera}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${p.tipo === 'CARRERA' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'}`}>
                        {p.tipo ? p.tipo.replace('_', ' ') : 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-800">{p.nombre}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${p.estado ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {p.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button onClick={() => abrirModal(p)} className="p-2 text-slate-400 hover:text-teal-500 hover:bg-teal-50 rounded-lg transition-colors" title="Editar Programa">
                        <Pen size={18}/>
                      </button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PROGRAMA CON REACT QUILL BLINDADO */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-800">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-black text-lg text-slate-800 flex items-center gap-2"><BookOpen className="text-teal-500" size={20}/> {form.idCarrera ? `Editar Programa: ${form.nombre}` : 'Crear Nuevo Programa'}</h3>
              <button type="button" onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-lg"><X size={20}/></button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <form id="progForm" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo de Programa</label>
                    <select required value={form.tipo} onChange={e=>setForm({...form, tipo: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-teal-500 outline-none text-sm font-semibold bg-white text-slate-800">
                      <option value="CARRERA">Carrera Profesional</option>
                      <option value="CURSO_CORTO">Curso Corto</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Estado</label>
                    <select required value={form.estado} onChange={e=>setForm({...form, estado: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-teal-500 outline-none text-sm font-semibold bg-white text-slate-800">
                      <option value="true">Activo (Visible en web)</option>
                      <option value="false">Inactivo (Oculto)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre del Programa</label>
                  <input type="text" required value={form.nombre} onChange={e=>setForm({...form, nombre: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-teal-500 outline-none text-sm bg-white text-slate-800 placeholder-slate-400"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descripción Corta (Resumen)</label>
                  <textarea rows="2" value={form.descripcion} onChange={e=>setForm({...form, descripcion: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-teal-500 outline-none text-sm bg-white text-slate-800 placeholder-slate-400 resize-y"></textarea>
                </div>
                
                {/* EDITORES QUILL FORZADOS A TEXTO OSCURO */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Perfil Académico</label>
                  <div className="bg-white rounded-xl overflow-hidden border border-slate-300 [&_.ql-editor]:text-slate-800 [&_.ql-editor]:min-h-[120px] [&_.ql-editor]:text-sm [&_.ql-toolbar]:bg-slate-50">
                    <ReactQuill theme="snow" modules={modules} value={form.perfilAcademico || ''} onChange={(val) => setForm({...form, perfilAcademico: val})} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mercado Laboral</label>
                  <div className="bg-white rounded-xl overflow-hidden border border-slate-300 [&_.ql-editor]:text-slate-800 [&_.ql-editor]:min-h-[120px] [&_.ql-editor]:text-sm [&_.ql-toolbar]:bg-slate-50">
                    <ReactQuill theme="snow" modules={modules} value={form.mercadoLaboral || ''} onChange={(val) => setForm({...form, mercadoLaboral: val})} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Requisitos y Horarios</label>
                  <div className="bg-white rounded-xl overflow-hidden border border-slate-300 [&_.ql-editor]:text-slate-800 [&_.ql-editor]:min-h-[120px] [&_.ql-editor]:text-sm [&_.ql-toolbar]:bg-slate-50">
                    <ReactQuill theme="snow" modules={modules} value={form.requisitos || ''} onChange={(val) => setForm({...form, requisitos: val})} />
                  </div>
                </div>
              </form>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 shrink-0">
              <button type="button" onClick={() => setModalAbierto(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors">Cancelar</button>
              <button type="submit" form="progForm" disabled={guardando} className="px-5 py-2.5 text-sm font-bold text-white bg-teal-500 hover:bg-teal-600 rounded-xl shadow-md transition-colors disabled:opacity-70 flex items-center gap-2">
                {guardando ? <i className="fa-solid fa-spinner fa-spin"></i> : <Save size={16}/>} Guardar Programa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramasEstudio;