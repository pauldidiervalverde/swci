import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const nombreModulo = "Reportes Por Dia";

try {
  const resultado = await prisma.$transaction(async (tx) => {
    // 1. Buscar el módulo para obtener su ID
    const modulo = await tx.modulo.findUnique({
      where: { nombre: nombreModulo },
    });

    if (!modulo) {
      throw new Error("El módulo no existe.");
    }

    // 2. Eliminar todos los permisos asociados a ese moduloId
    await tx.permisoRol.deleteMany({
      where: { moduloId: modulo.id },
    });

    // 3. Ahora sí, eliminar el módulo de forma segura
    const moduloEliminado = await tx.modulo.delete({
      where: { id: modulo.id },
    });

    return moduloEliminado;
  });

  console.log("Módulo y sus permisos eliminados con éxito:", resultado);
} catch (error) {
  console.error("Error al eliminar el módulo:", error.message);
}
