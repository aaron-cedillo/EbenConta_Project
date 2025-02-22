"use client";
import React, { useState, useEffect } from "react";
import { getUserName } from "../services/authService";
import { addClient, getClients, editClient, deleteClient } from "../services/clienteService";

// Definir el tipo Cliente directamente aquí
interface Cliente {
  ClienteID: number;
  Nombre: string;
  RFC: string;
  Correo: string;
  Telefono: string;
  Direccion: string;
}

const Clientes = () => {
  const [clients, setClients] = useState<Cliente[]>([]); // Especificamos que 'clients' es un array de tipo Cliente
  const [newClient, setNewClient] = useState({
    nombre: "",
    rfc: "",
    correo: "",
    telefono: "",
    direccion: "",
  });
  const [userName, setUserName] = useState<string | null>(null); // Estado para almacenar el nombre del usuario
  const [editingClient, setEditingClient] = useState<Cliente | null>(null); // Estado para el cliente que estamos editando
  const [editClientData, setEditClientData] = useState({
    nombre: "",
    rfc: "",
    correo: "",
    telefono: "",
    direccion: "",
  }); // Estado para los datos del cliente a editar

  useEffect(() => {
    const fetchClients = async () => {
      const clientData = await getClients();
      setClients(clientData); // Actualiza la lista de clientes al cargar el componente
    };
    fetchClients();

    // Obtener el nombre del usuario desde el authService
    const username = getUserName();
    setUserName(username);  // Si el nombre del usuario está en localStorage, se muestra
  }, []);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();

    // Obtener el usuarioId desde el token decodificado, o de localStorage si está disponible
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Usuario no autenticado");
      return;
    }

    // Decodificar el token para obtener el usuarioId (si no lo tienes explícitamente)
    const user = JSON.parse(atob(token.split('.')[1])); // Aquí es donde decodificas el JWT (asegurate de que este es el formato)
    const usuarioId = user?.id; // Suponiendo que 'id' es el campo que contiene el usuarioId.

    if (!usuarioId) {
      console.error("No se encontró el usuarioId en el token");
      return;
    }

    // Añadir usuarioId al objeto newClient
    const clientData = { ...newClient, usuarioId };

    try {
      const addedClient = await addClient(clientData); // Enviar datos con usuarioId
      setClients([...clients, addedClient]); // Actualizar la lista de clientes
      setNewClient({ nombre: "", rfc: "", correo: "", telefono: "", direccion: "" }); // Limpiar formulario
    } catch (error) {
      console.error("Error al agregar cliente", error);
    }
  };

  const handleEditClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    // Crear un objeto con los valores modificados, solo incluir los que están siendo cambiados
    const updatedClientData = {
      ClienteID: editingClient.ClienteID,
      Nombre: editClientData.nombre,
      RFC: editClientData.rfc,
      Correo: editClientData.correo,
      Telefono: editClientData.telefono,
      Direccion: editClientData.direccion,
    };

    try {
      const updatedClient = await editClient(editingClient.ClienteID, updatedClientData); // Enviar los datos actualizados
      setClients(clients.map(client => client.ClienteID === editingClient.ClienteID ? updatedClient : client)); // Actualizar la lista de clientes
      setEditingClient(null); // Limpiar el estado de edición
      setEditClientData({ nombre: "", rfc: "", correo: "", telefono: "", direccion: "" }); // Limpiar el formulario de edición
    } catch (error) {
      console.error("Error al editar cliente", error);
    }
  };

  const handleDeleteClient = async (clientId: number) => {
    try {
      await deleteClient(clientId);
      setClients(clients.filter(client => client.ClienteID !== clientId)); // Elimina el cliente de la lista
    } catch (error) {
      console.error("Error al eliminar cliente", error);
    }
  };

  const handleEditButtonClick = (client: Cliente) => {
    setEditingClient(client);
    setEditClientData({
      nombre: client.Nombre,
      rfc: client.RFC,
      correo: client.Correo,
      telefono: client.Telefono,
      direccion: client.Direccion,
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">
        {userName ? `Bienvenido, ${userName}` : "Cargando..."}
      </h1>
      
      {/* Formulario para agregar cliente */}
      {!editingClient && (
        <form onSubmit={handleAddClient} className="mb-4">
          <input
            type="text"
            placeholder="Nombre"
            value={newClient.nombre}
            onChange={(e) => setNewClient({ ...newClient, nombre: e.target.value })}
            className="mb-2 p-2 border rounded"
          />
          <input
            type="text"
            placeholder="RFC"
            value={newClient.rfc}
            onChange={(e) => setNewClient({ ...newClient, rfc: e.target.value })}
            className="mb-2 p-2 border rounded"
          />
          <input
            type="email"
            placeholder="Correo"
            value={newClient.correo}
            onChange={(e) => setNewClient({ ...newClient, correo: e.target.value })}
            className="mb-2 p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Teléfono"
            value={newClient.telefono}
            onChange={(e) => setNewClient({ ...newClient, telefono: e.target.value })}
            className="mb-2 p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Dirección"
            value={newClient.direccion}
            onChange={(e) => setNewClient({ ...newClient, direccion: e.target.value })}
            className="mb-4 p-2 border rounded"
          />
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
            Agregar Cliente
          </button>
        </form>
      )}

      {/* Formulario de edición (cuando un cliente está siendo editado) */}
      {editingClient && (
        <form onSubmit={handleEditClient} className="mb-4">
          <h2>Editar Cliente</h2>
          <input
            type="text"
            placeholder="Nombre"
            value={editClientData.nombre}
            onChange={(e) => setEditClientData({ ...editClientData, nombre: e.target.value })}
            className="mb-2 p-2 border rounded"
          />
          <input
            type="text"
            placeholder="RFC"
            value={editClientData.rfc}
            onChange={(e) => setEditClientData({ ...editClientData, rfc: e.target.value })}
            className="mb-2 p-2 border rounded"
          />
          <input
            type="email"
            placeholder="Correo"
            value={editClientData.correo}
            onChange={(e) => setEditClientData({ ...editClientData, correo: e.target.value })}
            className="mb-2 p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Teléfono"
            value={editClientData.telefono}
            onChange={(e) => setEditClientData({ ...editClientData, telefono: e.target.value })}
            className="mb-2 p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Dirección"
            value={editClientData.direccion}
            onChange={(e) => setEditClientData({ ...editClientData, direccion: e.target.value })}
            className="mb-4 p-2 border rounded"
          />
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
            Guardar Cambios
          </button>
        </form>
      )}

      {/* Lista de clientes */}
      <ul>
        {clients.map((client) => (
          <li key={client.ClienteID} className="mb-2">
            {client.Nombre} - {client.RFC} - {client.Correo} - {client.Telefono} - {client.Direccion}
            <button
              onClick={() => handleEditButtonClick(client)} // Llamar la función para editar el cliente
              className="ml-4 text-blue-500"
            >
              Editar
            </button>
            <button
              onClick={() => handleDeleteClient(client.ClienteID)} // Llamar la función para eliminar el cliente
              className="ml-2 text-red-500"
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Clientes;
