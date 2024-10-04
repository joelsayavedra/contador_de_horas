// document.getElementById("guardar").addEventListener("click", function () {
//     chrome.storage.sync.set({ info: "Ejemplo de información" }, function () {
//         console.log("Información guardada.");
//     });
// });

// document.getElementById("mostrar").addEventListener("click", function () {
//     chrome.storage.sync.get(["info"], function (result) {
//         console.log("Información recuperada: " + result?.info);
//     });
// });


// chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
//     const response = await fetch(`${tab.url}&xml=T`,{credentials: 'include'});
//     const data = await response.text();

//     console.log('data', data);
// });

// chrome.tabs.executeScript({
//     target: { tabId: tab.id },
//     files: ['contentScript.js']
// });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Mensaje recibido en el popup:", message);
    // Aquí puedes procesar el mensaje recibido
});


// Array con los datos a insertar en la tabla, incluyendo detalles adicionales
const data = [
    {
        nombre: "IX Comercio Chile SPA : Dev IX COMERCIO OC_33196_Cambio en la generación",
        edad: "2.2 Desarrollo (Project Task)",
        detalles: "Detalles"
    },
    {
        nombre: "IX Comercio Chile SPA : Dev IX COMERCIO OC_33196_Cambio en la generación",
        edad: "2.2 Desarrollo (Project Task)",
        detalles: "Detalles"
    },
    {
        nombre: "IX Comercio Chile SPA : Dev IX COMERCIO OC_33196_Cambio en la generación",
        edad: "2.2 Desarrollo (Project Task)",
        detalles: "Detalles"
    },
    {
        nombre: "IX Comercio Chile SPA : Dev IX COMERCIO OC_33196_Cambio en la generación",
        edad: "2.2 Desarrollo (Project Task)",
        detalles: "Detalles"
    },
];

// Función para generar la tabla dinámica
function generarTabla(data) {
    const tableBody = document.querySelector("#miTabla tbody");

    // Limpiar el contenido previo de la tabla
    tableBody.innerHTML = "";

    // Recorrer el array de datos y generar las filas de la tabla
    data.forEach((item, index) => {
        // Crear fila principal
        const row = document.createElement("tr");

        // Crear celdas para cada columna (nombre, edad, ciudad)
        Object.keys(item).forEach((key) => {
            if (key !== 'detalles') { // No incluir los detalles en la fila principal
                const cell = document.createElement("td");
                cell.textContent = item[key];
                row.appendChild(cell);
            }
        });

        // Agregar celda con botón para desplegar detalles
        const accionCell = document.createElement("td");
        const boton = document.createElement("button");
        boton.textContent = "Detalles";
        boton.onclick = () => toggleDetalles(index); // Llama a la función para mostrar detalles
        accionCell.appendChild(boton);
        row.appendChild(accionCell);

        // Añadir la fila principal al cuerpo de la tabla
        tableBody.appendChild(row);

        // Crear una fila extra para los detalles (inicialmente oculta)
        const detallesRow = document.createElement("tr");
        detallesRow.classList.add("detalles"); // Oculta por defecto

        const detallesCell = document.createElement("td");
        detallesCell.setAttribute("colspan", 4); // Hace que ocupe todas las columnas
        detallesCell.textContent = item.detalles;
        detallesRow.appendChild(detallesCell);

        // Añadir la fila de detalles a la tabla
        tableBody.appendChild(detallesRow);
    });
}

// Función para mostrar/ocultar los detalles de una fila
function toggleDetalles(index) {
    const detallesRows = document.querySelectorAll(".detalles");
    const detallesRow = detallesRows[index];

    // Alternar visibilidad de la fila de detalles
    if (detallesRow.style.display === "none" || !detallesRow.style.display) {
        detallesRow.style.display = "table-row"; // Mostrar detalles
    } else {
        detallesRow.style.display = "none"; // Ocultar detalles
    }
}

// Llamada para generar la tabla con los datos del array
generarTabla(data);