import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, BookOpen, Wallet, Inbox } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto'; // Registra Chart.js automáticamente
import { Link } from 'react-router-dom';

const PanelGeneral = () => {
  const [metricas, setMetricas] = useState({ alumnos: 0, docentes: 0, ingresos: 0, pendientes: 0 });
  const [chartData, setChartData] = useState(null);
  const [saeRecientes, setSaeRecientes] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    // 1. Cargar Métricas Superiores
    axios.get('http://localhost:8080/api/v1/reportes/dashboard-admin', { headers })
      .then(res => {
        setMetricas({
          alumnos: res.data.totalAlumnos || 0,
          docentes: res.data.totalDocentes || 0,
          ingresos: res.data.ingresosMes || 0,
          pendientes: res.data.solicitudesPendientes || 0
        });
      }).catch(err => console.error("Error métricas", err));

    // 2. Cargar Gráfico de Matrículas
    axios.get('http://localhost:8080/api/v1/reportes/matriculas-chart', { headers })
      .then(res => {
        const labels = res.data.map(d => d.mes || d.Mes);
        const totales = res.data.map(d => d.total || d.Total);
        setChartData({
          labels,
          datasets: [{
            label: 'Nuevas Matrículas',
            data: totales,
            borderColor: '#0ea5e9',
            backgroundColor: 'rgba(14, 165, 233, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 3
          }]
        });
      });

    // 3. Cargar Preview de Trámites SAE
    axios.get('http://localhost:8080/api/v1/solicitudes/pendientes', { headers })
      .then(res => {
        const pendientes = res.data.filter(s => s.estado === 'PENDIENTE');
        setSaeRecientes(pendientes.slice(0, 3));
      });
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-black text-slate-800">Dashboard Institucional</h2>
        <p className="text-slate-500">Resumen en tiempo real del estado académico y financiero.</p>
      </div>

      {/* TARJETAS DE MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-5 hover:border-sky-300 transition-colors">
          <div className="w-14 h-14 bg-sky-50 text-sky-500 rounded-xl flex items-center justify-center shrink-0"><Users size={28}/></div>
          <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alumnos</p><h3 className="text-2xl font-black text-slate-800">{metricas.alumnos}</h3></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-5 hover:border-indigo-300 transition-colors">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center shrink-0"><BookOpen size={28}/></div>
          <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Docentes</p><h3 className="text-2xl font-black text-slate-800">{metricas.docentes}</h3></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-5 hover:border-emerald-300 transition-colors">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center shrink-0"><Wallet size={28}/></div>
          <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ingresos Mes</p><h3 className="text-2xl font-black text-slate-800">S/ {metricas.ingresos.toFixed(2)}</h3></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-5 hover:border-rose-300 transition-colors">
          <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center shrink-0"><Inbox size={28}/></div>
          <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">SAE Pendientes</p><h3 className="text-2xl font-black text-slate-800">{metricas.pendientes}</h3></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Evolución de Matrículas</h3>
          <div className="h-72">
            {chartData ? <Line data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} /> : <div className="h-full flex items-center justify-center text-slate-400">Cargando gráfico...</div>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
            <h3 className="font-bold text-slate-800">Trámites por Revisar (SAE)</h3>
            <Link to="/admin/sae" className="text-sm font-bold text-sky-500 hover:text-sky-700">Ver todos</Link>
          </div>
          <div className="flex-1 space-y-3">
            {saeRecientes.length === 0 ? (
               <p className="text-center text-slate-400 py-10 font-medium">Bandeja limpia. Todo al día.</p>
            ) : (
              saeRecientes.map(s => (
                <div key={s.idSolicitud} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center"><Inbox size={18}/></div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{s.tipo}</p>
                      <p className="text-xs text-slate-500">{s.nombreEmisor}</p>
                    </div>
                  </div>
                  <Link to="/admin/sae" className="text-xs font-bold bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:border-sky-300 transition-colors">Atender</Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanelGeneral;