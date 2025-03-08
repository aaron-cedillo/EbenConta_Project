"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { logoutUser, getUserName } from "@/app/services/authService";
import axios from "axios";

interface Alerta {
  AlertaID: number;
  Tipo: string;
  FechaVencimiento: string;
  Estado: string;
  NombreClientes: string;
}

export default function ContadorDashboard() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [clienteNombre, setClienteNombre] = useState("");  // Nueva variable para el nombre manual
  const [tipo, setTipo] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [estado, setEstado] = useState("Pendiente");

  // Estado para el modal de confirmación de edición
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [alertaSeleccionada, setAlertaSeleccionada] = useState<Alerta | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    const storedUserName = getUserName();
    setUserName(storedUserName);
  }, []);

  const handleLogout = () => {
    logoutUser();
    router.push("/login");
  };

  // Función para obtener las alertas
  const obtenerAlertas = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get('http://localhost:3001/api/alertas', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAlertas(response.data);  // Actualiza el estado con las alertas
    } catch (error) {
      console.error("Error al obtener las alertas", error);
    }
  };

  // Llama a obtenerAlertas cuando el componente se monta
  useEffect(() => {
    obtenerAlertas();
  }, []);

  const handleAgregarAlerta = async () => {
    if (!clienteNombre || !tipo || !fechaVencimiento) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3001/api/alertas",
        {
          NombreClientes: clienteNombre, // Usamos el nombre manual del cliente
          Tipo: tipo,
          FechaVencimiento: fechaVencimiento,
          Estado: estado,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Alerta agregada correctamente");
      setClienteNombre("");  // Limpiar el campo de nombre
      setTipo("");
      setFechaVencimiento("");
      setEstado("Pendiente");

      // Actualizar las alertas
      const res = await axios.get("http://localhost:3001/api/alertas", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAlertas(res.data);
    } catch (error) {
      console.error("Error al agregar alerta:", error);
      alert("Hubo un error al agregar la alerta.");
    }
  };

  const handleEliminarAlerta = async (alertaID: number) => {
    const token = localStorage.getItem("token");

    try {
      await axios.delete(`http://localhost:3001/api/alertas/${alertaID}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setIsDeleteModalOpen(false);
      setAlertaSeleccionada(null);
      alert("Alerta eliminada correctamente");

      // Actualizar las alertas
      const res = await axios.get("http://localhost:3001/api/alertas", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAlertas(res.data);
    } catch (error) {
      console.error("Error al eliminar alerta:", error);
      alert("Hubo un error al eliminar la alerta.");
    }
  };

  const confirmarEliminarAlerta = async () => {
    if (!alertaSeleccionada) return; // Si no hay alerta seleccionada, salir
  
    await handleEliminarAlerta(alertaSeleccionada.AlertaID);
  };

  const handleEditarEstado = async (alertaID: number, nuevoEstado: string) => {
    const token = localStorage.getItem("token");

    try {
      await axios.put(
        `http://localhost:3001/api/alertas/${alertaID}/estado`, // CORREGIDA
        { Estado: nuevoEstado },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Estado de alerta actualizado");
      setIsEditModalOpen(false);
      setAlertaSeleccionada(null);

      // Actualizar la lista de alertas
      const res = await axios.get("http://localhost:3001/api/alertas", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAlertas(res.data);
    } catch (error) {
      console.error("Error al editar estado de alerta:", error);
      alert("Hubo un error al actualizar el estado de la alerta.");
    }
  };

  if (!userName) {
    return <div className="flex items-center justify-center min-h-screen text-xl">Cargando...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#14213D] p-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center px-8 py-4 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-semibold text-[#14213D]">Bienvenido, {userName}</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#E63946] text-white font-semibold rounded-lg hover:bg-[#D62839] transition"
        >
          Cerrar Sesión
        </button>
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-center gap-6 mt-6">
        <button
          onClick={() => router.push("/Clientes")}
          className="px-4 py-2 bg-[#FCA311] text-white rounded-lg hover:bg-[#E08E00] transition"
        >
          Clientes
        </button>
        <button
          onClick={() => router.push("/Ingresos-Egresos")}
          className="px-4 py-2 bg-[#4CAF50] text-white rounded-lg hover:bg-[#388E3C] transition"
        >
          Ingresos y Egresos
        </button>
        <button
          onClick={() => router.push("/archivados")}
          className="px-4 py-2 bg-[#6C757D] text-white rounded-lg hover:bg-[#495057] transition"
        >
          Archivados
        </button>
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col items-center mt-6 gap-6">
        {/* Formulario para agregar alertas */}
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
          <h2 className="text-xl font-semibold text-[#14213D] mb-4">Agregar Alerta</h2>

          {/* Nombre del Cliente */}
          <div className="mb-4">
            <label className="block text-[#14213D] font-medium">Nombre del Cliente</label>
            <input
              type="text"
              value={clienteNombre}
              onChange={(e) => setClienteNombre(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FCA311] text-[#14213D]"
              placeholder="Ejemplo: Juan Pérez"
            />
          </div>

          {/* Tipo de Alerta */}
          <div className="mb-4">
            <label className="block text-[#14213D] font-medium">Tipo de Alerta</label>
            <input
              type="text"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FCA311] text-[#14213D]"
              placeholder="Ejemplo: Vencimiento Impuestos"
            />
          </div>

          {/* Fecha de Vencimiento */}
          <div className="mb-4">
            <label className="block text-[#14213D] font-medium">Fecha de Vencimiento</label>
            <input
              type="date"
              value={fechaVencimiento}
              onChange={(e) => setFechaVencimiento(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FCA311] text-[#14213D]"
            />
          </div>

          {/* Estado de la Alerta */}
          <div className="mb-4">
            <label className="block text-[#14213D] font-medium">Estado</label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FCA311] text-[#14213D]"
            >
              <option value="Pendiente">Pendiente</option>
              <option value="Atendida">Atendida</option>
            </select>
          </div>

          {/* Botón para agregar alerta */}
          <button
            onClick={handleAgregarAlerta}
            className="w-full px-4 py-2 bg-[#FCA311] text-white rounded-lg hover:bg-[#E08E00] transition"
          >
            Agregar Alerta
          </button>
        </div>

        {/* Mostrar alertas */}
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl mt-6">
          <h2 className="text-xl font-semibold text-[#14213D] mb-4">Mis Alertas</h2>
          <div>
            {alertas.length === 0 ? (
              <p className="text-gray-500">No tienes alertas creadas.</p>
            ) : (
              <ul>
                {alertas.map((alerta) => (
                  <li key={alerta.AlertaID} className="flex justify-between items-center py-2 border-b">
                    <div className="text-[#14213D]">
                      <strong>{alerta.Tipo}</strong> - {alerta.NombreClientes} <br />
                      <span className="text-gray-500">Fecha de vencimiento: {alerta.FechaVencimiento}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {alerta.Estado === "Pendiente" ? (
                        <button
                          onClick={() => {
                            setAlertaSeleccionada(alerta);
                            setIsEditModalOpen(true);
                          }}
                          className="px-3 py-1 bg-[#FCA311] text-white rounded-lg hover:bg-[#E08E00] transition"
                        >
                          Pendiente
                        </button>
                      ) : (
                        <span className="px-3 py-1 bg-[#2D6A4F] text-white rounded-lg">
                          Atendida
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setAlertaSeleccionada(alerta);
                          setIsDeleteModalOpen(true);
                        }}
                        className="px-3 py-1 bg-[#D00000] text-white rounded-lg hover:bg-[#A00000] transition"
                      >
                        Eliminar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {isDeleteModalOpen && alertaSeleccionada && (
        <div className="fixed inset-0 flex justify-center items-center bg-[#14213D] bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg border-2 border-[#FCA311]">
            <h3 className="text-lg font-semibold text-[#14213D]">Confirmar Eliminación</h3>
            <p className="mt-2 text-[#14213D]">
              ¿Estás seguro de que deseas eliminar la alerta de <strong>{alertaSeleccionada.Tipo}</strong>
              de <strong>{alertaSeleccionada.NombreClientes}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="mt-4 flex justify-end gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-[#6C757D] text-white rounded-lg hover:bg-[#545B62] transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminarAlerta}
                className="px-4 py-2 bg-[#D62828] text-white rounded-lg hover:bg-[#A12020] transition"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de edición */}
      {isEditModalOpen && alertaSeleccionada && (
        <div className="fixed inset-0 flex justify-center items-center bg-[#14213D] bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg border-2 border-[#FCA311]">
            <h3 className="text-lg font-semibold text-[#14213D]">Confirmar Cambio de Estado</h3>
            <p className="mt-2 text-[#14213D]">
              ¿Estás seguro de que deseas marcar la alerta de <strong>{alertaSeleccionada.Tipo}</strong>
              de <strong>{alertaSeleccionada.NombreClientes}</strong> como &quot;Atendida&quot;?
            </p>
            <div className="mt-4 flex justify-end gap-4">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-[#6C757D] text-white rounded-lg hover:bg-[#545B62] transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleEditarEstado(alertaSeleccionada.AlertaID, "Atendida")}
                className="px-4 py-2 bg-[#2D6A4F] text-white rounded-lg hover:bg-[#1B4332] transition"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de confirmación de cierre de sesión */}
      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-[#14213D] bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg border-2 border-[#FCA311]">
            <h3 className="text-lg font-semibold text-[#14213D]">¿Seguro que quieres cerrar sesión?</h3>
            <p className="mt-2 text-[#14213D]">Se cerrará tu sesión y deberás volver a iniciar sesión para acceder.</p>
            <div className="mt-4 flex justify-end gap-4">
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
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
