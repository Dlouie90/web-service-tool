/**
 * Created by shay on 10/11/16.
 */

/**
 * A header navigation bar that is displayed on every page
 */
angular.module("WebserviceApp.Directives")
    .directive("navBar", function () {
        return {
            restrict: "E",
            templateUrl: "features/navbar/NavBar.html"
        }
    });
