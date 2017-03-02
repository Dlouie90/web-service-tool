angular.module("WebserviceApp.Directives")
    .directive("treeDiagram", function () {
        function link(scope, element, attrs) {

            scope.$watch('data', function (newData) {
                let data = newData;

                d3.select(element[0]).selectAll("*").remove();


                const width      = 1000;
                const height     = 600;
                const nodeRadius = 20;
                const margin     = {
                    left  : 50, top: 10,
                    bottom: 10, right: 40
                };

                const svg = d3.select(element[0])
                    .append("svg")
                    .attr("class", "svg-main")
                    .attr("width", width)
                    .attr("height", height);

                const mainGroup = svg.append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ')');


                const tree = d3.layout.tree()
                    .size([
                        height - (margin.bottom + margin.top),
                        width - (margin.left + margin.right)
                    ]);

                const nodes = tree.nodes(data);
                const links = tree.links(nodes);

                const diagonal = d3.svg.diagonal()
                    .projection(d => {
                        return [d.y, d.x]
                    });

                mainGroup.selectAll("path")
                    .data(links)
                    .enter()
                    .append("path", "g")
                    .attr({
                        d             : diagonal,
                        fill          : "none",
                        stroke        : "#ccc",
                        "stroke-width": 2
                    });

                const circleGroups = mainGroup.selectAll("g")
                    .data(nodes)
                    .enter()
                    .append("g")
                    .attr("transform", d => {
                        return "translate(" + d.y + "," + d.x + ")";
                    });

                circleGroups.append("circle")
                    .attr({
                        "r"           : nodeRadius,
                        "fill"        : "#fff",
                        "stroke"      : "steelblue",
                        "stroke-width": 3
                    });

                circleGroups.append("text")
                    .text(d => {
                        if (d.id)
                            return d.id;
                        else
                            return "root";
                    })
                    .attr("y", d => {
                        return d.children || d._children ?
                            -nodeRadius * 2 : nodeRadius * 2
                    })
                    .attr({
                        "dy"          : ".35em",
                        "text-anchor" : "middle",
                        "fill-opacity": 1
                    })
                    .style("font", "1.5em sans-serif")
            }, false);
        }

        return {
            link    : link,
            restrict: "E",
            scope   : {data: "="}

        }
    })


    .directive("radialDiagram", function () {
        function link(scope, element, attrs) {

            scope.$watch('data', function (newData) {
                let data = newData;

                d3.select(element[0]).selectAll("*").remove();


                const width      = 600;
                const height     = 600;
                const nodeRadius = 12;

                const svg = d3.select(element[0])
                    .append("svg")
                    .attr({width, height});

                const radius    = width / 2;
                const mainGroup = svg.append("g")
                    .attr("transform", "translate(" + radius + "," + radius + ')');


                const cluster = d3.layout.cluster()
                    .size([360, radius - 50]);

                const nodes = cluster.nodes(data);
                const links = cluster.links(nodes);

                const diagonal = d3.svg.diagonal.radial()
                    .projection(d => {
                        return [d.y, d.x / 180 * Math.PI]
                    });

                mainGroup.selectAll("path")
                    .data(links)
                    .enter()
                    .append("path")
                    .attr({
                        d             : diagonal,
                        fill          : "none",
                        stroke        : "#ccc",
                        "stroke-width": 2
                    });

                const circleGroups = mainGroup.selectAll("g")
                    .data(nodes)
                    .enter()
                    .append("g")
                    .attr("transform", d => {
                        return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
                    });

                circleGroups.append("circle")
                    .attr({
                        "r"           : nodeRadius,
                        "fill"        : "#fff",
                        "stroke"      : "steelblue",
                        "stroke-width": 3
                    });

                circleGroups.append("text")
                    .attr({
                        dy           : ".25em",
                        dx           : "-.5em",
                        'text-anchor': function (d) {
                            return d.x < 180 ? "start" : "end";
                        },
                        'transform'  : function (d) {
                            return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)";
                        }
                    })
                    .style('font', '1.5em sans-serif')
                    .text(function (d) {
                        return d.id || "root";
                    });
            }, false);
        }

        return {
            link    : link,
            restrict: "E",
            scope   : {data: "="}

        }
    });

