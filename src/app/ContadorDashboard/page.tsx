'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserName } from '../services/authService'; 

const ContadorDashboard = () => {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const storedUserName = getUserName(); // Recuperamos el nombre de usuario
    if (storedUserName) {
      setUserName(storedUserName);
    } else {
      router.push('/login'); // Si no hay usuario logueado, redirigimos al login
    }
  }, [router]); // Agregar router como dependencia

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmarLogout = () => {
    // Limpiamos el almacenamiento local o el contexto global (dependiendo de tu implementación)
    localStorage.removeItem('userName');
    router.push('/login');
  };

  const cancelarLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className="p-6 bg-gray-50">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">{`Bienvenido, ${userName || 'Cargando...'}`}</h2>
        <button
          onClick={handleLogout}
          className="text-red-500 font-semibold hover:text-red-600 focus:ring-2 focus:ring-red-500"
        >
          Cerrar sesión
        </button>
      </div>

      {/* Aquí puedes agregar más contenido para el contador */}
      <div className="mb-6">
        <h3 className="text-xl text-gray-700">Panel del Contador</h3>
        {/* Otros componentes o información del contador */}
      </div>

      {/* Modal para confirmar cierre de sesión */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-600 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold">¿Estás seguro que deseas cerrar sesión?</h3>
            <div className="flex justify-between mt-4">
              <button onClick={cancelarLogout} className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600">
                Cancelar
              </button>
              <button onClick={confirmarLogout} className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600">
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContadorDashboard;
