// Ionic Starter App
var db = null;
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var climaApp = angular.module('climaApp', ['ionic','ngCordova']);

climaApp.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
      
    db = $cordovaSQLite.openDB({name: "my.db"});
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS clima (id INTEGER PRIMARY KEY, temperatura text)");      
  });
})

climaApp.controller("climaCtrl", ["$scope", "$ionicLoading", "$cordovaSQLite", "climaSvc", climaCtrl]);

function climaCtrl($scope, $ionicLoading, $cordovaSQLite, climaSvc){
    $scope.cidade = "Lins";
    $scope.temperatura = "ND";
    $scope.latitude = "-21.6692";
    $scope.longitude = "-49.6933";
    
    // invocar um servico que se comunica com o Open Weather
    climaSvc.loadClima();
    
    // Funcao invocada ao se carregar temperatura
    $scope.$on("climaApp.temperatura", function(_,result){
            $scope.temperatura = result.main.temp;
            $scope.insert($scope.temperatura);

            $scope.pressure = result.main.pressure;
            $scope.humidity = result.main.humidity;
            $scope.temp_min = result.main.temp_min;
            $scope.temp_max = result.main.temp_max;
            $scope.sys_name = result.name;

            $scope.temp_icon = "http://openweathermap.org/img/w/" + result.weather[0].icon + ".png";
            $scope.temp_description = result.weather[0].description;
        
    }         
    ); // fim do climaApp.temperatura
    
    $scope.$on("climaApp.temperaturaErro", function(){
        // Carregar valores a partir do BD
            $scope.select();
    }         
    ); // fim do climaApp.temperaturaErro
    
    $scope.reloadClima = function() {
		console.log("Reload Clima");
		climaSvc.loadClima();
        $scope.$broadcast("scroll.infiniteScrollComplete");
		$scope.$broadcast("scroll.refreshComplete");
	}
    
    $scope.insert = function(temperatura) {
        var query = "insert into clima (temperatura) values (?)";
        $cordovaSQLite.execute(db,query,[temperatura]).then(function(result) {
            console.log("Insert ID -> " + result.insertId);
        }, function(error){
            $scope.mensagemFinal = "Fail";
            console.log(error);
        });
    }
    
    $scope.select = function(){
        var query = "select temperatura from clima limit 1";
        $cordovaSQLite.execute(db,query,[]).then(function(result) {
            if(result.rows.length > 0){
                $scope.temperatura = result.rows.item(0).temperatura;
                $scope.pressure = "bd";
                $scope.humidity = "bd";
                $scope.temp_min = "bd";
                $scope.temp_max = "bd";
                $scope.sys_name = "bd";

                $scope.temp_icon = "bd";
                $scope.temp_description = "bd";
            } else {
                console.log("Nao achei");
            }
            
        }, function(error){
            console.log(error);
        });
    }
    
    
} // fim do controller

climaApp.service("climaSvc", ["$http","$rootScope",climaSvc]);

function climaSvc($http, $rootScope){
    
    this.loadClima = function() {
        console.log("Carregando clima");
        url = "http://api.openweathermap.org/data/2.5/weather?lat=-21.6692&lon=-49.6933&units=metric&lang=pt";
        //url = "http://api.openweathermap.org/data/2.5/weather?lat=12121212&lon=2312312332";
        $http.get(url, {params : ""}).success(
            function(result){
                console.log("Temperatura carregada com Sucesso");
                $rootScope.$broadcast("climaApp.temperatura", result);
            }
        ).error(
            function(result){
                console.log("Erro ao carregar Temperatura");
                $rootScope.$broadcast("climaApp.temperaturaErro");
            }  
        );
        
    }
    
} // fim do Servico
