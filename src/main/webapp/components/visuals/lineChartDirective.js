angular.module("WebserviceApp.Directives")
    .directive("lineChart", function () {
        function link(scope, element) {
            var width = 500,
                height = 500,
                margin = 30,
                x = d3.scale.linear()
                    .domain([0, 10])
                    .range([margin, width - margin]),
                y = d3.scale.linear()
                    .domain([0, 10])
                    .range([height - margin, margin]);

            var data = [
                [
                    {x: 0, y: 5}, {x: 1, y: 9}, {x: 2, y: 7},
                    {x: 3, y: 5}, {x: 4, y: 3}, {x: 6, y: 4},
                    {x: 7, y: 2}, {x: 8, y: 3}, {x: 9, y: 2}
                ],
                d3.range(10).map(function (i) {
                    return {x: i, y: Math.sin(i) + 5};
                })
            ];

            var svg = d3.select(element[0]).append("svg");

            svg.attr("height", height)
                .attr("width", width);

            renderAxes(svg);

            render("linear");

            renderDots(svg);

            function render(mode) {
                var line = d3.svg.line()
                    .interpolate(mode) // <-A
                    .x(function (d) {
                        return x(d.x);
                    })
                    .y(function (d) {
                        return y(d.y);
                    });

                svg.selectAll("path.line")
                    .data(data)
                    .enter()
                    .append("path")
                    .attr("class", "line");

                svg.selectAll("path.line")
                    .data(data)
                    .attr("d", function (d) {
                        return line(d);
                    });
            }

            function renderDots(svg) { // <-B
                data.forEach(function (list) {
                    svg.append("g").selectAll("circle")
                        .data(list)
                        .enter().append("circle") // <-C
                        .attr("class", "dot")
                        .attr("cx", function (d) {
                            return x(d.x);
                        })
                        .attr("cy", function (d) {
                            return y(d.y);
                        })
                        .attr("r", 4.5);
                });
            }

            function renderAxes(svg) {
                var xAxis = d3.svg.axis()
                    .scale(d3.scale.linear().range([0, quadrantWidth()]))
                    .orient("bottom");

                var yAxis = d3.svg.axis()
                    .scale(d3.scale.linear().range([quadrantHeight(), 0]))
                    .orient("left");

                svg.append("g")
                    .attr("class", "axis")
                    .attr("transform", function () {
                        return "translate(" + xStart() + "," + yStart() + ")";
                    })
                    .call(xAxis);

                svg.append("g")
                    .attr("class", "axis")
                    .attr("transform", function () {
                        return "translate(" + xStart() + "," + yEnd() + ")";
                    })
                    .call(yAxis);
            }

            function xStart() {
                return margin;
            }

            function yStart() {
                return height - margin;
            }

            function xEnd() {
                return width - margin;
            }

            function yEnd() {
                return margin;
            }

            function quadrantWidth() {
                return width - 2 * margin;
            }

            function quadrantHeight() {
                return height - 2 * margin;
            }
        }

        return {
            link: link,
            restrict: "E",
        }
    })