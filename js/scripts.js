var listaProyectos = document.querySelector('ul#proyectos');
eventListeners();
//lista de proyectos
var listaProyectos = document.querySelector('ul#proyectos');

function eventListeners() {
    //Document ready
    document.addEventListener('DOMContentLoaded', function() {
        actualizarProgreso();
    });
    //boton para crear proyecto
    document.querySelector('.crear-proyecto a').addEventListener('click', nuevoProyecto);

    //Boton para una nueva tarea
    if (document.querySelector('.nueva-tarea')) {
        document.querySelector('.nueva-tarea').addEventListener('click', agregarTarea);
    }


    //Botones para las acciones de las tareas
    document.querySelector('.listado-pendientes').addEventListener('click', accionesTareas);
}

function nuevoProyecto(e) {
    e.preventDefault();
    //crear un <input> para el nombre del nuevo proyecto
    var nuevoProyecto = document.createElement('li');
    nuevoProyecto.innerHTML = '<input type="text" id="nuevo-proyecto">';
    listaProyectos.appendChild(nuevoProyecto);

    //seleccionar el ID con el nuevoProyecto
    var inputNuevoProyecto = document.querySelector('#nuevo-proyecto');

    //al presionar enter, crear el proyecto
    inputNuevoProyecto.addEventListener('keypress', function(e) {
        var tecla = e.which || e.keyCode;

        if (tecla === 13) {
            guardarProyectoDB(inputNuevoProyecto.value);
            listaProyectos.removeChild(nuevoProyecto);
        }
    });
}

function guardarProyectoDB(nombreProyecto) {
    //crear llamado ajaax
    var xhr = new XMLHttpRequest();

    //enviar datos por form data
    var datos = new FormData();
    datos.append('proyecto', nombreProyecto);
    datos.append('accion', 'crear');

    //abrir la conexion
    xhr.open('POST', 'inc/modelos/modelo-proyecto.php', true);

    //En la carga
    xhr.onload = function() {
        if (this.status === 200) {
            //obtener respuesta
            var respuesta = JSON.parse(xhr.responseText);
            var proyecto = respuesta.nombre_proyecto,
                id_proyecto = respuesta.id_insertado,
                tipo = respuesta.tipo,
                resultado = respuesta.respuesta;
            //comprobar la insercion
            if (resultado === 'correcto') {
                //fue exitoso
                if (tipo === 'crear') {
                    //se creo un proyecto
                    //Inyectar HTML
                    var nuevoProyecto = document.createElement('li');
                    nuevoProyecto.innerHTML = `
                        <a href="index.php?id_proyecto=${id_proyecto}" id="proyecto:${id_proyecto}">
                            ${proyecto}
                        </a>
                    `;
                    //agregar al html
                    listaProyectos.appendChild(nuevoProyecto);

                    //enviar alerta
                    swal({
                            title: 'Proyecto Creado',
                            text: 'El proyecto: ' + proyecto + ' se creó correctamente',
                            type: 'success'
                        })
                        .then(resultado => {
                            //redireccionar a la nueva url
                            if (resultado.value) {
                                window.location.href = 'index.php?id_proyecto=' + id_proyecto;
                            }
                        });

                } else {
                    //se actualizo o se elimino
                }
            } else {
                //hubo un error
                swal({
                    type: 'error',
                    title: 'Error!',
                    text: 'Hubo un error!'
                });
            }

        }

    }

    //enviar el request
    xhr.send(datos);
}

//agregar una nueva tarea al proyecto actual
function agregarTarea(e) {
    e.preventDefault();

    var nombreTarea = document.querySelector('.nombre-tarea').value;
    //validar que el campo tenga algo escrito
    if (nombreTarea === '') {
        swal({
            title: 'Error',
            text: 'Una tarea debe tener nombre',
            type: 'error'
        });
    } else {
        //la tarea tiene algo, insertar en php
        //crear llamdo a ajax
        var xhr = new XMLHttpRequest();

        //crear form data
        var datos = new FormData();
        datos.append('tarea', nombreTarea);
        datos.append('accion', 'crear');
        datos.append('id_proyecto', document.querySelector('#id_proyecto').value);
        //abrir conexion
        xhr.open('POST', 'inc/modelos/modelo-tareas.php', true);

        //ejecutarlo y respuesta
        xhr.onload = function() {
            if (this.status === 200) {
                //todo correcto
                var respuesta = JSON.parse(xhr.responseText);
                //asignar valores
                var resultado = respuesta.respuesta,
                    tarea = respuesta.tarea,
                    id_insertado = respuesta.id_insertado,
                    tipo = respuesta.tipo;
                if (resultado === 'correcto') {
                    //se agrego correctamente
                    if (tipo === 'crear') {
                        //lanzar alerta
                        swal({
                            title: 'Tarea Creada',
                            text: 'Tarea: ' + tarea + ' se creó correctamente.',
                            type: 'success'
                        });
                        //seleccionar el parrafo con la lista vacia
                        var parrafoListaVacia = document.querySelectorAll('.lista-vacia');
                        if (parrafoListaVacia.length > 0) {
                            document.querySelector('.lista-vacia').remove();
                        }
                        //Construir el template
                        var nuevaTarea = document.createElement('li');

                        //agregamos el ID
                        nuevaTarea.id = 'tarea:' + id_insertado;

                        //agregar la clase tarea
                        nuevaTarea.classList.add('tarea');

                        //Construir el html
                        nuevaTarea.innerHTML = `
                            <p>${tarea}</p>
                            <div class="acciones">
                                <i class="far fa-check-circle"></i>
                                <i class="fas fa-trash"></i>
                            </div>
                        `;

                        //agregarlo al HTML
                        var listado = document.querySelector('.listado-pendientes ul');
                        listado.appendChild(nuevaTarea);

                        //Limpiar el formulario
                        document.querySelector('.agregar-tarea').reset();

                        //Actualizar el progreso
                        actualizarProgreso();
                    }
                } else {
                    //Hubo un error
                    swal({
                        title: 'Error',
                        text: 'Hubo un error',
                        type: 'error'
                    });
                }
            }
        }

        //enviar la consulta
        xhr.send(datos);
    }
}

//Cambia el estado de las tareas o las elimina

function accionesTareas(e) {
    e.preventDefault();
    if (e.target.classList.contains('fa-check-circle')) {
        if (e.target.classList.contains('completo')) {
            e.target.classList.remove('completo');
            cambiarEstadoTarea(e.target, 0);
        } else {
            e.target.classList.add('completo');
            cambiarEstadoTarea(e.target, 1);
        }
    }
    if (e.target.classList.contains('fa-trash')) {
        Swal.fire({
            title: 'Seguro?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, borrar!',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.value) {
                var tareaEliminar = e.target.parentElement.parentElement;
                //Borrar de la BD
                eliminarTareaBD(tareaEliminar);
                //Borrar del HTML
                tareaEliminar.remove();
                Swal.fire(
                    'Eliminado!',
                    'La tarea ha sido eliminada',
                    'success'
                )
            }
        })
    }
}

//marcar o desmarcar una tarea
function cambiarEstadoTarea(tarea, estado) {
    var idTarea = tarea.parentElement.parentElement.id.split(':');
    //crear llamado a ajax
    var xhr = new XMLHttpRequest();

    //informacion 
    var datos = new FormData();
    datos.append('id', idTarea[1]);
    datos.append('accion', 'actualizar');
    datos.append('estado', estado);
    //abrir la conexion
    xhr.open('POST', 'inc/modelos/modelo-tareas.php', true);

    //onload
    xhr.onload = function() {
        if (this.status === 200) {
            console.log(JSON.parse(xhr.responseText));
            //Actualizar el progreso
            actualizarProgreso();
        }
    }

    //enviar peticion
    xhr.send(datos);
}

//Eliminar tarea de la base de datos
function eliminarTareaBD(tarea) {
    var idTarea = tarea.id.split(':');
    //crear llamado a ajax
    var xhr = new XMLHttpRequest();

    //informacion 
    var datos = new FormData();
    datos.append('id', idTarea[1]);
    datos.append('accion', 'eliminar');
    //abrir la conexion
    xhr.open('POST', 'inc/modelos/modelo-tareas.php', true);

    //onload
    xhr.onload = function() {
        if (this.status === 200) {
            console.log(JSON.parse(xhr.responseText));
            //comprobar que haya tareas restantes
            var listaTareasRestantes = document.querySelectorAll('li.tarea');
            if (listaTareasRestantes.length === 0) {
                document.querySelector('.listado-pendientes ul').innerHTML = "<p class='lista-vacia'>No hay tareas en este proyecto</p>";
            }
            //Actualizar el progreso
            actualizarProgreso()
        }
    }

    //enviar peticion
    xhr.send(datos);
}

//actualizar avance del proyecto
function actualizarProgreso() {
    //Obtener todas las tareas
    const tareas = document.querySelectorAll('li.tarea');

    //Obtener las tareas completadas
    const tareasCompletadas = document.querySelectorAll('i.completo');
    //determinar el avance
    const avance = Math.round((tareasCompletadas.length / tareas.length) * 100);

    //Asignar avance a la barra
    const porcentaje = document.querySelector('#porcentaje');
    porcentaje.style.width = avance + '%';

    //Mostrar alerta al llegar al 100%
    if (avance === 100) {
        swal({
            title: 'Proyecto Terminado',
            text: 'Por el momento no hay tareas pendientes',
            type: 'success'
        });
    }
}