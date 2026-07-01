document.addEventListener('DOMContentLoaded', () => {
    // Establecer fecha de hoy por defecto
    document.getElementById('inputFechaCaja').value = new Date().toISOString().split('T')[0];
    actualizarInterfazCaja();
});

function actualizarInterfazCaja() {
    const fecha = document.getElementById('inputFechaCaja').value;
    const sesiones = getDB('sesionesCaja');
    const movs = getDB('movimientos');
    const saldo = parseFloat(localStorage.getItem('saldoGlobal')) || 0;

    // Estado de la caja
    const sesion = sesiones.find(s => s.fecha === fecha);
    document.getElementById('txtEstadoCaja').innerText = sesion ? sesion.estado.toUpperCase() : "NO INICIADA";
    document.getElementById('txtSaldoGlobal').innerText = `$ ${saldo.toLocaleString('es-AR', {minimumFractionDigits: 2})}`;

    // Filtrar movimientos del día
    const filtrados = movs.filter(m => m.fecha === fecha);
    const lista = document.getElementById('listaMovimientos');
    lista.innerHTML = filtrados.reverse().map((m, idx) => `
        <tr>
            <td>${m.hora}</td>
            <td><span class="badge ${m.tipo==='Egreso'?'badge-egreso':'badge-ingreso'}">${m.tipo}</span></td>
            <td>${m.detalle}</td>
            <td style="font-weight:bold;">$ ${m.monto.toFixed(2)}</td>
            <td>${m.editable !== false ? `<button class="btn-white" onclick="borrarMov(${movs.indexOf(m)})" style="padding:5px;">🗑️</button>` : '--'}</td>
        </tr>
    `).join('');

    // Calcular neto del día
    const neto = filtrados.reduce((a, b) => b.tipo === 'Egreso' ? a - b.monto : a + b.monto, 0);
    const txtMonto = document.getElementById('txtMontoDia');
    txtMonto.innerText = `$ ${neto.toFixed(2)}`;
    txtMonto.style.color = neto >= 0 ? 'var(--success)' : 'var(--danger)';
}

function abrirModalMov(tipo) {
    document.getElementById('tituloModalMov').innerText = "Registrar " + tipo;
    document.getElementById('mov_tipo').value = tipo;
    document.getElementById('formMov').reset();
    document.getElementById('modalMov').style.display = 'flex';
}

function cerrarModalMov() {
    document.getElementById('modalMov').style.display = 'none';
}

document.getElementById('formMov').addEventListener('submit', (e) => {
    e.preventDefault();
    const tipo = document.getElementById('mov_tipo').value;
    const monto = parseFloat(document.getElementById('mov_monto').value);
    const desc = document.getElementById('mov_desc').value;
    const fecha = document.getElementById('inputFechaCaja').value;

    let movs = getDB('movimientos');
    movs.push({
        fecha,
        hora: new Date().toLocaleTimeString(),
        tipo,
        detalle: desc,
        monto,
        editable: true
    });
    setDB('movimientos', movs);

    // Actualizar Saldo Global
    let saldo = parseFloat(localStorage.getItem('saldoGlobal')) || 0;
    const nuevoSaldo = tipo === 'Ingreso' ? saldo + monto : saldo - monto;
    localStorage.setItem('saldoGlobal', nuevoSaldo.toFixed(2));

    cerrarModalMov();
    actualizarInterfazCaja();
});

function cambiarEstadoCaja(st) {
    const fecha = document.getElementById('inputFechaCaja').value;
    let ses = getDB('sesionesCaja');
    const idx = ses.findIndex(s => s.fecha === fecha);
    if(idx !== -1) ses[idx].estado = st; else ses.push({fecha, estado: st});
    setDB('sesionesCaja', ses);
    actualizarInterfazCaja();
}

function borrarMov(idx) {
    if(!confirm("¿Desea eliminar este registro? El saldo global se ajustará.")) return;
    let movs = getDB('movimientos');
    const m = movs[idx];
    
    let saldo = parseFloat(localStorage.getItem('saldoGlobal')) || 0;
    const nuevoSaldo = m.tipo === 'Ingreso' ? saldo - m.monto : saldo + m.monto;
    localStorage.setItem('saldoGlobal', nuevoSaldo.toFixed(2));

    movs.splice(idx, 1);
    setDB('movimientos', movs);
    actualizarInterfazCaja();
}