import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ingresosService } from "../../services/ingresosService"; // Asumiendo tu estructura
import { useAuthStore } from "../../stores/authStore";
import './NotaIngreso.css';
import { obtenerFechaBolivia } from '../../utils/normalizarHora';

export const NotaIngreso = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ingresoData, setIngresoData] = useState(null);
    const [loading, setLoading] = useState(true);
    const tiendaActiva = useAuthStore((state) => state.tiendaActiva);

    useEffect(() => {
        const obtenerDatosIngreso = async () => {
            try {
                setLoading(true);
                const data = await ingresosService.getById(id);

                if (data.success) {
                    setIngresoData(data);
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
            obtenerDatosIngreso();
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

    // Calcula el total de unidades que están ingresando
    const calcularTotalUnidades = (detalles) => {
        return detalles?.reduce((acc, curr) => acc + curr.cantidad, 0) || 0;
    };

    if (loading) {
        return <div className="nota-ingreso-mensaje no-print">Cargando datos del ingreso...</div>;
    }

    if (!ingresoData || !ingresoData.success) {
        return (
            <div className="nota-ingreso-mensaje no-print">
                <p>No se pudo obtener la información del ingreso de mercadería.</p>
                <button onClick={() => navigate('/ingresos')}>Volver a Ingresos</button>
            </div>
        );
    }

    const itemIngreso = ingresoData.data;

    return (
        <div className="nota-ingreso-container">
            {/* Barra de acciones flotante */}
            <div className="nota-ingreso-actions no-print">
                <button className="btn-back" onClick={() => navigate('/ingresos')}>
                    Volver a Ingresos
                </button>
                <button className="btn-print" onClick={handlePrint}>
                    Imprimir Nota de Ingreso
                </button>
            </div>

            {/* Estructura Dinámica y Extensible Verticalmente */}
            <div className="income-box-dynamic">

                {/* ENCABEZADO */}
                <header className="income-header">
                    <div className="company-info">
                        {/* {tiendaActiva.imagen && (
                            <img
                                src={tiendaActiva.imagen}
                                alt="Logo"
                                className="company-logo"
                            />
                        )} */}
                        <div className="company-text">
                            <h1 className="company-name">{tiendaActiva.nombre}</h1>
                            <p className="company-subtitle">{tiendaActiva.descripcion}</p>
                        </div>
                    </div>
                    <div className="income-meta">
                        <h2 className="income-title">NOTA DE INGRESO</h2>
                        <p className="income-code"><strong>CÓDIGO:</strong> {itemIngreso.codigo}</p>
                        <p className="income-number"><strong>Nº Control:</strong> {itemIngreso.numero}</p>
                        <p className="income-management"><strong>Gestión:</strong> {itemIngreso.gestion}</p>
                    </div>
                </header>

                {/* DATOS GENERALES DEL INGRESO */}
                <section className="income-summary-section">
                    <div className="income-col">
                        <p><strong>Fecha de Ingreso:</strong> {formatFecha(itemIngreso.fecha)}</p>
                        <p><strong>Encargado:</strong> {itemIngreso.usuario?.nombre}</p>
                    </div>
                    <div className="income-col text-right">
                        <p><strong>Destino:</strong> {itemIngreso.tienda?.nombre || tiendaActiva.nombre}</p>
                        <p><strong>Items Únicos:</strong> {itemIngreso.detalles?.length || 0}</p>
                    </div>
                </section>

                {/* OBSERVACIONES PREVIAS A LA TABLA */}
                {itemIngreso.observacion && (
                    <div className="income-observation-box">
                        <strong>Concepto / Observación:</strong> {itemIngreso.observacion}
                    </div>
                )}

                {/* TABLA ULTRACOMPACTA PARA GRANDES VOLÚMENES */}
                <main className="income-details-section">
                    <table className="income-table">
                        <thead>
                            <tr>
                                <th style={{ width: '5%', textAlign: 'center' }}>Nº</th>
                                <th style={{ width: '5%' }}>Cód.</th>
                                <th>Descripción del Artículo</th>
                                <th style={{ width: '10%', textAlign: 'right' }}>Talla</th>
                                <th style={{ width: '20%', textAlign: 'left' }}>- Color</th> {/* Nueva columna */}
                                <th style={{ width: '10%' }}>Marca</th>
                                <th style={{ width: '10%', textAlign: 'center' }}>Cant.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {itemIngreso.detalles?.map((item, index) => (
                                <tr key={item.id || index}>
                                    <td className="text-center text-muted">{index + 1}</td>
                                    <td className="font-mono">{item.producto?.codigo}</td>
                                    <td>
                                        <span className="income-prod-desc">{item.producto?.descripcion}</span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <span className="income-prod-desc">{item.producto?.tallas}</span>
                                    </td>
                                    <td >
                                        {/* Se extrae a su propia columna conservando tus estilos intactos */}
                                        <span className="income-prod-specs">
                                            - {item.producto?.color}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>{item.producto?.marca?.nombre}</td>
                                    <td className="text-center font-bold">{item.cantidad}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </main>

                {/* TOTALIZADOR Y FIRMAS */}
                <footer className="income-footer">
                    <div className="income-totals-bar">
                        <span>TOTAL ARTÍCULOS REGISTRADOS:</span>
                        <strong>{calcularTotalUnidades(itemIngreso.detalles)} Unidades</strong>
                    </div>

                    {/* Espacio para firmas de conformidad (Vital en ingresos de almacén) */}
                    <div className="signature-container">
                        <div className="signature-box">
                            <div className="signature-line"></div>
                            <p>Entregado Por</p>
                        </div>
                        <div className="signature-box">
                            <div className="signature-line"></div>
                            <p>Recibido Almacén</p>
                        </div>
                    </div>
                </footer>

            </div>
        </div>
    );
};