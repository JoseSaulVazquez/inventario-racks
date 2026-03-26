import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    usuario: "",
    password: "",
    password2: "",
  })
  const [error, setError] = useState("")
  const [ok, setOk] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setOk(false)
    if (form.password !== form.password2) {
      setError("Las contraseñas no coinciden")
      return
    }
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.usuario,
          password: form.password,
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.ok) {
        setError(data?.error || "No se pudo registrar")
        return
      }
      setOk(true)
      setTimeout(() => navigate("/login", { replace: true }), 1200)
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
          REGISTRO DE USUARIO
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
              autoComplete="username"
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
              autoComplete="new-password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar contraseña
            </label>
            <input
              type="password"
              name="password2"
              value={form.password2}
              onChange={handleChange}
              autoComplete="new-password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-[#1e3a5f] hover:bg-[#2d4a73] text-white font-medium rounded-lg uppercase tracking-wide transition"
          >
            Crear cuenta
          </button>
          {ok && (
            <p className="text-sm text-emerald-700 font-medium text-center">
              Cuenta creada. Redirigiendo al inicio de sesión…
            </p>
          )}
          {error && (
            <p className="text-sm text-red-600 font-medium text-center pt-1">
              {error}
            </p>
          )}
          <p className="text-center text-sm text-gray-600">
            <Link
              to="/login"
              className="text-[#1e3a5f] font-medium hover:underline"
            >
              Volver al inicio de sesión
            </Link>
          </p>
        </form>
      </div>

      <div className="h-28 sm:h-36 lg:h-44 bg-gradient-to-r from-[#004c97] via-[#0066cc] to-[#0099ff] rounded-t-[35%] sm:rounded-t-[30%] lg:rounded-t-[25%]" />
    </div>
  )
}

export default Register
