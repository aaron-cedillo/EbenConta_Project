"use client";

// Definir la interfaz para el cliente, que es el tipo de datos esperado en varias funciones
interface Cliente {
  ClienteID: number;
  Nombre: string;
  RFC: string;
  Correo: string;
  Telefono: string;
  Direccion: string;
  UsuarioID?: number;  // UsuarioID puede ser opcional, pero se enviará si está presente
}

// Obtener el nombre del usuario desde localStorage (solo en el cliente)
export const getUserName = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("nombre"); // Solo se ejecuta en el cliente
  }
  return null; // Si estamos en el servidor, devolvemos null
};

// Agregar un nuevo cliente
export const addClient = async (clientData: {
  nombre: string;
  rfc: string;
  correo: string;
  telefono: string;
  direccion: string;
  usuarioId: number;  // Asegúrate de que el usuarioId está siendo enviado
}) => {
  try {
    const response = await fetch("http://localhost:3001/api/clientes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(clientData),
    });

    if (!response.ok) {
      throw new Error("Error al agregar el cliente");
    }

    return await response.json(); // Retorna la respuesta del servidor (cliente agregado)
  } catch (error) {
    console.error("Error al agregar el cliente:", error);
    throw error;
  }
};

// Obtener todos los clientes
export const getClients = async (): Promise<Cliente[]> => {
  try {
    const response = await fetch("http://localhost:3001/api/clientes");
    if (!response.ok) {
      throw new Error("Error al obtener los clientes");
    }
    return await response.json(); // Retorna la lista de clientes
  } catch (error) {
    console.error("Error al obtener los clientes:", error);
    throw error;
  }
};

// Editar un cliente
export const editClient = async (clientId: number, updatedData: Partial<Cliente>) => {
  try {
    const response = await fetch(`http://localhost:3001/api/clientes/${clientId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      throw new Error("Error al editar el cliente");
    }

    return await response.json(); // Retorna la respuesta del servidor (cliente actualizado)
  } catch (error) {
    console.error("Error al editar el cliente:", error);
    throw error;
  }
};

// Eliminar un cliente
export const deleteClient = async (clientId: number) => {
  try {
    const response = await fetch(`http://localhost:3001/api/clientes/${clientId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Error al eliminar el cliente");
    }

    return await response.json(); // Retorna la respuesta del servidor
  } catch (error) {
    console.error("Error al eliminar el cliente:", error);
    throw error;
  }
};
