angular.module("WebserviceApp.Directives")
    .directive("scatterPlot", function () {
        function link(scope, element) {
            var counter   = 0;
            var graphData = [];
            var color     = d3.scale.category20();
            var cursor    = {x: 0, y: 0};

            var margin = {top: 20, right: 20, bottom: 30, left: 40};
            var width  = 600 - margin.left - margin.right;
            var height = 400 - margin.top - margin.bottom;

            var div = d3.select(element[0]).append("div").attr("class", "toolTip");

            // setup x
            var x = d3.scale.linear()
                .domain([0, 10])
                .range([0, width]);

            var y = d3.scale.linear()
                .domain([0, 10])
                .range([height, 0]);

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left");

            var svg = d3.select(element[0]  ).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .on("mousemove", updateCursor)
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


            var circleG = svg.append("g")
                .attr("class", "circle-g");


            function draw() {

                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis);

                svg.append("g")
                    .attr("class", "y axis")
                    .call(yAxis);

                var circles = circleG.selectAll("circle")
                    .data(graphData, key);

                circles.enter().append("circle")
                    .attr("r",1)
                    .attr("cx", function (d) {
                        return x(d.x);
                    })
                    .attr("cy", function (d) {
                        return y(d.y);
                    })
                    .attr("fill", function (d) {
                        return color(counter++);
                    })
                    .transition()
                    .attr("r", function(d) {
                        return d.r;
                    });


                circles.on("mousemove.tooltip", showTooltip);
                circles.on("mousemove.size", enlarge);

                circles.on("mouseout", hideTooltip);
                circles.on("mouseout.size", shrink);

                circles.on("click", highlight);

            }

            function key(d, index) {
                return d.x + "," + d.y;
            }

            function updateCursor() {
                cursor.x = d3.mouse(this)[0];
                cursor.y = d3.mouse(this)[1];
            }

            function showTooltip(d) {
                div.style("left", cursor.x + 20 + "px");
                div.style("top", cursor.y + 120+ "px");
                div.style("display", "inline-block");
                div.html("Generic Tooltip <br> (" + d.x.toFixed(2) + ",&nbsp;" + d.y.toFixed(2) + ")");
            }

            function hideTooltip() {
                div.style("display", "none");
            }

            function enlarge(d) {
                d3.select(this).transition()
                    .attr("r", function (d) {
                        return d.r * 2
                    });
            }

            function shrink(d) {
                d3.select(this).transition()
                    .attr("r", function (d) {
                        return d.r
                    });
            }

            function highlight() {
                d3.select(this)
                    .classed("highlight", function (d) {
                        d.h = !d.h;
                        return d.h;
                    });
            }


            draw();
            /* =============== WATCH =============== */
            scope.$watch("data", function (newData, oldData) {
                var userData = [];
                newData.scatterData.forEach(function (d) {
                    userData.push({x: d.x, y:d.y, r: d.r, h: d.h});
                });
                var refreshPlot = setInterval(function () {

                    if (userData.length <= 0) {
                        clearInterval(refreshPlot);
                    } else {
                        graphData.push(userData.shift());
                        draw();
                    }

                }, 500);


            }, true);
        }

        return {
            restrict: "E",
            scope   : {data: "="},
            link    : link
        }
    });


