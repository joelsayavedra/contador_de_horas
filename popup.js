// -----------------------------------------------------------------------
// ------------------------------ CONSTANTES -----------------------------
// -----------------------------------------------------------------------


let STATUS = {
    SIN_STATUS: 0,
    EN_DESARROLLO: 1,
    LIBERADO_POR_QA: 2,
    EN_PRODUCCION: 3,
    STOPPED: 4
};

const statuses = [
    { value: STATUS.SIN_STATUS, text: 'Without status' },
    { value: STATUS.EN_DESARROLLO, text: 'On development' },
    { value: STATUS.LIBERADO_POR_QA, text: 'Approved by QA' },
    { value: STATUS.EN_PRODUCCION, text: 'On production' },
    { value: STATUS.STOPPED, text: 'Stopped' }
];

const MONTHS = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
]

let STATUS_COLORS = {
    [STATUS.SIN_STATUS]:'white',
    [STATUS.EN_DESARROLLO]:'Yellow',
    [STATUS.LIBERADO_POR_QA]:'lightblue',
    [STATUS.EN_PRODUCCION]:'LightGray',
    [STATUS.STOPPED]:'lightcoral',
}

  // -----------------------------------------------------------------------
// ------------------------------- FUNCIONES -----------------------------
// -----------------------------------------------------------------------

let checkAll = async function(check){
    let clientesDict = await cargaClientesDict() || {};
    Object.keys(clientesDict).forEach(cliente => {
        clientesDict[cliente].show = check;
    });
    chrome.storage.local.set({[CLIENTES_DICT]:clientesDict},()=>{
        console.log("Diccionario de clientes actualizado:", clientesDict);
    });
    await listaProyectos();
    await generarTabla();
}

let deleteAllData = async function(){
    async function eliminarDato(clave) {
        chrome.storage.local.remove(clave, () => {
            if (chrome.runtime.lastError) {
                console.error("Error al eliminar el dato:", chrome.runtime.lastError);
            } else {
                console.log(`Dato con la clave '${clave}' ha sido eliminado.`);
            }
        });
    }

    // Llamar a la función para eliminar un dato
    await eliminarDato(TIMESHEETS);
    await eliminarDato(RECORDS_DATA);
    await eliminarDato(CLIENTES_DICT);
    await eliminarDato(TASKS_DICT);
}


function getWeeksOfYear(year) {
    const weeks = [];
    let startDate = new Date(year, 0, 1); // Comenzamos con el 1 de enero del año dado

    // Ajustamos la fecha al lunes de la primera semana del año
    const dayOfWeek = startDate.getDay(); // Obtiene el día de la semana (0 = domingo, 1 = lunes, ...)
    const diffToSunday = 0 - dayOfWeek;
    startDate.setDate(startDate.getDate() + diffToSunday);

    console.log('startDate', startDate);

    // Generar las semanas del año
    while (
        startDate.getFullYear() === year ||
        (startDate.getFullYear() === year + 1 && startDate.getDate() === 1) ||
        startDate.getFullYear() === year - 1
    ) {
        const weekStart = new Date(startDate);
        const weekEnd = new Date(startDate);
        weekEnd.setDate(weekEnd.getDate() + 6); // El domingo de la semana

        // Añadir la semana (inicio y fin)
        weeks.push({
            start: new Date(weekStart),
            end: new Date(weekEnd)
        });

        // Avanzamos al lunes de la siguiente semana
        startDate.setDate(startDate.getDate() + 7);
    }

    return weeks;
}

let formatDate = (date) => {
    try {
        return MONTHS[date.getMonth()] +' '+ date.getDate()
    } catch (error) {
        console.error("Error formatDate: ");        
        console.error(error);        
    }
};

let parseDate = (date) => {
    try {
        const [dia, mes, año] = date.split('/');
        return new Date(año, mes - 1, dia);
    } catch (error) {
        console.error("Error parseDate: ");        
        console.error(error);        
    }
};

let dibujaCuadricula = async function () {
    let recordsData = await cargaRecordsData() || [];
    let startDates = [];
    recordsData.forEach(record => {
        startDates.push(parseDate(record.startdate));
    });

    let year = (new Date()).getFullYear();
    let weeksOfYear = getWeeksOfYear(year);
    document.getElementById('timesheetsViewTitle').innerHTML = year+"";

    // Generar la cuadrícula de semanas
    const weeksGrid = document.getElementById('weeksGrid');

    for (let i = 0; i < weeksOfYear.length; i++) {
        const weekDiv = document.createElement('div');
        weekDiv.classList.add('week');

        let start = weeksOfYear?.[i]?.start;
        let end = weeksOfYear?.[i]?.end;

        weekDiv.innerHTML = formatDate(start)+" <br> to <br>"+formatDate(end);

        if ( startDates.some(fecha => fecha.getTime() === start.getTime())) {
            weekDiv.classList.add('selected'); // Cambiar el color al hacer clic
        }



        // Evento para cambiar el color al hacer clic
        // weekDiv.addEventListener('click', function () {
        //     this.classList.toggle('selected'); // Cambiar el color al hacer clic
        // });

        weeksGrid.appendChild(weekDiv);
    }
}

let listaProyectos = async function(){

    let clientesDict = await cargaClientesDict() || {};

    let tableBody = document.querySelector("#tablaProyectos tbody");
    // Limpiar el contenido previo de la tabla
    tableBody.innerHTML = "";
    Object.keys(clientesDict).forEach((clienteId, index) => {
        let cliente = clientesDict[clienteId];
        let row = document.createElement("tr");

        // Columna Show
        let cellShow = document.createElement("td");
        cellShow.style.textAlign = "center";       // Centrar horizontalmente
        cellShow.style.verticalAlign = "middle";   // Centrar verticalmente
        const checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.id = `checkbox-${clienteId}`;
        checkbox.checked = cliente?.show;
        checkbox.addEventListener('change', function () {
            cliente.show = this.checked;
            console.log({ show: this.checked })
            chrome.storage.local.set({[CLIENTES_DICT]:clientesDict},()=>{
                console.log("Diccionario de clientes actualizado:", clientesDict);
            });
            listaProyectos();
            generarTabla();
        });        
        cellShow.appendChild(checkbox);
        row.appendChild(cellShow);

        // Columna de proyecto
        let cellCliente = document.createElement("td");
        cellCliente.textContent = cliente?.name;
        row.appendChild(cellCliente);
        
        // Columna status
        let cellStatus = document.createElement("td");
        const select = document.createElement('select');
        select.id = `status-${clienteId}`;
        // Rellenar las opciones del select
        statuses.forEach(status => {
            const option = document.createElement('option');
            option.value = status.value;
            option.textContent = status.text;
            if (status.value === cliente?.status) {
                option.selected = true;
            }
            select.appendChild(option);
        });
        // Evento para cambiar el status del proyecto
        select.addEventListener('change', function () {
            cliente.status = parseInt(this.value);
            chrome.storage.local.set({[CLIENTES_DICT]:clientesDict},()=>{
                console.log("Diccionario de clientes actualizado:", clientesDict);
            });
            listaProyectos();
            generarTabla();
        });
        cellStatus.appendChild(select);
        row.appendChild(cellStatus);

        // Color de la fila dependiendo del status
        let status = clientesDict?.[clienteId]?.status;
        row.style.backgroundColor = STATUS_COLORS[status];

        tableBody.appendChild(row);
        

    });

    
}

let writeRecorStatus = async function(message, alreadyAdded){
    let label = document.getElementById("recordStatus");
    if (alreadyAdded) {
        label.style.color = 'green';
    }else{
        label.style.color = 'red';
    }
    label.textContent = message;
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
                writeRecorStatus('Invalid record', false);
                return;
            }

            // let fecha = new Date();
            if (Object.keys(timesheets)?.includes(id)) {
                writeRecorStatus('Record already counted', true);
                // writeRecorStatus('Record already counted ('+fecha.toUTCString()+')');
            }else{
                writeRecorStatus('This record has not been added', false);
            }
        }
    });
}

let updateLocalStorage = async function(data){
    if (!data?.id || data.id=='null') {
        return;
    }

    let timesheets = await cargaTimesheets() || {};
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
    if(!timesheets?.[data?.id]){
        // TODO: Agregar fecha
        timesheets[data?.id] = {
            d: new Date()
        };
    }
    await saveTimesheets(timesheets);
    
    // Elimina el detalle anterior
    if(Object.keys(timesheets)?.includes(data?.id)){
        recordsData = recordsData.filter(objeto => objeto.id !== data?.id);
    }
    recordsData.push(groupedData?.desglose);
    // Actualiza información detallada de la timesheet
    chrome.storage.local.set({[RECORDS_DATA]:recordsData},()=>{
        console.log("Detalles de transacciones actualizados:", recordsData);
    });
    
    // Actualiza diccionarios
    let clientesDictRecord = groupedData?.clientesDict;
    for (const key in clientesDictRecord) {
        if (!clientesDict.hasOwnProperty(key)) {
            clientesDict[key] = clientesDictRecord[key];
        }
    }
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

let saveTimesheets = async function(timesheets){
    await chrome.storage.local.set({[TIMESHEETS]:timesheets},()=>{
        console.log("Timsheets de storage actualizadas:", timesheets);
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
                clientesDict[customer] = {
                    name: linea?.customer_display,
                    status: STATUS.SIN_STATUS,
                    show: true
                };
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
        cellCliente.textContent = clientesDict[cliente]?.name;
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

        // Color de la fila dependiendo del status
        let status = clientesDict?.[cliente]?.status;
        row.style.backgroundColor = STATUS_COLORS[status];

        let show = clientesDict?.[cliente]?.show;
        if (!show) {
            row.style.display = 'none';
        }

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

document.getElementById('freepikLink').addEventListener('click', function() {
    chrome.tabs.create({
        url: 'https://www.flaticon.com/free-icons/calendar'
    });
  });

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

document.getElementById("showAll").addEventListener("click", async function () {
    await checkAll(true);
});
document.getElementById("hideAll").addEventListener("click", async function () {
    await checkAll(false);
});

document.getElementById("deleteAllData").addEventListener("click", async function () {
    await deleteAllData();
    location.reload();
});

document.getElementById("addRecord").addEventListener("click", async function () {
    if(!validRecord){
        return;
    }

    let data = await cargaRecordInfo();

    console.log("Datos recuperados del storage:", data);

    // let groupedData = getGroupedData();

    await updateLocalStorage(data);

    location.reload(); // DEBUG: Recargar el popup completamente 
});

let main = async function(){
    await validaRegistroActual();

    // Tabla de totales
    await generarTabla();

    await dibujaCuadricula();

    await listaProyectos();

}

main();