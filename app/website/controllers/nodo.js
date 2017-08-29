var nodoView = require('../views/reference'),
    nodoModel = require('../models/dataAccess');

var path = require('path');
//var webPage = require('webpage');
var request = require('request');


var nodo = function(conf) {
       

    this.conf = conf || {};

    this.view = new nodoView();
    this.model = new nodoModel({
        parameters: this.conf.parameters
    });

    this.response = function() {
        this[this.conf.funcionalidad](this.conf.req, this.conf.res, this.conf.next);
    };
};


nodo.prototype.get_verificaUsuario = function(req, res, next) {

    var self = this;

    var params = [
        { name: 'idUsuario', value: req.query.idUsuario, type: self.model.types.INT },
        { name: 'folio', value: req.query.folio, type: self.model.types.STRING }        
    ];

    this.model.query('SEL_BOTON_CERRAR_NODO_SP', params, function(error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
};
nodo.prototype.get_cierraNodo = function(req, res, next) {

    var self = this;

    var params = [
        { name: 'proc_Id', value: req.query.idProceso, type: self.model.types.INT },        
        { name: 'nodo_Id', value: req.query.idNodo, type: self.model.types.INT },
        { name: 'folio_Operacion', value: req.query.idFolio, type: self.model.types.STRING }        
    ];
    this.model.query('INS_CIERRA_NODO_SP', params, function(error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
};

module.exports = nodo;