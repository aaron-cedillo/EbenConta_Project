"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { logoutUser, getUserName } from "@/app/services/authService";
import { FaHome, FaUser, FaDollarSign, FaFolderOpen } from "react-icons/fa";

interface Cliente {
  Nombre: string;
  RFC: string;
  Correo: string;
  Telefono: string;
}

interface Factura {
  FacturaID: number;
  UUID: string;
  FechaEmision: string;
  Total: number;
  Estatus: string;
  Tipo: string;
  RFCEmisor: string;
}

const ClienteDashboard = () => {
  const router = useRouter();
  const params = useParams();
  const ClienteID = params.ClienteID as string | undefined;
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [xmlFiles, setXmlFiles] = useState<File[]>([]);
  const [userName, setUserName] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [nuevoEstatus, setNuevoEstatus] = useState<string>("");
  const [FacturaID, setFacturaID] = useState<number | null>(null);

  const userMenuRef = useRef<HTMLDivElement>(null);

  const fetchCliente = useCallback(async () => {
    if (!ClienteID) return;
    try {
      const token = localStorage.getItem("token");
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
      const response = await axios.get(`http://localhost:3001/api/facturas/cliente/${ClienteID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFacturas(response.data);
    } catch (err) {
      console.error("Error al obtener las facturas:", err);
    }
  }, [ClienteID]);

  useEffect(() => {
    setUserName(getUserName());
    fetchCliente();
    fetchFacturas();

    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsModalOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [fetchCliente, fetchFacturas]);

  const handleLogout = () => {
    logoutUser();
    router.push("/login");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setXmlFiles(files);
  };

  const handleUploadFactura = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ClienteID) {
      alert("No se encontró el ID del cliente.");
      return;
    }

    if (xmlFiles.length === 0) {
      alert("Selecciona al menos un archivo XML.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      for (const file of xmlFiles) {
        const formData = new FormData();
        formData.append("xml", file);
        formData.append("ClienteID", ClienteID);

        await axios.post("http://localhost:3001/api/facturas/subir", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      alert("Facturas subidas exitosamente.");
      setXmlFiles([]);

      const fileInput = document.querySelector("input[type='file']") as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }

      fetchFacturas();
    } catch (err) {
      console.error("Error al subir las facturas:", err);
      alert("Error al subir las facturas.");
    }
  };

  const handleEstatusChange = async (facturaID: number, nuevoEstatus: string) => {
    setFacturaID(facturaID);
    setNuevoEstatus(nuevoEstatus);
    setShowModal(true);
  };

  const confirmEstatusChange = async () => {
    if (!FacturaID || !nuevoEstatus) return;

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

      fetchFacturas();
      alert("Estatus actualizado correctamente.");
    } catch (err) {
      console.error("Error al actualizar el estatus:", err);
      alert("Error al actualizar el estatus.");
    }

    setShowModal(false);
  };

  const cancelEstatusChange = () => {
    setShowModal(false);
  };


  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-[#14213D] text-white p-6 flex flex-col">
        <h1 className="text-2xl font-bold mb-6">
          eben<span className="text-[#FCA311]">Conta</span>
        </h1>

        {/* Botón Dashboard */}
        <button
          onClick={() => router.push("/ContadorDashboard")}
          className="flex items-center gap-2 text-white hover:bg-[#FCA311] px-4 py-3 rounded transition"
        >
          <FaHome />
          Dashboard
        </button>

        {/* Botón Clientes */}
        <button
          onClick={() => router.push("/Clientes")}
          className="flex items-center gap-2 text-white hover:bg-[#FCA311] px-4 py-3 rounded transition"
        >
          <FaUser />
          Clientes
        </button>

        {/* Botón Ingresos */}
        <button
          onClick={() => router.push("/Ingresos-Egresos")}
          className="flex items-center gap-2 text-white hover:bg-[#FCA311] px-4 py-3 rounded transition"
        >
          <FaDollarSign />
          Ingresos
        </button>

        {/* Botón Archivados */}
        <button
          onClick={() => router.push("/archivados")}
          className="flex items-center gap-2 text-white hover:bg-[#FCA311] px-4 py-3 rounded transition"
        >
          <FaFolderOpen />
          Archivados
        </button>
      </div>

      {/* Contenido */}
      <div className="flex-1 p-8">
        {/* Encabezado */}
        <div className="flex justify-between items-center bg-white p-4 shadow rounded-lg">
          <h2 className="text-2xl font-bold text-[#14213D]">Clientes</h2>
          <div className="relative flex items-center gap-4">
            <p className="text-lg font-semibold text-[#14213D]">{userName}</p>
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsModalOpen(!isModalOpen)}
                className="w-10 h-10 flex items-center justify-center bg-gray-300 rounded-full"
              >
                <FaUser size={20} />
              </button>
              {isModalOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-lg p-2">
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-200 rounded-lg"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Perfil del Cliente */}
        {cliente && (
          <div className="bg-white border-2 border-[#FCA311] p-6 mt-6 rounded-lg shadow">
            <div className="grid grid-cols-2 gap-4 text-[#14213D]">
              <div><strong>Nombre:</strong> {cliente.Nombre}</div>
              <div><strong>RFC:</strong> {cliente.RFC}</div>
              <div><strong>Correo electrónico:</strong> {cliente.Correo}</div>
              <div><strong>Teléfono:</strong> {cliente.Telefono}</div>
            </div>
          </div>
        )}

        {/* Subida de XML */}
        <div className="bg-white p-6 rounded-lg shadow mt-6">
          <h3 className="text-xl font-bold text-[#FCA311]">Subir Facturas (XML)</h3>
          <input type="file" className="w-full mt-4 border p-2 rounded" multiple accept=".xml" onChange={handleFileChange} />

          {/* Mostrar archivos seleccionados */}
          {xmlFiles.length > 0 && (
            <div className="mt-2 p-2 bg-gray-100 border rounded">
              <p className="text-sm font-semibold">Archivos seleccionados:</p>
              <ul className="list-disc ml-4 text-sm">
                {xmlFiles.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}

          <button onClick={handleUploadFactura} className="bg-[#FCA311] text-white px-6 py-2 rounded mt-4">
            Subir Facturas
          </button>
        </div>

        {/* Tabla de Facturas */}
        <div className="bg-white p-6 rounded-lg shadow mt-6">
          <h3 className="text-xl font-bold text-[#14213D]">Listado de Facturas</h3>
          <div className="overflow-x-auto">
            <table className="w-full mt-4 border-collapse">
              <thead>
                <tr className="bg-[#FCA311] text-white">
                  <th className="p-2">RFC Emisor</th>
                  <th className="p-2">Total</th>
                  <th className="p-2">Tipo</th>
                  <th className="p-2">UUID</th>
                  <th className="p-2">Fecha</th>
                  <th className="p-2">Estatus</th>
                  <th className="p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {facturas.map((factura) => (
                  <tr key={factura.FacturaID} className="border-b hover:bg-gray-100">
                    <td className="p-2">{factura.RFCEmisor}</td>
                    <td className="p-2">${factura.Total.toFixed(2)}</td>
                    <td className="p-2">{factura.Tipo}</td>
                    <td className="p-2">{factura.UUID}</td>
                    <td className="p-2">{new Date(factura.FechaEmision).toLocaleDateString()}</td>
                    <td className={`p-2 font-semibold 
                ${factura.Estatus === "Cancelada" ? "text-red-600" :
                        factura.Estatus === "Pendiente" ? "text-yellow-600" : "text-green-600"}`}>
                      {factura.Estatus}
                    </td>
                    {/* Agregar select para cambiar el estatus */}
                    <td className="p-2">
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
        </div>

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

        {/* Modal de confirmación de cierre de sesión */}
        {showLogoutModal && (
          <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-md w-96">
              <h3 className="text-lg font-semibold text-[#14213D]">¿Seguro que quieres cerrar sesión?</h3>
              <div className="mt-4 flex justify-end gap-4">
                <button onClick={() => setShowLogoutModal(false)} className="px-4 py-2 bg-gray-400 text-white rounded">
                  Cancelar
                </button>
                <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded">
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mostrar error si hay uno */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

      </div>
    </div>
  );
};

export default ClienteDashboard;
