var searchView = require('../views/reference'),
    searchModel = require('../models/dataAccess');

var path = require('path');
//var webPage = require('webpage');
var request = require('request');


var search = function(conf) {
       

    this.conf = conf || {};

    this.view = new searchView();
    this.model = new searchModel({
        parameters: this.conf.parameters
    });

    this.response = function() {
        this[this.conf.funcionalidad](this.conf.req, this.conf.res, this.conf.next);
    };
};


search.prototype.get_folios = function(req, res, next) {

    var self = this;

    var params = [
        { name: 'folioorden', value: req.query.folio, type: self.model.types.STRING },
        { name: 'idempresa', value: req.query.idEmpresa, type: self.model.types.INT },
        { name: 'idSucursal', value: req.query.idSucursal, type: self.model.types.INT },
        { name: 'iddepartamento', value: req.query.idDepartamento, type: self.model.types.INT },
        { name: 'idTipoOrden', value: req.query.tipoOrden, type: self.model.types.INT },
        { name: 'idproveedor', value: req.query.idProveedor, type: self.model.types.INT },
        { name: 'fechaini', value: req.query.fecha1, type: self.model.types.STRING },
        { name: 'fechafin', value: req.query.fecha2, type: self.model.types.STRING },
        { name: 'idProceso', value: req.query.idProceso, type: self.model.types.INT },
        { name: 'idusuariosolicitante', value: req.query.idempleado, type: self.model.types.INT },
        { name: 'factura', value: req.query.factura, type: self.model.types.STRING },
        { name: 'numeroSerie', value: req.query.numeroSerie, type: self.model.types.STRING },
        { name: 'ordenServicio', value: req.query.ordenServicio, type: self.model.types.STRING }        
    ];

    this.model.query('SEL_ORDENES_FILTROS_SP_NODE', params, function(error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
};

module.exports = search;