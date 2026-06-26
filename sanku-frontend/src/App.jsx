import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'sileo'; 

import { Navbar } from './common/Navbar';
import { Footer } from './common/Footer';
import { Inicio } from './pages/public/Inicio';
import { Nosotros } from './pages/public/Nosotros';
import { Contactanos } from './pages/public/Contactanos';
import { Cursos } from './pages/public/Cursos';
import { Programa } from './pages/public/Programa';
import { Admision } from './pages/public/Admision';
import { Login } from './pages/public/Login';

import AdminDashboard from './AdminDashboard'; 
import PanelGeneral from './pages/intranet/admin/PanelGeneral';
import UsuariosAdmin from './pages/intranet/admin/UsuariosAdmin';
import ReportesBI from './pages/intranet/admin/ReportesBI';
import BuzonSae from './pages/intranet/admin/BuzonSae';
import FinanzasAdmin from './pages/intranet/admin/FinanzasAdmin'; 

import CoordinadorDashboard from './pages/intranet/coordinador/CoordinadorDashboard';
import PanelAcademico from './pages/intranet/coordinador/PanelAcademico';
import RegistrosBase from './pages/intranet/coordinador/RegistrosBase';
import Programacion from './pages/intranet/coordinador/Programacion';
import SupervisionDocente from './pages/intranet/coordinador/SupervisionDocente';
import Rendimiento from './pages/intranet/coordinador/Rendimiento';
import MatriculasAdmision from './pages/intranet/coordinador/MatriculasAdmision';
import ProgramasEstudio from './pages/intranet/coordinador/ProgramasEstudio';
import PerfilCoordinador from './pages/intranet/coordinador/PerfilCoordinador';

import DocenteDashboard from './pages/intranet/docente/DocenteDashboard';
import PanelPrincipalDocente from './pages/intranet/docente/PanelPrincipal';
import AulaVirtual from './pages/intranet/docente/AulaVirtual';
import Asistencia from './pages/intranet/docente/Asistencia';
import HorarioDocente from './pages/intranet/docente/HorarioDocente';
import Calificador from './pages/intranet/docente/Calificador';
import PerfilDocente from './pages/intranet/docente/PerfilDocente';

import EstudianteDashboard from './pages/intranet/estudiante/EstudianteDashboard';
import PanelEstudiante from './pages/intranet/estudiante/PanelEstudiante';
import MisCursos from './pages/intranet/estudiante/MisCursos';
import HorarioEstudiante from './pages/intranet/estudiante/HorarioEstudiante';
import FinanzasEstudiante from './pages/intranet/estudiante/FinanzasEstudiante';
import TramitesSae from './pages/intranet/estudiante/TramitesSae';
import MatriculaEnLinea from './pages/intranet/estudiante/MatriculaEnLinea';
import MisCalificaciones from './pages/intranet/estudiante/MisCalificaciones';
import MiAsistencia from './pages/intranet/estudiante/MiAsistencia';
import PerfilEstudiante from './pages/intranet/estudiante/PerfilEstudiante';

const LayoutPublico = ({ children }) => {
  const location = useLocation();

  const isPrivateRoute = location.pathname === '/login' || 
                         location.pathname.startsWith('/admin') || 
                         location.pathname.startsWith('/coordinador') ||
                         location.pathname.startsWith('/docente') ||
                         location.pathname.startsWith('/estudiante');

  return (
    <>
      {!isPrivateRoute && <Navbar />}
      {children}
      {!isPrivateRoute && <Footer />}
    </>
  );
};

function App() {
  return (
    <>
      <Toaster position="top-center" theme="light" />
      <Router>
        <LayoutPublico>
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/nosotros" element={<Nosotros />} />
            <Route path="/contactanos" element={<Contactanos />} />
            <Route path="/cursos" element={<Cursos />} />
            <Route path="/programa/:id" element={<Programa />} />
            <Route path="/admision" element={<Admision />} />
            <Route path="/login" element={<Login />} />

            <Route path="/admin" element={<AdminDashboard />}>
              <Route index element={<PanelGeneral />} />
              <Route path="usuarios" element={<UsuariosAdmin />} />
              <Route path="reportes" element={<ReportesBI />} />
              <Route path="sae" element={<BuzonSae />} />
              <Route path="finanzas" element={<FinanzasAdmin />} />
            </Route>

            <Route path="/coordinador" element={<CoordinadorDashboard />}>
              <Route index element={<PanelAcademico />} />
              <Route path="registros" element={<RegistrosBase />} />
              <Route path="programacion" element={<Programacion />} />
              <Route path="docentes" element={<SupervisionDocente />} />
              <Route path="rendimiento" element={<Rendimiento />} />
              <Route path="matriculas" element={<MatriculasAdmision />} />
              <Route path="programas" element={<ProgramasEstudio />} />
              <Route path="perfil" element={<PerfilCoordinador />} />
            </Route>

            <Route path="/docente" element={<DocenteDashboard />}>
              <Route index element={<PanelPrincipalDocente />} />
              <Route path="aula-virtual" element={<AulaVirtual />} />
              <Route path="asistencia" element={<Asistencia />} /> 
              <Route path="horario" element={<HorarioDocente />} />
              <Route path="notas" element={<Calificador />} /> 
              <Route path="perfil" element={<PerfilDocente />} />
            </Route>

            <Route path="/estudiante" element={<EstudianteDashboard />}>
              <Route index element={<PanelEstudiante />} />
              <Route path="cursos" element={<MisCursos />} />
              <Route path="horario" element={<HorarioEstudiante />} />
              <Route path="finanzas" element={<FinanzasEstudiante />} />
              <Route path="tramites" element={<TramitesSae />} />
              <Route path="matricula" element={<MatriculaEnLinea />} />
              <Route path="calificaciones" element={<MisCalificaciones />} />
              <Route path="asistencia" element={<MiAsistencia />} />
              <Route path="perfil" element={<PerfilEstudiante />} />
            </Route>
          </Routes>
        </LayoutPublico>
      </Router>
    </>
  );
}

export default App;