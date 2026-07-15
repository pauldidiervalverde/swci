export const roleMiddleware =
  (...rolesPermitidos) =>
  (req, res, next) => {
    const rol = req.user.rol;

    if (!rolesPermitidos.includes(rol)) {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado",
      });
    }

    next();
  };
