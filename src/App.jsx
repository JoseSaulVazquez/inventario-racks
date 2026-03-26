import { Routes, Route, useLocation, Navigate } from "react-router-dom"
import { InventarioProvider } from "./context/InventarioContext"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import OficinasPisos from "./pages/OficinasPisos"
import CasetasRacks from "./pages/CasetasRacks"
import Racks from "./pages/Racks"
import RackView from "./pages/RackView"
import ComponenteView from "./pages/ComponenteView"
import PuertoView from "./pages/PuertoView"
import Configuracion from "./pages/Configuracion"
import Login from "./pages/Login"
import Register from "./pages/Register"

function RequireAuth({ children }) {
  const location = useLocation()
  const authed = !!localStorage.getItem("auth-token")

  if (!authed) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}

function App() {
  const location = useLocation()
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register"

  return (
    <InventarioProvider>
      {!isAuthPage && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />
        <Route
          path="/configuracion"
          element={
            <RequireAuth>
              <Configuracion />
            </RequireAuth>
          }
        />
        <Route
          path="/oficinas"
          element={
            <RequireAuth>
              <OficinasPisos />
            </RequireAuth>
          }
        />
        <Route
          path="/casetas"
          element={
            <RequireAuth>
              <CasetasRacks />
            </RequireAuth>
          }
        />
        <Route
          path="/racks/:areaId"
          element={
            <RequireAuth>
              <Racks />
            </RequireAuth>
          }
        />
        <Route
          path="/rack/:rackId"
          element={
            <RequireAuth>
              <RackView />
            </RequireAuth>
          }
        />
        <Route
          path="/componente/:componenteId"
          element={
            <RequireAuth>
              <ComponenteView />
            </RequireAuth>
          }
        />
        <Route
          path="/puerto/:puertoId"
          element={
            <RequireAuth>
              <PuertoView />
            </RequireAuth>
          }
        />
      </Routes>
    </InventarioProvider>
  )
}

export default App
