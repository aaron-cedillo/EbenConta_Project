"use client";
import React, { useState, useEffect, useCallback } from "react";
import { addClient, editClient, deleteClient, Cliente } from "../services/clienteService";
import { getUserName } from "../services/authService";

const Clientes = () => {
  const [clients, setClients] = useState<Cliente[]>([]);
  const [newClient, setNewClient] = useState({
    nombre: "",
    rfc: "",
    correo: "",
    telefono: "",
    direccion: "",
  });
  const [userName, setUserName] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<Cliente | null>(null);
  const [editClientData, setEditClientData] = useState({
    nombre: "",
    rfc: "",
    correo: "",
    telefono: "",
    direccion: "",
  });
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Obtiene los clientes de la API con useCallback
  const fetchClients = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/clientes${searchTerm ? `?search=${searchTerm}` : ""}`);
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error("Error al obtener los clientes:", error);
    }
  }, [searchTerm]); // Dependencia corregida

  // Ejecutar fetchClients cuando searchTerm cambie
  useEffect(() => {
    fetchClients();
    setUserName(getUserName()); // Obtiene el nombre del usuario
  }, [fetchClients]); // Ahora fetchClients es estable y se incluye como dependencia

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Usuario no autenticado");
      return;
    }

    try {
      const decodedToken = JSON.parse(atob(token.split(".")[1] || ""));
      const usuarioId = decodedToken?.id;
      if (!usuarioId) throw new Error("No se encontró el usuarioId en el token");

      const clientData = { ...newClient, usuarioId };
      await addClient(clientData);
      fetchClients();
      setNewClient({ nombre: "", rfc: "", correo: "", telefono: "", direccion: "" });
    } catch (error) {
      console.error("Error al agregar cliente", error);
    }
  };

  const handleEditClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient?.ClienteID) return;

    try {
      const updatedClientData = { ...editClientData, ClienteID: editingClient.ClienteID };
      await editClient(editingClient.ClienteID, updatedClientData);
      fetchClients();
      setEditingClient(null);
      setEditClientData({ nombre: "", rfc: "", correo: "", telefono: "", direccion: "" });
    } catch (error) {
      console.error("Error al editar cliente", error);
    }
  };

  const handleDeleteClient = async (clientId: number) => {
    try {
      await deleteClient(clientId);
      fetchClients();
    } catch (error) {
      console.error("Error al eliminar cliente", error);
    }
  };

  const handleEditButtonClick = (client: Cliente) => {
    setEditingClient(client);
    setEditClientData({
      nombre: client.nombre,
      rfc: client.rfc,
      correo: client.correo,
      telefono: client.telefono,
      direccion: client.direccion,
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">
        {userName ? `Bienvenido, ${userName}` : "Cargando..."}
      </h1>

      {/* Formulario de búsqueda */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchClients();
        }}
        className="mb-4"
      >
        <input
          type="text"
          placeholder="Buscar por nombre o RFC"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-2 p-2 border rounded w-full"
        />
      </form>

      {/* Formulario para agregar cliente */}
      {!editingClient && (
        <form onSubmit={handleAddClient} className="mb-4">
          {Object.keys(newClient).map((field) => (
            <input
              key={field}
              type={field === "correo" ? "email" : "text"}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={newClient[field as keyof typeof newClient]}
              onChange={(e) => setNewClient({ ...newClient, [field]: e.target.value })}
              className="mb-2 p-2 border rounded w-full"
            />
          ))}
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded w-full">
            Agregar Cliente
          </button>
        </form>
      )}

      {/* Formulario de edición */}
      {editingClient && (
        <form onSubmit={handleEditClient} className="mb-4">
          <h2 className="mb-2 text-lg font-bold">Editar Cliente</h2>
          {Object.keys(editClientData).map((field) => (
            <input
              key={field}
              type={field === "correo" ? "email" : "text"}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={editClientData[field as keyof typeof editClientData]}
              onChange={(e) => setEditClientData({ ...editClientData, [field]: e.target.value })}
              className="mb-2 p-2 border rounded w-full"
            />
          ))}
          <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded w-full">
            Guardar Cambios
          </button>
          <button
            type="button"
            onClick={() => setEditingClient(null)}
            className="mt-2 px-4 py-2 bg-gray-500 text-white rounded w-full"
          >
            Cancelar
          </button>
        </form>
      )}

      {/* Lista de clientes */}
      <ul className="mt-4">
        {clients.map((client) => (
          <li key={client.ClienteID} className="mb-2 p-2 border rounded flex justify-between items-center">
            <span>
              {client.nombre} - {client.rfc} - {client.correo} - {client.telefono} - {client.direccion}
            </span>
            <div>
              <button
                onClick={() => handleEditButtonClick(client)}
                className="px-2 py-1 bg-yellow-500 text-white rounded mr-2"
              >
                Editar
              </button>
              <button
                onClick={() => handleDeleteClient(client.ClienteID)}
                className="px-2 py-1 bg-red-500 text-white rounded"
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Clientes;
