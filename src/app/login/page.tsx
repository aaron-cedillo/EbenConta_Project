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
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Correo electrónico"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          required
        />
        {errorMessage && <p>{errorMessage}</p>}
        <button type="submit">Iniciar sesión</button>
      </form>
    </div>
  );
};

export default LoginPage;
