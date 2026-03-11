import { Routes, Route, useLocation, Navigate } from "react-router-dom"
import { InventarioProvider } from "./context/InventarioContext"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import OficinasPisos from "./pages/OficinasPisos"
import Racks from "./pages/Racks"
import RackView from "./pages/RackView"
import ComponenteView from "./pages/ComponenteView"
import PuertoView from "./pages/PuertoView"
import Configuracion from "./pages/Configuracion"
import Login from "./pages/Login"

function RequireAuth({ children }) {
  const location = useLocation()
  const authed = !!localStorage.getItem("auth-ok")

  if (!authed) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}

function App() {
  const location = useLocation()
  const isLogin = location.pathname === "/login"

  return (
    <InventarioProvider>
      {!isLogin && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
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
