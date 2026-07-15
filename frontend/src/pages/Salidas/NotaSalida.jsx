import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { salidasService } from "../../services/salidasService"; // Tu servicio backend
import { useAuthStore } from "../../stores/authStore";
import './NotaSalida.css'; // Mantiene los mismos estilos dinámicos
import { obtenerFechaBolivia } from '../../utils/normalizarHora';

export const NotaSalida = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [salidaData, setSalidaData] = useState(null);
    const [loading, setLoading] = useState(true);
    const tiendaActiva = useAuthStore((state) => state.tiendaActiva);

    useEffect(() => {
        const obtenerDatosSalida = async () => {
            try {
                setLoading(true);
                const data = await salidasService.getById(id);

                if (data.success) {
                    setSalidaData(data);
                } else {
                    console.error("Error en respuesta:", data.message);
                }
            } catch (error) {
                console.error("Error al conectar con el servidor:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            obtenerDatosSalida();
        }
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    const formatFecha = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return obtenerFechaBolivia(date);
    };
    const formatMoneda = (valor) => {
        return parseFloat(valor || 0).toFixed(2);
    };

    const calcularTotalUnidades = (detalles) => {
        return detalles?.reduce((acc, curr) => acc + curr.cantidad, 0) || 0;
    };

    if (loading) {
        return <div className="nota-salida-mensaje no-print">Cargando datos de la salida...</div>;
    }

    if (!salidaData || !salidaData.success) {
        return (
            <div className="nota-salida-mensaje no-print">
                <p>No se pudo obtener la información de la salida de mercadería.</p>
                <button onClick={() => navigate('/salidas')}>Volver a Salidas</button>
            </div>
        );
    }

    const itemSalida = salidaData.data;

    return (
        <div className="nota-salida-container">
            {/* Barra de acciones flotante */}
            <div className="nota-salida-actions no-print">
                <button className="btn-back" onClick={() => navigate('/salidas')}>
                    Volver a Salidas
                </button>
                <button className="btn-print" onClick={handlePrint}>
                    Imprimir Nota de Salida
                </button>
            </div>

            {/* Estructura Dinámica y Extensible Verticalmente */}
            <div className="outcome-box-dynamic">

                {/* ENCABEZADO */}
                <header className="outcome-header">
                    <div className="company-info">
                        {/* {tiendaActiva.imagen && (
                            <img
                                src={tiendaActiva.imagen.replace(/\.[^/.]+$/, ".jpg")}
                                alt="Logo"
                                className="company-logo"
                            />
                        )} */}
                        <div className="company-text">
                            <h1 className="company-name">{tiendaActiva.nombre}</h1>
                            <p className="company-subtitle">{tiendaActiva.descripcion}</p>
                        </div>
                    </div>
                    <div className="outcome-meta">
                        <h2 className="outcome-title">NOTA DE SALIDA</h2>
                        <p className="outcome-code"><strong>CÓDIGO:</strong> {itemSalida.codigo}</p>
                        <p className="outcome-number"><strong>Nº Control:</strong> {itemSalida.numero}</p>
                        <p className="outcome-management"><strong>Gestión:</strong> {itemSalida.gestion}</p>
                    </div>
                </header>

                {/* DATOS GENERALES Y DESTINATARIO */}
                <section className="outcome-summary-section">
                    <div className="outcome-col">
                        <p><strong>Fecha de Salida:</strong> {formatFecha(itemSalida.fecha)}</p>
                        <p><strong>Tipo Movimiento:</strong> <span className="badge-movimiento">{itemSalida.tipoMovimiento?.nombre}</span></p>
                        <p><strong></strong> <span >{itemSalida.tipoMovimiento?.descripcion}</span></p>
                        <p><strong>Autorizado Por:</strong> {itemSalida.usuario?.nombre}</p>
                    </div>
                    <div className="outcome-col text-right">
                        <p><strong>Destinatario / Cliente:</strong> {itemSalida.cliente?.nombre || 'S/N'}</p>
                        {itemSalida.cliente?.telefono && <p><strong>Teléfono:</strong> {itemSalida.cliente.telefono}</p>}
                        {/* {itemSalida.cliente?.direccion && <p><strong>Dirección:</strong> {itemSalida.cliente.direccion}</p>} */}
                    </div>
                </section>

                {/* OBSERVACIONES PREVIAS A LA TABLA */}
                {itemSalida.observacion && (
                    <div className="outcome-observation-box">
                        <strong>Motivo / Observación:</strong> {itemSalida.observacion}
                    </div>
                )}

                {/* TABLA ULTRACOMPACTA CON COLUMNA SEPARADA */}
                <main className="outcome-details-section">
                    <table className="outcome-table">
                        <thead>
                            <tr>
                                <th style={{ width: '5%', textAlign: 'center' }}>Nº</th>
                                <th style={{ width: '20%' }}>SKU / Código</th>
                                <th>Descripción del Artículo</th>
                                <th style={{ width: '15%', textAlign: 'center' }}>Valor</th>
                                <th style={{ width: '10%', textAlign: 'center' }}>Cant.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {itemSalida.detalles?.map((item, index) => (
                                <tr key={item.id || index}>
                                    <td className="text-center text-muted">{index + 1}</td>
                                    <td className="font-mono">{item.producto?.sku}</td>
                                    <td>
                                        <span className="outcome-prod-desc">{item.producto?.descripcion}</span>
                                        - {item.producto?.color} | {item.producto.tallas}
                                    </td>
                                    <td className="text-center font-bold">{formatMoneda(item.producto.precioVenta)}</td>
                                    <td className="text-center font-bold">{item.cantidad}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </main>

                {/* TOTALIZADOR Y FIRMAS */}
                <footer className="outcome-footer">
                    <div className="outcome-totals-bar">
                        <span>TOTAL ARTÍCULOS RETIRADOS:</span>
                        <strong>{calcularTotalUnidades(itemSalida.detalles)} Unidades</strong>
                    </div>

                    {/* Bloque de firmas de seguridad */}
                    <div className="signature-container">
                        <div className="signature-box">
                            <div className="signature-line"></div>
                            <p>Entregado (Almacén)</p>
                        </div>
                        <div className="signature-box">
                            <div className="signature-line"></div>
                            <p>Recibido (Conformidad)</p>
                        </div>
                    </div>
                </footer>

            </div>
        </div>
    );
};