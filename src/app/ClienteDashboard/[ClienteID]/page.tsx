"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { AxiosError } from 'axios';
import { logoutUser, getUserName } from "@/app/services/authService";

interface Cliente {
  Nombre: string;
  RFC: string;
  Correo: string;
  Telefono: string;
  Direccion: string;
}

interface Factura {
  FacturaID: number;
  UUID: string;
  FechaEmision: string;
  Total: number;
  Estatus: string;
  Tipo: string;
  RFCEmisor: string;
  RFCReceptor: string;
  Folio: string;
  EnlacePDF: string | null;
  EnlaceXML: string | null;
}

const ClienteDashboard = () => {
  const router = useRouter();
  const params = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const ClienteID = params.ClienteID as string | undefined;
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [error, setError] = useState("");
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const [userName, setUserName] = useState<string | null>(null); // Estado para almacenar el nombre del usuario

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [nuevoEstatus, setNuevoEstatus] = useState<string>("");
  const [FacturaID, setFacturaID] = useState<number | null>(null); // Utilizamos directamente FacturaID


  const fetchCliente = useCallback(async () => {
    if (!ClienteID) {
      setError("No se encontró el ID del cliente.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Usuario no autenticado");
        setError("No tienes permisos para ver esta información.");
        return;
      }

      const response = await axios.get(`http://localhost:3001/api/clientedashboard/${ClienteID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCliente(response.data);
    } catch (err) {
      console.error("Error al obtener los datos del cliente:", err);
      setError("No se pudo cargar la información del cliente.");
    }
  }, [ClienteID]);

  const fetchFacturas = useCallback(async () => {
    if (!ClienteID) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Usuario no autenticado");
        setError("No tienes permisos para ver esta información.");
        return;
      }

      const response = await axios.get(`http://localhost:3001/api/facturas/cliente/${ClienteID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFacturas(response.data);
    } catch (err) {
      console.error("Error al obtener las facturas:", err);
      setError("No se pudieron cargar las facturas.");
    }
  }, [ClienteID]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setXmlFile(e.target.files[0]);
    }
  };

  const handleUploadFactura = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ClienteID) {
      alert("No se encontró el ID del cliente.");
      return;
    }

    if (!xmlFile) {
      alert("Selecciona un archivo XML.");
      return;
    }

    const formData = new FormData();
    formData.append("xml", xmlFile);
    formData.append("ClienteID", ClienteID);  // Asegurar que se envía el ClienteID

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:3001/api/facturas/subir", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Factura subida exitosamente.");
      setXmlFile(null);
      fetchFacturas();
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        console.error("Error al subir la factura:", err.response?.data || err);
        alert("Error al subir la factura: " + (err.response?.data?.error || "Desconocido"));
      } else {
        console.error("Error desconocido:", err);
        alert("Error desconocido al subir la factura.");
      }
    }
  };

  const handleEstatusChange = async (facturaID: number, nuevoEstatus: string) => {
    setFacturaID(facturaID); // Asignamos el ID de la factura directamente
    setNuevoEstatus(nuevoEstatus); // Asignamos el nuevo estatus seleccionado
    setShowModal(true); // Mostramos el modal de confirmación
  };  

  const confirmEstatusChange = async () => {
    if (!FacturaID || !nuevoEstatus) return; // Validamos que tenemos el ID y el nuevo estatus
  
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Usuario no autenticado");
        return;
      }
  
      await axios.put(
        `http://localhost:3001/api/facturas/${FacturaID}`, // Usamos FacturaID directamente
        { Estatus: nuevoEstatus }
      );
  
      // Actualizamos la lista de facturas después de la actualización
      fetchFacturas();
      alert("Estatus actualizado correctamente.");
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error al actualizar el estatus:", err.message);
      } else {
        console.error("Error desconocido:", err);
      }
      alert("Error al actualizar el estatus.");
    }
  
    setShowModal(false); // Cerrar el modal después de confirmar
  };
  

  const cancelEstatusChange = () => {
    setShowModal(false); // Cerrar el modal sin realizar cambios
  };

  const handleLogout = () => {
    logoutUser();
    router.push("/login");
  };

  useEffect(() => {
    const storedUserName = getUserName();
    setUserName(storedUserName);
    fetchCliente();
    fetchFacturas();
  }, [fetchCliente, fetchFacturas]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
      {/* Mensaje de bienvenida y botón de cerrar sesión en la misma línea */}
      <div className="flex items-center justify-between w-full mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Bienvenido, {userName}</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition sm:w-auto"
        >
          Cerrar Sesión
        </button>
      </div>

      {/* Modal de confirmación */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold">Confirmar cierre de sesión</h2>
            <p className="mt-2 text-gray-600">¿Estás seguro de que quieres cerrar sesión?</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Botón de Volver */}
      <button
        onClick={() => router.push('/Clientes')}
        className="mb-6 bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 transition"
      >
        Volver
      </button>


      <h2 className="text-3xl font-bold text-gray-800 mb-6">Información del Cliente</h2>

      {error && <p className="text-red-500">{error}</p>}

      {cliente ? (
        <div className="w-full max-w-lg bg-white shadow-md rounded-lg overflow-hidden mb-8">
          <table className="w-full text-left border-collapse">
            <tbody>
              <tr className="bg-gray-200">
                <td className="p-4 font-semibold text-gray-800">Nombre:</td>
                <td className="p-4 text-gray-800">{cliente.Nombre}</td>
              </tr>
              <tr className="border-t">
                <td className="p-4 font-semibold text-gray-800">RFC:</td>
                <td className="p-4 text-gray-800">{cliente.RFC}</td>
              </tr>
              <tr className="bg-gray-200 border-t">
                <td className="p-4 font-semibold text-gray-800">Correo:</td>
                <td className="p-4 text-gray-800">{cliente.Correo}</td>
              </tr>
              <tr className="border-t">
                <td className="p-4 font-semibold text-gray-800">Teléfono:</td>
                <td className="p-4 text-gray-800">{cliente.Telefono}</td>
              </tr>
              <tr className="bg-gray-200 border-t">
                <td className="p-4 font-semibold text-gray-800">Dirección:</td>
                <td className="p-4 text-gray-800">{cliente.Direccion}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600">Cargando información...</p>
      )}

      <div className="w-full max-w-lg bg-white p-6 shadow-md rounded-lg mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Subir Factura (XML)</h3>
        <form onSubmit={handleUploadFactura} className="space-y-4">
          <input type="file" accept=".xml" onChange={handleFileChange} className="w-full p-2 border rounded" required />
          <button type="submit" className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 transition">
            Subir Factura
          </button>
        </form>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-4">Facturas del Cliente</h2>

      {facturas.length > 0 ? (
        <div className="w-full max-w-4xl bg-white shadow-md rounded-lg overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-blue-500 text-white">
              <tr>
                <th className="p-3 text-left">RFC Emisor</th>
                <th className="p-3 text-left">RFC Receptor</th>
                <th className="p-3 text-left">Total</th>
                <th className="p-3 text-left">Tipo</th>
                <th className="p-3 text-left">UUID</th>
                <th className="p-3 text-left">Fecha Emisión</th>
                <th className="p-3 text-left">Folio</th>
                <th className="p-3 text-left">Estatus</th>
                <th className="p-3 text-left">Acción</th>
              </tr>
            </thead>
            <tbody>
              {facturas.map((factura) => (
                <tr key={factura.FacturaID} className="border-t">
                  <td className="p-3">{factura.RFCEmisor}</td>
                  <td className="p-3">{factura.RFCReceptor}</td>
                  <td className="p-3">${factura.Total.toFixed(2)}</td>
                  <td className="p-3">{factura.Tipo}</td>
                  <td className="p-3">{factura.UUID}</td>
                  <td className="p-3">{new Date(factura.FechaEmision).toLocaleDateString()}</td>
                  <td className="p-3">{factura.Folio}</td>
                  <td className={`p-3 font-semibold ${factura.Estatus === "Cancelada" ? "text-red-500" : "text-green-600"}`}>
                    {factura.Estatus}
                  </td>
                  <td className="p-3">
                    <select
                      value={factura.Estatus}
                      onChange={(e) => handleEstatusChange(factura.FacturaID, e.target.value)}
                      className="border p-2 rounded"
                    >
                      <option value="Activa">Activa</option>
                      <option value="Pendiente">Pendiente</option>
                      <option value="Cancelada">Cancelada</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600">Este cliente no tiene facturas registradas.</p>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-md w-1/3">
            <h3 className="text-xl font-semibold mb-4">Confirmar cambio de estatus</h3>
            <p>¿Estás seguro de cambiar el estatus de esta factura?</p>
            <div className="flex justify-between mt-6">
              <button
                onClick={confirmEstatusChange}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
              >
                Sí, cambiar
              </button>
              <button
                onClick={cancelEstatusChange}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              >
                No, cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClienteDashboard;
