import axios from "axios";

const API_URL = "http://localhost:3001/api/users"; 

// Crear una instancia de Axios con configuración
const API = axios.create();

API.interceptors.response.use(
  (response) => response, 
  (error) => {
    if (error.response && error.response.status === 401) {
      logoutUser(); // Cierra sesión si el token es inválido o ha expirado
    }
    return Promise.reject(error);
  }
);

interface LoginResponse {
  token: string;
  rol: "admin" | "contador";
  nombre: string; 
  expirationDate?: string; 
}

export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    if (!email || !password) {
      alert("Por favor ingresa un correo y una contraseña");
      return Promise.reject("Faltan campos");
    }

    const response = await axios.post(`${API_URL}/login`, { email, password });

    if (response.data.token) {
      
      if (typeof window !== "undefined") {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("nombre", response.data.nombre); 
        localStorage.setItem("UsuarioID", response.data.usuarioID); 

        if (response.data.rol === "contador" && response.data.expirationDate) {
          localStorage.setItem("expirationDate", response.data.expirationDate);
        }

        if (response.data.rol === "admin") {
          window.location.href = "/AdminDashboard"; 
        } else if (response.data.rol === "contador") {
          window.location.href = "/ContadorDashboard"; 
        } else {
          alert("Rol no reconocido");
        }
      }
    } else {
      alert("Error en la respuesta del servidor");
    }

    return response.data; 
  } catch (error) {
    if (axios.isAxiosError(error)) {
      
      if (error.response && error.response.data && error.response.data.message === "El acceso de este contador ha expirado") {
        alert("El acceso de este contador ha expirado. Por favor, contacta al administrador.");
      } else {
        const errorMessage = error.response ? error.response.data.message : error.message;
        console.error("Error al iniciar sesión:", errorMessage);
        alert("Error al iniciar sesión: " + errorMessage);
      }
    } else {
      console.error("Error desconocido:", error);
      alert("Error desconocido al iniciar sesión");
    }
    throw error;
  }
};

export const getUser = () => {
  if (typeof window !== "undefined") { 
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      
      const base64Url = token.split(".")[1]; 
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      return JSON.parse(jsonPayload); 
    } catch (error) {
      console.error("Error al decodificar el token:", error);
      return null;
    }
  }
  return null; 
};

export const getUserName = () => {
  if (typeof window !== "undefined") { 
    return localStorage.getItem("nombre");
  }
  return null; 
};

export const getUserId = () => {
  if (typeof window !== "undefined") { 
    return localStorage.getItem("UsuarioID");
  }
  return null; 
};

export const logoutUser = () => {
  if (typeof window !== "undefined") { 
    localStorage.removeItem("token");
    localStorage.removeItem("nombre"); 
    localStorage.removeItem("expirationDate"); 
    window.location.href = "/login"; 
  }
};
