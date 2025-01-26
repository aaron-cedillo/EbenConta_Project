import React from 'react';

interface Cliente {
    ClienteID: number;
    Nombre: string;
    RFC: string;
    Correo: string;
    Telefono: string;
    Direccion: string;
    UsuarioID: number;
}

interface ClientesListProps {
    clientes: Cliente[];
}

const ClientesList: React.FC<ClientesListProps> = ({ clientes }) => {
    return (
        <div>
            <h2>Lista de Clientes</h2>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
                {clientes.map(cliente => (
                    <li key={cliente.ClienteID} style={{ marginBottom: '15px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
                        <h3>{cliente.Nombre}</h3>
                        <p><strong>RFC:</strong> {cliente.RFC}</p>
                        <p><strong>Teléfono:</strong> {cliente.Telefono}</p>
                        <p><strong>Correo:</strong> {cliente.Correo}</p>
                        <p><strong>Dirección:</strong> {cliente.Direccion}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ClientesList;
