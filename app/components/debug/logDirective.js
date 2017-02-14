/**
 * Created by shay on 10/20/16.
 */

/**
 * Use to log message onto the HTML.
 * Strings, Numbers, JSON, whatever...
 */
angular.module("WebserviceApp.Directives")
    .directive("wsLog", function() {
        return {
            restrict: "E",
            transclude: true,
            template: "<p><code><ng-transclude></ng-transclude></code></p>"
        }
    });
