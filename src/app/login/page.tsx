"use client";
import React, { useState } from 'react';
import { loginUser } from '../services/authService';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await loginUser(email, password);
      console.log('Login exitoso:', response.token);
    } catch {
      setErrorMessage('No se pudo iniciar sesión. Verifica tus credenciales.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#14213D]">
      {/* Mensaje de bienvenida */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white">
          Bienvenido a <span className="text-white">eben</span><span className="text-[#FCA311]">Conta</span>
        </h1>
      </div>

      {/* Formulario de inicio de sesión */}
      <div className="bg-[#E5E5E5] p-8 rounded-xl shadow-xl max-w-sm w-full">
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
              className="mt-2 p-3 w-full border border-gray-400 rounded-lg focus:ring-2 focus:ring-[#FCA311] outline-none text-black"
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
              className="mt-2 p-3 w-full border border-gray-400 rounded-lg focus:ring-2 focus:ring-[#FCA311] outline-none text-black"
            />
          </div>

          {errorMessage && (
            <p className="text-red-500 text-sm text-center mb-4">{errorMessage}</p>
          )}

          <button
            type="submit"
            className="w-full bg-[#FCA311] text-white py-3 rounded-lg hover:bg-[#E68A00] transition-all font-bold"
          >
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
