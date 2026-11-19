
document.addEventListener("DOMContentLoaded", () => {

    // =========================================================
    // 1. FILTRO DE BÚSQUEDA EN EL CATÁLOGO (RF-10)
    // =========================================================
    const formFiltros = document.querySelector("#catalogo form");
    const inputBuscar = document.getElementById("buscar");
    const productos = document.querySelectorAll("#catalogo article");

    if (formFiltros) {
        formFiltros.addEventListener("submit", (evento) => {
            evento.preventDefault(); // Evita que la página se recargue
            const textoBuscado = inputBuscar.value.toLowerCase().trim();

            productos.forEach((producto) => {
                const contenidoProducto = producto.textContent.toLowerCase();
                // Si el texto del repuesto coincide con la búsqueda, se muestra; si no, se oculta
                if (contenidoProducto.includes(textoBuscado)) {
                    producto.style.display = "block";
                } else {
                    producto.style.display = "none";
                }
            });
        });
    }

    // =========================================================
    // 2. BOTONES DE AGREGAR AL CARRITO (RF-05)
    // =========================================================
    const botonesAgregar = document.querySelectorAll("#catalogo article button");

    botonesAgregar.forEach((boton) => {
        if (boton.textContent.includes("Agregar al Carrito")) {
            boton.addEventListener("click", () => {
                // Obtiene el título (h3) del repuesto seleccionado
                const nombreRepuesto = boton.parentElement.querySelector("h3").textContent;
                alert(`✅ "${nombreRepuesto}" fue agregado al carrito de compras.`);
            });
        }
    });

    // =========================================================
    // 3. SOLICITUD DE COTIZACIÓN CON N° DE TICKET (RF-06)
    // =========================================================
    const formCotizacion = document.querySelector("#cotizacion form");

    if (formCotizacion) {
        formCotizacion.addEventListener("submit", (evento) => {
            evento.preventDefault();
            const nombreCliente = document.getElementById("nombre_cotiz").value;
            // Genera un número de solicitud aleatorio de 4 dígitos como pide el RF-06
            const numeroSolicitud = Math.floor(1000 + Math.random() * 9000);

            alert(`📩 ¡Solicitud enviada, ${nombreCliente}!\nTu número de cotización es: #COT-${numeroSolicitud}.\nEl administrador de RedPar responderá a la brevedad.`);
            formCotizacion.reset(); // Limpia el formulario
        });
    }

    // =========================================================
    // 4. INICIO DE SESIÓN EMPRESA / ADMIN (RF-08)
    // =========================================================
    const formIngreso = document.querySelector("#ingreso form");

    if (formIngreso) {
        formIngreso.addEventListener("submit", (evento) => {
            evento.preventDefault();
            const rutIngresado = document.getElementById("usuario_rut").value;
            alert(`🔐 Sesión iniciada correctamente para el RUT: ${rutIngresado}`);
        });
    }

    // =========================================================
    // 5. PANEL DE ADMINISTRACIÓN: GUARDAR STOCK Y PRECIO (RF-09)
    // =========================================================
    const botonesGuardarStock = document.querySelectorAll("#ingreso table button");

    botonesGuardarStock.forEach((boton) => {
        boton.addEventListener("click", () => {
            const fila = boton.closest("tr");
            const nombreProducto = fila.children[1].textContent;
            const nuevoPrecio = fila.children[2].querySelector("input").value;
            const nuevoStock = fila.children[3].querySelector("input").value;

            alert(`💾 Actualizado en sistema:\nRepuesto: ${nombreProducto}\nNuevo Precio: $${nuevoPrecio}\nNuevo Stock: ${nuevoStock} unidades`);
        });
    });

});
