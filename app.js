// Funciones del sitio RedPar
// Proyecto Interfaz de Usuario - Equipo RedPar

let productos = [];   // aquí quedan los repuestos que trae el fetch
let totalAPagar = 0;  // total del carrito (se usa al finalizar el pedido)


// ---------------- LOCALSTORAGE ----------------
// localStorage solo guarda texto, por eso usamos JSON.stringify para guardar
// y JSON.parse para volver a tener el arreglo

function leerLista(clave) {
    let datos = localStorage.getItem(clave);
    if (datos == null) {
        return [];
    }
    return JSON.parse(datos);
}

function guardarLista(clave, lista) {
    localStorage.setItem(clave, JSON.stringify(lista));
}

function leerSesion() {
    let sesion = localStorage.getItem("sesion");
    if (sesion == null) {
        return null;
    }
    return JSON.parse(sesion);
}


// ---------------- FUNCIONES DE AYUDA ----------------

function formatoPesos(numero) {
    return "$" + Math.round(numero).toLocaleString("es-CL");
}

// para que el texto que escribe el usuario no se lea como HTML
function quitarEtiquetas(texto) {
    return texto.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function buscarProducto(codigo) {
    for (let i = 0; i < productos.length; i++) {
        if (productos[i].codigo == codigo) {
            return productos[i];
        }
    }
    return null;
}

// RF-03: texto del stock
function textoStock(stock) {
    if (stock <= 0) {
        return "Sin stock";
    } else if (stock <= 5) {
        return "Últimas unidades";
    } else {
        return "Disponible";
    }
}

function colorStock(stock) {
    if (stock <= 0) {
        return "text-danger";
    } else if (stock <= 5) {
        return "text-warning-emphasis";
    } else {
        return "text-success";
    }
}

// Cuenta lo que hay en el carrito y muestra el usuario en el menú
function actualizarNavbar() {
    let carrito = leerLista("carrito");
    let cantidad = 0;
    for (let i = 0; i < carrito.length; i++) {
        cantidad = cantidad + carrito[i].cantidad;
    }
    document.getElementById("contadorCarrito").innerText = cantidad;

    let sesion = leerSesion();
    if (sesion != null) {
        document.getElementById("usuarioNav").innerText = "Hola, " + sesion.nombre;
    } else {
        document.getElementById("usuarioNav").innerText = "";
    }
}


// ---------------- INICIO ----------------

function buscarDesdeInicio() {
    // guardamos lo que escribió para usarlo en el catálogo
    localStorage.setItem("busqueda", document.getElementById("busquedaInicio").value);
    window.location.href = "catalogo.html";
    return false;
}


// ---------------- CATÁLOGO (RF-02, RF-03, RF-04, RF-10) ----------------

function cargarCatalogo() {
    actualizarNavbar();

    fetch("data/productos.json")
        .then(function (respuesta) {
            return respuesta.json();
        })
        .then(function (datos) {
            productos = datos;
            // si el administrador cambió precios o stock, usamos lo guardado
            if (localStorage.getItem("productos") != null) {
                productos = leerLista("productos");
            }

            llenarFiltros();

            // si viene una búsqueda desde el inicio
            let busqueda = localStorage.getItem("busqueda");
            if (busqueda != null) {
                document.getElementById("buscar").value = busqueda;
                localStorage.removeItem("busqueda");
            }

            filtrar();
        })
        .catch(function () {
            document.getElementById("listaProductos").innerHTML =
                "<p class='text-danger'>No se pudo cargar el catálogo. Abre el sitio con Live Server.</p>";
        });
}

// llena los select de categoría y marca con lo que hay en el JSON
function llenarFiltros() {
    let categorias = [];
    let marcas = [];

    for (let i = 0; i < productos.length; i++) {
        if (!categorias.includes(productos[i].categoria)) {
            categorias.push(productos[i].categoria);
        }
        if (!marcas.includes(productos[i].marca)) {
            marcas.push(productos[i].marca);
        }
    }

    for (let i = 0; i < categorias.length; i++) {
        document.getElementById("categoria").innerHTML += "<option>" + categorias[i] + "</option>";
    }
    for (let i = 0; i < marcas.length; i++) {
        document.getElementById("marca").innerHTML += "<option>" + marcas[i] + "</option>";
    }
}

function filtrar() {
    let texto = document.getElementById("buscar").value.toLowerCase();
    let tipo = document.getElementById("tipo").value;
    let categoria = document.getElementById("categoria").value;
    let marca = document.getElementById("marca").value;
    let stock = document.getElementById("stock").value;
    let precioMax = document.getElementById("precioMax").value;

    let html = "";
    let encontrados = 0;

    for (let i = 0; i < productos.length; i++) {
        let p = productos[i];
        let datosProducto = (p.nombre + " " + p.codigo + " " + p.marca).toLowerCase();

        // si no cumple algún filtro, pasamos al siguiente producto
        if (texto != "" && !datosProducto.includes(texto)) continue;
        if (tipo != "" && p.tipo != tipo) continue;
        if (categoria != "" && p.categoria != categoria) continue;
        if (marca != "" && p.marca != marca) continue;
        if (stock != "" && textoStock(p.stock) != stock) continue;
        if (precioMax != "" && p.precio > Number(precioMax)) continue;

        html = html + crearTarjeta(p);
        encontrados++;
    }

    if (encontrados == 0) {
        html = "<p>No hay repuestos con esos filtros.</p>";
    }

    document.getElementById("listaProductos").innerHTML = html;
    document.getElementById("cantidadResultados").innerText = encontrados + " repuesto(s) encontrado(s)";
}

function limpiarFiltros() {
    document.getElementById("formFiltros").reset();
    filtrar();
}

function crearTarjeta(p) {
    let tipoTexto = "Automóviles";
    if (p.tipo == "camion") {
        tipoTexto = "Camiones y buses";
    }

    let tarjeta = "<div class='col-12 col-sm-6 col-lg-3'>";
    tarjeta += "<div class='card h-100'>";
    tarjeta += "<div class='card-body'>";
    tarjeta += "<h2 class='h5'>" + p.nombre + "</h2>";
    tarjeta += "<p class='mb-1'>" + tipoTexto + "</p>";
    tarjeta += "<p class='mb-1'><b>Código:</b> " + p.codigo + "</p>";
    tarjeta += "<p class='mb-1'><b>Marca:</b> " + p.marca + "</p>";
    tarjeta += "<p class='mb-1'><b>Categoría:</b> " + p.categoria + "</p>";
    tarjeta += "<p class='mb-1'><b>Precio:</b> " + formatoPesos(p.precio) + "</p>";
    tarjeta += "<p><b>Stock:</b> <span class='" + colorStock(p.stock) + "'>" + textoStock(p.stock) + " (" + p.stock + ")</span></p>";

    tarjeta += "<button type='button' class='btn btn-secondary btn-sm' data-bs-toggle='modal' data-bs-target='#modalDetalle' onclick=\"verDetalle('" + p.codigo + "')\">Ver detalle</button> ";
    if (p.stock > 0) {
        tarjeta += "<button type='button' class='btn btn-danger btn-sm' onclick=\"agregarCarrito('" + p.codigo + "')\">Agregar</button>";
    } else {
        tarjeta += "<button type='button' class='btn btn-danger btn-sm' disabled>Agotado</button>";
    }
    tarjeta += "<br><a href='cotizacion.html' onclick=\"cotizarProducto('" + p.codigo + "')\">Solicitar cotización</a>";
    tarjeta += "</div>";

    tarjeta += "</div></div>";
    return tarjeta;
}

// RF-04: llena la ventana modal con el detalle
function verDetalle(codigo) {
    let p = buscarProducto(codigo);

    document.getElementById("detalleTitulo").innerText = p.nombre;
    document.getElementById("detalleCuerpo").innerHTML =
        "<p>" + p.descripcion + "</p>" +
        "<ul>" +
        "<li><b>Código:</b> " + p.codigo + "</li>" +
        "<li><b>Marca:</b> " + p.marca + "</li>" +
        "<li><b>Compatibilidad:</b> " + p.compatibilidad + "</li>" +
        "<li><b>Categoría:</b> " + p.categoria + "</li>" +
        "<li><b>Origen:</b> " + p.origen + "</li>" +
        "<li><b>Precio:</b> " + formatoPesos(p.precio) + " (IVA incluido)</li>" +
        "<li><b>Stock:</b> " + textoStock(p.stock) + " (" + p.stock + ")</li>" +
        "</ul>";
}

// RF-05: agregar al carrito
function agregarCarrito(codigo) {
    let p = buscarProducto(codigo);
    let carrito = leerLista("carrito");
    let encontrado = false;

    for (let i = 0; i < carrito.length; i++) {
        if (carrito[i].codigo == codigo) {
            encontrado = true;
            if (carrito[i].cantidad >= p.stock) {
                alert("No queda más stock de " + p.nombre);
                return;
            }
            carrito[i].cantidad++;
        }
    }

    if (encontrado == false) {
        carrito.push({ codigo: codigo, cantidad: 1 });
    }

    guardarLista("carrito", carrito);
    actualizarNavbar();
    alert(p.nombre + " se agregó al carrito");
}

function cotizarProducto(codigo) {
    localStorage.setItem("codigoCotizar", codigo);
    window.location.href = "cotizacion.html";
}


// ---------------- CARRITO Y PAGO (RF-05, RF-07) ----------------

function cargarCarrito() {
    actualizarNavbar();

    fetch("data/productos.json")
        .then(function (respuesta) {
            return respuesta.json();
        })
        .then(function (datos) {
            productos = datos;
            if (localStorage.getItem("productos") != null) {
                productos = leerLista("productos");
            }
            mostrarCarrito();
        })
        .catch(function () {
            document.getElementById("cuerpoCarrito").innerHTML =
                "<tr><td colspan='6' class='text-danger'>No se pudo cargar. Abre el sitio con Live Server.</td></tr>";
        });
}

function mostrarCarrito() {
    let carrito = leerLista("carrito");
    let filas = "";
    let subtotal = 0;

    for (let i = 0; i < carrito.length; i++) {
        let p = buscarProducto(carrito[i].codigo);
        let totalFila = p.precio * carrito[i].cantidad;
        subtotal = subtotal + totalFila;

        filas += "<tr>";
        filas += "<td>" + p.codigo + "</td>";
        filas += "<td>" + p.nombre + "</td>";
        filas += "<td>" + formatoPesos(p.precio) + "</td>";
        filas += "<td><input type='number' class='form-control form-control-sm' style='width: 80px' min='1' max='" + p.stock + "' value='" + carrito[i].cantidad + "' aria-label='Cantidad de " + p.nombre + "' onchange=\"cambiarCantidad('" + p.codigo + "', this.value)\"></td>";
        filas += "<td>" + formatoPesos(totalFila) + "</td>";
        filas += "<td><button type='button' class='btn btn-outline-danger btn-sm' onclick=\"eliminarDelCarrito('" + p.codigo + "')\">Eliminar</button></td>";
        filas += "</tr>";
    }

    if (carrito.length == 0) {
        filas = "<tr><td colspan='6'>Tu carrito está vacío. <a href='catalogo.html'>Ir al catálogo</a></td></tr>";
    }
    document.getElementById("cuerpoCarrito").innerHTML = filas;

    // los clientes empresa tienen 10% de descuento
    let descuento = 0;
    let sesion = leerSesion();
    if (sesion != null && sesion.tipo == "empresa") {
        descuento = subtotal * 0.10;
        document.getElementById("filaDescuento").style.display = "table-row";
        document.getElementById("montoDescuento").innerText = "-" + formatoPesos(descuento);
    } else {
        document.getElementById("filaDescuento").style.display = "none";
    }

    totalAPagar = subtotal - descuento;
    document.getElementById("totalCarrito").innerText = formatoPesos(totalAPagar);
}

function cambiarCantidad(codigo, valor) {
    let p = buscarProducto(codigo);
    let cantidad = parseInt(valor);

    if (isNaN(cantidad) || cantidad < 1) {
        cantidad = 1;
    }
    if (cantidad > p.stock) {
        alert("Solo quedan " + p.stock + " unidades de " + p.nombre);
        cantidad = p.stock;
    }

    let carrito = leerLista("carrito");
    for (let i = 0; i < carrito.length; i++) {
        if (carrito[i].codigo == codigo) {
            carrito[i].cantidad = cantidad;
        }
    }
    guardarLista("carrito", carrito);
    mostrarCarrito();
    actualizarNavbar();
}

function eliminarDelCarrito(codigo) {
    let carrito = leerLista("carrito");
    for (let i = 0; i < carrito.length; i++) {
        if (carrito[i].codigo == codigo) {
            carrito.splice(i, 1); // borra 1 elemento en la posición i
            break;
        }
    }
    guardarLista("carrito", carrito);
    mostrarCarrito();
    actualizarNavbar();
}

// si elige despacho se muestra el campo dirección y se vuelve obligatorio
function mostrarDireccion() {
    let direccion = document.getElementById("direccion");
    if (document.getElementById("entregaDespacho").checked) {
        document.getElementById("bloqueDireccion").style.display = "block";
        direccion.required = true;
    } else {
        document.getElementById("bloqueDireccion").style.display = "none";
        direccion.required = false;
    }
}

// el navegador revisa los required antes de llegar aquí
function finalizarPedido() {
    let carrito = leerLista("carrito");
    if (carrito.length == 0) {
        alert("Tu carrito está vacío");
        return false;
    }

    let entrega = "retiro";
    if (document.getElementById("entregaDespacho").checked) {
        entrega = "despacho";
    }

    let pedido = {
        numero: "PED-" + Math.floor(1000 + Math.random() * 9000),
        fecha: new Date().toLocaleString("es-CL"),
        cliente: document.getElementById("nombrePago").value,
        email: document.getElementById("emailPago").value,
        entrega: entrega,
        direccion: document.getElementById("direccion").value,
        medioPago: document.getElementById("medioPago").value,
        productos: carrito,
        total: totalAPagar
    };

    let pedidos = leerLista("pedidos");
    pedidos.push(pedido);
    guardarLista("pedidos", pedidos);

    // descontamos el stock que se vendió
    for (let i = 0; i < carrito.length; i++) {
        let p = buscarProducto(carrito[i].codigo);
        p.stock = p.stock - carrito[i].cantidad;
    }
    guardarLista("productos", productos);

    alert("¡Pedido recibido!\nTu número de pedido es " + pedido.numero + "\nTotal: " + formatoPesos(pedido.total));

    guardarLista("carrito", []);
    document.getElementById("formPago").reset();
    mostrarDireccion();
    mostrarCarrito();
    actualizarNavbar();
    return false; // para que la página no se recargue
}


// ---------------- COTIZACIÓN (RF-06) ----------------

function cargarCotizacion() {
    actualizarNavbar();

    // si viene desde el catálogo con un código, lo rellenamos
    let codigo = localStorage.getItem("codigoCotizar");
    if (codigo != null) {
        document.getElementById("codigoCot").value = codigo;
        localStorage.removeItem("codigoCotizar");
    }

    mostrarCotizaciones("tablaMisCotizaciones", false);
}

function enviarCotizacion() {
    let cotizacion = {
        numero: "COT-" + Math.floor(1000 + Math.random() * 9000),
        fecha: new Date().toLocaleDateString("es-CL"),
        nombre: document.getElementById("nombreCot").value,
        rut: document.getElementById("rutCot").value,
        email: document.getElementById("emailCot").value,
        telefono: document.getElementById("telefonoCot").value,
        codigo: document.getElementById("codigoCot").value,
        cantidad: document.getElementById("cantidadCot").value,
        detalle: document.getElementById("detalleCot").value,
        estado: "Pendiente"
    };

    let cotizaciones = leerLista("cotizaciones");
    cotizaciones.push(cotizacion);
    guardarLista("cotizaciones", cotizaciones);

    alert("¡Solicitud enviada!\nTu número de cotización es " + cotizacion.numero +
        "\nEl administrador de RedPar te responderá a la brevedad.");

    document.getElementById("formCotizacion").reset();
    mostrarCotizaciones("tablaMisCotizaciones", false);
    return false;
}

// se usa en cotización (cliente) y en el panel del admin
function mostrarCotizaciones(idTabla, esAdmin) {
    let cotizaciones = leerLista("cotizaciones");
    let filas = "";

    for (let i = 0; i < cotizaciones.length; i++) {
        let c = cotizaciones[i];
        filas += "<tr>";
        filas += "<td>" + c.numero + "</td>";
        if (esAdmin) {
            filas += "<td>" + quitarEtiquetas(c.nombre) + "</td>";
            filas += "<td>" + quitarEtiquetas(c.email) + "<br>" + quitarEtiquetas(c.telefono) + "</td>";
        } else {
            filas += "<td>" + c.fecha + "</td>";
            filas += "<td>" + quitarEtiquetas(c.codigo) + "</td>";
        }
        filas += "<td>" + c.cantidad + " x " + quitarEtiquetas(c.detalle) + "</td>";
        filas += "<td>" + c.estado;
        if (esAdmin && c.estado == "Pendiente") {
            filas += " <button type='button' class='btn btn-dark btn-sm' onclick=\"responderCotizacion('" + c.numero + "')\">Marcar respondida</button>";
        }
        filas += "</td>";
        filas += "</tr>";
    }

    if (cotizaciones.length == 0) {
        filas = "<tr><td colspan='5'>No hay solicitudes todavía.</td></tr>";
    }
    document.getElementById(idTabla).innerHTML = filas;
}


// ---------------- INGRESO Y PANEL ADMIN (RF-08, RF-09) ----------------

function cargarIngreso() {
    actualizarNavbar();
    mostrarVistaIngreso();
}

function iniciarSesion() {
    // sacamos los puntos del RUT para compararlo
    let rut = document.getElementById("rutIngreso").value.replaceAll(".", "").toUpperCase();
    let clave = document.getElementById("claveIngreso").value;

    // OJO: es una demo sin servidor, las cuentas de prueba están en un JSON
    fetch("data/usuarios.json")
        .then(function (respuesta) {
            return respuesta.json();
        })
        .then(function (usuarios) {
            let usuarioEncontrado = null;
            for (let i = 0; i < usuarios.length; i++) {
                if (usuarios[i].rut == rut && usuarios[i].clave == clave) {
                    usuarioEncontrado = usuarios[i];
                }
            }

            if (usuarioEncontrado == null) {
                alert("RUT o contraseña incorrectos");
                return;
            }

            let sesion = { rut: usuarioEncontrado.rut, nombre: usuarioEncontrado.nombre, tipo: usuarioEncontrado.tipo };
            localStorage.setItem("sesion", JSON.stringify(sesion));
            document.getElementById("formIngreso").reset();
            mostrarVistaIngreso();
        });

    return false;
}

function cerrarSesion() {
    localStorage.removeItem("sesion");
    mostrarVistaIngreso();
}

function mostrarVistaIngreso() {
    actualizarNavbar();
    let sesion = leerSesion();

    if (sesion == null) {
        document.getElementById("bloqueLogin").style.display = "block";
        document.getElementById("bloqueSesion").style.display = "none";
        document.getElementById("panelAdmin").style.display = "none";
        return;
    }

    document.getElementById("bloqueLogin").style.display = "none";
    document.getElementById("bloqueSesion").style.display = "block";

    if (sesion.tipo == "admin") {
        document.getElementById("textoSesion").innerText = "Sesión iniciada como administrador.";
        document.getElementById("panelAdmin").style.display = "block";
        cargarPanelAdmin();
    } else {
        document.getElementById("textoSesion").innerText = "Bienvenido/a " + sesion.nombre + ". Como cliente empresa tienes 10% de descuento en el carrito.";
        document.getElementById("panelAdmin").style.display = "none";
    }
}

function cargarPanelAdmin() {
    fetch("data/productos.json")
        .then(function (respuesta) {
            return respuesta.json();
        })
        .then(function (datos) {
            productos = datos;
            if (localStorage.getItem("productos") != null) {
                productos = leerLista("productos");
            }
            mostrarTablaAdmin();
        });

    mostrarCotizaciones("tablaCotizacionesAdmin", true);
}

function mostrarTablaAdmin() {
    let filas = "";
    for (let i = 0; i < productos.length; i++) {
        let p = productos[i];
        filas += "<tr>";
        filas += "<td>" + p.codigo + "</td>";
        filas += "<td>" + p.nombre + "</td>";
        filas += "<td><input type='number' id='precio-" + p.codigo + "' class='form-control form-control-sm' min='0' value='" + p.precio + "' aria-label='Precio de " + p.nombre + "'></td>";
        filas += "<td><input type='number' id='stock-" + p.codigo + "' class='form-control form-control-sm' min='0' value='" + p.stock + "' aria-label='Stock de " + p.nombre + "'></td>";
        filas += "<td><button type='button' class='btn btn-danger btn-sm' onclick=\"guardarProducto('" + p.codigo + "')\">Guardar</button></td>";
        filas += "</tr>";
    }
    document.getElementById("tablaAdmin").innerHTML = filas;
}

function guardarProducto(codigo) {
    let precio = document.getElementById("precio-" + codigo).value;
    let stock = document.getElementById("stock-" + codigo).value;

    if (precio == "" || stock == "" || Number(precio) < 0 || Number(stock) < 0) {
        alert("El precio y el stock tienen que ser números de 0 o más");
        return;
    }

    let p = buscarProducto(codigo);
    p.precio = Number(precio);
    p.stock = Number(stock);
    guardarLista("productos", productos);
    alert("Repuesto " + codigo + " actualizado");
}

function restablecerDatos() {
    if (confirm("¿Volver a los precios y stock originales?") == true) {
        localStorage.removeItem("productos");
        cargarPanelAdmin();
    }
}

function responderCotizacion(numero) {
    let cotizaciones = leerLista("cotizaciones");
    for (let i = 0; i < cotizaciones.length; i++) {
        if (cotizaciones[i].numero == numero) {
            cotizaciones[i].estado = "Respondida";
        }
    }
    guardarLista("cotizaciones", cotizaciones);
    mostrarCotizaciones("tablaCotizacionesAdmin", true);
}
