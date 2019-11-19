//(function() {

    let svg = '';
    let mapData = 'no data';
    let pointsData = 'no data';

    const measurements = {
        width: 800,
        height: 600, 
        margin: 50 
    };

    window.onload = function() {
        svg = d3.select('body')
            .append('svg')
            .attr('height', measurements.height)
            .attr('width', measurements.width); 
        
        d3.json('data/neighborhoods.json', function(jsondata) {
            mapData = jsondata;
            makeMap();
        });

        d3.json('data/points.json', function(jsondata) {
            pointsData = jsondata;
            console.log(pointsData)
        });  
    }

    function makeMap() {
        let neighborhoods = svg.append('g');
        let points = svg.append('g');
        let lines = svg.append('g')

        // function to get pixel coordinates of the map
        let mapProjection = d3.geoAlbers()
            .scale(190000)
            .rotate([71.057, 0])
            .center([0, 42.313])
            .translate([measurements.width/2, measurements.height/2]);

        // function to get svg path string
        let geoPath = d3.geoPath()
            .projection(mapProjection);
        
        // show map
        neighborhoods.selectAll('path')
            .data(mapData.features)
            .enter()
            .append('path')
            .attr('fill', '#ccc')
            .attr('d', geoPath);
        
        // show points on map
        points.selectAll('path')
            .data(pointsData.features )
            .enter()
            .append('path')
            .attr('fill', 'red')
            .attr('stroke', 'darkred')
            .attr('d', geoPath);

        svg.selectAll("path")
            .data(pointsData.features)
            .enter() 
            .append('path')
            .attr('d', 'line')
        
        let data = pointsData.features;
        let connectors = [];
        for(let i = 0; i < data.length - 1; i++){
            var start = mapProjection(data[i].geometry.coordinates);
            var stop = mapProjection(data[i + 1].geometry.coordinates);
            connectors.push({
                type: "LineString",
                coordinates: [
                    [ start[0], start[1] ],
                    [ stop[0], stop[1] ]
                ]
            });
        }

        console.log(connectors);
        lines.selectAll('line')
            .data(connectors)
            .enter()
            .append('line')
                .attr("x1", d=>
                    d.coordinates[0][0]
                )
                .attr("y1", d=>d.coordinates[0][1])
                .attr("x2", d=>d.coordinates[1][0])
                .attr("y2", d=>d.coordinates[1][1])
                .attr("id", function(d, i) { return "line" + i})
                .attr("stroke", "blue")
                
        d3.selectAll('line').style('opacity', '1');
        
        d3.selectAll('line').each(function(d, i) {
                    let totalLength = d3.select("#line" + i).node().getTotalLength();
                    d3.select("#line" + i).attr("stroke-dasharray", totalLength + " " + totalLength)
                        .attr("stroke-dashoffset", totalLength)
                        .transition()
                        .duration(500)
                        .delay(220*i)
                        .ease(d3.easeLinear)
                        .attr("stroke-dashoffset", 0)
                        .style("stroke-width", 3);
        
        })
    }

//})