import axios from "axios";

const API_URL = "http://localhost:3001/api/users"; // Asegúrate de que esta URL apunte correctamente al backend

// Definir el tipo de respuesta para el login
interface LoginResponse {
  token: string;
  rol: "admin" | "contador"; // Asegúrate de que la API devuelva este valor
}

// Iniciar sesión
export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    if (!email || !password) {
      alert("Por favor ingresa un correo y una contraseña");
      return Promise.reject("Faltan campos");
    }

    const response = await axios.post(`${API_URL}/login`, { email, password });

    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      
      // Redirigir a Dashboard según el rol
      if (response.data.rol === "admin") {
        window.location.href = "/admin-dashboard"; // Redirigir al dashboard del admin
      } else if (response.data.rol === "contador") {
        window.location.href = "/contador-dashboard"; // Redirigir al dashboard del contador
      } else {
        alert("Rol no reconocido");
      }
    } else {
      alert("Error en la respuesta del servidor");
    }

    return response.data; // Devuelves el token y rol
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response ? error.response.data.message : error.message;
      console.error("Error al iniciar sesión:", errorMessage);
      alert("Error al iniciar sesión: " + errorMessage);
    } else {
      console.error("Error desconocido:", error);
      alert("Error desconocido al iniciar sesión");
    }
    throw error;
  }
};

// Obtener usuario desde localStorage
export const getUser = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    // Decodificar el token para obtener la información del usuario
    const base64Url = token.split(".")[1]; // Extraer el payload del JWT
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload); // Retorna el usuario decodificado
  } catch (error) {
    console.error("Error al decodificar el token:", error);
    return null;
  }
};

// Cerrar sesión
export const logoutUser = () => {
  localStorage.removeItem("token");
  window.location.href = "/login"; // Redirigir a la página de login
};
