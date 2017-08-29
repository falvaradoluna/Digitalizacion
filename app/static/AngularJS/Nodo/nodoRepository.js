var nodoUrl = global_settings.urlCORS + '/api/nodoapi/';
var nodoApiUrl = global_settings.urlApiNode + '/api/nodo/';
registrationModule.factory('nodoRepository', function($http) {
    return {
        get: function(id) {
            return $http.get(nodoUrl + '0|' + id);
        },
        getAll: function(folio, idproceso, perfil) {
            return $http.get(nodoUrl + '1|' + folio + '|' + idproceso + '|' + perfil);
        },
        getHeader: function(folio, usuario) {
            return $http.get(nodoUrl + '2|' + folio + '|' + usuario);
        },
        update: function(id) {
            return $http.post(nodoUrl + '2|' + id);
        },
        getNavegacion: function(folio, tipofolio, tiporegreso) {
            return $http.get(nodoUrl + '3|' + folio + '|' + tipofolio + '|' + tiporegreso);
        },
        CancelarOrden: function(folio, idusuario) {
            return $http.get(nodoUrl + '4|' + folio + '|' + idusuario);
        },
        cambiaEstatusApartada: function(serie, folio, idusuario) {
            return $http.get(nodoUrl + '5|' + serie + '|' + folio + '|' + idusuario);
        },
        verificaUsuario: function(folio, idUsuario) {
            return $http({
                url: nodoApiUrl + 'verificaUsuario/',
                method: "GET",
                params: {
                    folio: folio,
                    idUsuario: idUsuario
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        cierraNodo: function(idProceso, idNodo, idFolio) {
            return $http({
                url: nodoApiUrl + 'cierraNodo/',
                method: "GET",
                params: {
                    idProceso: idProceso,
                    idFolio: idFolio,
                    idNodo: idNodo
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
    };
});