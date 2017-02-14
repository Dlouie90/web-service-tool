/**
 * TODO: make domain/range attribute values with default values if non are provided
 * TODO: update the date values for the bar charts instead of creating a new chart each time
 *
 * Create a bar chart with a fixed domain / range.
 * Requires an object that contains a "dataReport" property.
 *
 * ---------------- ARRAY VS OBJECT ---------------
 * using an object because $watch really only watches for changes in a
 * a memory location. If you change from project #1 array to project #2 array,
 * it won't detect any changes because it still watches the memory location of
 * project #1's array. Therefore a solution is to store all the array of data
 * that we want to plot inside an object. When we update the array, either by
 * adding values, or switching to different project array, we can see the changes.
 **/

angular.module("WebserviceApp.Directives")
    .directive("barChart", function () {

        function link(scope, element) {
            // name of the object property that contains the array of data to plot
            var dataFieldName = "dataReport";
            var data = scope.data[dataFieldName];

            // good default choice to map a continuous input domain to a
            // continuous output range. https://github.com/d3/d3-3.x-api-reference/blob/master/Quantitative-Scales.md#linear-scales
            var linearScale = d3.scale.linear()
                .domain([0, 100])
                .range([0, 750]);


            // watch for changes to the data scope object. when it gets update,
            // when data gets added to a project, rebuild the bar chart.
            scope.$watch('data', function (newData) {

                // get the updated new data
                var data = newData[dataFieldName];

                // when the application first start, active project is empty
                // TypeError: Cannot read property 'length' of undefined
                if (data) {
                    // remove old bar chart data (if any)
                    d3.select(".chart").selectAll("div").remove();

                    // create new bar chart
                    d3.select(element[0])
                        .classed("chart", true)
                        .selectAll("div")
                        .data(data)
                        .enter().append("div")
                        .style("width", 0)
                        .transition()
                        .style("width", function (d) {
                            return linearScale(d) + "px";
                        })
                        .text(function (d) {
                            return d;
                        });
                }

            }, true);
        }

        return {
            link: link,
            restrict: "E",
            scope: {data: "="}
        }
    });
