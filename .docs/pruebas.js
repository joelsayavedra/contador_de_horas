let data = {
    lineas: [
        {
            casetaskevent: '1022441',
            casetaskevent_display: '6.1 Soporte a proyectos (Project Task)',
            customer: '58148',
            customer_display: 'Netsoft / Cloudsuite Horas Internas',
            hours1: '1:00',
            hours3: '1:00',
            hourstotal: '2:00',
            memo1:
                'Revisión descarga masiva SAT Griver: El certificado está vencido, es necesario generar el archivo .pem nuevamente y modificar la instalación del cliente.',
            memo3: 'Revisión de error con Pinpad PErú, se solicitan logs del POS.',
            id: '3465899',
        },
        {
            casetaskevent: '2200459',
            casetaskevent_display:
                '1.4 Juntas Internas Avances/Seguimiento (Project Task)',
            customer: '58148',
            customer_display: 'Netsoft / Cloudsuite Horas Internas',
            hours1: '0:30',
            hours3: '1:00',
            hourstotal: '1:30',
            memo1: 'Revisióon integraciones',
            memo3:
                'Revisión integraciones.\nAcompañamiento a consultoría, se muestra funcionamiento de desarrollo "OC_33196_Cambio en la generación del archivo file_store-information_netsuite_vent_"',
            id: '3465898',
        },
        {
            casetaskevent: '2831855',
            casetaskevent_display: '2.2 Desarrollo (Project Task)',
            customer: '109659',
            customer_display:
                'IX Comercio Chile SPA : Dev IX COMERCIO Convertir Tickets IX a Ticket',
            hours1: '6:30',
            hours3: '8:00',
            hourstotal: '14:30',
            memo1:
                'Se convierte El salvador a tipo data, se comprueba que el resultado en base 64 sea exactamente igual a su versión ticket. Se inicia Ecuador.',
            memo3:
                'Se agrega formateo secuencial, filas condicionales y formateo con locale.\nSe agregan tests de funciones de tabla, se agregan tests de ejemplos template generator.\nSe corrige bug al realizar textwrapping. Se agrega el resto de test de EjemplosTemplateGenerator.',
            id: '3465900',
        },
        {
            casetaskevent: '2820533',
            casetaskevent_display: '5.3 Pase a producción (Project Task)',
            customer: '109138',
            customer_display:
                'IX Comercio Chile SPA : Dev IX COMERCIO Ajustes a tickets',
            hours3: '1:00',
            hourstotal: '1:00',
            memo3:
                'Pase a producción, modificación de jar a petición de Cristian Navarro. Se envía versión con los cambios a QA.',
            id: '3467041',
        },
    ],
    workcalendarhours: '32',
    enddate: '05/10/2024',
    hourstotal: '19:00',
    hourstotal1: '8:00',
    hourstotal3: '11:00',
    id: '104118',
    startdate: '29/09/2024',
    type: 'timesheet',
};

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
}



console.log(JSON.stringify(getGroupedData(data),null,4));
