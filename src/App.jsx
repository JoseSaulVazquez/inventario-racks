import { Routes, Route } from "react-router-dom"
import { InventarioProvider } from "./context/InventarioContext"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import OficinasPisos from "./pages/OficinasPisos"
import Racks from "./pages/Racks"
import RackView from "./pages/RackView"
import ComponenteView from "./pages/ComponenteView"
import PuertoView from "./pages/PuertoView"
import Configuracion from "./pages/Configuracion"

function App() {
  return (
    <InventarioProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/configuracion" element={<Configuracion />} />
        <Route path="/oficinas" element={<OficinasPisos />} />
        <Route path="/racks/:areaId" element={<Racks />} />
        <Route path="/rack/:rackId" element={<RackView />} />
        <Route path="/componente/:componenteId" element={<ComponenteView />} />
        <Route path="/puerto/:puertoId" element={<PuertoView />} />
      </Routes>
    </InventarioProvider>
  )
}

export default App
