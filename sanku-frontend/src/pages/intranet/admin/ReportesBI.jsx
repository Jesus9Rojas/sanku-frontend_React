import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';
import { FileDown, FileText, Activity } from 'lucide-react';
import { sileo } from 'sileo';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ReportesBI = () => {
  const [finanzas, setFinanzas] = useState(null);
  const [matriculas, setMatriculas] = useState(null);
  const [semaforo, setSemaforo] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [loadingPdf, setLoadingPdf] = useState(false);

  const finanzasRef = useRef(null);
  const matriculasRef = useRef(null);
  const semaforoRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

    axios.get('http://localhost:8080/api/v1/reportes/financiero', { headers }).then(res => {
      if (!isMounted) return;
      const labels = res.data.map(d => d.mes || d.Mes);
      const data = res.data.map(d => parseFloat(d.ingreso || d.total || 0));
      setFinanzas({ labels, datasets: [{ label: 'Ingresos', data, backgroundColor: '#22c55e', borderRadius: 4 }] });
    }).catch(() => {});

    axios.get('http://localhost:8080/api/v1/reportes/matriculas-chart', { headers }).then(res => {
      if (!isMounted) return;
      const labels = res.data.map(d => d.mes || d.Mes);
      const data = res.data.map(d => d.total || d.Total);
      setMatriculas({ labels, datasets: [{ label: 'Matrículas', data, borderColor: '#0ea5e9', backgroundColor: 'rgba(14, 165, 233, 0.2)', fill: true, tension: 0.4 }] });
    }).catch(() => {});

    axios.get('http://localhost:8080/api/v1/reportes/semaforo-global', { headers }).then(res => {
      if (!isMounted) return;
      let aTiempo = 0, porVencer = 0, retrasado = 0;
      res.data.forEach(item => {
        const val = Object.values(item).join(' ').toLowerCase();
        if (val.includes('retrasado') || val.includes('vencido')) retrasado++;
        else if (val.includes('vencer') || val.includes('alerta')) porVencer++;
        else aTiempo++;
      });
      if(aTiempo===0 && porVencer===0 && retrasado===0) aTiempo=1;
      setSemaforo({ labels: ['Al Día', 'Por Vencer', 'Retrasados'], datasets: [{ data: [aTiempo, porVencer, retrasado], backgroundColor: ['#22c55e', '#facc15', '#ef4444'], borderWidth: 0 }] });
    }).catch(() => {});

    axios.get('http://localhost:8080/api/v1/reportes/rendimiento', { headers }).then(res => {
      if (isMounted) setAlertas(res.data);
    }).catch(() => {});

    return () => { isMounted = false; };
  }, []);

  const exportarCSV = () => {
    sileo.promise(
      new Promise(resolve => setTimeout(() => {
        let csv = "REPORTE BI\nPeriodo,Ingresos\n";
        csv += "\nGenerado correctamente.";
        
        const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "Reporte_Instituto.csv";
        link.click();
        resolve();
      }, 800)),
      { loading: {title: 'Generando Excel'}, success: {title: '¡Descarga completa!'}, error: {title: 'Error'} }
    );
  };

  const exportarPDF = () => {
    setLoadingPdf(true);
    sileo.promise(
      new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            const doc = new jsPDF('p', 'mm', 'a4');
            doc.setFontSize(18);
            doc.text("Reporte de Inteligencia de Negocios (BI)", 14, 20);
            
            if (finanzasRef.current) {
              const finanzasCanvas = finanzasRef.current.canvas;
              const imgData1 = finanzasCanvas.toDataURL('image/png');
              doc.setFontSize(12);
              doc.text("Desempeño Financiero", 14, 35);
              doc.addImage(imgData1, 'PNG', 14, 40, 85, 50);
            }

            if (matriculasRef.current) {
              const matriculasCanvas = matriculasRef.current.canvas;
              const imgData2 = matriculasCanvas.toDataURL('image/png');
              doc.setFontSize(12);
              doc.text("Evolución de Matrículas", 110, 35);
              doc.addImage(imgData2, 'PNG', 110, 40, 85, 50);
            }

            const tableBody = alertas.map(a => [
              a.alumno || a.nombre || 'N/A', 
              a.promedio_historico || a.promedio || '0', 
              a.carrera || 'General'
            ]);

            autoTable(doc, {
              startY: 100, 
              head: [['Alumno en Riesgo', 'Promedio', 'Carrera']],
              body: tableBody.length > 0 ? tableBody : [['Sin datos', '-', '-']],
              theme: 'grid',
              headStyles: { fillColor: [14, 165, 233] }
            });

            doc.save(`Reporte_BI_${new Date().getTime()}.pdf`);
            resolve();
          } catch (error) {
            console.error("Error al construir PDF:", error);
            reject(error);
          } finally {
            setLoadingPdf(false);
          }
        }, 500); 
      }),
      { 
        loading: { title: 'Preparando PDF...' }, 
        success: { title: '¡PDF Descargado exitosamente!' }, 
        error: { title: 'No se pudo generar el documento' } 
      }
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Inteligencia de Negocios (BI)</h2>
          <p className="text-slate-500 text-sm">Análisis financiero y académico del instituto.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportarPDF} disabled={loadingPdf} className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md flex items-center gap-2 transition-colors disabled:opacity-50">
            <FileText size={16}/> {loadingPdf ? 'Creando...' : 'Descargar PDF'}
          </button>
          <button onClick={exportarCSV} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md flex items-center gap-2 transition-colors">
            <FileDown size={16}/> Descargar CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Desempeño Financiero</h3>
          <div className="h-64">
            {finanzas ? <Bar ref={finanzasRef} data={finanzas} options={{maintainAspectRatio: false, plugins: {legend:{display:false}}}} /> : <div className="h-full flex items-center justify-center text-slate-400"><Activity className="animate-spin"/></div>}
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Evolución de Matrículas</h3>
          <div className="h-64">
            {matriculas ? <Line ref={matriculasRef} data={matriculas} options={{maintainAspectRatio: false, plugins: {legend:{display:false}}}} /> : <div className="h-full flex items-center justify-center text-slate-400"><Activity className="animate-spin"/></div>}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Semáforo Docente</h3>
          <div className="h-60 flex justify-center">
            {semaforo ? <Doughnut ref={semaforoRef} data={semaforo} options={{maintainAspectRatio: false, cutout: '75%'}} /> : <div className="h-full flex items-center justify-center text-slate-400"><Activity className="animate-spin"/></div>}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-rose-600 mb-4 border-b border-slate-100 pb-2">Alertas Académicas</h3>
          <div className="overflow-y-auto h-60 custom-scrollbar pr-2">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 sticky top-0"><tr className="text-xs uppercase"><th className="p-3">Alumno</th><th className="p-3 text-right">Promedio</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {alertas.length === 0 ? <tr><td colSpan="2" className="text-center py-8 text-slate-400">Sin alumnos en riesgo</td></tr> : alertas.slice(0,8).map((a, i) => (
                  <tr key={i}>
                    <td className="p-3 font-semibold text-slate-700">{a.alumno || a.nombre}</td>
                    <td className="p-3 text-right"><span className="bg-rose-100 text-rose-700 font-bold px-2 py-1 rounded-md text-xs">{parseFloat(a.promedio_historico || a.promedio || 0).toFixed(1)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportesBI;