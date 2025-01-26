import axios from 'axios';

const API_URL = 'http://localhost:3001/api/clientes';

// Obtener todos los clientes
export const getClientes = async (usuarioID?: number) => {
    try {
        // Si no se pasa usuarioID, no lo incluimos en la URL
        const url = usuarioID ? `${API_URL}?usuarioID=${usuarioID}` : API_URL;
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error al obtener los clientes', error);
        throw error;
    }
};

// Crear un nuevo cliente
export const createCliente = async (clienteData: {
    nombre: string;
    rfc: string;
    correo: string;
    telefono: string;
    direccion: string;
    usuarioID: number;
}) => {
    try {
        const response = await axios.post(API_URL, clienteData);
        return response.data;
    } catch (error) {
        console.error('Error al crear cliente', error);
        throw error;
    }
};

// Actualizar un cliente
export const updateCliente = async (id: number, clienteData: {
    nombre: string;
    rfc: string;
    correo: string;
    telefono: string;
    direccion: string;
    usuarioID: number;
}) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, clienteData);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar cliente', error);
        throw error;
    }
};

// Eliminar un cliente
export const deleteCliente = async (id: number) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al eliminar cliente', error);
        throw error;
    }
};
