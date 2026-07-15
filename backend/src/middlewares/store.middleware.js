import { prisma } from "../config/prisma.js";
export const storeMiddleware = async (req, res, next) => {
  const tiendaId = Number(req.headers["x-tienda-id"]);
  if (!tiendaId) {
    return res.status(400).json({
      success: false,
      message: "Debe indicar la tienda",
    });
  }
  const acceso = await prisma.usuarioTienda.findFirst({
    where: {
      usuarioId: req.user.id,
      tiendaId,
      estado: true,
    },
    include: {
      tienda: true,
    },
  });
  if (!acceso) {
    return res.status(403).json({
      success: false,
      message: "No tiene acceso a esta tienda",
    });
  }
  req.store = acceso.tienda;
  next();
};
