registrationModule.controller("nodoController", function($scope, $rootScope, $location, localStorageService, alertFactory, nodoRepository, documentoRepository, alertaRepository, empleadoRepository) {

    //Propiedades
    $scope.isLoading = false;
    //$scope.idProceso = 1;
    // $rootScope.perfil = 1;

    //Deshabilitamos el clic derecho en toda la aplicación
    //window.frames.document.oncontextmenu = function(){ alertFactory.error('Función deshabilitada en digitalización.'); return false; };

    //Mensajes en caso de error
    var errorCallBack = function(data, status, headers, config) {
        $('#btnEnviar').button('reset');
        //Reinicio el tipo de folio

        alertFactory.error('Ocurrio un problema');
    };

    //Grupo de funciones de inicio
    $scope.init = function() {
        //Obtengo el idempleado
        getEmpleado();
        //Obtengo los datos del empleado loguedo
        empleadoRepository.get($rootScope.currentEmployee)
            .success(getEmpleadoSuccessCallback)
            .error(errorCallBack);

    };
    //Obtengo los datos del usuario que genero la orden de compra
    $rootScope.CargaUsuarioCXP = function(folio) {
        empleadoRepository.getUsuarioCXP(folio)
            .success(getUsuarioCXPSuccessCallback)
            .error(errorCallBack);

    };

    var getUsuarioCXPSuccessCallback = function(data, status, headers, config) {
        $scope.usuarioCXP = data.idUsuarioCXP;
    };

    $rootScope.CargaEmpleado = function(id, idProceso) {
        getEmpleado();
        $scope.id = id;
        $rootScope.idProceso = idProceso
            //localStorageService.add('idFolio',id); //LQMA
        empleadoRepository.get($rootScope.currentEmployee)
            .success(getEmpleadoSuccessCallback)
            .error(errorCallBack);
    };

    //Obtiene el empleado actual
    var getEmpleado = function() {
        if (!($('#lgnUser').val().indexOf('[') > -1)) {
            localStorageService.set('lgnUser', $('#lgnUser').val());
        } else {
            if (($('#lgnUser').val().indexOf('[') > -1) && !localStorageService.get('lgnUser')) {
                if (getParameterByName('employee') != '') {
                    $rootScope.currentEmployee = getParameterByName('employee');
                    return;
                } else {
                    alert('Inicie sesión desde panel de aplicaciones.');
                    window.close();
                }

            }
        }
        //Obtengo el empleado logueado
        $rootScope.currentEmployee = localStorageService.get('lgnUser');
    };

    var getEmpleadoSuccessCallback = function(data, status, headers, config) {
        $rootScope.empleado = data;
        //Obtenemos la lista de nodos completos
        if ($rootScope.empleado != null) {
            //LMS 29/06/2016 Validacion para folio
            if ($rootScope.folio == null)
                $rootScope.folio = getParameterByName('id') != '' ? getParameterByName('id') : $scope.id; //localStorageService.get('idFolio');
            //Obtengo el encabezado del expediente                

            if ($rootScope.folio) {
                nodoRepository.getHeader($rootScope.folio, $rootScope.empleado.idUsuario)
                    .success(obtieneHeaderSuccessCallback)
                    .error(errorCallBack);
            } else {
                $('#slide').click();
                //angular.element('#slide').triggerHandler('click');
            }
        } else
            alertFactory.error('El empleado no existe en el sistema.');

    };

    //LQMA funcion para cada folio dentro del pop remisiones-facturas
    $scope.navegaFolio = function(folio) {
        //$scope.navegacion = true; //LQMA true: entro desde navDiv
        //alert(folio.folionuevo);
        //$rootScope.folio = folio;   //ORIGINAL comentado LQMA 02052017

        if($rootScope.tipoFolio == 1) //LQMA 02052017 cuando se empieza a navegar por una orde de compra normal
            $rootScope.folio = folio;
        else //cuando se navega por una IF
        {
             //if($rootScope.folio.indexOf("FI") && folio.indexOf("PE"))
             if($rootScope.nodoClick != undefined && $rootScope.nodoClickDestino == undefined) //recien viene del buscador
                    folio = $rootScope.folio;
             else{ //nodo origen y destino vienen con valor, ya viene del modal
                       if($rootScope.nodoClickDestino <= global_settings.nodoSaltoRefacciones[1])   
                            $rootScope.folio = folio;
                       else{
                            console.log('entro en el ultimo else')
                            console.log('folio.indexOf(IF): ' + folio.indexOf("IF"))

                            if(folio.indexOf("IF") == -1)
                                folio = $rootScope.folio;
                            else
                                $rootScope.folio = folio;
                            
                            console.log(folio)       
                       }
             }
               //                
        }

        $('#navegaLinks').modal('hide');
        $('#navegaLinks2').modal('hide');

        //alert('Navega Folio');
        if ($rootScope.navegacionBusqueda == 1 && $rootScope.tipoFolio == 1 && $rootScope.esServicio == 0) {
            $scope.navBusFolio = 1;

            nodoRepository.getNavegacion(folio, 2, 3)
                .success(getNavegacionSuccessCallback)
                .error(errorCallBack);

            $rootScope.navegacionBusqueda = 0;
            $rootScope.tipoFolio = 0;
        } else //$rootScope.tipoFolio <> 1 
        {
            $rootScope.CargaEmpleado(folio, $rootScope.idProceso);
        }
    };

    //Success al obtener expediente
    var obtieneHeaderSuccessCallback = function(data, status, headers, config) {
        //LQMA variable controla inicio nodos
        $scope.iniciaNodos = 0;
        //Asigno el objeto encabezado
        $scope.expediente = data;
        //alert('Obtiene Header SUCCESS');
        //LQMA la propiedad $scope.expediente.nodoActual se actualiza con el data, checar si viene de otro link para poner en el nodo seleccionado
        if ($scope.navBusFolio == 1 && $scope.expediente.esPlanta != 1) //si viene de busqueda
            $scope.expediente.nodoActual = $scope.nodNavBusqueda;

        $scope.navBusFolio = 0;
        //LQMA

        if ($scope.expediente != null) {
            //Obtengo la información de los nodos    
            //////////BEGIN Agregar por que $rootScope.idProceso=undefined cuando regreso de factura      
            if ($rootScope.idProceso == undefined) {
                $rootScope.idProceso = getParameterByName('proceso');
            }
            //////////END Agregar por que $rootScope.idProceso=undefined cuando regreso de factura
            nodoRepository.getAll($rootScope.folio, $rootScope.idProceso, $rootScope.empleado.idPerfil)
                .success(obtieneNodosSuccessCallback)
                .error(errorCallBack);
        } else
            alertFactory.error('No existe información para este expediente.');
    };

    //Abre una orden padre o hijo
    $scope.VerOrdenPadre = function(exp) {
        location.href = '/?id=' + exp.folioPadre + '&employee=' + $rootScope.currentEmployee + '&perfil=' + $location.search().perfil + '&proceso=' + $rootScope.idProceso;
    };

    $scope.VerOrdenHijo = function(exp) {
        location.href = '/?id=' + exp.folioHijo + '&employee=' + $rootScope.currentEmployee + '&perfil=' + $location.search().perfil + '&proceso=' + $rootScope.idProceso;
    };

    ////////////////////////////////////////////////////////////////////////////
    //Genero Nodos
    ////////////////////////////////////////////////////////////////////////////
    var obtieneNodosSuccessCallback = function(data, status, headers, config) {
        //$scope.listaNodos = _Nodes;
        $scope.listaNodos = data;
        //$scope.numElements = _Nodes.length;
        $scope.numElements = data.length;
        //leo la página inicial y voy a ella
        GetCurrentPage();

        setTimeout(function() {
            $('ul#standard').roundabout({
                btnNext: ".next",
                btnNextCallback: function() {
                    goToPageTrigger('.next');
                },
                btnPrev: ".prev",
                btnPrevCallback: function() {
                    goToPageTrigger('.prev');
                },
                clickToFocusCallback: function() {
                    goToPageTrigger('.next');
                }
            });
            //Voy a la página actual
            goToPage($scope.currentPage);

        }, 1);
    };

    var GetCurrentPage = function() {
        $scope.currentPage = $scope.navDestino > 0 ? $scope.navDestino : $scope.expediente.nodoActual; //$scope.expediente.nodoActual; //LQMA comentado, se agrego control de navegacion        
        $scope.navDestino = 0;
    };

    ////////////////////////////////////////////////////////////////////////////
    //Gestión de nodos y validación
    ////////////////////////////////////////////////////////////////////////////

    //Reacciona a los triggers de NEXT PREV CLIC
    var goToPageTrigger = function(button) {
        //alert('goToPageTrigger');
        //Veo la página actual
        //yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy LQMA
        if ($scope.expediente.esPlanta == 1) {
            navegacionRemFac($scope.currentPage, $('ul#standard').roundabout("getChildInFocus") + 1);
        } else {
            //YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
            $scope.currentPage = $('ul#standard').roundabout("getChildInFocus") + 1;
            if ($scope.listaNodos[$scope.currentPage - 1].enabled != 0) {
                goToPage($scope.currentPage);
            } else {
                alertFactory.warning('El nodo ' + $scope.currentPage + ' no está disponible para su perfil.');
                $(button).click();
            }
        }
    };

    //LLeva a un nodo específico desde la navegación
    $scope.setPage = function(nodo) {
        //alert('setPage');
        if (nodo.enabled != 0) {
            //yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy  LQMA
            if ($scope.expediente.esPlanta == 1 && $rootScope.esServicio == 0) {
                navegacionRemFac($scope.currentPage, nodo.id);
            } else {
                ////////////////////////  LMS Funcion para navegacion de Ordenes de Servicio
                if ($rootScope.esServicio == 1) {
                    //alert('navegacionOrdFacSer');
                    navegacionOrdFacSer($scope.currentPage, nodo.id);
                } else {
                    //Navegacion Orden normal
                    //alert('Estoy en setPage');
                    $scope.currentPage = nodo.id;
                    goToPage($scope.currentPage);
                }
                ///////////////////////
            }
        } else {
            alertFactory.warning('Nodo ' + $scope.currentPage + ' no disponible para su perfil.');
        }
    };

    //LQMA 
    var navegacionRemFac = function(origen, destino) {

        $rootScope.nodoClick = origen;        
        $rootScope.nodoClickDestino = destino;        

        var inicio = global_settings.nodoSaltoRefacciones[0];
        var fin = global_settings.nodoSaltoRefacciones[1];

        var tipoFolio = 0,
            tipoReturn = 0;
        $scope.especial = false;

        //var origen = $scope.currentPage;//$scope.currentPage_aux;
        //var destino = nodo.id;//$scope.currentPage;

        if (origen < inicio && destino > fin) //mostrar remisiones (ordenes compra - remisiones)
        {
            //alert('(ordenes compra - remisiones)');
            tipoFolio = 1; //OC
            tipoReturn = 2; //RE
            $scope.especial = true;
        }
        if ((origen < inicio) && (destino >= inicio) && (destino <= fin)) {
            //alert('Remisiones Hi Hi Hi');
            tipoFolio = 1; //OC
            tipoReturn = 2; //RE
        }
        if ((origen >= inicio && origen <= fin) && (destino > fin)) {
            //alert('Facturas hAHeHE');
            tipoFolio = 2; //RE
            tipoReturn = 3; //FA
        }
        if ((origen > fin) && (destino >= inicio && destino <= fin)) {
            //alert('Remisiones HoHoHooo');
            tipoFolio = 3; //FA
            tipoReturn = 2; //RE
        }
        if (((origen >= inicio) && (origen <= fin)) && destino < inicio) {
            //alert('Ordenes Pow!');
            tipoFolio = 2; //RE
            tipoReturn = 1; //OC
        }
        //Navegar de Factura a Orden.
        if (origen > fin && destino < inicio) {
            //alert('De Factura a Orden');
            tipoFolio = 3; //FA
            tipoReturn = 1; //RE
            $scope.especial = true;
        }
        //Navegar de Orden a Factura.
        if (origen < inicio && destino > fin) {
            //alert('De orden a Factura');
            tipoFolio = 1; //FA
            tipoReturn = 3; //RE
            $scope.especial = true;
        }

        $scope.navDestino = $scope.especial ? 0 : destino;

        //llamar a sp y mostrar div
        if (tipoFolio != 0 && tipoReturn != 0) {
            if ((tipoFolio == 3 && tipoReturn == 1) || (tipoFolio == 1 && tipoReturn == 3)) {
                alertFactory.warning('Selecciona Nodo entre 4 y 6 para elegir una Remisión.');
            } else {
                nodoRepository.getNavegacion($rootScope.folio, tipoFolio, tipoReturn)
                    .success(getNavegacionSuccessCallback)
                    .error(errorCallBack);
            }
        } else {
            $scope.currentPage = destino;
            goToPage($scope.currentPage);
        }
    };

    $rootScope.navBusqueda = function(tipo, nodoactual, folio) {
        
        $rootScope.nodoClick = nodoactual;

        var tipoFolio = tipo,
            tipoReturn = (tipo == 1) ? 2 : 3;
        $rootScope.navegacionBusqueda = 1;
        $scope.navBusFolio = 1;
        $rootScope.folio = folio;
        $scope.nodNavBusqueda = 0;
        $rootScope.tipoFolio = tipo;

        if (tipo == 1 && nodoactual >= global_settings.nodoSaltoRefacciones[0]) {
            //buscar remisiones y mostrar para seleccionar,
            tipoFolio = 1; //OC
            tipoReturn = 2; //RE
            //sino existen, poner en el ultimo nodo de ordenes --> global_settings.nodoSaltoRefacciones[0] - 1
            $scope.nodNavBusqueda = global_settings.nodoSaltoRefacciones[0] - 1;
        }
        if (tipo == 2 && nodoactual > global_settings.nodoSaltoRefacciones[1]) {
            //buscar facturas y mostrar,
            //sino existen, poner en el ultimo nodo de remisiones -->global_settings.nodoSaltoRefacciones[1]
            $scope.nodNavBusqueda = global_settings.nodoSaltoRefacciones[1];
            tipoFolio = 2; //RE
            tipoReturn = 3; //FA
        }

        nodoRepository.getNavegacion(folio, tipoFolio, tipoReturn)
            .success(getNavegacionSuccessCallback)
            .error(errorCallBack);

    };

    //Ir a una página específica
    var goToPage = function(page) {
        //alert('gotoPage');

        $('ul#standard').roundabout("animateToChild", (page - 1));
        $scope.currentNode = $scope.listaNodos[page - 1];
        //Marco el nodo activo en NavBar
        SetActiveNav();
        //Cargo el contenido de nodo
        //LoadActiveNode();
        $rootScope.LoadActiveNode();

        //LQMA nodos iniciados
        $scope.iniciaNodos = 1;
    };

    //Establece la clase de navegación del nodo actual
    var SetActiveNav = function() {
        angular.forEach($scope.listaNodos, function(value, key) {
            if (key == ($scope.currentPage - 1))
                value.active = 1;
            else
                value.active = 0;
        });
        //Ejecuto apply
        Apply();
    }

    /////////////////////////////////////////////////////////////////////////
    //Obtengo la lista de documentos disponibles por nodo
    /////////////////////////////////////////////////////////////////////////
    //Success de carga de alertas
    var getAlertasSuccessCallback = function(data, status, headers, config) {
        $scope.isLoading = false;
        $scope.listaAlertas = data;
        Apply();
    };

    //Success de obtner documentos por nodo
    var getDocumentosSuccessCallback = function(data, status, headers, config) {
        $scope.resultado = [];
        angular.forEach(data, function(value, key) {
            if (value.idDocumento == 10 && (value.existeDoc == '' || value.existeDoc == null)) {

            } else {
                $scope.resultado[key] = value;
            }
        });

        $scope.listaDocumentos = $scope.resultado;
        alertaRepository.getByNodo($scope.idProceso, $scope.currentNode.id, $scope.currentNode.folio)
            .success(getAlertasSuccessCallback)
            .error(errorCallBack);
    };

    //Carga los documentos del nodo activo
    //var LoadActiveNode = function(){
    $rootScope.LoadActiveNode = function() {
        if ($scope.currentNode.estatus != 1) {
            $scope.isLoading = true;
            Apply();
            //Consulta el repositorio
            documentoRepository.getByNodo($scope.currentNode.id, $scope.currentNode.folio, $rootScope.empleado.idPerfil)
                .success(getDocumentosSuccessCallback)
                .error(errorCallBack);
        } else
            alertFactory.warning('El nodo ' + $scope.currentNode.id + ' aún no se activa para el expediente actual. No existen documentos para mostrar.');
    };

    //Ejecuta un apply en funciones jQuery
    var Apply = function() {
        if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest')
            $scope.$apply();
    };

    //Success de obtner navegacion por nodo LQMA
    var getNavegacionSuccessCallback = function(data, status, headers, config) {

        //Asigno titulo de modal
        if (data.length > 0) {
            var nodoActual = angular.isUndefined($scope.currentNode) ? 0 : $scope.currentNode.id;

            switch (data[0].tipoFolioNav) {
                case 1:

                    if (nodoActual > 3) {

                        $rootScope.tituloNavegacion = 'Remisión: ' + data[0].folioinicial;
                        $rootScope.tipoOrdenNav = 'Ordenes de Compra asociadas';
                    } else {
                        $rootScope.tituloNavegacion = 'Ordenes de Compra ';
                        $rootScope.tipoOrdenNav = 'OC';
                    }

                    //$rootScope.tipoOrdenNav = 'Ordenes de Compra'
                    break;
                case 2:
                    if (nodoActual > 6)
                        $rootScope.tituloNavegacion = 'Factura: ' + data[0].folioinicial;
                    else
                        $rootScope.tituloNavegacion = 'Orden de Compra: ' + data[0].folioinicial;

                    $rootScope.tipoOrdenNav = 'Remisiones asociadas:';

                    break;
                case 3:
                    $rootScope.tituloNavegacion = 'Remisión: ' + data[0].folioinicial;
                    $rootScope.tipoOrdenNav = 'Facturas asociadas';
                    break;
            }
        }

        if ($scope.navBusFolio == 1) { //
            //si no tiene 
            if (data.length > 0) {
                $rootScope.CargaEmpleado($rootScope.folio, $rootScope.idProceso);
                console.log('length mayor que cero en navBusFolio');
                if ($rootScope.tipoFolio == 1) {
                    $rootScope.linksNavegacion = data;
                    /*setTimeout( function(){
                        $('#navegaLinks').modal('show');
                        console.log('show modal');
                    } ,300);*/
                    $('#navegaLinks').modal('show');
                } else {
                    $rootScope.linksNavegacion = data;
                    //El título siempre es "Facturas"
                    //$rootScope.tituloNavegacion = 'Facturas';
                    /*setTimeout( function(){
                        $('#navegaLinks').modal('show');
                        console.log($rootScope.tipoFolio);
                    } ,300);*/

                    $('#navegaLinks2').modal('show');
                }
                $scope.navBusFolio = 0;

            } else {
                $rootScope.CargaEmpleado($rootScope.folio, $rootScope.idProceso);
                //poner nodo actual 
                //cuando OC poner en el ultimo nodo de ordenes --> global_settings.nodoSaltoRefacciones[0] - 1
                //cuando RE poner en el ultimo nodo de remisiones -->global_settings.nodoSaltoRefacciones[1]
            }
        } else {
            if (data.length > 0) {
                $rootScope.linksNavegacion = data;
                setTimeout(function() {
                    $('#navegaLinks').modal('show');
                }, 300);
                //$('#navegaLinks').modal('show');//$('#navegaLinks').modal('show');
            } else {
                if ($rootScope.navegacionBusqueda == 0)
                    alertFactory.warning('No existen remisiones/facturas para continuar el flujo.');
                else {
                    $rootScope.CargaEmpleado($rootScope.folio, $rootScope.idProceso); //folio);
                    $rootScope.navegacionBusqueda = 0;
                }
            }
        }
        //Reinicio el tipoFolio

    };
    ///

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    //            BUSQUEDA ORDEN DE SERVICIO                  
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    $rootScope.navBusquedaServicio = function(tipo, nodoactual, folio, idProceso) {

        //alert('Estoy en navBusquedaServicio ');
        $rootScope.nodoClick = nodoactual;

        var tipoFolio = tipo,
            tipoReturn = (tipo == 1) ? 5 : 1;
        $rootScope.navegacionBusqueda = 1;
        $scope.navBusFolio = 1;
        $scope.folio = folio;
        $scope.nodNavBusqueda = 0;
        $rootScope.tipoFolio = tipo;
        $rootScope.idProceso = idProceso;
        //Si es un Nodo mayor o igual a 7
        if (tipo == 1 && nodoactual >= global_settings.nodoSaltoServicio[0]) {
            //alert('Mayor o igual a 7');
            //Buscar Facturas mostrar para seleccionar
            tipoFolio = 1; //OC
            tipoReturn = 5; //FAC
            //Sino existen, poner en el ultimo nodo de ordenes
            $scope.nodNavBusqueda = global_settings.nodoSaltoServicio[0];
            //
            $rootScope.tituloNavegacion = 'Orden: ' + folio;
            $rootScope.tipoOrdenNav = 'Facturas asociadas';
        }
        //        if (tipo == 5 && nodoactual < global_settings.nodoSaltoServicio[0]) {
        //            alert('Es un nodo menor a 7777777');
        //            //Buscar Ordenes mostrar para seleccionar
        //            tipoFolio = 5; //FAC
        //            tipoReturn = 1; //OC
        //            //Sino existen, poner en el ultimo nodo de ordenes Nodo=6
        //            $scope.nodNavBusqueda = global_settings.nodoSaltoServicio[0] - 1;
        //            //
        //            $rootScope.tituloNavegacion = 'Factura: ' + folio;
        //            $rootScope.tipoOrdenNav = 'Ordenes asociadas';
        //        }
        //        if (tipo == 5 && nodoactual = global_settings.nodoSaltoServicio[0]) {
        //            alert('OJO!!!!  Es Factura del nodo 7');
        //            $rootScope.CargaEmpleado(folio);
        //        }
        //        if (tipo == 1 && nodoactual < global_settings.nodoSaltoServicio[0]) {
        //            alert('Es un nodo menor a 7777777');
        //            //Buscar Ordenes mostrar para seleccionar
        //            tipoFolio = 5; //FAC
        //            tipoReturn = 1; //OC
        //            //Sino existen, poner en el ultimo nodo de ordenes Nodo=6
        //            $scope.nodNavBusqueda = global_settings.nodoSaltoServicio[0] - 1;
        //            //
        //            $rootScope.tituloNavegacion = 'Factura: ' + folio;
        //            $rootScope.tipoOrdenNav = 'Ordenes asociadas';
        //        }
        //Aqui mando a llamar 
        //[SEL_NAVEGACION_NODO_SP] 'CA-CRA-CUA-SE-PE-26',1,5
        nodoRepository.getNavegacion(folio, tipoFolio, tipoReturn)
            .success(getNavegacionServicioSuccessCallback)
            .error(errorCallBack);

    };
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                           SERVICIO SUCCESS de obtener navegacion por nodo 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    var getNavegacionServicioSuccessCallback = function(data, status, headers, config) {
        //alertFactory.warning('Navegacion Servicio SuccessCallback');
        //Asigno titulo de modal
        if (data.length > 0) {
            var nodoActual = angular.isUndefined($scope.currentNode) ? 0 : $scope.currentNode.id;

            switch (data[0].tipoFolioNav) {
                case 1:
                    if (nodoActual > 6) {
                        //alert('Mayor a 6 ');
                        $rootScope.tituloNavegacion = 'Factura: ' + $rootScope.folio;
                        $rootScope.tipoOrdenNav = 'Ordenes Asociadas';
                    } else {
                        //alert('Menor o igual a 6 ');
                        $rootScope.tituloNavegacion = 'Ordennn ' + $rootScope.folio;
                        $rootScope.tipoOrdenNav = 'Facturas asociadasss';
                    }
                    break;
            }
        }

        if ($scope.navBusFolio == 1) { //navBusFolio == 1
            //si no tiene 
            if (data.length > 0) { //data.length >0
                $rootScope.CargaEmpleado($rootScope.folio, $rootScope.idProceso);
                console.log('Carga empleado folio');
                if ($rootScope.tipoFolio == 1) {
                    $rootScope.linksNavegacion = data;
                    $('#navegaLinks').modal('show');
                } else {
                    $rootScope.linksNavegacion = data;
                    $('#navegaLinks2').modal('show');
                }
                $scope.navBusFolio = 0;
            } //Else data.length >0
            else {
                $rootScope.CargaEmpleado($rootScope.folio, $rootScope.idProceso);
            }
        } //Else navBusFolio == 1
        else {
            if (data.length > 0) {
                $rootScope.linksNavegacion = data;
                setTimeout(function() {
                    $('#navegaLinks').modal('show');
                }, 300);
            } else //Else data.length > 0 
            {
                if ($rootScope.navegacionBusqueda == 0) {
                    //alertFactory.warning('SERVICIO No existen remisiones/facturas para continuar el flujo.');
                    //Navegar O.C sin Facturas asociadas
                    $rootScope.CargaEmpleado($rootScope.folio, $rootScope.idProceso);
                } else { //Else navegacionBusqueda == 0
                    $rootScope.CargaEmpleado($rootScope.folio, $rootScope.idProceso);
                    $rootScope.navegacionBusqueda = 0;
                }
            }
        }
        //
    };
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                           SERVICIO   Navegacion Nodo a Nodo
    ///////////////////////////////////////////////////////////////////////////////////////////////////////// 
    var navegacionOrdFacSer = function(origen, destino) {
        //alert('Estoy en Navegacion Servicio');
        $rootScope.nodoClick = origen;
        $rootScope.nodoClickDestino = destino;
        
        var inicio = global_settings.nodoSaltoServicio[0]; //7
        var fin = global_settings.nodoSaltoServicio[1]; //14

        var tipoFolio = 0,
            tipoReturn = 0;
        $scope.especialSer = false;

        if ((origen < inicio) && (destino >= inicio) && (destino <= fin)) {
            //alert('1.-orden a Facturas');
            tipoFolio = 1; //OC
            tipoReturn = 5; //FA
            $rootScope.tituloNavegacion = 'Orden: ' + $rootScope.folio;
            $rootScope.tipoOrdenNav = 'Facturas Asociadas';
        }

        if (((origen >= inicio) && (origen <= fin)) && destino < inicio) {
            //alert('2.-Factura a OrdenCompra');
            tipoFolio = 5; //FA
            tipoReturn = 1; //OC
            $rootScope.tituloNavegacion = 'Factura:  ' + $rootScope.folio;
            $rootScope.tipoOrdenNav = 'Ordenes Asociadas';
        }

        $scope.navDestino = $scope.especial ? 0 : destino;

        //llamar a sp y mostrar div
        if (tipoFolio != 0 && tipoReturn != 0) {
            nodoRepository.getNavegacion($rootScope.folio, tipoFolio, tipoReturn)
                .success(getNavegacionServicioSuccessCallback)
                .error(errorCallBack);
        } else {
            $scope.currentPage = destino;
            goToPage($scope.currentPage);
        }
    };
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                           SERVICIO   Cancelación de Orden de Compra
    ///////////////////////////////////////////////////////////////////////////////////////////////////////// 
    $scope.CancelarOrdenCompra = function( folio) {
        nodoRepository.CancelarOrden(folio, $scope.usuarioCXP)
            .success(putCancelarOrdenServicioSuccessCallback)
            .error(errorCallBack);
    };
    var putCancelarOrdenServicioSuccessCallback = function(data, status, headers, config) {
        $scope.notificacion = data[0];
        if($scope.notificacion.estatus == 0){
            alertFactory.success($scope.notificacion.mensaje)
        }else{
            alertFactory.error($scope.notificacion.mensaje)
        }
    };

});
