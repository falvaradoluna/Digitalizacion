var facturaUrl = global_settings.urlCORS + '/api/facturaapi/';

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
                }
                //*******************************************************************************************************
            };
});