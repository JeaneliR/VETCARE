import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
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
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/duenos" element={<OwnersPage />} />
        <Route path="/mascotas" element={<PetsPage />} />
        <Route path="/mascotas/:id" element={<PetDetailPage />} />
        <Route path="/citas" element={<AppointmentsPage />} />
        <Route path="/vacunas" element={<VaccinesPage />} />
        <Route path="/tratamientos" element={<TreatmentsPage />} />
        <Route path="/banos-cortes" element={<GroomingPage />} />
        <Route path="/sedes" element={<LocationsPage />} />
        <Route path="/resenas" element={<ReviewsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
