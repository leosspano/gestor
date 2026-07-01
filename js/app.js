const getDB = (key) => JSON.parse(localStorage.getItem(key)) || [];
const setDB = (key, val) => localStorage.setItem(key, JSON.stringify(val));

let carrito = [];

document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('listaVentasHistorial')) renderVentas();
    if(document.getElementById('selectProductoPOS')) poblarPOS();
});

function poblarPOS() {
    const prods = getDB('productos');
    const select = document.getElementById('selectProductoPOS');
    select.innerHTML = prods.map(p => `<option value="${p.codigo}">${p.desc} ($${p.venta})</option>`).join('');
}

function abrirModalVenta() { document.getElementById('modalVenta').style.display = 'flex'; carrito = []; actualizarCarritoUI(); }
function cerrarModalVenta() { document.getElementById('modalVenta').style.display = 'none'; }

function agregarAlCarrito() {
    const cod = document.getElementById('selectProductoPOS').value;
    const cant = parseInt(document.getElementById('cantProductoPOS').value);
    const prod = getDB('productos').find(p => p.codigo === cod);
    if(prod.stock < cant) return alert("Sin stock");
    
    carrito.push({ codigo: cod, desc: prod.desc, precio: prod.venta, cantidad: cant, subtotal: prod.venta * cant });
    actualizarCarritoUI();
}

function actualizarCarritoUI() {
    const res = document.getElementById('renderCarrito');
    res.innerHTML = carrito.map((i, idx) => `<div>${i.desc} x${i.cantidad} = $${i.subtotal}</div>`).join('');
    const total = carrito.reduce((a, b) => a + b.subtotal, 0);
    document.getElementById('totalVentaModal').innerText = `$ ${total.toFixed(2)}`;
}

function finalizarVenta() {
    if(carrito.length === 0) return;
    const total = carrito.reduce((a, b) => a + b.subtotal, 0);
    const hoy = new Date().toISOString().split('T')[0];
    
    // Descontar Stock
    let prods = getDB('productos');
    carrito.forEach(i => { prods.find(p => p.codigo === i.codigo).stock -= i.cantidad; });
    setDB('productos', prods);

    // Guardar Venta e Historial
    let ventas = getDB('ventas');
    const desc = carrito.map(i => `${i.cantidad}x ${i.desc}`).join(', ');
    ventas.push({ fecha: hoy, hora: new Date().toLocaleTimeString(), items: desc, total, metodo: document.getElementById('metodoPagoPOS').value });
    setDB('ventas', ventas);

    // Sincronizar Caja
    let movs = getDB('movimientos');
    movs.push({ fecha: hoy, hora: new Date().toLocaleTimeString(), tipo: 'Venta', detalle: `Venta: ${desc}`, monto: total, editable: false });
    setDB('movimientos', movs);

    let saldo = parseFloat(localStorage.getItem('saldoGlobal')) || 0;
    localStorage.setItem('saldoGlobal', (saldo + total).toFixed(2));

    location.reload();
}

function renderVentas() {
    const v = getDB('ventas');
    document.getElementById('listaVentasHistorial').innerHTML = v.reverse().map(i => `<tr><td>${i.fecha}</td><td>${i.items}</td><td>$${i.total}</td><td>${i.metodo}</td></tr>`).join('');
}