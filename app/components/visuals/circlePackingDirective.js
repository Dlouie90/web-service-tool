angular.module("WebserviceApp.Directives")
    .directive("circlePack", function () {
        function link(scope, element, attrs) {

            scope.$watch('data', function (newData) {
                console.log("circle-pack", newData);
                let data    = newData;
                const WIDTH = 500;
                const c10   = d3.scale.category20c();

                const pack = d3.layout.pack()
                    .size([WIDTH, WIDTH])
                    .sort(null)
                    .padding(5)
                    .value(d => {
                        return 100;
                    });

                d3.select(element[0]).selectAll("*").remove();

                const svg = d3.select(element[0])
                    .append("svg")
                    .attr("class", "svg-main")
                    .attr("width", 800)
                    .attr("height", 800);


                const vis = svg.datum(data)
                    .selectAll(".node").data(pack.nodes).enter()
                    .append("g")
                    .attr("transform", d => {
                        let x_adjusted = d.x + 50;
                        let y_adjusted = d.y + 50;
                        return "translate(" + x_adjusted + "," + y_adjusted + ")";
                    });

                let circles = vis.append("circle")
                    .style("fill", d => {
                        return c10(d.depth);
                    })
                    .attr("stroke", "grey")
                    .attr("r", d => d.r)
                    .on("mouseout", () => {
                        d3.select(this).attr("stroke", "grey")
                            .style("stroke-width", 0)

                    })
                    .on("mouseover", () => {
                        d3.select(this).attr("stroke", "black")
                            .style("stroke-width", 5)
                    });

                let text = vis.append("text")
                    .style("text-anchor", "middle")
                    .attr("dy", ".5em")
                    .text(d => {
                        if (d.id != null)
                            return (d.id);
                    });
            }, false);
        }

        return {
            link    : link,
            restrict: "E",
            scope   : {data: "="}

        }
    })
;

