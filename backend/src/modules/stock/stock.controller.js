import { obtenerStockSchema } from "./stock.validation.js";
import { obtenerStockProducto } from "./stock.service.js";

export async function obtenerStock(req, res) {
  try {
    const { productoId } = obtenerStockSchema.parse(req.params);

    const producto = await obtenerStockProducto(productoId);

    res.json({
      success: true,
      data: producto,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}
