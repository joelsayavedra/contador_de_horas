console.clear();
let recordsData = {
    1:{
        "clientes": {
            "58148": {
                "tasks": {
                    "1022441": {
                        "t": "3:00",
                        "d":{
                            "20250126-3": {
                                "h": "1:30",
                                "m": "1h: Error con motor de plantillas, se valida impresión de factura con 52 artículos, el error sigue siendo esporádico.\n0.5h: Revisión de error en Descarga Masiva SAT con Griver. Error en política de CORS.",
                                "f": "Miércoles 29 de Enero 2025"
                            },
                            "20250126-4": {
                                "h": "1:00",
                                "m": "Cotización GAL | Integración Básculas Camioneras",
                                "f": "Jueves 30 de Enero 2025"
                            },
                            "20250126-5": {
                                "h": "0:30",
                                "m": "Cortización POS Quadrum.",
                                "f": "Viernes 31 de Enero 2025"
                            }
                        }
                    },
                    "2200459": {
                        "t": "4:30"
                    }
                },
                "total": "07:30"
            },
            "105067": {
                "tasks": {
                    "2720640": {
                        "t": "1:30"
                    }
                },
                "total": "01:30"
            },
            "105238": {
                "tasks": {
                    "2726334": {
                        "t": "4:00"
                    },
                    "2726337": {
                        "t": "6:00"
                    }
                },
                "total": "10:00"
            },
            "109003": {
                "tasks": {
                    "2814547": {
                        "t": "5:30"
                    },
                    "2814548": {
                        "t": "1:00"
                    }
                },
                "total": "06:30"
            },
            "109659": {
                "tasks": {
                    "2831855": {
                        "t": "16:00"
                    }
                },
                "total": "16:00"
            }
        },
        "enddate": "28/09/2024",
        "hourstotal": "41:30",
        "id": "103712",
        "startdate": "22/09/2024",
        "workcalendarhours": "40"
    },
    2:{
        "clientes": {
            "58148": {
                "tasks": {
                    "1022441": {
                        "t": "8:30",
                        "d": {
                            "20250127-1": {
                                "h": "1:00",
                                "m": "Revisión integraciones.\nRetroalimentación.",
                                "f": "Lunes 27 de Enero 2025"
                            },
                            "20250127-2": {
                                "h": "0:30",
                                "m": "Revisión integraciones.",
                                "f": "Martes 28 de Enero 2025"
                            },
                            "20250127-3": {
                                "h": "0:30",
                                "m": "Revisión integraciones.",
                                "f": "Miércoles 29 de Enero 2025"
                            },
                            "20250127-4": {
                                "h": "0:30",
                                "m": "Revisión integraciones.",
                                "f": "Jueves 30 de Enero 2025"
                            },
                            "20250127-5": {
                                "h": "6:00",
                                "m": "0.5h Revisión integraciones.\n5.5h Kick Off.",
                                "f": "Viernes 31 de Enero 2025"
                            }
                        }
                    },
                    "2200459": {
                        "t": "2:30"
                    }
                },
                "total": "11:00"
            },
            "101886": {
                "tasks": {
                    "undefined": {
                        "t": "4:30"
                    }
                },
                "total": "04:30"
            },
            "105238": {
                "tasks": {
                    "2726334": {
                        "t": "8:30"
                    },
                    "2726335": {
                        "t": "6:30"
                    }
                },
                "total": "15:00"
            },
            "107538": {
                "tasks": {
                    "undefined": {
                        "t": "1:30"
                    }
                },
                "total": "01:30"
            }
        },
        "enddate": "21/09/2024",
        "hourstotal": "32:00",
        "id": "103392",
        "startdate": "15/09/2024",
        "workcalendarhours": "32"
    },
    3:{
        "id": "102873",
        "workcalendarhours": "40",
        "enddate": "14/09/2024",
        "hourstotal": "41:30",
        "startdate": "08/09/2024",
        "clientes": {
            "58148": {
                "tasks": {
                    "2200459": {
                        "t": "3:30"
                    }
                },
                "total": "03:30"
            },
            "85749": {
                "tasks": {
                    "2658762": {
                        "t": "4:30"
                    }
                },
                "total": "04:30"
            },
            "105238": {
                "tasks": {
                    "2726334": {
                        "t": "21:30"
                    }
                },
                "total": "21:30"
            },
            "106127": {
                "tasks": {
                    "undefined": {
                        "t": "6:00"
                    }
                },
                "total": "06:00"
            },
            "107538": {
                "tasks": {
                    "2784989": {
                        "t": "6:00"
                    }
                },
                "total": "06:00"
            }
        }
    }
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

let getGrandTotal = function(recordsData){
    let grandTotal = {};

    Object.keys(recordsData).forEach(recordKey => {
        let record = recordsData[recordKey];
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
                Object.keys(tasks).forEach(taskKey => {
                    let task = tasks[taskKey];
                    if(!grandTotal[clienteKey].tasks[taskKey]){
                        grandTotal[clienteKey].tasks[taskKey] = task;
                    }else{

                        console.log({task, taskKey});

                        grandTotal[clienteKey].tasks[taskKey].d = {
                            ...grandTotal[clienteKey].tasks[taskKey].d,
                            ...task.d
                        }
                        
                        // Suma total de task
                        grandTotal[clienteKey].tasks[taskKey].t = sumarHoras(grandTotal[clienteKey].tasks[taskKey].t, task.t);
                    }
                });

            }
        });
    });
    
    return grandTotal;
}

let grandTotal = getGrandTotal(recordsData);
console.log(grandTotal);
// console.log(JSON.stringify(grandTotal, null, 4));
