El frontend está desarrollado en Next.js con React y estilizado con Tailwind CSS. También se utilizan otras bibliotecas para manejar solicitudes HTTP, autenticación y manipulación de archivos.

📦 Dependencias principales
Next.js → next@15.1.6
React → react@19.0.0
React DOM → react-dom@19.0.0
Tailwind CSS → tailwindcss@3.4.17
Axios (Para peticiones HTTP) → axios@1.7.9 → npm install axios
React Icons (Para iconos en la interfaz) → react-icons@5.5.0 → npm install react-icons
XLSX (Para exportar archivos Excel) → xlsx@0.18.5

🔐 Autenticación
NextAuth.js (Manejo de autenticación) → next-auth@4.24.11
bcrypt (Para encriptar contraseñas) → bcrypt@5.1.1

🔍 Herramientas de desarrollo
TypeScript → typescript@5.7.3
ESLint (Linting y buenas prácticas) → eslint@9.18.0
ESLint Config Next → eslint-config-next@15.1.6
PostCSS y Autoprefixer (Optimización de CSS) → postcss@8.5.2, autoprefixer@10.4.20

📂 Estructura del proyecto
📁 Frontend (ebenconta/)
/src/app/Admindashboard/ → Panel de administración
/src/app/ContadorDashboard/ → Panel de contadores
/src/app/components/ → Componentes reutilizables
/src/app/services/ → Lógica de autenticación y peticiones API
/src/app/utils/ → Middleware de protección de rutas

📌 Funcionalidades del proyecto
✅ Administradores:
✔️ Gestionar contadores (crear, editar, eliminar).
✔️ Ver lista de contadores con su fecha de expiración.

✅ Contadores:
✔️ Gestionar clientes (crear, editar, eliminar, subir XML).
✔️ Ver facturas y exportarlas a Excel.
✔️ Recibir alertas de vencimiento.

✅ Autenticación:
✔️ Inicio de sesión con JWT.
✔️ Sesión expira tras 1 hora de inactividad.
✔️ La sesión se mantiene activa si el usuario está en uso.

📌 Ejecución
Npm run dev → Ejecución de app
