import { exec } from "child_process";
import path from "path";
import fs from "fs";

// Rutas físicas apuntando a la carpeta public del frontend
const FRONTEND_PUBLIC_PATH = path.resolve(
  process.cwd(),
  "../frontend/public/respaldosBD",
);
const FILE_NAME = "respaldo_data_sistema.sql";
const FULL_PATH = path.join(FRONTEND_PUBLIC_PATH, FILE_NAME);

/**
 * Helper para extraer las credenciales desde la URL de Prisma de forma segura
 */
function obtenerCredencialesBD() {
  const urlConexion = process.env.DATABASE_URL;
  if (!urlConexion)
    throw new Error("La variable DATABASE_URL no está configurada en el .env");

  // Formato esperado: mysql://user:password@host:port/database
  const estructura = urlConexion.replace("mysql://", "");
  const [usuarioPassword, hostPuertoBase] = estructura.split("@");
  const [usuario, password] = usuarioPassword.split(":");
  const [hostPuerto, baseDatos] = hostPuertoBase.split("/");

  const [host, puerto] = hostPuerto.includes(":")
    ? hostPuerto.split(":")
    : [hostPuerto, "3306"];

  return { usuario, password, host, puerto, baseDatos };
}

/**
 * RESPALDO: Genera una foto instantánea SÓLO DE LA DATA (Registros)
 */
export async function crearRespaldo() {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(FRONTEND_PUBLIC_PATH)) {
      fs.mkdirSync(FRONTEND_PUBLIC_PATH, { recursive: true });
    }

    const { usuario, password, host, puerto, baseDatos } =
      obtenerCredencialesBD();

    // RUTA EXACTA PARA WAMPSERVER
    const rutaMysqldump = `"C:\\wamp64\\bin\\mysql\\mysql8.4.7\\bin\\mysqldump.exe"`;

    // CAMBIO AQUÍ: Se añade la bandera --column-statistics=0 para evitar el error 1109
    const comando = `${rutaMysqldump} -h ${host} -P ${puerto} -u ${usuario} -p"${password}" --column-statistics=0 --no-create-info --complete-insert ${baseDatos} > "${FULL_PATH}"`;

    exec(comando, (error, stdout, stderr) => {
      if (error) {
        console.error("Error detallado en WampServer mysqldump:", stderr);
        return reject(
          new Error("No se pudo generar la foto instantánea de los datos"),
        );
      }

      resolve({
        nombreArchivo: FILE_NAME,
        ruta: `/respaldosBD/${FILE_NAME}`,
        fechaGeneracion: new Date(),
      });
    });
  });
}

/**
 * RESTAURACIÓN: Inyecta la data usando el cliente de WampServer
 */
export async function restaurarSistema() {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(FULL_PATH)) {
      return reject(
        new Error("No se encontró el archivo de respaldo de datos"),
      );
    }

    const { usuario, password, host, puerto, baseDatos } =
      obtenerCredencialesBD();

    // RUTA EXACTA DEL CLIENTE MYSQL EN WAMPSERVER (Se añade la extensión .exe por buena práctica en Windows)
    const rutaMysql = `"C:\\wamp64\\bin\\mysql\\mysql8.0.26\\bin\\mysql.exe"`;

    const comando = `${rutaMysql} -h ${host} -P ${puerto} -u ${usuario} -p"${password}" ${baseDatos} < "${FULL_PATH}"`;

    exec(comando, (error, stdout, stderr) => {
      if (error) {
        console.error("Error detallado en WampServer restauración:", stderr);
        return reject(new Error("Error crítico al restaurar la data"));
      }

      resolve({
        restaurado: true,
        fechaRestauracion: new Date(),
      });
    });
  });
}
