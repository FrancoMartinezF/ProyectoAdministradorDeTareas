eventListeners();

function eventListeners() {
    document.querySelector('#formulario').addEventListener('submit', validarRegistro);
}

function validarRegistro(e) {
    e.preventDefault();

    var usuario = document.querySelector('#usuario').value,
        password = document.querySelector('#password').value,
        tipo = document.querySelector('#tipo').value;


    if (usuario === '' || password === '') {
        //Fallo en la validacion
        swal({
            type: 'error',
            tittle: 'Error!',
            text: 'Ambos campos son obligatorios'
        })
    } else {
        //Ambos campos son correctos, mandar a ejecutar Ajax

        //datos que se envian al servidor
        var datos = new FormData();
        datos.append('usuario', usuario);
        datos.append('password', password);
        datos.append('accion', tipo);

        //crear el llamado a ajax
        var xhr = new XMLHttpRequest();

        //abrir la conexion
        xhr.open('POST', 'inc/modelos/modelo-admin.php', true);

        //retorno de datos

        xhr.onload = function() {
            if (this.status === 200) {
                var respuesta = JSON.parse(xhr.responseText);
                console.log(respuesta);
                //si la respuesta es correcta 
                if (respuesta.respuesta === 'correcto') {
                    //si es un nuevo usuario
                    if (respuesta.tipo === 'crear') {
                        swal({
                            title: 'Usuario Creado',
                            text: 'El usuario ha sido creado correctamente',
                            type: 'success'
                        });
                    } else if (respuesta.tipo === 'login') {
                        swal({
                                title: 'Login Exitoso',
                                text: 'Presiona OK para continuar al dashboard',
                                type: 'success'
                            })
                            .then(resultado => {
                                if (resultado.value) {
                                    window.location.href = 'index.php';
                                }
                            });
                    }
                } else {
                    //hubo un error
                    swal({
                        title: 'Error',
                        text: 'Hubo un error',
                        type: 'error'
                    });
                }
            }
        }

        //enviar peticion
        xhr.send(datos);
    }
}