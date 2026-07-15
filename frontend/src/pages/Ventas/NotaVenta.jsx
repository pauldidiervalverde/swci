import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ventasService } from "../../services/ventasService";
import { useAuthStore } from "../../stores/authStore";
import './NotaVenta.css';
import { obtenerFechaBolivia } from '../../utils/normalizarHora';


export const NotaVenta = () => {
    const { id } = useParams(); // Captura el ID de la URL
    const navigate = useNavigate();
    const [ventaData, setVentaData] = useState(null);
    const [loading, setLoading] = useState(true);
    const tiendaActiva = useAuthStore(
        (state) => state.tiendaActiva
    );

    useEffect(() => {
        const obtenerDatosVenta = async () => {
            try {
                setLoading(true);
                const data = await ventasService.getById(id);
                console.log(data);

                if (data.success) {
                    setVentaData(data);
                } else {
                    console.error("Error en respuesta:", data.message);
                }
            } catch (error) {
                console.error("Error al conectar con el servidor:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) { obtenerDatosVenta(); }
    }, [id]);

    // Disparador de impresión nativa
    const handlePrint = () => {
        // 1. Guardamos el título original de la pestaña del navegador
        const originalTitle = document.title;
        const fechaDoc = sale?.fecha ? formatFecha(sale.fecha) : '';
        // 2. Asignamos el nombre que queremos que tenga el documento/PDF
        // Usamos el código de la venta (ej. NV-1025) si ya cargó, de lo contrario un nombre estándar
        // eslint-disable-next-line react-hooks/immutability
        document.title = sale?.codigo
            ? `Venta - ${fechaDoc} - ${sale.codigo}`
            : "Nota de Venta";

        // 3. Disparamos el cuadro de impresión nativo del navegador
        window.print();

        // 4. Restauramos el título original inmediatamente después
        // eslint-disable-next-line react-hooks/immutability
        document.title = originalTitle;
    };

    // Formateadores de datos
    const formatFecha = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);

        return obtenerFechaBolivia(date);
    };

    const formatMoneda = (valor) => {
        return parseFloat(valor || 0).toFixed(2);
    };

    // 1. Estado de carga en pantalla
    if (loading) {
        return <div className="nota-venta-mensaje no-print">Cargando datos de la venta...</div>;
    }

    // 2. Si no se encontró la venta o falló la respuesta
    if (!ventaData || !ventaData.success) {
        return (
            <div className="nota-venta-mensaje no-print">
                <p>No se pudo obtener la información de la venta.</p>
                <button onClick={() => navigate('/ventas')}>Volver a Ventas</button>
            </div>
        );
    }

    const sale = ventaData.data;

    return (
        <div className="nota-venta-container">
            {/* Barra de acciones flotante (No se imprime) */}
            <div className="nota-venta-actions no-print">
                <button className="btn-back" onClick={() => navigate('/ventas')}>
                    Volver a Ventas
                </button>
                <button className="btn-print" onClick={handlePrint}>
                    Imprimir Nota
                </button>
            </div>

            {/* Estructura de la Nota de Venta (Mitad de Hoja Carta - Se Imprime) */}
            <div className="invoice-box-half-page">

                {/* ENCABEZADO */}
                <header className="invoice-header">
                    <div className="company-info">
                        {tiendaActiva.imagen ?
                            (
                                <img
                                    src={tiendaActiva.imagen.replace(/\.[^/.]+$/, ".jpg")}
                                    //src={tiendaActiva.imagen}
                                    alt="Logo"
                                    className="company-logo"
                                />
                            )
                            :
                            (
                                <div className="company-text">
                                    <h1 className="company-name">{tiendaActiva.nombre}</h1>
                                    <p className="company-subtitle">{tiendaActiva.descripcion}</p>
                                </div>
                            )
                        }

                    </div>
                    <div className="invoice-meta">
                        <h2 className="invoice-title">NOTA DE VENTA</h2>
                        <p className="invoice-code"><strong>CÓDIGO:</strong> {sale.codigo}</p>
                        <p className="invoice-number"><strong>Nº Control:</strong> {sale.numero}</p>
                    </div>
                </header>

                {/* INFORMACIÓN DEL CLIENTE */}
                <section className="invoice-customer-section">
                    <div className="customer-col">
                        <p><strong>Cliente:</strong> {sale.cliente?.nombre || 'S/N'}</p>
                        <p><strong>Teléfono:</strong> {sale.cliente?.telefono || 'N/A'}</p>

                        {sale.cliente?.nit && <p><strong>NIT/CI:</strong> {sale.cliente.nit}</p>}
                        {sale.cliente?.direccion && <p><strong>Dirección:</strong> {sale.cliente.direccion}</p>}
                        {sale.cliente?.correo && <p><strong>E-mail:</strong> {sale.cliente.correo}</p>}
                    </div>
                    <div className="customer-col text-right">
                        <p><strong>Fecha:</strong> {formatFecha(sale.fecha)}</p>
                        <p><strong>Pago:</strong> <span className="badge-pago">{sale.tipoPago?.nombre}</span></p>
                        <p><strong>Vendedor:</strong> {sale.usuario?.nombre}</p>
                    </div>
                </section>

                {/* TABLA DE PRODUCTOS DE VENTA REESTRUCTURADA */}
                <main className="invoice-details-section">
                    <table className="invoice-table">
                        <thead>
                            <tr>
                                <th style={{ width: '4%', textAlign: 'center' }}>Nº</th>
                                <th style={{ width: '12%' }}>Marca </th>
                                <th style={{ width: '8%', textAlign: 'right' }}>Código </th>
                                <th>Descripción del Producto</th>
                                <th style={{ width: '5%', textAlign: 'center' }}>Cant.</th>
                                <th style={{ width: '10%', textAlign: 'right' }}>P. Unit.</th>
                                <th style={{ width: '5%', textAlign: 'right' }}>Desc.</th>
                                <th style={{ width: '10%', textAlign: 'right' }}>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sale.detalles?.map((item, index) => (
                                <tr key={item.id || index}>
                                    <td className="text-center text-muted">{index + 1}</td>
                                    <td className="invoice-prod-specs">
                                        {item.producto?.marca?.nombre}
                                    </td>
                                    <td className="text-right invoice-prod-specs">
                                        {item.producto?.codigo}
                                    </td>

                                    {/* Columna 1: Solo el nombre del producto */}
                                    <td className="invoice-prod-desc">
                                        {item.producto?.descripcion}
                                    </td>
                                    {/* Columna 2: Atributos combinados en una sola línea */}

                                    <td className="text-center">{item.cantidad}</td>
                                    <td className="text-right">{formatMoneda(item.precioLista)}</td>
                                    <td className="text-right">{item.descuento}</td>
                                    <td className="text-right">{formatMoneda(item.subtotal)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </main>

                {/* TOTALES Y OBSERVACIONES */}
                <footer className="invoice-footer">
                    <div className="footer-obs">
                        <p><strong>SWCI </strong> - Sistema Web de Control de Inventario</p>
                    </div>
                    <div className="footer-totals">
                        <div className="total-row">
                            <span className="total-label">TOTAL BS:</span>
                            <span className="total-amount">{formatMoneda(sale.total)}</span>
                        </div>
                    </div>
                </footer>

                <div className="thanks-message">
                    <p>Gracias por su preferencia</p>
                </div>

            </div>
        </div>
    );
};