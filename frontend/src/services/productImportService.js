import { api } from "./api";

export const productImportService = {
  STATUS: {
    READY: "VERDE",
    DUPLICATED: "AMARILLO",
    ERROR: "ROJO",
  },

  /**
   * Verifica que las columnas requeridas existan en el archivo Excel.
   */
  validateColumns(excelData) {
    if (!excelData || excelData.length === 0) {
      throw new Error("El archivo Excel está vacío.");
    }

    // Tomamos las llaves de la primera fila y las normalizamos
    const primerasColumnas = Object.keys(excelData[0]).map((col) =>
      col.trim().toUpperCase(),
    );

    const columnasRequeridas = [
      "CODIGO",
      "MARCA",
      "DESCRIPCION",
      "COLOR",
      "TALLA",
      "PRECIO",
    ];

    // Mapeo alternativo por si usan acentos o variaciones comunes
    const verificarColumna = (req) => {
      if (req === "CODIGO")
        return (
          primerasColumnas.includes("CODIGO") ||
          primerasColumnas.includes("CÓDIGO")
        );
      if (req === "DESCRIPCION")
        return (
          primerasColumnas.includes("DESCRIPCION") ||
          primerasColumnas.includes("DESCRIPCIÓN")
        );
      if (req === "PRECIO")
        return (
          primerasColumnas.includes("PRECIO") ||
          primerasColumnas.includes("PRECIO VENTA")
        );
      if (req === "TALLA")
        return (
          primerasColumnas.includes("TALLA") ||
          primerasColumnas.includes("TALLAS")
        );
      return primerasColumnas.includes(req);
    };

    const faltantes = columnasRequeridas.filter(
      (col) => !verificarColumna(col),
    );

    if (faltantes.length > 0) {
      throw new Error(
        `Al archivo Excel le faltan las siguientes columnas obligatorias: ${faltantes.join(", ")}`,
      );
    }
  },

  /**
   * Mapea las columnas del Excel hacia el formato estricto y valida la data.
   * ¡AHORA VALIDA DUPLICADOS INTERNOS CON MAPS INDICANDO LA FILA EXACTA!
   */
  transformRows(excelData, marcasDisponibles = []) {
    // Primero validamos la estructura básica de columnas
    this.validateColumns(excelData);

    const marcasSistemaSet = new Set(
      marcasDisponibles.map((m) =>
        String(m.label || m.nombre || "")
          .trim()
          .toUpperCase(),
      ),
    );

    // USAMOS MAPS: Guardan la relación (clave -> numeroDeFilaOriginal)
    const codigosEnExcel = new Map();
    const productosEnExcel = new Map();

    return excelData.map((row, index) => {
      const normalizedRow = {};
      Object.keys(row).forEach((key) => {
        normalizedRow[key.trim().toUpperCase()] = row[key];
      });

      const nroFila = index + 2; // +2 porque Excel empieza en fila 1 y la fila 1 son las cabeceras

      // 3. Extraer y limpiar valores básicos (Tipos de datos)
      const rawCodigo = normalizedRow["CODIGO"] || normalizedRow["CÓDIGO"];
      const codigo = parseInt(rawCodigo, 10);

      const marca = String(normalizedRow["MARCA"] || "")
        .trim()
        .toUpperCase();
      const descripcion = String(
        normalizedRow["DESCRIPCION"] || normalizedRow["DESCRIPCIÓN"] || "",
      )
        .trim()
        .toUpperCase();
      const color = String(normalizedRow["COLOR"] || "")
        .trim()
        .toUpperCase();
      const talla = String(
        normalizedRow["TALLA"] || normalizedRow["TALLAS"] || "",
      )
        .trim()
        .toUpperCase();

      const rawPrecio =
        normalizedRow["PRECIO"] || normalizedRow["PRECIO VENTA"];
      const precio = parseFloat(rawPrecio);

      // =========================================================================
      // REGLAS DE VALIDACIÓN ESTRICTA
      // =========================================================================

      // A) Control del Código: Debe ser un número entero y mayor a 0
      if (isNaN(codigo) || codigo <= 0) {
        throw new Error(
          `[Fila ${nroFila}] El CÓDIGO "${rawCodigo || "no existe"}". Debe ser un número entero mayor que 0.`,
        );
      }

      // B) Control de Campos Requeridos: No deben estar vacíos
      if (!marca)
        throw new Error(`[Fila ${nroFila}] La MARCA no puede estar vacía.`);
      if (!descripcion)
        throw new Error(
          `[Fila ${nroFila}] La DESCRIPCIÓN no puede estar vacía.`,
        );
      if (!color)
        throw new Error(`[Fila ${nroFila}] El COLOR no puede estar vacío.`);
      if (!talla)
        throw new Error(`[Fila ${nroFila}] La TALLA no puede estar vacía.`);

      // C) Control del Precio: Debe ser un número válido y mayor o igual a 0
      if (isNaN(precio) || precio < 0) {
        throw new Error(
          `[Fila ${nroFila}] El PRECIO "${rawPrecio || "VACÍO"}" debe ser un número válido igual o mayor a 0.`,
        );
      }

      // D) Control de Marca Existente en el Sistema
      if (!marcasSistemaSet.has(marca)) {
        throw new Error(
          `[MARCA_INEXISTENTE] La marca "${marca}" (Fila ${nroFila}) NO existe en el sistema. Debe registrarla antes de poder subir este archivo.`,
        );
      }

      // 4. Revisar CÓDIGOS duplicados en el mismo Excel
      if (codigosEnExcel.has(codigo)) {
        const filaOriginal = codigosEnExcel.get(codigo);
        throw new Error(
          `[Fila ${nroFila}] El CÓDIGO "${codigo}" está repetido dentro del propio archivo Excel con la [Fila ${filaOriginal}].`,
        );
      }
      // CORRECCIÓN: .set() en lugar de .add()
      codigosEnExcel.set(codigo, nroFila);

      // 5. Revisar PRODUCTOS duplicados en el mismo excel (marca + descripcion + color + talla)
      const productoKey = `${codigo}|${marca}|${descripcion}|${color}|${talla}`;
      if (productosEnExcel.has(productoKey)) {
        const filaOriginal = productosEnExcel.get(productoKey);
        throw new Error(
          `[Fila ${nroFila}] El producto "${codigo} - ${marca} - ${descripcion} (${color} / ${talla})" está duplicado (mismas características) dentro del propio archivo Excel con la [Fila ${filaOriginal}].`,
        );
      }
      // CORRECCIÓN: .set() en lugar de .add()
      productosEnExcel.set(productoKey, nroFila);

      return {
        CODIGO: codigo,
        MARCA: marca,
        DESCRIPCION: descripcion,
        COLOR: color,
        TALLA: talla,
        PRECIO: precio,
      };
    });
  },

  /**
   * Mapea el objeto plano mapeando tanto 'marca' como 'marcaNombre'
   */
  formatBackendRows(detallesFilas, marcasDisponibles = []) {
    return detallesFilas.map((row) => {
      const marcaEncontrada = marcasDisponibles.find(
        (m) =>
          m.label?.trim().toUpperCase() === row.marca?.trim().toUpperCase() ||
          m.nombre?.trim().toUpperCase() === row.marca?.trim().toUpperCase(),
      );

      return {
        ...row,
        status: row.estado,
        marcaId: marcaEncontrada
          ? marcaEncontrada.id || marcaEncontrada.value
          : "",
        precioVenta: row.precio,
        codigo: row.codigo,
        descripcion: row.descripcion,
        color: row.color,
        tallas: row.talla,
        observacion: row.motivo,
        selected: row.estado === "VERDE",
      };
    });
  },

  calculateSummaryFromRows(rows) {
    const summary = {
      total: rows.length,
      ready: 0,
      incomplete: 0,
      duplicated: 0,
      errors: 0,
    };
    rows.forEach((row) => {
      if (row.estado === "VERDE") summary.ready++;
      else if (row.estado === "AMARILLO") summary.duplicated++;
      else if (row.estado === "ROJO") summary.errors++;
    });
    return summary;
  },

  async simulateImport(categoriaId, productos) {
    const response = await api.post("/productos/excel/simular", {
      categoriaId: Number(categoriaId),
      productos,
    });
    return response.data;
  },

  async executeImport(categoriaId, selectedRows) {
    const productosFormateados = selectedRows.map((row) => ({
      codigo: Number(row.codigo),
      marca: row.marca || row.marcaNombre,
      descripcion: row.descripcion,
      color: row.color,
      talla: row.talla || row.tallas,
      precio: parseFloat(row.precio || row.precioVenta),
    }));

    const response = await api.post("/productos/excel/confirmar", {
      categoriaId: Number(categoriaId),
      productos: productosFormateados,
    });
    return response.data;
  },
};

export default productImportService;
