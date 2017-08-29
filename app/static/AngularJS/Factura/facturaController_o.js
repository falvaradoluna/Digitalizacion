registrationModule.controller("facturaController", function($scope, $rootScope,$location, utils, localStorageService, alertFactory, documentoRepository, alertaRepository, empleadoRepository, facturaRepository) {


    //Mensajes en caso de error
    var errorCallBack = function(data, status, headers, config) {
        $('#btnConfirmar').button('reset');
        alertFactory.error('Ocurrio un problema');
    };
    //Grupo de funciones de inicio
    $scope.init = function() {

        getFolio();
        getEmpleado();
        //getIdAprobacion();
        //LMS 09/05/2016 Obtengo lista de documentos
        $scope.btnView = true;
        getListaDocumentos();

        $scope.consultaInicial = 1;
        //$scope.respuesta = "1";
        $scope.respuesta = {
            opcion: '1'
        };
        $rootScope.currentidProceso = getParameterByName('proceso');
    };

    var getFolio = function() {
        if (getParameterByName('id') != '') {
            $rootScope.currentFolioFactura = getParameterByName('id');
        }

        if ($rootScope.currentFolioFactura == null) {
            var idFolioFactura = prompt("Ingrese un folio de orden", 1);
            $rootScope.currentFolioFactura = idFolioFactura;
        }
    };
    //LMS 08/06/2016
    var getIdAprobacion = function() {
        if (getParameterByName('idAprobacion') != '') {
            $rootScope.currentIdAprobacion = getParameterByName('idAprobacion');
            alert($rootScope.currentIdAprobacion);
        }

        if ($rootScope.currentIdAprobacion == null) {
            var idAprobacion = prompt("Ingrese un idAprobacion", 1);
            $rootScope.currentIdAprobacion = idAprobacion;
        }
    };

    var getEmpleado = function() {
        if (getParameterByName('employee') != '') {
            $rootScope.currentEmployee = getParameterByName('employee');
        }

        if ($rootScope.currentEmployee == null) {
            var idEmpleado = prompt("Ingrese un número de empleado", 1);
            $rootScope.currentEmployee = idEmpleado;
        }

        //setTimeout(function(){ 
        facturaRepository.getDoc($rootScope.currentFolioFactura, $rootScope.currentEmployee, 11) //se busca que exista la factura (id = 20) para mostrar
            .success(getDocSuccessCallback)
            .error(errorCallBack);
        //},2000);
    };


    //LMS 09/05/2016 Funcion que obtiene la lista de documentos del Nodo 7 
    var getListaDocumentos = function() {
        documentoRepository.getByNodo('7', $rootScope.currentFolioFactura, getParameterByName('perfil'))
            .success(getByNodoSuccessCallback)
            .error(errorCallBack);
    }

    //LMS 09/05/2016 Success de obtener todos los documentos del Nodo 7
    var getByNodoSuccessCallback = function(data, status, headers, config) {
        if (data != null) {
            $scope.resultado = [];
            angular.forEach(data, function(value, key) {
                if (value.idDocumento == 10 && (value.existeDoc == '' || value.existeDoc == null)) {

                } else {
                    $scope.resultado[key] = value;
                }
            });

            $scope.listaDocumentos = $scope.resultado;


        ////LMS
        angular.forEach($scope.listaDocumentos, function(value, key) {
            if (value.idDocumento == 20 && value.estatusDoc == 2) {
                $scope.btnView = false;
            }
        });
        ////
            //alertFactory.success('Lista de Documentos cargada');
        } else {
            alertFactory.warning('No hay documentos para Mostrar');
        }
    }

    var getDocSuccessCallback = function(data, status, headers, config) {
        if (data != null) {
            if (data != '') {
                //$scope.documento = data;
                //$scope.documentoIni = '<div><object id="ifDocument" data="' + data + '" type="application/pdf" width="100%"><p>Alternative text - include a link <a href="' + data + '">to the PDF!</a></p></object> </div>';

                documentoRepository.getPdf('OCO', $rootScope.currentFolioFactura, 7).then(function(d) {
                    //Creo la URL
                    var pdf = URL.createObjectURL(utils.b64toBlob(d.data[0].arrayB, "application/pdf"))
                    $scope.documentoIni = '<div><div class="css-label radGroup2">ORDEN DE COMPRA</div><object id="ifDocument" data="' + pdf + '" type="application/pdf" width="100%"><p>Alternative text - include a link <a href="' + pdf + '">to the PDF!</a></p></object> </div>';
                    //Muestra el documento
                    $("#divDocumento").append($scope.documentoIni);
                });

                // '<div class="izquierda"><object id="ifDocument" data="' + data + '" type="application/pdf" width="100%"><p>Alternative text - include a link <a href="' + data + '">to the PDF!</a></p></object> </div>';
                //+ '<div class="derecha"><object id="ifDocument2" data="http://es.tldp.org/COMO-INSFLUG/es/pdf/Linuxdoc-Ejemplo.pdf" type="application/pdf" width="100%"><p>Alternative text - include a link <a href="http://es.tldp.org/COMO-INSFLUG/es/pdf/Linuxdoc-Ejemplo.pdf">to the PDF!</a></p></object></div>';
                /*
                facturaRepository.getDoc($rootScope.currentFolioFactura, $rootScope.currentEmployee, 11) //se busca que exista la factura (id = 15) para mostrar
                    .success(getDocRecepcionIniSuccessCallback)
                    .error(errorCallBack);*/
                //$("#divDocumento").append(documento); 
                $('#btnSalir').hide();
            } else {
                alertFactory.warning('Aun no se ha subido ningun documento de este folio.');
                var documento = '<div class="noExiste"><b> El documento aun no esta disponible </b> </div>';
                $("#divDocumento").append(documento);
                $("#divControles").hide();

                //alertFactory.success('Que tenga buen día');
                //setTimeout(function(){window.close();},3000);
            }
        } else {
            alertFactory.warning('Aun no se ha subido ningun documento de este folio.');
            var documento = '<div class="noExiste"><b> El documento aun no esta disponible </b> </div>';
            $("#divDocumento").append(documento);
            $("#divControles").hide();
        }
    };


    var getDocRecepcionIniSuccessCallback = function(data, status, headers, config) {
        //alertFactory.warning('Entre en getDocRecepcionIniSuccessCallback');
        if (data != null) {
            if (data != '') {
                var typeAplication = $rootScope.obtieneTypeAplication(data);
                /*$scope.documentoIni = $scope.documentoIni.replace('<div>', '<div class="izquierda">') + ' ' +
                    '<div class="derecha"><object id="ifDocument2" data="' + data + '" type="' + typeAplication + '" width="100%"><p>Error al cargar el documento. Intente de nuevo.</a></p></object></div>';
                */
                /*if($scope.consultaInicial == 1)
                    $("#divControles").hide();*/
            }
        }

        $("#divDocumento").append($scope.documentoIni);
    };

    $scope.Confirmar = function() {
        //alertFactory.warning('Estoy en la funcion confirmar 1'); //Agregado Lulu 17may2016   
        facturaRepository.getDoc($rootScope.currentFolioFactura, $rootScope.currentEmployee, 15) //se busca que exista recepcion factura (id = 15)
            .success(getDocRecepcionSuccessCallback)
            .error(errorCallBack);
    };

    $scope.Regresar = function() {
        //alertFactory.warning('Estoy en Regresar'); 
        if (window.location.pathname == '/factura') {
            
            location.href = '/?id=' + $rootScope.currentFolioFactura + '&employee=' + $rootScope.currentEmployee + '&perfil=' + $location.search().perfil+'&proceso='+$rootScope.currentidProceso;
            //location.href = '/?employee=' + $rootScope.currentEmployee ;
        } else {
             alert('Errooooooorrrrrrr');
            //$('#frameUpload').attr('src', '/uploader');
            //$('#modalUpload').modal('show');
            //$rootScope.currentUpload = doc;
        }
    };



    var getDocRecepcionSuccessCallback = function(data, status, headers, config) {
        //alertFactory.warning('Estoy en la funcion getDocRecepcionSuccessCallback Emple: ' + $rootScope.currentEmployee + ' Resp:'+$scope.respuesta.opcion + ' Aprob: ' + $rootScope.currentIdAprobacion); //Agregado Lulu 17may2016 
        if (data != null) {
            if (data != '') {
                //alertFactory.warning('ins_factura_entrega_sp(folio,idperfil,opcion,idAprobacion)'); //Agregado Lulu 17may2016 
                facturaRepository.setFactura($rootScope.currentFolioFactura, $rootScope.currentEmployee, $scope.respuesta.opcion, 1) 
                    .success(setFacturaSuccessCallback)
                    .error(errorCallBack);
            } else
                alertFactory.warning('Debe subir el documento de Recepción de Factura.');
        } else
            alertFactory.warning('No existe informacion para este folio.');
    };

    var setFacturaSuccessCallback = function(data, status, headers, config) {
        //alertFactory.warning('Estoy en la funcion setFacturaSuccessCallback::: ' + data); //Agregado Lulu 17may2016 
        if (data != null) {
            if (data == 0 && $scope.respuesta.opcion ==1) {
                //Agregado Lulu 17may2016 
                alertFactory.warning('El importe de la factura es diferente al de la Orden de Compra.');
                //$rootScope.cierraVentana();
            } else
                if (data == 1 && $scope.respuesta.opcion ==1) { 
                alertFactory.success('La factura Coincide');
                $rootScope.cierraVentana();
                }  
                else
                if (data == 1 && $scope.respuesta.opcion != 1) { 
                alertFactory.warning('La factura No coincide y se desvincula correctamente');
                }
                else
                if (data == 0 && $scope.respuesta.opcion != 1) { 
                alertFactory.warning('La factura No coincide y No  se pudo desvincular');
                }  
        } else
            alertFactory.warning('No existe informacion para este folio.');
    };

    $rootScope.muestraDocumentos = function() {
        //alert('Hola desde factura controller');
        $("#divDocumento").empty();

        $scope.consultaInicial = 0;

        facturaRepository.getDoc($rootScope.currentFolioFactura, $rootScope.currentEmployee, 11) //se busca que exista la factura (id = 20) para mostrar
            .success(getDocSuccessCallback)
            .error(errorCallBack);
    };

    $rootScope.cierraVentana = function() {
        //alertFactory.success('Que tenga buen día');
        //setTimeout(function(){window.close();},2500);
        //setTimeout(function() { window.location.href = 'http://' + location.host + '/?id=' + $rootScope.currentFolioFactura + '&employee=' + $rootScope.currentEmployee; }, 2500);
        setTimeout(function() { location.href = '/?id=' + $rootScope.currentFolioFactura + '&employee=' + $rootScope.currentEmployee + '&perfil=' + $location.search().perfil+'&proceso='+$rootScope.currentidProceso; }, 2500);
        
    };


    //LMS 09/05/2016 Funcion para ver que documentos se encuentran seleccionados
    $scope.CompararDocumentos = function() {

        //$route.reload();

        $scope.contadorSeleccionado = 0;
        $scope.contadorExiste = 0;
        $scope.nombreDocNull = null;
        //Limpiamos el div
        //$("#divDocumento").empty();

        angular.forEach($scope.listaDocumentos, function(value, key) {
            //alert(value.nombreDocumento + 'Seleccionado: ' + value.seleccionado);
            //contador de seleccionado
            if (value.seleccionado == true) {
                $scope.contadorSeleccionado++;
                //alert(value.existeDoc);
                if (value.existeDoc != '' && value.existeDoc != null) {
                    $scope.contadorExiste++;
                } else {
                    $scope.nombreDocNull = value.nombreDocumento;
                }
            }
        });

        //alert('Contador selec ' + $scope.contadorSeleccionado + ' Existe: ' + $scope.contadorExiste);

        if ($scope.contadorSeleccionado != $scope.contadorExiste) {
            alertFactory.warning('No existe el documento : ' + $scope.nombreDocNull);
        } else {
            //alert('Mostrar los doc selecionados' + $scope.contadorSeleccionado + ' ');
            $("#divDocumento").empty();

            if ($scope.contadorSeleccionado <= 2) {
                //alert('Seleccion correcta: ' + $scope.contadorSeleccionado);            
                angular.forEach($scope.listaDocumentos, function(value, key) {
                    //contador de seleccionado
                    if (value.seleccionado == true && $scope.contadorSeleccionado == 2) {
                        $scope.documentoSel = value;
                        /////Se agrego el value.idDocumento == 10 para mostrar la NOTA DE CREDITO
                        if (value.idDocumento == 20 || value.cargar == true || value.idDocumento == 10 ) {
                            $scope.documentoSel = '<div class="derecha"><div class="css-label radGroup2">' + value.nombreDocumento + '</div><object id="ifDocument" data="' + value.existeDoc + '" type="application/pdf" width="100%"><p>Alternative text - include a link <a href="' + value.existeDoc + '">to the PDF!</a></p></object> </div>';
                            //Muestra el documento
                            $("#divDocumento").append($scope.documentoSel);
                        } else {
                            documentoRepository.getPdf(value.tipo, value.folio, value.idNodo).then(function(d) {
                                //Creo la URL
                                var pdf = URL.createObjectURL(utils.b64toBlob(d.data[0].arrayB, "application/pdf"))
                                $scope.documentoSel = '<div class="derecha"><div class="css-label radGroup2">' + value.nombreDocumento + '</div><object id="ifDocument" data="' + pdf + '" type="application/pdf" width="100%"><p>Alternative text - include a link <a href="' + pdf + '">to the PDF!</a></p></object> </div>';
                                //Muestra el documento
                                $("#divDocumento").append($scope.documentoSel);
                            });

                        }
                    } else {
                        if (value.seleccionado == true && $scope.contadorSeleccionado == 1) {
                            $scope.documentoSel = value;
                            /////Se agrego el value.idDocumento == 10 para mostrar la NOTA DE CREDITO
                            if (value.idDocumento == 20 || value.cargar == true || value.idDocumento == 10) {
                                $scope.documentoSel = '<div><div class="css-label radGroup2">' + value.nombreDocumento + '</div><object id="ifDocument" data="' + value.existeDoc + '" type="application/pdf" width="100%"><p>Alternative text - include a link <a href="' + value.existeDoc + '">to the PDF!</a></p></object> </div>';
                                //Muestra el documento
                                $("#divDocumento").append($scope.documentoSel);
                            } else {
                                documentoRepository.getPdf(value.tipo, value.folio, value.idNodo).then(function(d) {
                                    //Creo la URL
                                    var pdf = URL.createObjectURL(utils.b64toBlob(d.data[0].arrayB, "application/pdf"))
                                    $scope.documentoSel = '<div><div class="css-label radGroup2">' + value.nombreDocumento + '</div><object id="ifDocument" data="' + pdf + '" type="application/pdf" width="100%"><p>Alternative text - include a link <a href="' + pdf + '">to the PDF!</a></p></object> </div>';
                                    //Muestra el documento
                                    $("#divDocumento").append($scope.documentoSel);
                                });

                            }
                        }
                    }
                });

            } else {
                if ($scope.contadorSeleccionado == 0) {
                    alertFactory.warning('Debes elegir un documento');
                } else {
                    alertFactory.warning('Debes elegir solo 2 documentos');
                }
            }
        }
    }

    //LMS 09/05/2016  
    //$scope.SeleccionaDocumento = function(documento) {
    //    alertFactory.success(documento.seleccionado);
    //

});