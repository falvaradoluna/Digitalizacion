var facturaUrl = global_settings.urlCORS + '/api/facturaapi/';
var facturaApiUrl = global_settings.urlApiNode + '/api/factura/';

registrationModule.factory('facturaRepository', function ($http) {
    return {        
                getDoc: function (folio,idperfil,idDoc) { //sel_factura_entrega_sp
                    return $http.get(facturaUrl + '1|' + folio + '|' + idperfil + '|' + idDoc);
                },
                setFactura: function (folio,idperfil,opcion,idAprobacion) {//ins_factura_entrega_sp
                    return $http.post(facturaUrl + '1|' + folio + '|' + idperfil + '|' + opcion  + '|' + idAprobacion);
                },
                //*******************************************************************************************************
                //Consigue idFactura, Serie, Folio y RFCemisor de la factura de CXC 
                getInfFact: function(folio){
                	return $http.get(facturaUrl + '2|' + folio);
                },
                //*******************************************************************************************************
                //*******************************************************************************************************
                //Consigue idFactura, Serie, Folio y RFCemisor de la factura de CXC 
                getInfNotaCredito: function(folio){
                	return $http.get(facturaUrl + '3|' + folio);
                },
                //*******************************************************************************************************
                getUsuarioConfirmaFactura: function(idUsuario){
                    return $http.get(facturaUrl + '4|' + idUsuario);
                },
                getInfAnticipos: function(folio){
                    return $http.get(facturaUrl + '5|' + folio);
                },
                getInfReciboCaja: function(folio){
                    return $http.get(facturaUrl + '6|' + folio);
                }
                ,//LQMA add 21062017 verifica si se puede subir comprobante recepcion
                getValidaSubeCompRecep: function(folio,idUsuario){
                    return $http.get(facturaUrl + '7|' + folio + '|' + idUsuario);
                },//LQMA add 04082017 verifica si se puede aplicar pago externo
                /*getVerificaAplicaPago: function(folio,idUsuario){
                    return $http.get(facturaUrl + '8|' + folio + '|' + idUsuario);
                },*///LQMA add 04082017 aplica pago externo
                getVerificaAplicaPago: function(folio,idUsuario) {
                    return $http({
                        url: facturaApiUrl + 'verificaPagoExterno/',
                        method: "GET",
                        params: {                    
                            idUsuario: idUsuario,                    
                            folio: folio
                        },
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                },/*
                getPagoExterno: function(folio,idUsuario){
                    return $http.get(facturaUrl + '9|' + folio + '|' + idUsuario);
                }*/
                getPagoExterno: function(folio,idUsuario) {
                    return $http({
                        url: facturaApiUrl + 'aplicaPagoExterno/',
                        method: "GET",
                        params: {                    
                            idUsuario: idUsuario,
                            folio: folio
                        },
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                }

            };
});