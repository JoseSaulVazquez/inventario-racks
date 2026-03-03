import { Link } from "react-router-dom"

function Navbar() {
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
        <Link
          to="/configuracion"
          className="text-[#1e3a5f] font-medium text-xs sm:text-sm uppercase tracking-wide hover:underline whitespace-nowrap"
        >
          Configuración
        </Link>
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
