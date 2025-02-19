'use client';
import React, { useState } from 'react';
import { loginUser } from '../services/authService';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Llamamos a la función loginUser que hemos creado
      const response = await loginUser(email, password);

      // Si el login es exitoso, aquí podemos redirigir al usuario o mostrar algo
      console.log('Login exitoso:', response.token);
      // Redirigir o actualizar el estado de la app
    } catch {
      setErrorMessage('No se pudo iniciar sesión. Verifica tus credenciales.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {/* Mensaje de bienvenida */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Bienvenido a EbenConta</h1>
      </div>

      {/* Formulario de inicio de sesión */}
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Iniciar sesión</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Introduce tu correo"
              required
              className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Introduce tu contraseña"
              required
              className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {errorMessage && (
            <p className="text-red-500 text-sm text-center mb-4">{errorMessage}</p>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-500 text-white py-3 rounded-md hover:bg-indigo-600 focus:ring-2 focus:ring-indigo-500"
          >
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
