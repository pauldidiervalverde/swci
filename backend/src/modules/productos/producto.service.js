import { prisma } from "../../config/prisma.js";
import { generarSku } from "../../utils/generarSku.js";
import { normalizarTexto } from "../../utils/normalizar.js";

const INCLUDE_RELATIONS = { categoria: true, marca: true, tienda: true };

export async function obtenerProductos({
  search = "",
  color = "",
  tiendaId,
  categoriaId,
  marcaId,
  page = 1,
}) {
  const take = 1000; // Bloques fijos de 100 productos
  const skip = (Number(page) - 1) * take;

  // Construimos el filtro dinámico
  const donde = {
    tiendaId,
    estado: true, // Si solo quieres listar activos, si no, puedes quitarlo
    OR: [
      { descripcion: { contains: search } },
      { color: { contains: search } },
      { sku: { contains: search } },
    ],
  };

  // SI EL USUARIO NO SELECCIONA NADA, no entrará en estos 'if' y Prisma ignorará el filtro
  if (categoriaId) {
    donde.categoriaId = Number(categoriaId);
  }

  if (marcaId) {
    donde.marcaId = Number(marcaId);
  }
  if (color) {
    donde.color = {
      contains: color.toUpperCase(),
    };
  }

  // Ejecutamos la consulta de productos y el conteo total en paralelo para maximizar velocidad
  const [productos, total] = await Promise.all([
    prisma.producto.findMany({
      where: donde,
      include: INCLUDE_RELATIONS,
      // Ordenamos primero por los códigos más altos (últimos registrados)
      orderBy: [{ codigo: "desc" }],
      skip,
      take,
    }),
    prisma.producto.count({ where: donde }),
  ]);

  return {
    productos,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / take),
  };
}

export async function obtenerProductoPorId(id, tiendaId) {
  const producto = await prisma.producto.findFirst({
    where: { id, tiendaId },
    include: INCLUDE_RELATIONS,
  });
  if (!producto) throw new Error("El producto no existe");
  return producto;
}

export async function crearProducto(data, store) {
  const categoria = await prisma.categoria.findFirst({
    where: { id: data.categoriaId, tiendaId: store.id },
  });
  if (!categoria) throw new Error("La categoría no existe");
  const marca = await prisma.marca.findFirst({
    where: { id: data.marcaId, tiendaId: store.id },
  });
  if (!marca) throw new Error("La marca no existe");
  const [descripcion, color, tallas] = [
    normalizarTexto(data.descripcion),
    normalizarTexto(data.color),
    normalizarTexto(data.tallas),
  ];
  await validarProductoDuplicado({
    tiendaId: store.id,
    categoriaId: data.categoriaId,
    marcaId: data.marcaId,
    codigo: data.codigo,
    descripcion,
    color,
    tallas,
  });

  const existeCodigo = await prisma.producto.findFirst({
    where: {
      tiendaId: store.id,
      categoriaId: data.categoriaId,
      codigo: data.codigo,
    },
  });
  if (existeCodigo)
    throw new Error(`El código ${data.codigo} ya existe en esta categoría`);

  const sku = generarSku(store.abreviatura, data.categoriaId, data.codigo);

  const existeSku = await prisma.producto.findUnique({ where: { sku } });
  if (existeSku) throw new Error(`El SKU ${sku} ya existe`);
  return prisma.producto.create({
    data: {
      tiendaId: store.id,
      categoriaId: data.categoriaId,
      marcaId: data.marcaId,
      codigo: data.codigo,
      sku,
      descripcion: data.descripcion.trim().toUpperCase(),
      color: data.color.trim().toUpperCase(),
      unidad: "PIEZA",
      tallas: data.tallas.trim().toUpperCase(),
      piezas: data.piezas,
      precioVenta: data.precioVenta,
      stockActual: data.stockActual,
      stockMinimo: data.stockMinimo,
      observacion: data.observacion,
      estado: true,
    },
  });
}

export async function actualizarProducto(id, data, store) {
  const producto = await prisma.producto.findFirst({
    where: { id, tiendaId: store.id },
  });
  if (!producto) throw new Error("El producto no existe");
  const marca = await prisma.marca.findFirst({
    where: { id: data.marcaId, tiendaId: store.id },
  });
  if (!marca) throw new Error("La marca no existe");
  const [descripcion, color, tallas] = [
    normalizarTexto(data.descripcion),
    normalizarTexto(data.color),
    normalizarTexto(data.tallas),
  ];
  await validarProductoDuplicado({
    tiendaId: store.id,
    categoriaId: data.categoriaId,
    marcaId: data.marcaId,
    codigo: data.codigo,
    descripcion,
    color,
    tallas,
    excluirId: id,
  });
  return prisma.producto.update({
    where: { id },
    data: {
      categoriaId: data.categoriaId,
      marcaId: data.marcaId,
      descripcion: data.descripcion.trim().toUpperCase(),
      color: data.color.trim().toUpperCase(),
      tallas: data.tallas.trim().toUpperCase(),
      piezas: data.piezas,
      precioVenta: data.precioVenta,
      stockMinimo: data.stockMinimo,
      observacion: data.observacion,
    },
  });
}
export async function cambiarEstado(id, estado, tiendaId) {
  const producto = await prisma.producto.findFirst({ where: { id, tiendaId } });
  if (!producto) throw new Error("El producto no existe");
  return prisma.producto.update({ where: { id }, data: { estado } });
}
/**
 * SIMULAR CARGA MASIVA (STAGING LOGIC)
 * Utiliza req.store para auditoría en caliente sin alterar la BD
 */
async function validarProductoDuplicado({
  tiendaId,
  categoriaId,
  marcaId,
  codigo,
  descripcion,
  color,
  tallas,
  excluirId = null,
}) {
  const producto = await prisma.producto.findFirst({
    where: {
      tiendaId,
      categoriaId,
      marcaId,
      codigo,
      descripcion,
      color,
      tallas,
      ...(excluirId && { NOT: { id: excluirId } }),
    },
  });
  if (producto)
    throw new Error(
      "Ya existe este producto registrado en esta categoría. <br>Por favor verifique: codigo, la descripción, color y talla.",
    );
}
export async function simularCargaMasiva(data, store) {
  const { categoriaId, productos } = data;
  const tiendaId = store.id;
  const abreviaturaTienda = store.abreviatura || "TIENDA";

  let totalLeidos = 0;
  let nuevos = 0;
  let existentesOmitidos = 0;
  let conflictosCriticos = 0;

  const detallesFilas = [];

  // Controles internos dentro del mismo archivo Excel
  const codigosEnEsteExcel = new Map();
  // Almacena claves de productos únicos: 'MARCA|DESCRIPCION|COLOR|TALLA' -> { codigo, linea }
  const productosEnEsteExcel = new Map();

  for (const item of productos) {
    totalLeidos++;

    const excelCodigoInt = parseInt(item.CODIGO, 10);
    const excelMarca = item.MARCA.trim().toUpperCase();
    const excelDescripcion = item.DESCRIPCION.trim().toUpperCase();
    const excelColor = normalizarTexto(item.COLOR);
    const excelTalla = item.TALLA.trim().toUpperCase();
    const excelPrecio = parseFloat(item.PRECIO) || 0;

    // =========================================================================
    // CONTROL INTERNO 1: Duplicados por CÓDIGO dentro del mismo Excel
    // =========================================================================
    if (codigosEnEsteExcel.has(excelCodigoInt)) {
      // Obtenemos los datos de la fila original donde apareció por primera vez
      const primerRegistroCodigo = codigosEnEsteExcel.get(excelCodigoInt);

      detallesFilas.push({
        linea: totalLeidos,
        codigo: excelCodigoInt,
        marca: excelMarca,
        descripcion: excelDescripcion,
        color: excelColor,
        talla: excelTalla,
        precio: excelPrecio,
        estado: "ROJO",
        motivo: `El código [${excelCodigoInt}] ya fue asignado en la fila [${primerRegistroCodigo.linea}] de este mismo Excel.`,
      });
      conflictosCriticos++;
      continue;
    }
    codigosEnEsteExcel.set(excelCodigoInt);

    // =========================================================================
    // CONTROL INTERNO 2: Duplicados por PRODUCTO FÍSICO dentro del mismo Excel
    // =========================================================================
    // Generamos una clave única combinada e independiente de los espacios
    const claveProductoUnico = `${excelCodigoInt}|${excelMarca}|${excelDescripcion}|${excelColor}|${excelTalla}`;

    if (productosEnEsteExcel.has(claveProductoUnico)) {
      const primerRegistro = productosEnEsteExcel.get(claveProductoUnico);
      detallesFilas.push({
        linea: totalLeidos,
        codigo: excelCodigoInt,
        marca: excelMarca,
        descripcion: excelDescripcion,
        color: excelColor,
        talla: excelTalla,
        precio: excelPrecio,
        estado: "ROJO",
        motivo: `Este producto ya es igual al código [${primerRegistro.codigo}] en la fila [${primerRegistro.linea}] del Excel.`,
        sku: "N/A",
      });
      conflictosCriticos++;
      continue;
    }

    // Si es la primera vez que se ve el producto físico en el Excel, lo indexamos para futuras filas
    productosEnEsteExcel.set(claveProductoUnico, {
      codigo: excelCodigoInt,
      linea: totalLeidos,
    });

    // =========================================================================
    // CONTROL EXTERNO: Validación contra los datos existentes en la Base de Datos
    // =========================================================================
    const productoBD = await prisma.producto.findFirst({
      where: {
        tiendaId,
        categoriaId,
        codigo: excelCodigoInt,
      },
      include: { marca: true },
    });

    const skuEstimado = generarSku(
      abreviaturaTienda,
      categoriaId,
      excelCodigoInt,
    );

    if (productoBD) {
      const bdMarca = normalizarTexto(productoBD.marca?.nombre || "");
      const bdDesc = normalizarTexto(productoBD.descripcion);
      const bdColor = normalizarTexto(productoBD.color);
      const bdTalla = normalizarTexto(productoBD.tallas);

      const esIdentico =
        bdMarca === normalizarTexto(excelMarca) &&
        bdDesc === normalizarTexto(excelDescripcion) &&
        bdColor === normalizarTexto(excelColor) &&
        bdTalla === normalizarTexto(excelTalla);

      if (esIdentico) {
        detallesFilas.push({
          linea: totalLeidos,
          codigo: excelCodigoInt,
          marca: excelMarca,
          descripcion: excelDescripcion,
          color: excelColor,
          talla: excelTalla,
          precio: excelPrecio,
          estado: "AMARILLO",
          motivo: "El Producto ya esta registrado",
          sku: productoBD.sku,
        });
        existentesOmitidos++;
      } else {
        detallesFilas.push({
          linea: totalLeidos,
          codigo: excelCodigoInt,
          marca: excelMarca,
          descripcion: excelDescripcion,
          color: excelColor,
          talla: excelTalla,
          precio: excelPrecio,
          estado: "ROJO",
          motivo: `El código ${productoBD.codigo} ya pertenece a otra prenda: [${productoBD.marca?.nombre} - ${productoBD.descripcion} - ${productoBD.color} - ${productoBD.tallas}].`,
          sku: "N/A",
        });
        conflictosCriticos++;
      }
    } else {
      // CONTROL EXTERNO: producto físico duplicado con otro código en la Base de Datos
      const productoDuplicado = await prisma.producto.findFirst({
        where: {
          tiendaId,
          categoriaId,
          codigo: excelCodigoInt,
          descripcion: excelDescripcion,
          color: excelColor,
          tallas: excelTalla,
          marca: {
            nombre: excelMarca,
          },
        },
        include: { marca: true },
      });

      if (productoDuplicado) {
        detallesFilas.push({
          linea: totalLeidos,
          codigo: excelCodigoInt,
          marca: excelMarca,
          descripcion: excelDescripcion,
          color: excelColor,
          talla: excelTalla,
          precio: excelPrecio,
          estado: "ROJO",
          motivo: `Este producto ya existe en el sistema con el código ${productoDuplicado.codigo}.`,
          sku: productoDuplicado.sku,
        });
        conflictosCriticos++;
      } else {
        detallesFilas.push({
          linea: totalLeidos,
          codigo: excelCodigoInt,
          marca: excelMarca,
          descripcion: excelDescripcion,
          color: excelColor,
          talla: excelTalla,
          precio: excelPrecio,
          estado: "VERDE",
          motivo: "Listo para guardar",
          sku: skuEstimado,
        });
        nuevos++;
      }
    }
  }

  return {
    totales: {
      totalLeidos,
      nuevos,
      existentesOmitidos,
      conflictosCriticos,
    },
    detallesFilas,
  };
}

/**
 * CONFIRMAR CARGA MASIVA REAL
 */
export async function confirmarCargaMasiva(data, store) {
  const { categoriaId, productos } = data;
  const tiendaId = store.id;
  const abreviaturaTienda = store.abreviatura || "TIENDA";

  let guardadosConExito = 0;

  await prisma.$transaction(async (tx) => {
    for (const prod of productos) {
      const marcaNombreNorm = prod.marca.trim().toUpperCase();

      let marca = await tx.marca.findFirst({
        where: {
          nombre: marcaNombreNorm,
          tiendaId,
        },
      });

      if (!marca) {
        marca = await tx.marca.create({
          data: {
            nombre: marcaNombreNorm,
            tiendaId,
            estado: true,
          },
        });
      }

      const codigoExistente = await tx.producto.findFirst({
        where: {
          tiendaId,
          categoriaId,
          codigo: prod.codigo,
        },
      });

      if (codigoExistente) {
        throw new Error(
          `El código ${prod.codigo} ya fue registrado durante la confirmación.`,
        );
      }

      const productoExistente = await tx.producto.findFirst({
        where: {
          tiendaId,
          categoriaId,
          marcaId: marca.id,
          codigo: prod.codigo,
          descripcion: prod.descripcion.trim().toUpperCase(),
          color: prod.color.trim().toUpperCase(),
          tallas: prod.talla.trim().toUpperCase(),
        },
      });

      if (productoExistente) {
        throw new Error(
          `El producto ${prod.codigo} ${prod.descripcion} (${prod.color} - ${prod.talla}) ya existe con el código ${productoExistente.codigo}.`,
        );
      }

      const skuFinal = generarSku(abreviaturaTienda, categoriaId, prod.codigo);

      await tx.producto.create({
        data: {
          tiendaId,
          categoriaId,
          marcaId: marca.id,
          codigo: prod.codigo,
          sku: skuFinal,
          descripcion: prod.descripcion.trim().toUpperCase(),
          color: prod.color.trim().toUpperCase(),
          tallas: prod.talla.trim().toUpperCase(),
          piezas: 1,
          precioVenta: prod.precio,
          stockActual: 0,
          stockMinimo: 1,
          estado: true,
        },
      });

      guardadosConExito++;
    }
  });

  return { guardadosConExito };
}
