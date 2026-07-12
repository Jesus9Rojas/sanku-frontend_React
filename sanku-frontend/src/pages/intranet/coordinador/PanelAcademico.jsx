import { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Users, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import Swal from 'sweetalert2';
import { sileo } from 'sileo';
import { API_BASE } from '../../../utils/api';

const PanelAcademico = () => {
  const [metricas, setMetricas] = useState({ cursos: 0, docentes: 0, alertas: 0 });
  const [alertas, setAlertas] = useState([]);
  const [chartData, setChartData] = useState(null);

  const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  // Función exclusiva para el botón Resolver
  const recargarAlertasManual = async () => {
    try {
      const res = await axios.get(`${API_BASE}/alertas/pendientes`, { headers: getHeaders() });
      setAlertas(res.data);
      setMetricas(prev => ({ ...prev, alertas: res.data.length }));
    } catch {
      sileo.error({ title: "Error", description: "No se pudieron recargar las alertas." });
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    // TODA la lógica de carga inicial se encierra aquí adentro
    const iniciarDashboard = async () => {
      try {
        const h = { Authorization: `Bearer ${localStorage.getItem('token')}` };
        
        const [resAlertas, resSecciones, resDocentes, resRendimiento] = await Promise.all([
          axios.get(`${API_BASE}/alertas/pendientes`, { headers: h }).catch(() => ({ data: [] })),
          axios.get(`${API_BASE}/secciones`, { headers: h }).catch(() => ({ data: [] })),
          axios.get(`${API_BASE}/docentes`, { headers: h }).catch(() => ({ data: [] })),
          axios.get(`${API_BASE}/reportes/rendimiento`, { headers: h }).catch(() => ({ data: [] }))
        ]);

        if (!isMounted) return;

        setAlertas(resAlertas.data);
        setMetricas({
          cursos: resSecciones.data.length,
          docentes: resDocentes.data.length,
          alertas: resAlertas.data.length
        });

        const alumnos = resRendimiento.data;
        const asistenciaPorCarrera = {};

        alumnos.forEach(a => {
          const carrera = a.carrera || "General";
          const diasAsistidos = parseInt(a.dias_asistidos || 0);
          const diasTotales = parseInt(a.dias_totales || 0);
          if (!asistenciaPorCarrera[carrera]) asistenciaPorCarrera[carrera] = { asistidos: 0, totales: 0 };
          asistenciaPorCarrera[carrera].asistidos += diasAsistidos;
          asistenciaPorCarrera[carrera].totales += diasTotales;
        });

        const labels = [];
        const dataReales = [];
        const dataEsperados = [];

        Object.keys(asistenciaPorCarrera).forEach(carrera => {
          labels.push(carrera);
          const datos = asistenciaPorCarrera[carrera];
          dataReales.push(datos.totales > 0 ? Math.round((datos.asistidos / datos.totales) * 100) : 0);
          dataEsperados.push(100);
        });

        setChartData({
          labels: labels.length ? labels : ['Sin datos'],
          datasets: [
            { label: 'Esperada (%)', data: labels.length ? dataEsperados : [100], backgroundColor: 'rgba(200,200,200,0.3)' },
            { label: 'Real (%)', data: labels.length ? dataReales : [0], backgroundColor: '#14b8a6', borderRadius: 4 }
          ]
        });

      } catch {
        sileo.error({ title: "Error", description: "No se pudieron cargar los datos iniciales." });
      }
    };

    iniciarDashboard();
    
    return () => { isMounted = false; };
  }, []); // Array vacío limpio sin quejas

  const resolverAlerta = (id) => {
    Swal.fire({
      title: '¿Marcar como resuelta?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, resolver',
      confirmButtonColor: '#10b981',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.put(`${API_BASE}/alertas/${id}/resolver`, {}, { headers: getHeaders() });
          sileo.success({ title: "Resuelta", description: "Alerta marcada como solucionada." });
          recargarAlertasManual();
        } catch {
          Swal.fire("Error", "No se pudo resolver la alerta", "error");
        }
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Panel de Coordinación</h2>
          <p className="text-slate-500">Monitorea el avance del ciclo, asistencia y cumplimiento docente.</p>
        </div>
        <span className="bg-teal-50 text-teal-700 px-4 py-2 rounded-xl font-bold border border-teal-100 shadow-sm flex items-center gap-2 text-sm">
          <CheckCircle2 size={16} /> Ciclo 2026-I Activo
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-5">
          <div className="w-14 h-14 bg-teal-50 text-teal-500 rounded-2xl flex justify-center items-center"><BookOpen size={24}/></div>
          <div><p className="text-xs font-bold text-slate-400 uppercase">Cursos Activos</p><h3 className="text-2xl font-black">{metricas.cursos}</h3></div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-5">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex justify-center items-center"><Users size={24}/></div>
          <div><p className="text-xs font-bold text-slate-400 uppercase">Docentes</p><h3 className="text-2xl font-black">{metricas.docentes}</h3></div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border-l-4 border-l-rose-500 border-slate-200 flex items-center gap-5">
          <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex justify-center items-center"><AlertTriangle size={24}/></div>
          <div><p className="text-xs font-bold text-slate-400 uppercase">Alertas</p><h3 className="text-2xl font-black text-rose-600">{metricas.alertas}</h3></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-6 border-b border-slate-100 pb-3">Promedio de Asistencia Global</h3>
          <div className="h-72">
            {chartData ? <Bar data={chartData} options={{ maintainAspectRatio: false, scales: { y: { max: 100 } } }} /> : <p className="text-center text-slate-400 mt-20">Cargando gráfico...</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col">
          <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Alertas de Cumplimiento</h3>
          <div className="flex-1 space-y-3 overflow-y-auto pr-2 max-h-72 custom-scrollbar">
            {alertas.length === 0 ? (
              <p className="text-center text-slate-400 py-10">Todo en orden. No hay alertas.</p>
            ) : (
              alertas.map(a => (
                <div key={a.idAlerta} className="p-4 bg-slate-50 border-l-4 border-l-amber-500 rounded-2xl flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-amber-600 text-sm">{a.tipo.replace('_', ' ')}</h4>
                    <p className="text-sm font-semibold text-slate-700">Sección: {a.nombreSeccion}</p>
                    <p className="text-xs text-slate-500">Docente: {a.nombreDocente}</p>
                  </div>
                  <button onClick={() => resolverAlerta(a.idAlerta)} className="text-xs font-bold bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:border-emerald-500 hover:text-emerald-600 transition-colors">Resolver</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanelAcademico;