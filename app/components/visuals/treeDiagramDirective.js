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
;

