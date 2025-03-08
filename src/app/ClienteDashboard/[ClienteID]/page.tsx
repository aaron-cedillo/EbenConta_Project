
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
    console.log("FacturaID:", FacturaID, "Nuevo Estatus:", nuevoEstatus);  // Verificar que los datos son correctos
    if (!FacturaID || !nuevoEstatus) return; // Validamos que tenemos el ID y el nuevo estatus

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Usuario no autenticado");
        return;
      }

      await axios.put(
        `http://localhost:3001/api/facturas/${FacturaID}`,
        { Estatus: nuevoEstatus },
        { headers: { Authorization: `Bearer ${token}` } }
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
    <div className="min-h-screen flex flex-col bg-[#14213D] p-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center px-8 py-4 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-semibold text-[#14213D]">{`Bienvenido, ${userName || "Cargando..."}`}</h2>
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/Clientes')}
            className="px-6 py-3 bg-[#FCA311] text-white font-semibold rounded-lg hover:bg-[#E08E00] transition"
          >
            Volver
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-[#E63946] text-white font-semibold rounded-lg hover:bg-[#D62839] transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Modal de confirmación */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 border-2 border-[#FCA311]">
            <h2 className="text-lg font-semibold text-[#14213D]">Confirmar cierre de sesión</h2>
            <p className="mt-2 text-[#14213D]">¿Estás seguro de que quieres cerrar sesión?</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-[#6C757D] text-white rounded-lg hover:bg-[#545B62] transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-[#D62828] text-white rounded-lg hover:bg-[#A12020] transition"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Información del Cliente */}
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6 mt-6 text-black mx-auto flex flex-col items-center">
        <h2 className="text-3xl font-bold text-[#14213D] mb-6 text-center">Información del Cliente</h2>

        {error && <p className="text-red-500 text-center">{error}</p>}

        {cliente ? (
          <div className="w-full">
            <table className="w-full text-left border-collapse">
              <tbody>
                {[
                  { label: "Nombre", value: cliente.Nombre },
                  { label: "RFC", value: cliente.RFC },
                  { label: "Correo", value: cliente.Correo },
                  { label: "Teléfono", value: cliente.Telefono },
                  { label: "Dirección", value: cliente.Direccion },
                ].map(({ label, value }, index) => (
                  <tr key={index} className={`${index % 2 === 0 ? "bg-gray-200" : ""} border-t`}>
                    <td className="p-4 font-semibold text-center">{label}:</td>
                    <td className="p-4 text-center">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600 text-center">Cargando información...</p>
        )}
      </div>

      {/* Subir Factura */}
      <div className="w-full max-w-3xl bg-white p-6 shadow-lg rounded-lg mt-6 mx-auto flex flex-col items-center">
        <h3 className="text-xl font-semibold text-[#14213D] mb-4 text-center">Subir Factura (XML)</h3>
        <form onSubmit={handleUploadFactura} className="space-y-4 w-full flex flex-col items-center">
          <input
            type="file"
            accept=".xml"
            onChange={handleFileChange}
            className="w-full p-2 border border-gray-300 rounded text-black"
            required
          />
          <button
            type="submit"
            className="w-full bg-[#4CAF50] text-white p-2 rounded hover:bg-[#388E3C] transition"
          >
            Subir Factura
          </button>
        </form>
      </div>

      {/* Facturas del Cliente */}
      <div className="w-full max-w-6xl bg-white shadow-lg rounded-lg overflow-hidden mt-6 mx-auto text-center">
        <h2 className="text-2xl font-bold text-[#14213D] mb-4">Facturas del Cliente</h2>

        {facturas.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-black mx-auto">
              <thead className="bg-[#FCA311] text-white">
                <tr>
                  {["RFC Emisor", "RFC Receptor", "Total", "Tipo", "UUID", "Fecha Emisión", "Folio", "Estatus", "Acción"].map((header, index) => (
                    <th key={index} className="p-3 text-left">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {facturas.map((factura) => (
                  <tr key={factura.FacturaID} className="border-t hover:bg-gray-100 transition">
                    <td className="p-3">{factura.RFCEmisor}</td>
                    <td className="p-3">{factura.RFCReceptor}</td>
                    <td className="p-3">${factura.Total.toFixed(2)}</td>
                    <td className="p-3">{factura.Tipo}</td>
                    <td className="p-3">{factura.UUID}</td>
                    <td className="p-3">{new Date(factura.FechaEmision).toLocaleDateString()}</td>
                    <td className="p-3">{factura.Folio}</td>
                    <td
                      className={`p-3 font-semibold ${factura.Estatus === "Cancelada"
                          ? "text-red-600"
                          : factura.Estatus === "Pendiente"
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                    >
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
          <p className="text-black text-center p-4">Este cliente no tiene facturas registradas.</p>
        )}
      </div>

      {/* Modal de confirmación de cambio de estatus */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-md w-96 border-2 border-[#FCA311]">
            <h3 className="text-xl font-semibold text-[#14213D] mb-4">Confirmar cambio de estatus</h3>
            <p className="text-[#14213D]">¿Estás seguro de cambiar el estatus de esta factura?</p>
            <div className="flex justify-between mt-6"> 
              <button
                onClick={cancelEstatusChange}
                className="bg-[#D62828] text-white px-4 py-2 rounded hover:bg-[#A12020] transition"
              >
                No, cancelar
              </button>
              <button
                onClick={confirmEstatusChange}
                className="bg-[#4CAF50] text-white px-4 py-2 rounded hover:bg-[#388E3C] transition"
              >
                Sí, cambiar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClienteDashboard;
