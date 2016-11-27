
function DialogCtrl( $scope, $mdDialog, $timeout, message  ) {
	$scope.close = function() {
		$mdDialog.hide();
	 };
	$scope.message = message;
}
angular.module("binnerWeb", ['ngRoute', 'ngMaterial'])
	.config( function(  $interpolateProvider, $locationProvider, $routeProvider  ) {
		$routeProvider.when("/", {
			"templateUrl": "/static/html/home.html",
			"controller": "HomeCtrl" })
		.when("/results", {
			"templateUrl": "/static/html/results.html",
			"controller": "ResultsCtrl" })
		.when("/about", {
			"templateUrl": "/static/html/about.html",
			"controller": "AboutCtrl" })
		.otherwise("/");
		$locationProvider.html5Mode(true);
		$interpolateProvider.startSymbol("[[");
		$interpolateProvider.endSymbol("]]");
	 })
	.factory("$shared", function() {
		var $factory = {};
		$factory.results ={};
		$factory.getResults = function() {
			return $factory.results;
		};
		$factory.setResults = function(results) {
			$factory.results = results;
		};
		return $factory;
	 })
	.controller("HomeCtrl", function($scope, $shared, $http, $mdDialog, $location) {
		$scope.title = "Binner Examples";
		$scope.description = "Try binner in your browser. Receive estimates";
		$scope.args = [];
		$scope.validArgs = [
			{
				"title": "Multi Algorithm Use Smallest Bins",
				"value": "multi_use_smallest_bins"
			}  ];
		$scope.algorithms = [
			{
				"title": "Multi Bin Fit",
				"value": "multi"
			},
			{
				"title": "Single Bin Fit",
				"value": "single"
			},
			{
				"title": "Smallest Bin Fit",
				"value": "smallest"
			}  ];
		$scope.selectedAlgorithm = $scope.algorithms[0];


		$scope.entityTemplate = {"w": 0, "h": 0, "d": 0};
		$scope.bins =  [];
		$scope.items = [];
		function onResult( response ) {
			$shared.setResults( response.data );
			$location.path("/results");
		}
		function onError( response ) {
			 $mdDialog.show({
				"parent": document.body,
				"targetEvent": null,
				"controller": DialogCtrl,
				"scope": {
					"message": response },
				"templateUrl": "/static/html/dialog.html" } );
		}
			
		$scope.getEstimate = function() {
			var args = {};
			angular.forEach( $scope.args, function( arg  ) {
			 	args[ arg.value ]  =true;
			} );
			args['algorithm'] = $scope.selectedAlgorithm.value;
			var fullData = {
				"args":  args,
				"items": $scope.items,
				"bins": $scope.bins };
			$http.post("/estimate", fullData).then(onResult, onError);
		 };
	 	$scope.addArgument = function() {
	                $scope.args.push( angular.copy( $scope.validArgs[0] ) );
		};
		$scope.addBin = function() {
			$scope.bins.push( angular.copy($scope.entityTemplate) );
		};
		$scope.addItem = function() {
			$scope.items.push( angular.copy($scope.entityTemplate) );
		};
		$scope.removeArgument = function(arg) {
			$scope.args.splice(  $scope.args.indexOf( arg ), 1 );
		};
		$scope.removeBin = function(bin) {
			$scope.bins.splice( $scope.bins.indexOf( bin ), 1 );
		};
		$scope.removeItem = function(item) {
			$scope.items.splice( $scope.items.indexOf( item ), 1);
		};
		
	})
	.controller("AboutCtrl", function($scope) {
		$scope.title = "About";
		$scope.description = "";
	})
	.controller("ResultsCtrl", function($scope, $shared) {
		$scope.title = "Results";
		$scope.description = "Results for your estimate";
		$scope.results = $shared.getResults();
	 });
		
