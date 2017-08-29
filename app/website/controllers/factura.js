var facturaView = require('../views/reference'),
    facturaModel = require('../models/dataAccess');

var path = require('path');
//var webPage = require('webpage');
var request = require('request');


var Factura = function(conf) {
    console.log('conf: ')
    console.log(conf)    

    this.conf = conf || {};

    this.view = new facturaView();
    this.model = new facturaModel({
        parameters: this.conf.parameters
    });

    this.response = function() {
        this[this.conf.funcionalidad](this.conf.req, this.conf.res, this.conf.next);
    };
};


Factura.prototype.get_aplicaPagoExterno = function(req, res, next) {

    var self = this;

    var params = [
        { name: 'idUsuario', value: req.query.idUsuario, type: self.model.types.INT },
        { name: 'folio', value: req.query.folio, type: self.model.types.STRING }        
    ];

    this.model.query('INS_APLICA_PAGO_EX_SP', params, function(error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
};

Factura.prototype.get_empleado = function(req, res, next) {

    var self = this;

    var params = [
        { name: 'idEmpleado', value: req.query.idEmpleado, type: self.model.types.INT } 
    ];

    this.model.query('SEL_EMPLEADO_SP', params, function(error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
};

Factura.prototype.get_verificaPagoExterno = function(req, res, next) {

    var self = this;

    var params = [
                  { name: 'idUsuario', value: req.query.idUsuario, type: self.model.types.INT },
                  { name: 'folio', value: req.query.folio, type: self.model.types.STRING }
    ];

    this.model.query('SEL_APLICA_PAGO_EX_SP', params, function(error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
};

module.exports = Factura;