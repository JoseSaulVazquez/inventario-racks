import { Link, useLocation, useNavigate } from "react-router-dom"

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const enVistaComponente = location.pathname.startsWith("/componente/")

  const cerrarSesion = () => {
    localStorage.removeItem("auth-ok")
    localStorage.removeItem("auth-token")
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
        {enVistaComponente && (
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("open-componente-help"))}
            className="h-8 w-8 rounded-full bg-white border border-gray-200 shadow hover:bg-gray-50 flex items-center justify-center"
            aria-label="Abrir ayuda de la vista del componente"
          >
            <img
              src="/Iconos/ayuda.png"
              alt="Ayuda"
              className="h-4 w-4 object-contain"
            />
          </button>
        )}
        <button
          type="button"
          onClick={cerrarSesion}
          className="text-[#1e3a5f] font-medium text-xs sm:text-sm uppercase tracking-wide hover:underline whitespace-nowrap"
        >
          Cerrar sesión
        </button>
      </nav>
    </header>
  )
}

export default Navbar
