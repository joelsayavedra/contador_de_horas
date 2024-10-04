document.getElementById("actualizar").addEventListener("click", function () {
    chrome.storage.local.get("recordInfo", (result) => {
        if (result?.recordInfo) {
            let data = result?.recordInfo;
            console.log("Datos recuperados del storage:", data);
    
            generarTabla(data);
            
        } else {
            console.log("No se encontraron datos almacenados.");
        }
    });
});

function sumarHoras(hora1, hora2) {
    // Separar las horas y minutos
    const [horas1, minutos1] = hora1.split(':').map(Number);
    const [horas2, minutos2] = hora2.split(':').map(Number);

    // Sumar las horas y minutos
    let totalMinutos = minutos1 + minutos2;
    let totalHoras = horas1 + horas2 + Math.floor(totalMinutos / 60); // Convertir minutos a horas

    // Calcular los minutos restantes
    totalMinutos = totalMinutos % 60; // Obtener minutos restantes

    // Asegurarse de que las horas estén en formato de dos dígitos
    totalHoras = String(totalHoras).padStart(2, '0');
    const minutosFormateados = String(totalMinutos).padStart(2, '0');

    return `${totalHoras}:${minutosFormateados}`;
}

let getGroupedData = function (data) {
    try {
        let clientesDict = {};
        let tasksDict = {};
        let desglose = {
            id: data?.id,
            workcalendarhours: data?.workcalendarhours,
            enddate: data?.enddate,
            hourstotal: data?.hourstotal,
            startdate: data?.startdate,
            clientes: {},
        };
        data?.lineas?.forEach(linea => {
            let customer = linea?.customer;
            let task = linea?.casetaskevent;

            if (!clientesDict[customer]) {
                clientesDict[customer] = linea?.customer_display;
            }

            if (!tasksDict[task]) {
                tasksDict[task] = linea?.casetaskevent_display;
            }

            if (!desglose?.clientes?.[customer]) {
                desglose.clientes[customer] = {

                    tasks: {
                        [task]: {
                            t: linea?.hourstotal
                        },
                    },
                };
            } else {
                if (!desglose.clientes[customer]?.tasks?.[task]) {
                    desglose.clientes[customer].tasks[task] = {
                        t: linea?.hourstotal
                    };
                }
            }
        });

        const totalPorCliente = data.lineas.reduce(
            (acumulador, { customer, hourstotal }) => {
                if (!acumulador[customer]) {
                    acumulador[customer] = '00:00';
                }
                acumulador[customer] = sumarHoras(acumulador[customer], hourstotal);
                return acumulador;
            },
            {}
        );

        return {
            clientesDict,
            tasksDict,
            desglose,
            totalPorCliente
        };
    } catch (error) {
        console.error("Error getGroupedData: " + error);
    }
}

// Función para generar la tabla dinámica
function generarTabla(data) {
    const tableBody = document.querySelector("#miTabla tbody");

    // Limpiar el contenido previo de la tabla
    tableBody.innerHTML = "";

    let groupedData = getGroupedData(data);
    console.log({groupedData});
    let clientes = groupedData.desglose.clientes;
    let clientesDict = groupedData.clientesDict;
    let tasksDict = groupedData.tasksDict;
    let totalPorCliente = groupedData.totalPorCliente;

    // Recorrer el array de datos y generar las filas de la tabla
    Object.keys(clientes).forEach((cliente, index) => {
        // Crear fila principal
        const row = document.createElement("tr");

        // Crear celdas para cada columna (nombre, edad, ciudad)
        const cellCliente = document.createElement("td");
        cellCliente.textContent = clientesDict[cliente];
        row.appendChild(cellCliente);
        const cellTotal = document.createElement("td");
        cellTotal.textContent = totalPorCliente[cliente];
        row.appendChild(cellTotal);

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


        // Creación de tabla interna
        const innerTable = document.createElement('table');
        innerTable.className = 'inner-table';

        const innerThead = document.createElement('thead');
        const innerHeaderRow = document.createElement('tr');
        const subHeader1 = document.createElement('th');
        subHeader1.textContent = 'Case/Task/Event';
        const subHeader2 = document.createElement('th');
        subHeader2.textContent = 'Horas invertidas';

        innerHeaderRow.appendChild(subHeader1);
        innerHeaderRow.appendChild(subHeader2);
        innerThead.appendChild(innerHeaderRow);
        innerTable.appendChild(innerThead);
        innerTable.setAttribute("colspan", 4);

        // Crea el cuerpo de la tabla interna
        const innerTbody = document.createElement('tbody');
        let tasks = clientes[cliente].tasks;
        Object.keys(tasks).forEach(task => {

            let row1 = document.createElement('tr');
            let cell1Row1 = document.createElement('td');
            cell1Row1.textContent = tasksDict[task];
            let cell2Row1 = document.createElement('td');
            cell2Row1.textContent = tasks[task].t;
            row1.appendChild(cell1Row1);
            row1.appendChild(cell2Row1);
            innerTbody.appendChild(row1);
            // detallesCell.textContent = tasksDict[task];
        });
        innerTable.appendChild(innerTbody);
        
        const detallesCell = document.createElement("td");
        detallesCell.appendChild(innerTable);
        detallesCell.setAttribute("colspan", 4); // Hace que ocupe todas las columnas
        detallesRow.appendChild(detallesCell);

        
        
        tableBody.appendChild(detallesRow);

        // // Añadir la fila de detalles a la tabla
    });
}

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
