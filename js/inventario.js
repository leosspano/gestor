let selectedCode = null;

document.addEventListener('DOMContentLoaded', renderStock);

function renderStock() {
    const prods = getDB('productos');
    const body = document.getElementById('bodyStock');
    if(!body) return;

    body.innerHTML = prods.map(p => `
        <tr onclick="seleccionar('${p.codigo}', this)">
            <td>${p.codigo}</td>
            <td>${p.desc}</td>
            <td>${p.marca}</td>
            <td style="font-weight:bold;">${p.stock}</td>
            <td style="color:var(--primary); font-weight:bold;">$ ${p.venta.toFixed(2)}</td>
        </tr>
    `).join('');
    
    // Resetear botones
    document.getElementById('btnEditar').disabled = true;
    document.getElementById('btnBorrar').disabled = true;
    selectedCode = null;
}

function seleccionar(cod, el) {
    document.querySelectorAll('tr').forEach(r => r.classList.remove('selected-row'));
    el.classList.add('selected-row');
    selectedCode = cod;
    document.getElementById('btnEditar').disabled = false;
    document.getElementById('btnBorrar').disabled = false;
}

function abrirModalProducto(modo) {
    const modal = document.getElementById('modalProducto');
    const form = document.getElementById('formProducto');
    const titulo = document.getElementById('tituloModalProd');
    
    form.reset();
    
    if (modo === 'editar') {
        const prod = getDB('productos').find(p => p.codigo === selectedCode);
        if (!prod) return;
        titulo.innerText = "Modificar Producto";
        document.getElementById('p_cod').value = prod.codigo;
        document.getElementById('p_cod').readOnly = true; // El código no se edita
        document.getElementById('p_desc').value = prod.desc;
        document.getElementById('p_marca').value = prod.marca;
        document.getElementById('p_stock').value = prod.stock;
        document.getElementById('p_venta').value = prod.venta;
    } else {
        titulo.innerText = "Nuevo Producto";
        document.getElementById('p_cod').readOnly = false;
    }
    
    modal.style.display = 'flex';
}

function cerrarModalProd() {
    document.getElementById('modalProducto').style.display = 'none';
}

document.getElementById('formProducto').addEventListener('submit', (e) => {
    e.preventDefault();
    let prods = getDB('productos');
    const cod = document.getElementById('p_cod').value;
    
    const datos = {
        codigo: cod,
        desc: document.getElementById('p_desc').value,
        marca: document.getElementById('p_marca').value,
        stock: parseInt(document.getElementById('p_stock').value),
        venta: parseFloat(document.getElementById('p_venta').value)
    };

    const idx = prods.findIndex(p => p.codigo === cod);
    
    if (idx !== -1 && document.getElementById('tituloModalProd').innerText === "Modificar Producto") {
        prods[idx] = datos; // Editar
    } else if (idx === -1) {
        prods.push(datos); // Nuevo
    } else {
        alert("El código ya existe en el inventario.");
        return;
    }

    setDB('productos', prods);
    cerrarModalProd();
    renderStock();
});

function borrarProducto() {
    if(!confirm("¿Está seguro de eliminar este producto del stock?")) return;
    let prods = getDB('productos');
    prods = prods.filter(p => p.codigo !== selectedCode);
    setDB('productos', prods);
    renderStock();
}