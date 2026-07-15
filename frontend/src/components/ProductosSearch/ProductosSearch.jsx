import { useEffect, useMemo, useState } from "react";
import SearchInput from "../SearchInput/SearchInput";
import SelectField from "../SelectField/SelectField";
import { filtrarProductos } from "./filtrarProductos";
import "./ProductosSearch.css";

function ProductosSearch({
    productos = [],
    categorias = [],
    marcas = [],
    onFilter,
    orderBy = "",
    desc = false,
    filterRequired = false // 🌟 NUEVA PROP: Por defecto es 'false' para que las otras páginas sigan mostrando todo al iniciar
}) {
    const [search, setSearch] = useState("");
    const [categoriaId, setCategoriaId] = useState("");
    const [marcaId, setMarcaId] = useState("");

    const productosFiltrados = useMemo(() => {
        return filtrarProductos(productos, {
            search,
            categoriaId,
            marcaId,
            orderBy,
            desc
        });
    }, [productos, search, categoriaId, marcaId, orderBy, desc]);

    useEffect(() => {
        if (!onFilter) return;

        // Validamos si no hay ninguna interacción en los inputs
        const noHayFiltrosActivos = !search.trim() && !categoriaId && !marcaId;

        // 🌟 Si se requiere filtro obligatorio Y el usuario no ha escrito nada, mandamos vacío
        if (filterRequired && noHayFiltrosActivos) {
            onFilter([]);
        } else {
            // En cualquier otro caso (o en las otras páginas), se muestra el comportamiento normal
            onFilter(productosFiltrados);
        }
    }, [productosFiltrados, search, categoriaId, marcaId, filterRequired, onFilter]);

    return (
        <div className="productos-search">
            <div className="productos-search__item productos-search__item--wide">
                <SearchInput
                    id="productos-search"
                    name="productos-search"
                    value={search}
                    onChange={setSearch}
                    placeholder="Buscar producto..."
                />
            </div>
            <div className="productos-search__item">
                <SelectField
                    id="productos-categoria"
                    name="productos-categoria"
                    value={categoriaId}
                    onChange={(e) => setCategoriaId(e.target.value)}
                    options={categorias}
                    placeholder="Todas las categorías"
                />
            </div>
            <div className="productos-search__item">
                <SelectField
                    id="productos-marca"
                    name="productos-marca"
                    value={marcaId}
                    onChange={(e) => setMarcaId(e.target.value)}
                    options={marcas}
                    placeholder="Todas las marcas"
                />
            </div>
        </div>
    );
}

export default ProductosSearch;