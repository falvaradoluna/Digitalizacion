var searchUrl = global_settings.urlCORS + '/api/filtroApi/';
var searchApiUrl = global_settings.urlApiNode + '/api/search/';

registrationModule.factory('searchRepository', function($http) {
    return {
        get: function(id) {
            return $http.get(searchUrl + '1|' + id);
        },
        getDivision: function(idempleado) { // SEL_DIVISIONES_SP
            return $http.get(searchUrl + '1|' + idempleado);
        },
        getEmpresa: function(idempleado, iddivision) { //SEL_EMPRESAS_SP
            return $http.get(searchUrl + '2|' + idempleado + '|' + iddivision);
        },
        getSucursal: function(idempleado, idempresa) { //SEL_SUCURSALES_SP
            return $http.get(searchUrl + '3|' + idempleado + '|' + idempresa);
        },
        getDepartamento: function(idempleado, idempresa, idsucursal) { //SEL_DEPARTAMENTOS_SP
            return $http.get(searchUrl + '4|' + idempleado + '|' + idempresa + '|' + idsucursal);
        },
        getTipos: function() {
            return $http.get(searchUrl + '6|0');
        },
        getProveedor: function(cadena) {
            return $http.get(searchUrl + '5|' + cadena);
        },
        // getFolios: function(folio, idEmpresa, idSucursal, idDepartamento, tipoOrden, idProveedor, fecha1, fecha2, idProceso, idempleado) {
        //     return $http.get(searchUrl + '7|' + folio + '|' + idEmpresa + '|' + idSucursal + '|' + idDepartamento + '|' + idProveedor + '|' + tipoOrden + '|' + fecha1 + '|' + fecha2 + '|' + idProceso + '|' + idempleado);
        // },
        update: function(id) {
            return $http.post(searchUrl + '2|' + id);
        },
        getIsPlanta: function(folio) { //LQMA 30062016
            return $http.get(searchUrl + '8|' + folio);
        },
        getProceso: function() {
            return $http.get(searchUrl + '9');
        },
        getUnidadApartada: function(folio) {
            return $http.get(searchUrl + '10|' + folio);
        },
        getFolios: function(folio, idEmpresa, idSucursal, idDepartamento, tipoOrden, idProveedor, fecha1, fecha2, idProceso, idempleado, factura, numeroSerie, ordenServicio) {
            return $http({
                url: searchApiUrl + 'folios/',
                method: "GET",
                params: {
                    folio: folio,
                    idEmpresa: idEmpresa,
                    idSucursal: idSucursal,
                    idDepartamento: idDepartamento,
                    tipoOrden: tipoOrden,
                    idProveedor: idProveedor,
                    fecha1: fecha1,
                    fecha2: fecha2,
                    idProceso: idProceso,
                    idempleado: idempleado,
                    factura: factura,
                    numeroSerie: numeroSerie,
                    ordenServicio: ordenServicio
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
    };
});
