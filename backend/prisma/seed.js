import bcrypt from "bcryptjs";
// import { PrismaClient } from "../generated/prisma/index.js";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
/* =======================================================
 * ROLES
 * ======================================================= */
async function crearRoles() {
  console.log("🌱 Roles...");
  const roles = [
    {
      nombre: "MASTER",
      descripcion: "Acceso total al sistema",
    },
    {
      nombre: "ADMIN",
      descripcion: "Administrador de tienda",
    },
    {
      nombre: "VENDEDOR",
      descripcion: "Usuario vendedor",
    },
    {
      nombre: "GERENTE",
      descripcion: "Usuario gerente administrativo",
    },
  ];
  for (const rol of roles) {
    await prisma.rol.upsert({
      where: {
        nombre: rol.nombre,
      },
      update: {
        descripcion: rol.descripcion,
      },
      create: rol,
    });
  }
  console.log("✅ Roles listos");
}
/* =======================================================
 * TIENDAS
 * ======================================================= */
async function crearTiendas() {
  console.log("🌱 Tiendas...");
  const tiendas = [
    {
      nombre: "MAGNUS",
      abreviatura: "MG",
      descripcion: "Ropa Deportiva",
      imagen: "/logostiendas/magnus.png",
    },
    {
      nombre: "ROSA NEGRA",
      abreviatura: "RN",
      descripcion: "Estilo que define tu esencia",
      imagen: "/logostiendas/rosanegra.png",
    },
  ];
  for (const tienda of tiendas) {
    await prisma.tienda.upsert({
      where: {
        nombre: tienda.nombre,
      },
      update: {
        abreviatura: tienda.abreviatura,
        descripcion: tienda.descripcion,
        imagen: tienda.imagen,
      },
      create: tienda,
    });
  }
  console.log("✅ Tiendas listas");
}
/* =======================================================
 * CATEGORIAS
 * ======================================================= */
async function crearCategorias() {
  console.log("🌱 Categorías...");
  const tiendas = await prisma.tienda.findMany({
    select: {
      id: true,
      nombre: true,
    },
  });
  const categorias = [
    {
      nombre: "HOMBRE",
      descripcion: "Ropa para hombre",
    },
    {
      nombre: "MUJER",
      descripcion: "Ropa para mujer",
    },
  ];
  for (const tienda of tiendas) {
    for (const categoria of categorias) {
      await prisma.categoria.upsert({
        where: {
          tiendaId_nombre: {
            tiendaId: tienda.id,
            nombre: categoria.nombre,
          },
        },
        update: {
          descripcion: categoria.descripcion,
        },
        create: {
          tiendaId: tienda.id,
          nombre: categoria.nombre,
          descripcion: categoria.descripcion,
        },
      });
    }
  }
  console.log("✅ Categorías listas");
}
/* =======================================================
 * TIPOS DE PAGO
 * ======================================================= */
async function crearTiposPago() {
  console.log("🌱 Tipos de pago...");
  const tiposPago = [
    {
      nombre: "EFECTIVO",
      descripcion: "Pago en efectivo",
    },
    {
      nombre: "QR",
      descripcion: "Pago mediante QR",
    },
    {
      nombre: "TRANSFERENCIA",
      descripcion: "Transferencia bancaria",
    },
    {
      nombre: "TARJETA",
      descripcion: "Pago con tarjeta",
    },
    // {
    //   nombre: "MIXTO",
    //   descripcion: "Pago combinado",
    // },
  ];
  for (const tipo of tiposPago) {
    await prisma.tipoPago.upsert({
      where: {
        nombre: tipo.nombre,
      },
      update: {
        descripcion: tipo.descripcion,
      },
      create: tipo,
    });
  }
  console.log("✅ Tipos de pago listos");
}
/* =======================================================
 * TIPOS DE MOVIMIENTO
 * ======================================================= */
async function crearTiposMovimiento() {
  console.log("🌱 Tipos de movimiento...");

  const movimientos = [
    {
      nombre: "INGRESO",
      descripcion: "Ingreso de mercadería",
      abreviatura: "ING",
      naturaleza: "ENTRADA",
    },
    {
      nombre: "VENTA",
      descripcion: "Salida por venta",
      abreviatura: "VEN",
      naturaleza: "SALIDA",
    },
    {
      nombre: "AJUSTE",
      descripcion: "Corrección manual de inventario",
      abreviatura: "AJU",
      naturaleza: "SALIDA",
    },
    {
      nombre: "DEVOLUCION",
      descripcion: "Devolución de productos",
      abreviatura: "DEV",
      naturaleza: "ENTRADA",
    },
    {
      nombre: "PROMOCION",
      descripcion: "Entrega de productos para publicidad o promoción",
      abreviatura: "PRO",
      naturaleza: "SALIDA",
    },
    {
      nombre: "INTERCAMBIO",
      descripcion: "Intercambio de servicios por productos",
      abreviatura: "INT",
      naturaleza: "SALIDA",
    },
    {
      nombre: "REGALO",
      descripcion: "Regalo de productos por lanzamientos de marca",
      abreviatura: "REG",
      naturaleza: "SALIDA",
    },
  ];

  for (const movimiento of movimientos) {
    await prisma.tipoMovimiento.upsert({
      where: {
        nombre: movimiento.nombre,
      },
      update: {
        descripcion: movimiento.descripcion,
        abreviatura: movimiento.abreviatura,
        naturaleza: movimiento.naturaleza,
      },
      create: movimiento,
    });
  }

  console.log("✅ Tipos de movimiento listos");
}
/* =======================================================
 * USUARIOS DEL SISTEMA MASTER-ADMIN-VENDEDOR
 * ======================================================= */
async function crearUsuariosSistema() {
  console.log("🌱 Creando o actualizando usuarios del sistema...");
  const password = "Clave123/*";
  const hashedPassword = await bcrypt.hash(password, 10); // =========================
  // ROLES
  // =========================
  const rolMaster = await prisma.rol.findUnique({
    where: { nombre: "MASTER" },
  });
  const rolAdmin = await prisma.rol.findUnique({
    where: { nombre: "ADMIN" },
  });
  const rolVendedor = await prisma.rol.findUnique({
    where: { nombre: "VENDEDOR" },
  });
  const rolGerente = await prisma.rol.findUnique({
    where: { nombre: "GERENTE" },
  });
  if (!rolMaster || !rolAdmin || !rolVendedor || !rolGerente) {
    throw new Error(
      "No existen todos los roles requeridos. Ejecute primero la carga de roles.",
    );
  } // =========================
  // TIENDAS
  // =========================
  const tiendaMagnus = await prisma.tienda.findUnique({
    where: {
      nombre: "MAGNUS",
    },
  });
  const tiendaRosaNegra = await prisma.tienda.findUnique({
    where: {
      nombre: "ROSA NEGRA",
    },
  });
  if (!tiendaMagnus || !tiendaRosaNegra) {
    throw new Error(
      "No existen las tiendas requeridas. Ejecute primero la carga de tiendas.",
    );
  } // =========================
  // USUARIOS
  // =========================
  const usuarios = [
    {
      nombre: "SUPER USUARIO",
      usuario: "master",
      rolId: rolMaster.id,
    },
    {
      nombre: "ADMINISTRADOR MAGNUS",
      usuario: "admin.mg",
      rolId: rolAdmin.id,
    },
    {
      nombre: "ADMINISTRADOR ROSA NEGRA",
      usuario: "admin.rn",
      rolId: rolAdmin.id,
    },
    {
      nombre: "VENDEDOR MAGNUS",
      usuario: "mg.vendedor",
      rolId: rolVendedor.id,
    },
    {
      nombre: "VENDEDOR ROSA NEGRA",
      usuario: "rn.vendedor",
      rolId: rolVendedor.id,
    },
    {
      nombre: "Lucy Rosales Warnes",
      usuario: "admin.lrosales",
      rolId: rolAdmin.id,
    },
    {
      nombre: "Rosario Daniela Aguilera Saucedo",
      usuario: "admin.rdaguilera",
      rolId: rolAdmin.id,
    },
    {
      nombre: "Gerente General",
      usuario: "gerente.gral",
      rolId: rolGerente.id,
    },
  ];
  for (const item of usuarios) {
    await prisma.usuario.upsert({
      where: {
        usuario: item.usuario,
      },
      update: {
        nombre: item.nombre,
        password: hashedPassword,
        rolId: item.rolId,
        estado: true,
      },
      create: {
        nombre: item.nombre,
        usuario: item.usuario,
        password: hashedPassword,
        rolId: item.rolId,
        estado: true,
      },
    });
  }
  console.log("✅ Usuarios creados o actualizados"); // =========================
  // RECUPERAR USUARIOS
  // =========================
  const master = await prisma.usuario.findUnique({
    where: {
      usuario: "master",
    },
  });
  const gerenteGral = await prisma.usuario.findUnique({
    where: {
      usuario: "gerente.gral",
    },
  });

  const adminMg = await prisma.usuario.findUnique({
    where: {
      //usuario: "admin.mg",
      usuario: "admin.lrosales",
    },
  });
  const adminRn = await prisma.usuario.findUnique({
    where: {
      //usuario: "admin.rn",
      usuario: "admin.rdaguilera",
    },
  });
  const vendedorMg = await prisma.usuario.findUnique({
    where: {
      usuario: "mg.vendedor",
    },
  });
  const vendedorRn = await prisma.usuario.findUnique({
    where: {
      usuario: "rn.vendedor",
    },
  }); // =========================
  // RELACIONES USUARIO-TIENDA
  // =========================
  const relaciones = [
    {
      usuarioId: master.id,
      tiendaId: tiendaMagnus.id,
    },
    {
      usuarioId: master.id,
      tiendaId: tiendaRosaNegra.id,
    },
    {
      usuarioId: gerenteGral.id,
      tiendaId: tiendaMagnus.id,
    },
    {
      usuarioId: gerenteGral.id,
      tiendaId: tiendaRosaNegra.id,
    },
    {
      usuarioId: adminMg.id,
      tiendaId: tiendaMagnus.id,
    },
    {
      usuarioId: adminRn.id,
      tiendaId: tiendaRosaNegra.id,
    },
    {
      usuarioId: vendedorMg.id,
      tiendaId: tiendaMagnus.id,
    },
    {
      usuarioId: vendedorRn.id,
      tiendaId: tiendaRosaNegra.id,
    },
  ];
  for (const relacion of relaciones) {
    const existeRelacion = await prisma.usuarioTienda.findFirst({
      where: {
        usuarioId: relacion.usuarioId,
        tiendaId: relacion.tiendaId,
      },
    });
    if (existeRelacion) {
      await prisma.usuarioTienda.update({
        where: {
          id: existeRelacion.id,
        },
        data: {
          estado: true,
        },
      });
    } else {
      await prisma.usuarioTienda.create({
        data: {
          usuarioId: relacion.usuarioId,
          tiendaId: relacion.tiendaId,
          estado: true,
        },
      });
    }
  }
  console.log("✅ Relaciones usuario-tienda listas");
  console.log("");
  console.log("USUARIOS DE PRUEBA");
  console.log("----------------------------------");
  console.log("master       / Clave123/*");
  console.log("admin.mg     / Clave123/*");
  console.log("admin.rn     / Clave123/*");
  console.log("mg.vendedor  / Clave123/*");
  console.log("rn.vendedor  / Clave123/*");
  console.log("----------------------------------");
}
async function crearModulos() {
  console.log("🌱 Módulos...");
  const modulos = [
    // DASHBOARD
    {
      nombre: "Dashboard",
      ruta: "/",
      icono: "LayoutDashboard",
      orden: 1,
      grupo: "DASHBOARD",
    },
    // CATÁLOGO
    {
      nombre: "Productos",
      ruta: "/productos",
      icono: "Package",
      orden: 2,
      grupo: "PRODUCTOS",
    },
    {
      nombre: "Categorias",
      ruta: "/categorias",
      icono: "Layers",
      orden: 3,
      grupo: "PRODUCTOS",
    },
    {
      nombre: "Marcas",
      ruta: "/marcas",
      icono: "Tags",
      orden: 4,
      grupo: "PRODUCTOS",
    }, // INVENTARIO
    {
      nombre: "Ingresos",
      ruta: "/ingresos",
      icono: "ArrowDownCircle",
      orden: 5,
      grupo: "INVENTARIO",
    },
    {
      nombre: "Existencias",
      ruta: "/existencias",
      icono: "Boxes",
      orden: 6,
      grupo: "INVENTARIO",
    },
    {
      nombre: "Kardex",
      ruta: "/kardex",
      icono: "ClipboardList",
      orden: 7,
      grupo: "INVENTARIO",
    },
    {
      nombre: "Auditoria",
      ruta: "/auditoria",
      icono: "CalendarSync",
      orden: 8,
      grupo: "INVENTARIO",
    },
    // VENTAS
    {
      nombre: "Ventas",
      ruta: "/ventas",
      icono: "ShoppingCart",
      orden: 9,
      grupo: "VENTAS",
    },
    // CLIENTES
    {
      nombre: "Clientes",
      ruta: "/clientes",
      icono: "Users",
      orden: 10,
      grupo: "VENTAS",
    }, // REPORTES
    {
      nombre: "ReportesPorDia",
      ruta: "/reportesdia",
      icono: "CalendarCheck",
      orden: 8,
      grupo: "REPORTES",
    }, // ADMIN
    {
      nombre: "Usuarios",
      ruta: "/usuarios",
      icono: "Shield",
      orden: 12,
      grupo: "ADMIN",
    },
    {
      nombre: "Roles",
      ruta: "/roles",
      icono: "KeyRound",
      orden: 13,
      grupo: "ADMIN",
    },
    {
      nombre: "Tiendas",
      ruta: "/tiendas",
      icono: "Store",
      orden: 14,
      grupo: "ADMIN",
    },
    {
      nombre: "Configuracion",
      ruta: "/configuracion",
      icono: "Settings",
      orden: 15,
      grupo: "ADMIN",
    }, // EGRESOS
    {
      nombre: "Salidas",
      ruta: "/salidas",
      icono: "Gift",
      orden: 16,
      grupo: "VENTAS",
    },
    {
      nombre: "ReportesPorMes",
      ruta: "/reportesmes",
      icono: "CalendarSearch",
      orden: 17,
      grupo: "REPORTES",
    },
  ];
  for (const modulo of modulos) {
    await prisma.modulo.upsert({
      where: {
        nombre: modulo.nombre,
      },
      update: modulo,
      create: modulo,
    });
  }
  console.log("✅ Módulos listos");
}
/* =======================================================
 * PERMISOS POR ROL
 * ======================================================= */
async function crearPermisosRoles() {
  console.log("🌱 Permisos por rol...");
  const rolMaster = await prisma.rol.findUnique({
    where: { nombre: "MASTER" },
  });
  const rolAdmin = await prisma.rol.findUnique({
    where: { nombre: "ADMIN" },
  });
  const rolVendedor = await prisma.rol.findUnique({
    where: { nombre: "VENDEDOR" },
  });
  const rolGerente = await prisma.rol.findUnique({
    where: { nombre: "GERENTE" },
  });
  if (!rolMaster || !rolAdmin || !rolVendedor || !rolGerente) {
    throw new Error("No se encontraron todos los roles.");
  }
  const modulos =
    await prisma.modulo.findMany(); /* ==========================================
   * MASTER
   * ========================================== */
  for (const modulo of modulos) {
    await prisma.permisoRol.upsert({
      where: {
        rolId_moduloId: {
          rolId: rolMaster.id,
          moduloId: modulo.id,
        },
      },
      update: {
        ver: true,
        crear: true,
        editar: true,
        eliminar: true,
      },
      create: {
        rolId: rolMaster.id,
        moduloId: modulo.id,
        ver: true,
        crear: true,
        editar: true,
        eliminar: true,
      },
    });
  }
  /* ==========================================
   * ADMIN
   * ========================================== */
  const permisosAdmin = {
    Dashboard: {
      ver: true,
      crear: false,
      editar: false,
      eliminar: false,
    },
    Productos: {
      ver: true,
      crear: true,
      editar: true,
      eliminar: true, // Soft Delete
    },
    Categorias: {
      ver: true,
      crear: true,
      editar: true,
      eliminar: true,
    },
    Marcas: {
      ver: true,
      crear: true,
      editar: true,
      eliminar: true,
    },
    Ingresos: {
      ver: true,
      crear: true,
      editar: true,
      eliminar: false,
    },
    Existencias: {
      ver: true,
      crear: false,
      editar: false,
      eliminar: false,
    },
    Kardex: {
      ver: false,
      crear: false,
      editar: false,
      eliminar: false,
    },
    Auditoria: {
      ver: false,
      crear: false,
      editar: false,
      eliminar: false,
    },
    Ventas: {
      ver: true,
      crear: true,
      editar: true,
      eliminar: false,
    },
    Clientes: {
      ver: true,
      crear: true,
      editar: true,
      eliminar: true,
    },
    ReportesPorDia: {
      ver: false,
      crear: false,
      editar: false,
      eliminar: false,
    },
    ReportesPorMes: {
      ver: false,
      crear: false,
      editar: false,
      eliminar: false,
    },
    // SOLO MASTER
    Usuarios: {
      ver: false,
      crear: false,
      editar: false,
      eliminar: false,
    },
    Roles: {
      ver: false,
      crear: false,
      editar: false,
      eliminar: false,
    },
    Tiendas: {
      ver: false,
      crear: false,
      editar: false,
      eliminar: false,
    },
    Configuracion: {
      ver: false,
      crear: false,
      editar: false,
      eliminar: false,
    },
    Salidas: {
      ver: true,
      crear: true,
      editar: true,
      eliminar: false,
    },
  };
  for (const modulo of modulos) {
    const permiso = permisosAdmin[modulo.nombre];
    await prisma.permisoRol.upsert({
      where: {
        rolId_moduloId: {
          rolId: rolAdmin.id,
          moduloId: modulo.id,
        },
      },
      update: {
        ver: permiso?.ver ?? false,
        crear: permiso?.crear ?? false,
        editar: permiso?.editar ?? false,
        eliminar: permiso?.eliminar ?? false,
      },
      create: {
        rolId: rolAdmin.id,
        moduloId: modulo.id,
        ver: permiso?.ver ?? false,
        crear: permiso?.crear ?? false,
        editar: permiso?.editar ?? false,
        eliminar: permiso?.eliminar ?? false,
      },
    });
  }
  /* ==========================================
   * GERENTE GRAL
   * ========================================== */
  const permisosGerente = {
    Dashboard: {
      ver: true,
      crear: false,
      editar: false,
      eliminar: false,
    },
    Productos: {
      ver: false,
      crear: false,
      editar: false,
      eliminar: false, // Soft Delete
    },
    Categorias: {
      ver: false,
      crear: false,
      editar: false,
      eliminar: false,
    },
    Marcas: {
      ver: false,
      crear: false,
      editar: false,
      eliminar: false,
    },
    Ingresos: {
      ver: true,
      crear: true,
      editar: true,
      eliminar: true,
    },
    Existencias: {
      ver: true,
      crear: true,
      editar: true,
      eliminar: true,
    },
    Kardex: {
      ver: true,
      crear: true,
      editar: true,
      eliminar: true,
    },
    Auditoria: {
      ver: true,
      crear: true,
      editar: true,
      eliminar: true,
    },
    Ventas: {
      ver: true,
      crear: true,
      editar: true,
      eliminar: false,
    },
    Clientes: {
      ver: true,
      crear: true,
      editar: true,
      eliminar: true,
    },
    ReportesPorDia: {
      ver: true,
      crear: true,
      editar: true,
      eliminar: true,
    },
    ReportesPorMes: {
      ver: false,
      crear: false,
      editar: false,
      eliminar: false,
    }, // SOLO MASTER
    Usuarios: {
      ver: false,
      crear: false,
      editar: false,
      eliminar: false,
    },
    Roles: {
      ver: false,
      crear: false,
      editar: false,
      eliminar: false,
    },
    Tiendas: {
      ver: false,
      crear: false,
      editar: false,
      eliminar: false,
    },
    Configuracion: {
      ver: false,
      crear: false,
      editar: false,
      eliminar: false,
    },
    Salidas: {
      ver: true,
      crear: true,
      editar: true,
      eliminar: false,
    },
  };
  for (const modulo of modulos) {
    const permiso = permisosGerente[modulo.nombre];
    await prisma.permisoRol.upsert({
      where: {
        rolId_moduloId: {
          rolId: rolGerente.id,
          moduloId: modulo.id,
        },
      },
      update: {
        ver: permiso?.ver ?? false,
        crear: permiso?.crear ?? false,
        editar: permiso?.editar ?? false,
        eliminar: permiso?.eliminar ?? false,
      },
      create: {
        rolId: rolGerente.id,
        moduloId: modulo.id,
        ver: permiso?.ver ?? false,
        crear: permiso?.crear ?? false,
        editar: permiso?.editar ?? false,
        eliminar: permiso?.eliminar ?? false,
      },
    });
  }
  /* ==========================================
   * VENDEDOR
   * ========================================== */
  const permisosVendedor = {
    Dashboard: {
      ver: true,
      crear: false,
      editar: false,
      eliminar: false,
    },
    Productos: {
      ver: true,
      crear: false,
      editar: false,
      eliminar: false,
    },
    Existencias: {
      ver: true,
      crear: false,
      editar: false,
      eliminar: false,
    },
    Clientes: {
      ver: true,
      crear: true,
      editar: true,
      eliminar: false,
    },
    Ventas: {
      ver: true,
      crear: true,
      editar: false,
      eliminar: false,
    },
    Salidas: {
      ver: true,
      crear: true,
      editar: true,
      eliminar: false,
    }, // Sin acceso
    Categorias: {},
    Marcas: {},
    Ingresos: {},
    Kardex: {},
    Auditoria: {},
    ReportesPorDia: {},
    ReportesPorMes: {},
    Usuarios: {},
    Roles: {},
    Tiendas: {},
    Configuracion: {},
  };
  for (const modulo of modulos) {
    const permiso = permisosVendedor[modulo.nombre];
    await prisma.permisoRol.upsert({
      where: {
        rolId_moduloId: {
          rolId: rolVendedor.id,
          moduloId: modulo.id,
        },
      },
      update: {
        ver: permiso?.ver ?? false,
        crear: permiso?.crear ?? false,
        editar: permiso?.editar ?? false,
        eliminar: permiso?.eliminar ?? false,
      },
      create: {
        rolId: rolVendedor.id,
        moduloId: modulo.id,
        ver: permiso?.ver ?? false,
        crear: permiso?.crear ?? false,
        editar: permiso?.editar ?? false,
        eliminar: permiso?.eliminar ?? false,
      },
    });
  }
  console.log("✅ Permisos por rol listos");
}
/* =======================================================
 * CREAR MARCAS EN MAGNUS
 * ======================================================= */
async function crearMarcasMagnus() {
  console.log("🌱 Marcas (MAGNUS)...");

  const tienda = await prisma.tienda.findFirst({
    where: {
      nombre: "MAGNUS",
    },
    select: {
      id: true,
    },
  });

  if (!tienda) {
    throw new Error('No existe la tienda "MAGNUS"');
  }

  const marcas = [
    { nombre: "XPOWER" },
    { nombre: "RACKETBALL" },
    { nombre: "INIZIO" },
    { nombre: "RPO" },
    { nombre: "MAGNUS" },
    { nombre: "PRECISSA" },
    { nombre: "BONLIFE" },
    { nombre: "BABALU" },
    { nombre: "BODY FIT" },
    { nombre: "NIKE" },
    { nombre: "BODYROCK" },
    { nombre: "BODYFIT" },
  ];

  for (const marca of marcas) {
    await prisma.marca.upsert({
      where: {
        tiendaId_nombre: {
          tiendaId: tienda.id,
          nombre: marca.nombre,
        },
      },
      update: {
        descripcion: marca.descripcion ?? null,
      },
      create: {
        tiendaId: tienda.id,
        nombre: marca.nombre,
        descripcion: marca.descripcion ?? null,
      },
    });
  }
  console.log("✅ Marcas de MAGNUS listas");
}

async function crearMarcasRosaNegra() {
  console.log("🌱 Marcas (ROSA NEGRA)...");

  const tienda = await prisma.tienda.findFirst({
    where: {
      nombre: "ROSA NEGRA",
    },
    select: {
      id: true,
    },
  });

  if (!tienda) {
    throw new Error('No existe la tienda "ROSA NEGRA"');
  }

  const marcas = [
    { nombre: "AMAIA" },
    { nombre: "AMORATTA" },
    { nombre: "ANWND" },
    { nombre: "ASI SEA" },
    { nombre: "B&C" },
    { nombre: "BABALU" },
    { nombre: "BE FREE" },
    { nombre: "BE FREE PREMIUM" },
    { nombre: "BE FREE SINCE" },
    { nombre: "BETTER BE" },
    { nombre: "BIKINI" },
    { nombre: "BOSS" },
    { nombre: "BRM" },
    { nombre: "BRP" },
    { nombre: "CANALDA MANCHA" },
    { nombre: "CASUAL" },
    { nombre: "CHARM" },
    { nombre: "CHEVIGNON" },
    { nombre: "CHRISTHIAN DIOR" },
    { nombre: "CLARIS" },
    { nombre: "CLOSET DELUXE" },
    { nombre: "CONY GREEN" },
    { nombre: "DAFNE" },
    { nombre: "DENIN" },
    { nombre: "DIESEL" },
    { nombre: "DRINKIS MAIS" },
    { nombre: "DYNAMIK" },
    { nombre: "DYABOO" },
    { nombre: "E-STAR" },
    { nombre: "EGOISTE" },
    { nombre: "EMPORIO" },
    { nombre: "ESSENTIALS" },
    { nombre: "FDVIXX" },
    { nombre: "FOR LOVE" },
    { nombre: "IMPACTO" },
    { nombre: "INCENTIVE" },
    { nombre: "IRIS" },
    { nombre: "JDC" },
    { nombre: "JEROM" },
    { nombre: "KENZUKI" },
    { nombre: "KOTONEL" },
    { nombre: "KUARZO" },
    { nombre: "LA FASHION" },
    { nombre: "LA LIMA" },
    { nombre: "LACOSTE" },
    { nombre: "LILY DAISY" },
    { nombre: "LOVE" },
    { nombre: "LOVE TREE" },
    { nombre: "M CHAER" },
    { nombre: "MARY ACCESORIOS" },
    { nombre: "MILALAI" },
    { nombre: "MODELLETY" },
    { nombre: "NAZARENA" },
    { nombre: "NINA ROSSI" },
    { nombre: "ONIX" },
    { nombre: "ORIGINAL" },
    { nombre: "POLONIO" },
    { nombre: "POOL" },
    { nombre: "REGINA" },
    { nombre: "ROLLY" },
    { nombre: "ROSA NEGRA" },
    { nombre: "SOBELLA" },
    { nombre: "SPLASH" },
    { nombre: "STUDIO F" },
    { nombre: "TALGUI" },
    { nombre: "TRIKINI" },
    { nombre: "VENETHUS" },
    { nombre: "VIBRANT" },
    { nombre: "VICTOR MARCET" },
    { nombre: "VIS" },
    { nombre: "VIVIAN FSHION" },
  ];

  for (const marca of marcas) {
    await prisma.marca.upsert({
      where: {
        tiendaId_nombre: {
          tiendaId: tienda.id,
          nombre: marca.nombre,
        },
      },
      update: {
        descripcion: marca.descripcion ?? null,
      },
      create: {
        tiendaId: tienda.id,
        nombre: marca.nombre,
        descripcion: marca.descripcion ?? null,
      },
    });
  }

  console.log("✅ Marcas de ROSA NEGRA listas");
}
/* =======================================================
 * MAIN
 * ======================================================= */
async function main() {
  console.log("");
  console.log("====================================");
  console.log("🚀 INICIANDO SEED");
  console.log("====================================");
  console.log("");
  // await crearRoles();
  // await crearTiendas();
  // await crearCategorias();
  // await crearTiposPago();
  // await crearTiposMovimiento();
  await crearUsuariosSistema();
  await crearModulos();
  await crearPermisosRoles();
  // await crearMarcasMagnus();
  // await crearMarcasRosaNegra();
  console.log("");
  console.log("====================================");
  console.log("✅ SEED FINALIZADO CORRECTAMENTE");
  console.log("====================================");
  console.log("");
}
main()
  .catch((error) => {
    console.error("");
    console.error("❌ ERROR EN EL SEED");
    console.error(error);
    console.error("");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
