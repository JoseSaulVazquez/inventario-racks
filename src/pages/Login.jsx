import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useInventario } from "../context/InventarioContext"

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { refrescarPuertosDesdeBD } = useInventario()
  const [form, setForm] = useState({ usuario: "", password: "" })
  const [error, setError] = useState("")

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.usuario,
          password: form.password,
        }),
      })

      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.token) {
        setError(data?.error || "Credenciales inválidas")
        return
      }

      localStorage.setItem("auth-token", data.token)
      try {
        await refrescarPuertosDesdeBD()
      } catch (_) {
        /* sync opcional; la app puede refrescar al entrar a un rack */
      }
      const from = location.state?.from?.pathname || "/"
      navigate(from, { replace: true })
    } catch (_) {
      setError("Error de conexión")
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <img
          src="/LogoG.png"
          alt="HT"
          className="h-20 sm:h-24 w-auto object-contain mb-4"
        />
        <h1 className="text-[#1e3a5f] text-lg sm:text-xl font-semibold mb-6 tracking-wide">
          BIENVENIDO
        </h1>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm bg-white border border-gray-200 rounded-xl shadow-lg p-6 sm:p-8 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuario
            </label>
            <input
              type="text"
              name="usuario"
              value={form.usuario}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-[#1e3a5f] hover:bg-[#2d4a73] text-white font-medium rounded-lg uppercase tracking-wide transition"
          >
            Iniciar sesión
          </button>
          {error && (
            <p className="text-sm text-red-600 font-medium text-center pt-1">
              {error}
            </p>
          )}
        </form>
      </div>

      <div className="h-28 sm:h-36 lg:h-44 bg-gradient-to-r from-[#004c97] via-[#0066cc] to-[#0099ff] rounded-t-[35%] sm:rounded-t-[30%] lg:rounded-t-[25%]" />
    </div>
  )
}

export default Login

