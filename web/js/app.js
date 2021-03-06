var app = angular.module('appCables', [ 'cablesGlobalCtrl', 'mortalitesCtrl', 'zonesSensiblesCtrl', 'tronconsErdfCtrl', 'eqTronconsErdfCtrl', 'eqPoteauxErdfCtrl','nidificationsCtrl','observationsCtrl', 'poteauxErdfCtrl', 'photosPoteauxErdfCtrl', 'photosTronconsErdfCtrl', 'cablesServices', 'colorServices', 'FormDirectives', 'DisplayDirectives', 'ui.bootstrap', 'darthwade.loading', 'mapServices', 'LocalStorageModule']); //, 'ngTableResizableColumns'

// module de gestion de la page d'accueil
angular.module('cablesGlobalCtrl', ['cablesServices', 'colorServices', 'mapServices', 'ngRoute', 'ngTable']);

// module de gestion des cas de mortalité
angular.module('mortalitesCtrl', ['cablesServices', 'colorServices', 'mapServices','ngRoute', 'ngTable']);

// module de gestion des zones sensibles
angular.module('zonesSensiblesCtrl', ['cablesServices', 'colorServices', 'mapServices', 'ngRoute', 'ngTable']);

// module de gestion des inventaires tronçons erdf
angular.module('tronconsErdfCtrl', ['cablesServices', 'colorServices', 'mapServices','ngRoute', 'ngTable']);

// module de gestion des équipements tronçons erdf
angular.module('eqTronconsErdfCtrl', ['cablesServices', 'colorServices', 'mapServices','ngRoute', 'ngTable']);

// module de gestion des équipements tronçons erdf
angular.module('photosTronconsErdfCtrl', ['cablesServices', 'colorServices', 'mapServices','ngRoute', 'ngTable']);

// module de gestion des inventaires poteaux erdf
angular.module('poteauxErdfCtrl', ['cablesServices', 'colorServices', 'mapServices', 'ngRoute', 'ngTable']);

// module de gestion des équipements poteaux erdf
angular.module('eqPoteauxErdfCtrl', ['cablesServices', 'colorServices', 'colorServices', 'mapServices', 'ngRoute', 'ngTable']);

// module de gestion des équipements poteaux erdf
angular.module('photosPoteauxErdfCtrl', ['cablesServices', 'colorServices', 'mapServices', 'ngRoute', 'ngTable']);

// module de gestion des sites de nidifications erdf
angular.module('nidificationsCtrl', ['cablesServices', 'colorServices', 'mapServices', 'ngRoute', 'ngTable']);

// module de gestion des observations erdf
angular.module('observationsCtrl', ['cablesServices', 'colorServices', 'mapServices','ngRoute', 'ngTable']);


// services principaux de l'application
angular.module('cablesServices', ['mapServices']);

// services pour la gestion des couleurs des couches géométriques
angular.module('colorServices', ['mapServices']);

// directives formulaires
angular.module('FormDirectives', ['angularFileUpload','mapServices']);

// directives affichage
angular.module('DisplayDirectives', ['mapServices']);

// directives map
angular.module('mapServices', ['cablesServices', 'colorServices']);


/*
 * Configuration des routes
 */
app.config(function($routeProvider){
    $routeProvider
        .when('/', {
            controller: 'baseController'
        })
        .when('/login', {
            controller: 'loginController',
            templateUrl: 'js/templates/login.htm'
        })
        .when('/logout', {
            controller: 'logoutController',
            templateUrl: 'js/templates/login.htm'
        });
});

app.run(function($rootScope, $templateCache) {
   $rootScope.$on('$viewContentLoaded', function() {
      // $templateCache.removeAll();
   });
});


app.config(function (localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('cables');
})
/*
 * Controleur de base
 */
app.controller('baseController', function($rootScope, $scope, $location, $modal, dataServ,
    configServ, mapService, userMessages, userServ){

	// Nom de l'appli pour le éléments distincts entre chaque appli
	configServ.getUrl('js/resources/defaultMap.json', function(res) {
        resource = res[0];
        $scope.appliDep = resource.appli;
    });
	
    
    // Définition des couches qui sont chargées au démarrage de l'application
    var categoriesFirstLoad = [
       "zonessensibles", "poteauxerdf", "tronconserdf"
        // "poteauxerdf"
    ];

    // Mise en cache des couches et sous-couches non visibles donc non chargées au démarrage de l'application
    configServ.put('legendLayer:mortalites:main:visibility', "novisible");
    configServ.put('legendLayer:mortalites:mortalitesPercussions:visibility', "novisible");
    configServ.put('legendLayer:mortalites:mortalitesElectrocutions:visibility', "novisible");
    configServ.put('legendLayer:eqpoteauxerdf:main:visibility', "novisible");
    configServ.put('legendLayer:eqtronconserdf:main:visibility', "novisible");
    configServ.put('legendLayer:nidifications:main:visibility', "novisible");
    configServ.put('legendLayer:nidifications:nidificationsGypaete:visibility', "novisible");
    configServ.put('legendLayer:nidifications:nidificationsAigle:visibility', "novisible");
    configServ.put('legendLayer:nidifications:nidificationsGrandDuc:visibility', "novisible");
    configServ.put('legendLayer:nidifications:nidificationsFaucon:visibility', "novisible");
    configServ.put('legendLayer:nidifications:nidificationsCircaete:visibility', "novisible");
    configServ.put('legendLayer:nidifications:nidificationsBusardStMartin:visibility', "novisible");
    configServ.put('legendLayer:nidifications:nidificationsBusardCendre:visibility', "novisible");
    configServ.put('legendLayer:nidifications:nidificationsBusardRoseaux:visibility', "novisible");
    configServ.put('legendLayer:nidifications:nidificationsCigogneBlanche:visibility', "novisible");
    configServ.put('legendLayer:observations:main:visibility', "novisible");
    configServ.put('legendLayer:observations:observationsNombre020:visibility', "novisible");
    configServ.put('legendLayer:observations:observationsNombre2040:visibility', "novisible");
    configServ.put('legendLayer:observations:observationsSup40:visibility', "novisible");

    $scope._appName = null; // pour une gestion factorisée des applications = pas utile pour le moment
    $scope.app = {name: "cables"};
    var success = function(resp){
        $scope.user = userServ.getUser();
        if(!$scope.user){
            console.log('dans login');
            $location.url('login');
        }
        // retourne /cables/zonessensibles si on tape juste pnv ou pnv/cables
        if($location.path() == '/' || $location.path() == '/cables/'){
            $location.url('/cables/zonessensibles');
        }

        $scope.data = resp;

        // FIXME DEBUG
        configServ.put('debug', false);

        // userMessages.infoMessage = "bienvenue !";

        $scope.$on('user:login', function(ev, user){
            $scope.user = user;
        });

        $scope.$on('user:logout', function(ev){
            $scope.app = {name: "Cables"};
            $scope.user = null;
        });

        categoriesFirstLoad.forEach(
            function(category) {
                mapService.showLayer(null, category);
            }
        );
    };



    // gestion des menus dans le bandeau
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };

    // collapsed tableau de données
    $scope.toggle = function() {
       $scope.affiche = !$scope.affiche;
    };

    // PALIATIF : change la valeur pour que affiche soit toujours à true (tableau ouvert) pour que la page de connexion s'affiche avec le ng-view
    $scope.toggleDeconnect = function() {
       if ($scope.affichetableau === true) {
        $scope.affichetableau = !$scope.affichetableau;
       }
    };

    // collapsed bandeau
    $scope.srcImageBtn = "css/img/btn_bandeau_up.png";
    $scope.toggleBandeau = function() {
        $scope.affichebandeau = !$scope.affichebandeau;
    };

    $scope.toggleTableau = function() {
        $scope.affichetableau = !$scope.affichetableau;
    };

    $scope.check = function(val){
        return userServ.checkLevel(val);
    };

    $scope.modalMentions = function(txt){
        var modInstance = $modal.open({
            templateUrl: 'js/templates/modalMentions.htm',
            resolve: {txt: function(){return txt}},
            controller: function($modalInstance, $scope, txt){
                $scope.txt = txt;
                $scope.ok = function(){
                    $modalInstance.close();
                };
                $scope.cancel = function(){
                    $modalInstance.dismiss('cancel');
                }
            }
        });
        return modInstance.result;
    };

    configServ.getUrl('config/apps', success);
});

/*
 * controleur login
 */
app.controller('loginController', function($scope, $location, $rootScope, userServ, userMessages, configServ){
    if(userServ.getUser()){
        console.log('loginController if')            
        $scope.data = {
            login: userServ.getUser().identifiant,
            pass: userServ.getUser().pass,
        };
    }
    else{
        console.log('loginController else')
        $scope.data = {login: null, pass: null};
    }

    $scope.$on('user:login', function(ev, user){
        // userMessages.infoMessage = user.nom_complet.replace(/(\w+) (\w+)/, 'Bienvenue $2 $1 !');
        $location.url('/cables/zonessensibles');
    });

    $scope.$on('user:error', function(ev){
        userMessages.errorMessage = "Erreur d'identification. Veuillez recommencer."
    });

    $scope.send = function(){
        userServ.login($scope.data.login, $scope.data.pass);
    };
});


/*
 * controleur logout
 */
app.controller('logoutController', function($scope, $location, userServ, userMessages, configServ){
    $scope.$on('user:logout', function(ev){
        // userMessages.infoMessage = "Déconnecté !";
        $location.url('login');
    });

    userServ.logout();
});


// collapse données letier dans la légende
app.controller('LegendCtrl', ['$scope', function ($scope) {
    $scope.isExpanded = false;
    $scope.togglePThemaData = function() {
       $scope.isExpanded = !$scope.isExpanded;
    };
}]);

// app.directive('modaldisplay', function(){
//     return {
//         restrict: 'A',
//         template: 'js/templates/display/modal_73.htm',
//         controller: function($scope, configServ){
//             configServ.getUrl('js/resources/defaultMap.json', function(res) {
// 		        resource = res[0];
// 		        $scope.template = resource.appli;
// 		    });
//         }
//     };
// });