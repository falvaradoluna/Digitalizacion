var registrationModule = angular.module("registrationModule", ["ngRoute", "ngGrid", "cgBusy", "ngAnimate", "ui.bootstrap", "LocalStorageModule"])
.config(function ($routeProvider, $locationProvider) {

    $routeProvider.when('/', {
        templateUrl: '/AngularJS/Templates/Nodo.html',
        controller: 'nodoController'
    });
    //LQMA add 10022016 visualizacion de la factura desde BPRO
    $routeProvider.when('/factura', {
        templateUrl: '/AngularJS/Templates/Factura.html',
        controller: 'facturaController'
    });

    $locationProvider.html5Mode(true);
});

registrationModule.run(function ($rootScope) {
    $rootScope.empleado = "";
    $rootScope.cliente = "";
})

registrationModule.directive('resize', function ($window) {
	return function (scope, element) {
		var w = angular.element($window);
        var changeHeight = function() {element.css('height', (w.height() +300) + 'px' );};  
			w.bind('resize', function () {        
		      changeHeight();   // when window size gets changed          	 
		});  
        changeHeight(); // when page loads          
	}
})
