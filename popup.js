// -----------------------------------------------------------------------
// ------------------------------- FUNCIONES -----------------------------
// -----------------------------------------------------------------------
let writeRecorStatus = async function(message){
    document.getElementById("recordStatus").textContent = message;
}

let getGrandTotal = function(recordsData){
    let grandTotal = {};

    recordsData.forEach(record => {
        let clientes = record.clientes;
        Object.keys(clientes).forEach(clienteKey => {
            let cliente = clientes[clienteKey];
            if(!grandTotal[clienteKey]){
                grandTotal[clienteKey] = cliente;
            }else{
                // Suma totales por cliente
                grandTotal[clienteKey].total = sumarHoras(grandTotal[clienteKey].total, cliente.total);

                // Combina tasks
                let tasks = cliente?.tasks;
                Object.keys(tasks).forEach(taksKey => {
                    let task = tasks[taksKey];
                    if(!grandTotal[clienteKey].tasks[taksKey]){
                        grandTotal[clienteKey].tasks[taksKey] = task;
                    }else{
                        // Suma total de task
                        grandTotal[clienteKey].tasks[taksKey].t = sumarHoras(grandTotal[clienteKey].tasks[taksKey].t, task.t);
                    }
                });

            }
        });
    });
    
    return grandTotal;
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
                validRecord = false;
                writeRecorStatus('Invalid record');
                return;
            }

            let fecha = new Date;
            if (timesheets?.includes(id)) {
                writeRecorStatus('Record already counted');
                // writeRecorStatus('Record already counted ('+fecha.toUTCString()+')');
            }else{
                writeRecorStatus('This record has not been added');
            }
        }
    });
}

let updateLocalStorage = async function(data){
    if (!data?.id || data.id=='null') {
        return;
    }

    let timesheets = await cargaTimesheets() || [];
    let recordsData = await cargaRecordsData() || [];
    let clientesDict = await cargaClientesDict() || {};
    let tasksDict = await cargaTasksDict() || {};
    let groupedData = getGroupedData(data);

    console.log({
        timesheets,
        recordsData,
        clientesDict,
        tasksDict,
        groupedData,
    });

    
    // Actualiza ids de timesheets
    // agrega el id si no existe
    if(!timesheets?.includes(data?.id)){
        // TODO: Agregar fecha
        timesheets.push(data?.id);
    }
    chrome.storage.local.set({[TIMESHEETS]:timesheets},()=>{
        console.log("Timsheets de storage actualizadas:", timesheets);
        let fecha = new Date;
        writeRecorStatus('Este registro se contabilizó ('+fecha.toUTCString()+')');
    });
    
    // Elimina el detalle anterior
    if(timesheets?.includes(data?.id)){
        recordsData = recordsData.filter(objeto => objeto.id !== data?.id);
    }
    recordsData.push(groupedData?.desglose);
    // Actualiza información detallada de la timesheet
    chrome.storage.local.set({[RECORDS_DATA]:recordsData},()=>{
        console.log("Detalles de transacciones actualizados:", recordsData);
    });
    
    // Actualiza diccionarios
    clientesDict = {...clientesDict, ...groupedData?.clientesDict};
    tasksDict = {...tasksDict, ...groupedData?.tasksDict};
    chrome.storage.local.set({[CLIENTES_DICT]:clientesDict},()=>{
        console.log("Diccionario de clientes actualizado:", clientesDict);
    });
    chrome.storage.local.set({[TASKS_DICT]:tasksDict},()=>{
        console.log("Diccionario de tareas actualizado:", tasksDict);
    });


};

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
let cargaRecordsData = async function(){
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(RECORDS_DATA, (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(result[RECORDS_DATA]);
            }
        });
    });
}
let cargaClientesDict = async function(){
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(CLIENTES_DICT, (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(result[CLIENTES_DICT]);
            }
        });
    });
}
let cargaTasksDict = async function(){
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(TASKS_DICT, (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(result[TASKS_DICT]);
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
                    total: totalPorCliente[customer]
                };
            } else {
                if (!desglose.clientes[customer]?.tasks?.[task]) {
                    desglose.clientes[customer].tasks[task] = {
                        t: linea?.hourstotal
                    };
                }
            }
        });

        

        return {
            clientesDict,
            tasksDict,
            desglose
        };
    } catch (error) {
        console.error("Error getGroupedData: " + error);
    }
}

// Función para generar la tabla dinámica
async function generarTabla() {
    const tableBody = document.querySelector("#miTabla tbody");

    // Limpiar el contenido previo de la tabla
    tableBody.innerHTML = "";

    let recordsData = await cargaRecordsData() || [];
    let clientesDict = await cargaClientesDict() || {};
    let tasksDict = await cargaTasksDict() || {};
    let clientes = getGrandTotal(recordsData);

    // Recorrer el array de datos y generar las filas de la tabla
    Object.keys(clientes).forEach((cliente, index) => {
        // Crear fila principal
        const row = document.createElement("tr");

        // Crear celdas para cada columna (nombre, edad, ciudad)
        const cellCliente = document.createElement("td");
        cellCliente.textContent = clientesDict[cliente];
        row.appendChild(cellCliente);
        const cellTotal = document.createElement("td");
        cellTotal.textContent = clientes[cliente]?.total;
        row.appendChild(cellTotal);

        // Agregar celda con botón para desplegar detalles
        const accionCell = document.createElement("td");
        const boton = document.createElement("button");
        boton.textContent = "Detail";
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
        subHeader2.textContent = 'Time spent';

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

let toggleDetalles = function(index) {
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

const grandTotalView = document.getElementById('grandTotalView');
const timesheetsView = document.getElementById('timesheetsView');
const projectsView = document.getElementById('projectsView');
const aboutView = document.getElementById('aboutView');
const grandTotalButton = document.getElementById('grandTotalButton');
const timesheetsButton = document.getElementById('timesheetsButton');
const projectsButton = document.getElementById('projectsButton');
const aboutButton = document.getElementById('aboutButton');

grandTotalView.style.display = 'block';
timesheetsView.style.display = 'none';
projectsView.style.display = 'none';
aboutView.style.display = 'none';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'reloadPopup') {
        // Lógica para recargar o actualizar el popup
        console.log('Recargando el popup...');
        location.reload(); // Recargar el popup completamente
    }
});

grandTotalButton.addEventListener('click', function () {
    grandTotalView.style.display = 'block';
    timesheetsView.style.display = 'none';
    projectsView.style.display = 'none';
    aboutView.style.display = 'none';
    grandTotalButton.classList.add('active');
    timesheetsButton.classList.remove('active');
    projectsButton.classList.remove('active');
    aboutButton.classList.remove('active');
});

timesheetsButton.addEventListener('click', function () {
    grandTotalView.style.display = 'none';
    timesheetsView.style.display = 'block';
    projectsView.style.display = 'none';
    aboutView.style.display = 'none';
    grandTotalButton.classList.remove('active');
    timesheetsButton.classList.add('active');
    projectsButton.classList.remove('active');
    aboutButton.classList.remove('active');
});

projectsButton.addEventListener('click', function () {
    grandTotalView.style.display = 'none';
    timesheetsView.style.display = 'none';
    projectsView.style.display = 'block';
    aboutView.style.display = 'none';
    grandTotalButton.classList.remove('active');
    timesheetsButton.classList.remove('active');
    projectsButton.classList.add('active');
    aboutButton.classList.remove('active');
});

aboutButton.addEventListener('click', function () {
    grandTotalView.style.display = 'none';
    timesheetsView.style.display = 'none';
    projectsView.style.display = 'none';
    aboutView.style.display = 'block';
    grandTotalButton.classList.remove('active');
    timesheetsButton.classList.remove('active');
    projectsButton.classList.remove('active');
    aboutButton.classList.add('active');
});

const RECORD_INFO = "recordInfo";
const TIMESHEETS = "addedTimesheets";
const RECORDS_DATA = "recordsData";
const CLIENTES_DICT = "clientesDict";
const TASKS_DICT = "tasksDict";

let validRecord = true;

document.getElementById("actualizar").addEventListener("click", async function () {
    if(!validRecord){
        return;
    }

    let data = await cargaRecordInfo();

    console.log("Datos recuperados del storage:", data);

    // let groupedData = getGroupedData();

    await updateLocalStorage(data);

    // location.reload(); // DEBUG: Recargar el popup completamente 
});

let main = async function(){
    await validaRegistroActual();
    await generarTabla();

}



main();



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
// eliminarDato(RECORDS_DATA);
// eliminarDato(CLIENTES_DICT);
// eliminarDato(TASKS_DICT);