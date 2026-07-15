import { useEffect, useState } from "react";
import { ImagePlus } from "lucide-react";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
// import Select from "../../components/Select/Select";
import MultiSelectInput from "../../components/MultiSelectInput/MultiSelectInput";
import { useAuthStore } from "../../stores/authStore";
import { categoriasService } from "../../services/categoriasService";
import { marcasService } from "../../services/marcasService";
import SelectField from "../../components/SelectField/SelectField";

function ProductoForm({ producto, productos, categoriaInicial, onSubmit, onCancel, showButtons = true }) {
    // const SIZE_ORDER = { U: 1, S: 2, M: 3, L: 4, XL: 5 };
    const tiendaActiva = useAuthStore((state) => state.tiendaActiva);
    const [categorias, setCategorias] = useState([]);
    const [marcas, setMarcas] = useState([]);
    const [codigo, setCodigo] = useState("");
    const [categoriaId, setCategoriaId] = useState(producto?.categoriaId || categoriaInicial || "");
    const [marcaId, setMarcaId] = useState(producto?.marcaId || "");
    const [descripcion, setDescripcion] = useState(producto?.descripcion || "");
    const [color, setColor] = useState(producto?.color || "");
    const [tallas, setTallas] = useState(producto?.tallas || "U");
    const [piezas, setPiezas] = useState(producto?.piezas || 1);
    const [precioVenta, setPrecioVenta] = useState(producto?.precioVenta || "");
    const [stockMinimo, setStockMinimo] = useState(producto?.stockMinimo || 1);
    const [observacion, setObservacion] = useState(producto?.observacion || "");
    const [errors, setErrors] = useState({});

    const clearError = (field) => setErrors((prev) => ({ ...prev, [field]: undefined }));

    useEffect(() => {
        if (!producto) return;
        setCodigo(producto.codigo || "");
        setCategoriaId(producto.categoriaId || "");
        setMarcaId(producto.marcaId || "");
        setDescripcion(producto.descripcion || "");
        setColor(producto.color || "");
        setTallas(producto.tallas || "U");
        setPiezas(producto.piezas || 1);
        setPrecioVenta(producto.precioVenta || "");
        setStockMinimo(producto.stockMinimo || 1);
        setObservacion(producto.observacion || "");
    }, [producto]);

    useEffect(() => {
        const loadCatalogos = async () => {
            try {
                const [categoriasResponse, marcasResponse] = await Promise.all([categoriasService.getAll(), marcasService.getAll()]);
                if (categoriasResponse.success) setCategorias(categoriasResponse.data.filter((item) => item.estado));
                if (marcasResponse.success) setMarcas(marcasResponse.data.filter((item) => item.estado));
            } catch (error) { console.error(error); }
        };
        loadCatalogos();
    }, []);

    useEffect(() => {
        if (producto || !categoriaId || !tiendaActiva) return;
        const productosCategoria = productos.filter((item) => item.tiendaId === tiendaActiva.id && item.categoriaId === Number(categoriaId));
        const siguienteCodigo = productosCategoria.length === 0 ? 1 : Math.max(...productosCategoria.map((item) => item.codigo)) + 1;
        setCodigo(siguienteCodigo);
    }, [producto, productos, categoriaId, tiendaActiva]);

    useEffect(() => { if (producto?.codigo) setCodigo(producto.codigo); }, [producto]);

    const validate = () => {
        const newErrors = {};
        if (!codigo || Number(codigo) < 1) newErrors.codigo = "Código inválido";
        if (!marcaId) newErrors.marcaId = "Seleccione una marca";
        if (!descripcion.trim()) newErrors.descripcion = "Descripción requerida";
        else if (descripcion.trim().length < 3) newErrors.descripcion = "Mínimo 3 caracteres";
        if (!color.trim()) newErrors.color = "Color requerido";
        if (!precioVenta || Number(precioVenta) <= 0) newErrors.precioVenta = "Precio inválido";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        onSubmit({
            tiendaId: tiendaActiva.id,
            categoriaId: Number(categoriaId),
            marcaId: Number(marcaId),
            codigo: Number(codigo),
            descripcion: descripcion.trim(),
            color: color.trim(),
            tallas: tallas.trim() || "U",
            piezas: Number(piezas),
            precioVenta: Number(precioVenta),
            stockMinimo: Number(stockMinimo),
            observacion: observacion.trim() || null,
        });
    };

    const categoriaSeleccionada = categorias.find((item) => item.id === Number(categoriaId));

    return (
        <form id="producto-form" className="modal-form" onSubmit={handleSubmit}>
            <div className="modal-form__grid">
                <div className="modal-form__field"><Input label="Tienda" value={tiendaActiva?.nombre || ""} disabled /></div>
                <div className="modal-form__field"><Input label="Categoría" value={categoriaSeleccionada?.nombre || ""} disabled /></div>
                <div className="modal-form__field"><Input label="Código" value={codigo} disabled={!!producto} onChange={(e) => { setCodigo(e.target.value); clearError("codigo"); }} error={errors.codigo} /></div>
                <div className="modal-form__field"><SelectField id="marca" name="marca" label="Marca" value={marcaId} onChange={(e) => { setMarcaId(e.target.value); clearError("marcaId"); }} error={errors.marcaId} options={marcas} /></div>
                <div className="modal-form__field modal-form__field--double"><Input label="Descripción" value={descripcion} onChange={(e) => { setDescripcion(e.target.value); clearError("descripcion"); }} error={errors.descripcion} /></div>
                <div className="modal-form__field"><Input label="Color" value={color} onChange={(e) => { setColor(e.target.value); clearError("color"); }} error={errors.color} /></div>
                <div className="modal-form__field"><MultiSelectInput label="Tallas" value={tallas} onChange={(value) => { setTallas(value); clearError("tallas"); }} error={errors.tallas} options={["U", "S", "M", "L", "XL"]} order={{ U: 1, S: 2, M: 3, L: 4, XL: 5 }} /></div>
                <div className="modal-form__field"><Input type="number" label="Piezas" value={piezas} onChange={(e) => setPiezas(e.target.value)} /></div>
                <div className="modal-form__field"><Input type="number" step="0.01" label="Precio Venta" value={precioVenta} onChange={(e) => { setPrecioVenta(e.target.value); clearError("precioVenta"); }} error={errors.precioVenta} /></div>
                <div className="modal-form__field"><Input type="number" label="Stock Mínimo" value={stockMinimo} onChange={(e) => setStockMinimo(e.target.value)} /></div>
                <div className="modal-form__field">
                    <label className="modal-form__label">Fotografía</label>
                    <Button type="button" variant="secondary" icon={<ImagePlus size={18} />}>Imagen Principal (Próximamente)</Button>
                </div>
            </div>
            {showButtons && (
                <div className="modal-form__actions">
                    <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
                    <Button type="submit">Guardar</Button>
                </div>
            )}
        </form>
    );
}
export default ProductoForm;