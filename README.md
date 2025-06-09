# Huasi Home - Guía de Instalación y Entorno de Desarrollo

Este proyecto utiliza Node.js v22.12.0, React, Vite y TailwindCSS. Sigue estos pasos para configurar tu ambiente de desarrollo desde cero.

## Requisitos previos

- **Node.js 22.12.0** (o compatible con la versión especificada en `package.json`)
- **npm** (incluido con Node.js)

## Pasos para instalar y ejecutar el proyecto

1. **Clona el repositorio o descarga el proyecto**

   Si aún no tienes el proyecto en tu máquina, clónalo o descomprímelo en tu carpeta de preferencia.
   https://github.com/Rodri-Paredes/HuasiHome.git

2. **Instala las dependencias**

   Abre una terminal en la carpeta raíz del proyecto y ejecuta:

   ```sh
   npm install
   ```

3. **Configura las variables de entorno (si aplica)**

   Si el proyecto requiere variables de entorno (por ejemplo, para Firebase), crea un archivo `.env` en la raíz y agrega las variables necesarias. Consulta la documentación interna o pide a tu equipo los valores requeridos.

4. **Ejecuta el servidor de desarrollo**

   ```sh
   npm run dev
   ```

   Esto iniciará la aplicación en modo desarrollo. Usualmente estará disponible en `http://localhost:5173` o el puerto que indique la terminal.

5. **Comandos útiles**

   - `npm run dev`: Inicia el servidor de desarrollo.
   - `npm run build`: Genera la versión de producción en la carpeta `dist`.
   - `npm run preview`: Previsualiza la build de producción localmente.
   - `npm run lint`: Ejecuta el linter para revisar el código.

6. **Notas adicionales**

   - Si tienes problemas con la versión de Node.js, usa [nvm](https://github.com/nvm-sh/nvm) o [nvm-windows](https://github.com/coreybutler/nvm-windows) para cambiar de versión fácilmente.
   - Asegúrate de tener conexión a internet para instalar dependencias y usar mapas.

---


