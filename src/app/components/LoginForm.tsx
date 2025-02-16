import { useState } from "react";
import { loginUser } from "../services/authService"; // Importar tu servicio de autenticación

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Para manejar el estado de carga
  const [error, setError] = useState(""); // Para manejar errores

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Mostrar que estamos cargando
    setError(""); // Limpiar errores previos

    try {
      const response = await loginUser(email, password); // Llamar al servicio de login
      if (response?.token) {
        localStorage.setItem("token", response.token); // Guardar el token en localStorage
        window.location.href = "/dashboard"; // Redirigir al dashboard si el login es exitoso
      }
    } catch (err) {
      setError("Error al iniciar sesión, por favor intenta nuevamente.");
      console.error("Error de login:", err);
    } finally {
      setLoading(false); // Finalizar el estado de carga
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Iniciar Sesión</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-red-500">{error}</div>} {/* Mostrar errores */}
          <input
            type="email"
            className="w-full p-2 border rounded"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="w-full p-2 border rounded"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded"
            disabled={loading} // Deshabilitar mientras se está cargando
          >
            {loading ? "Cargando..." : "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
