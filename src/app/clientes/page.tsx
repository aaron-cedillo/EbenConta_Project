'use client';
import React, { useState, useEffect } from 'react';
import { getClientes } from '../services/clienteService';
import ClientesList from '../components/ClientesList';

// Define una interfaz para los clientes
interface Cliente {
  ClienteID: number;
  Nombre: string;
  RFC: string;
  Correo: string;
  Telefono: string;
  Direccion: string;
  UsuarioID: number;
}

const ClientesPage: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]); // Usa la interfaz Cliente

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const data = await getClientes(); // Llama a la API para obtener todos los clientes
        setClientes(data); // Actualiza el estado con todos los clientes
      } catch (error) {
        console.error('Error al obtener clientes:', error);
      }
    };
    fetchClientes();
  }, []); // El efecto solo se ejecuta una vez, al montar el componente

  return (
    <div>
      <h1>Lista de Clientes</h1>
      <ClientesList clientes={clientes} /> {/* Aquí pasamos todos los clientes a la lista */}
    </div>
  );
};

export default ClientesPage;
