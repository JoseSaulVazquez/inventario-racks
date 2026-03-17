import { Link, useNavigate } from "react-router-dom"

function Navbar() {
  const navigate = useNavigate()

  const cerrarSesion = () => {
    localStorage.removeItem("auth-ok")
    // opcional: limpiar cache local para evitar ver datos antiguos tras salir
    // localStorage.removeItem("inventario-puertos")
    // localStorage.removeItem("inventario-ips-componentes")
    navigate("/login", { replace: true })
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center flex-wrap gap-2">
      <Link to="/" className="flex items-center gap-2 min-w-0">
        <img
          src="/HaitianLogo.png"
          alt="HAITIAN"
          className="h-8 sm:h-10 w-auto object-contain flex-shrink-0"
        />
      </Link>
      <nav className="flex items-center gap-4 sm:gap-6">
        <button
          type="button"
          onClick={cerrarSesion}
          className="text-[#1e3a5f] font-medium text-xs sm:text-sm uppercase tracking-wide hover:underline whitespace-nowrap"
        >
          Cerrar sesión
        </button>
        <Link
          to="/"
          className="text-[#1e3a5f] font-medium text-xs sm:text-sm uppercase tracking-wide hover:underline whitespace-nowrap"
        >
          Inicio
        </Link>
      </nav>
    </header>
  )
}

export default Navbar
