let recordsData = [
    {
        "clientes": {
            "58148": {
                "tasks": {
                    "1022441": {
                        "t": "3:00"
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
    {
        "clientes": {
            "58148": {
                "tasks": {
                    "1022441": {
                        "t": "8:30"
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
    {
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
]

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

    recordsData.forEach(record => {
        let clientes = record.clientes;
        console.log({clientes});
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

let grandTotal = getGrandTotal(recordsData);
console.log(JSON.stringify(grandTotal, null, 4));
