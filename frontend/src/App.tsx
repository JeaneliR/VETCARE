import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth";
import RequireAdmin from "./components/RequireAdmin";
import HomePage from "./pages/public/HomePage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import OwnersPage from "./pages/OwnersPage";
import PetsPage from "./pages/PetsPage";
import PetDetailPage from "./pages/PetDetailPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import VaccinesPage from "./pages/VaccinesPage";
import TreatmentsPage from "./pages/TreatmentsPage";
import GroomingPage from "./pages/GroomingPage";
import LocationsPage from "./pages/LocationsPage";
import ReviewsPage from "./pages/ReviewsPage";
import UsersPage from "./pages/UsersPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      {/* Sitio público de la veterinaria: lo primero que ve cualquier visitante */}
      <Route path="/" element={<HomePage />} />

      {/* Login del personal, fuera de RequireAuth (si no, nadie podría llegar a él) */}
      <Route path="/app/login" element={<LoginPage />} />

      {/* Sistema de gestión interno: solo para personal autenticado */}
      <Route
        path="/app"
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="duenos" element={<OwnersPage />} />
        <Route path="mascotas" element={<PetsPage />} />
        <Route path="mascotas/:id" element={<PetDetailPage />} />
        <Route path="citas" element={<AppointmentsPage />} />
        <Route path="vacunas" element={<VaccinesPage />} />
        <Route path="tratamientos" element={<TreatmentsPage />} />
        <Route path="banos-cortes" element={<GroomingPage />} />
        <Route path="sedes" element={<LocationsPage />} />
        <Route path="resenas" element={<ReviewsPage />} />
        <Route
          path="usuarios"
          element={
            <RequireAdmin>
              <UsersPage />
            </RequireAdmin>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
