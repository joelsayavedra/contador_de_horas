// -----------------------------------------------------------------------
// ------------------------------- FUNCIONES -----------------------------
// -----------------------------------------------------------------------
let writeRecorStatus = async function(message){
    document.getElementById("recordStatus").textContent = message;
}



let validaRegistroActual = async function(){
    let timesheets = await cargaTimesheets();


    let urlString = "";
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {

            urlString = tabs[0].url;
            const url = new URL(urlString);
            const params = url.searchParams;
            const id = params.get('id')+""; // "value1"
            console.log({id, timesheets});

            if (!id || id=='null') {
                validRegister = false;
                writeRecorStatus('Registro inválido');
                return;
            }

            let fecha = new Date;
            if (timesheets?.includes(id)) {
                writeRecorStatus('Este registro se contabilizó ('+fecha.toUTCString()+')');
            }else{
                writeRecorStatus('Este registro no se ha contabilizado');
            }
        }
    });
}

let updateLocalStorage = async function(data){
    if (!data?.id) {
        return;
    }
    let timesheets = await cargaTimesheets() || [];

    if(!timesheets?.includes(data?.id)){
        timesheets.push(data?.id);
        chrome.storage.local.set({[TIMESHEETS]:timesheets},()=>{
            console.log("Timsheets de storage actualizadas:", timesheets);
            let fecha = new Date;
            writeRecorStatus('Este registro se contabilizó ('+fecha.toUTCString()+')');
        })
    }

};

let cargaTimesheets = async function(){
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(TIMESHEETS, (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(result[TIMESHEETS]);
            }
        });
    });
}
let cargaRecordInfo = async function(){
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(RECORD_INFO, (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(result[RECORD_INFO]);
            }
        });
    });
}



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



// -----------------------------------------------------------------------
// ----------------------------- EJECUCIÓN-- -----------------------------
// -----------------------------------------------------------------------

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'reloadPopup') {
        // Lógica para recargar o actualizar el popup
        console.log('Recargando el popup...');
        location.reload(); // Recargar el popup completamente
    }
});

const TIMESHEETS = "addedTimesheets";
const RECORD_INFO = "recordInfo";

let validRegister = true;

document.getElementById("actualizar").addEventListener("click", async function () {
    if(!validRegister){
        return;
    }

    let data = await cargaRecordInfo();

    console.log("Datos recuperados del storage:", data);

    // let groupedData = getGroupedData();

    updateLocalStorage(data);

    generarTabla(data);

});


// Valida si la hoja actual ya se contabilizó
validaRegistroActual();







// function eliminarDato(clave) {
//     chrome.storage.local.remove(clave, () => {
//         if (chrome.runtime.lastError) {
//             console.error("Error al eliminar el dato:", chrome.runtime.lastError);
//         } else {
//             console.log(`Dato con la clave '${clave}' ha sido eliminado.`);
//         }
//     });
// }

// // Llamar a la función para eliminar un dato
// eliminarDato(TIMESHEETS);
