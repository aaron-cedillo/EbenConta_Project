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
    <div className="min-h-screen flex flex-col bg-gray-100 p-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center px-8 py-4 bg-white shadow-md">
        <h1 className="text-2xl font-semibold text-gray-800">Bienvenido, {userName}</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Cerrar Sesión
        </button>
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-center gap-6 mt-6">
        <button
          onClick={() => router.push("/clientes")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Clientes
        </button>
        <button
          onClick={() => router.push("/ingresos-egresos")}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Ingresos y Egresos
        </button>
        <button
          onClick={() => router.push("/archivados")}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
        >
          Archivados
        </button>
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col items-center mt-6 gap-6">
        {/* Formulario para agregar alertas */}
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
          <h2 className="text-xl font-semibold mb-4">Agregar Alerta</h2>

          {/* Nombre del Cliente */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium">Nombre del Cliente</label>
            <input
              type="text"
              value={clienteNombre}
              onChange={(e) => setClienteNombre(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Ejemplo: Juan Pérez"
            />
          </div>

          {/* Tipo de Alerta */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium">Tipo de Alerta</label>
            <input
              type="text"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Ejemplo: Vencimiento Impuestos"
            />
          </div>

          {/* Fecha de Vencimiento */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium">Fecha de Vencimiento</label>
            <input
              type="date"
              value={fechaVencimiento}
              onChange={(e) => setFechaVencimiento(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>

          {/* Estado de la Alerta */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium">Estado</label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="Pendiente">Pendiente</option>
              <option value="Atendida">Atendida</option>
            </select>
          </div>

          {/* Botón para agregar alerta */}
          <button
            onClick={handleAgregarAlerta}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Agregar Alerta
          </button>
        </div>

        {/* Mostrar alertas */}
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl mt-6">
          <h2 className="text-xl font-semibold mb-4">Mis Alertas</h2>
          <div>
            {alertas.length === 0 ? (
              <p>No tienes alertas creadas.</p>
            ) : (
              <ul>
                {alertas.map((alerta) => (
                  <li key={alerta.AlertaID} className="flex justify-between items-center py-2 border-b">
                    <div>
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
                          className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                        >
                          Pendiente
                        </button>
                      ) : (
                        <span className="px-3 py-1 bg-green-500 text-white rounded-lg">
                          Atendida
                        </span>
                      )}
                      <button
                        onClick={() => handleEliminarAlerta(alerta.AlertaID)}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
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

      {/* Modal de confirmación de edición */}
      {isEditModalOpen && alertaSeleccionada && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold">Confirmar Cambio de Estado</h3>
            <p className="mt-2">
              ¿Estás seguro de que deseas marcar la alerta de <strong>{alertaSeleccionada.Tipo}</strong> 
              de <strong>{alertaSeleccionada.NombreClientes}</strong> como &quot;Atendida&quot;?
            </p>
            <div className="mt-4 flex justify-end gap-4">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleEditarEstado(alertaSeleccionada.AlertaID, "Atendida")}
                className="px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de cierre de sesión */}
      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold">¿Seguro que quieres cerrar sesión?</h3>
            <div className="mt-4 flex justify-end gap-4">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-500 text-white rounded-lg">Cancelar</button>
              <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
