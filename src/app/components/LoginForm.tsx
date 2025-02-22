// LoginForm.tsx

'use client';
import { useState } from "react";
import { loginUser } from "../services/authService"; // Importar tu servicio de autenticación
import { useRouter } from "next/router"; // Importamos el hook useRouter para redirigir

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Para manejar el estado de carga
  const [errorMessage, setErrorMessage] = useState(""); // Para manejar errores
  const router = useRouter(); // Usamos el hook useRouter para redirigir al dashboard adecuado

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Mostrar que estamos cargando
    setErrorMessage(""); // Limpiar errores previos

    try {
      const response = await loginUser(email, password); // Llamar al servicio de login
      if (response?.token) {
        localStorage.setItem("token", response.token); // Guardar el token en localStorage
        localStorage.setItem("nombre", response.nombre); // Guardar el nombre del usuario

        // Si el rol es 'contador', guardar la fecha de expiración
        if (response?.rol === "contador" && response?.expirationDate) {
          localStorage.setItem("expirationDate", response.expirationDate);
        }

        // Redirigir según el rol
        if (response?.rol === "admin") {
          router.push("/AdminDashboard"); // Redirigir al dashboard del admin
        } else if (response?.rol === "contador") {
          router.push("/ContadorDashboard"); // Redirigir al dashboard del contador
        } else {
          setErrorMessage("Rol no reconocido"); // En caso de un rol inesperado
        }
      }
    } catch (err) {
      setErrorMessage("Error al iniciar sesión, por favor intenta nuevamente.");
      console.error("Error de login:", err);
    } finally {
      setLoading(false); // Finalizar el estado de carga
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Introduce tu correo"
          required
          className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Introduce tu contraseña"
          required
          className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {errorMessage && (
        <p className="text-red-500 text-sm text-center mb-4">{errorMessage}</p>
      )}

      <button
        type="submit"
        className="w-full bg-indigo-500 text-white py-3 rounded-md hover:bg-indigo-600 focus:ring-2 focus:ring-indigo-500"
        disabled={loading} // Deshabilitar mientras se está cargando
      >
        {loading ? "Cargando..." : "Iniciar sesión"}
      </button>
    </form>
  );
};

export default LoginForm;
