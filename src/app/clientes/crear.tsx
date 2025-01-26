import React, { useState } from 'react';
import { createCliente } from '../services/clienteService';

const CrearClientePage: React.FC = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        rfc: '',
        correo: '',
        telefono: '',
        direccion: '',
        usuarioID: 1, // Valor de ejemplo
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createCliente(formData);
            alert('Cliente creado con éxito');
        } catch (error) {
            console.error('Error al crear cliente:', error);
        }
    };

    return (
        <div>
            <h1>Crear Cliente</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="RFC"
                    value={formData.rfc}
                    onChange={(e) => setFormData({ ...formData, rfc: e.target.value })}
                />
                <input
                    type="email"
                    placeholder="Correo"
                    value={formData.correo}
                    onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Teléfono"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Dirección"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                />
                <button type="submit">Crear Cliente</button>
            </form>
        </div>
    );
};

export default CrearClientePage;
