"use client";

// Definir la interfaz para el cliente
export interface Cliente {
  ClienteID: number;
  nombre: string;
  rfc: string;
  correo: string;
  telefono: string;
  direccion: string;
  usuarioId?: number;
}

// Obtener el nombre del usuario desde localStorage
export const getUserName = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("nombre") || null;
  }
  return null;
};

// Agregar un nuevo cliente con validaciones
export const addClient = async (clientData: Omit<Cliente, "ClienteID">) => {
  if (!clientData.nombre || !clientData.rfc || !clientData.correo || !clientData.telefono || !clientData.direccion) {
    throw new Error("Todos los campos son obligatorios.");
  }

  if (!clientData.usuarioId) {
    throw new Error("Usuario no identificado. Inicia sesión nuevamente.");
  }

  try {
    const response = await fetch("http://localhost:3001/api/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clientData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al agregar el cliente");
    }

    return await response.json();
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

    return await response.json();
  } catch (error) {
    console.error("Error al obtener los clientes:", error);
    throw error;
  }
};

// Editar un cliente con validaciones
export const editClient = async (clientId: number, updatedData: Partial<Omit<Cliente, "ClienteID">>) => {
  if (!clientId) {
    throw new Error("El ID del cliente es obligatorio.");
  }

  try {
    const response = await fetch(`http://localhost:3001/api/clientes/${clientId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      throw new Error("Error al editar el cliente");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al editar el cliente:", error);
    throw error;
  }
};

// Eliminar un cliente con validación
export const deleteClient = async (clientId: number) => {
  if (!clientId) {
    throw new Error("El ID del cliente es obligatorio.");
  }

  try {
    const response = await fetch(`http://localhost:3001/api/clientes/${clientId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Error al eliminar el cliente");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al eliminar el cliente:", error);
    throw error;
  }
};

// Buscar clientes por nombre o RFC
export const searchClients = async (searchTerm: string): Promise<Cliente[]> => {
  if (!searchTerm) {
    throw new Error("El término de búsqueda es obligatorio.");
  }

  try {
    const response = await fetch(`http://localhost:3001/api/clientes/search?search=${searchTerm}`);

    if (!response.ok) {
      throw new Error("Error al buscar clientes");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al buscar clientes:", error);
    throw error;
  }
};
