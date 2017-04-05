/**
 * Created by shay on 10/11/16.
 */

// the root module
angular.module("WebserviceApp", [
        "ngRoute",
        "WebserviceApp.Directives",
        "WebserviceApp.Controllers",
        "WebserviceApp.Services",
        "WebserviceApp.Filters",
    ]
);


// set up routing
angular.module("WebserviceApp")
    .config(function ($routeProvider) {


        $routeProvider.when("/project", {
            templateUrl: "/webservice/views/project.html"
        });

        $routeProvider.when("/about", {
            templateUrl: "/webservice/views/about.html"
        });

        $routeProvider.when("/contact", {
            templateUrl: "/webservice/views/contact.html"
        });

        $routeProvider.otherwise({
            templateUrl: "/webservice/views/project.html"
        });
    });

// controllers
angular.module("WebserviceApp.Controllers", []);

// directives
angular.module("WebserviceApp.Directives", []);

// providers
angular.module("WebserviceApp.Services", []);

// filters
angular.module("WebserviceApp.Filters", []);
