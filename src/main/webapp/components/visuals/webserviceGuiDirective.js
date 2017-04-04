angular.module("WebserviceApp.Directives")
    .directive("webserviceGui", function () {
        function link(scope, element) {
            // Ensure we are working on a new canvas by removing all the children
            // elements
            d3.select(element[0]).selectAll("*").remove();

            /** MAIN SVG **/
            var width  = 1200;
            var height = 600;


            var svg = d3.select(element[0]).append("svg")
                .attr("class", "svg-main")
                .attr("width", width)
                .attr("height", height);
        }

        return {
            restrict: "E",
            scope   : {data: "="},
            link    : link
        }
    })

    .directive("editText", function () {
        return {
            restrict   : "E",
            scope      : {data: "="},
            templateUrl: "editText"
        }
    });