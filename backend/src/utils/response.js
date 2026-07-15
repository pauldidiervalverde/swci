export const successResponse = (
  res,
  data = null,
  message = "Operación exitosa",
) => {
  return res.status(200).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (res, message = "Error interno", status = 500) => {
  return res.status(status).json({
    success: false,
    message,
  });
};
