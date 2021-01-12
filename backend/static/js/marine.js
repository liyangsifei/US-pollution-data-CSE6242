// enter code to define margin and dimensions for svg
var margin = {top: window.innerWidth*0.1, right: window.innerWidth*0.1, bottom: window.innerWidth*0.07, left: window.innerWidth*0};
var width = window.innerWidth - margin.left - margin.right;
var height = window.innerHeight - margin.top - margin.bottom;
//console.log(data)
var usmap = d3.map();

var tip = d3.tip()
	.offset([0, 0])
	.attr('class', 'd3-tip')
	.html(function(d) {
		return "<strong>Latitude: </strong>" + Math.floor(d.latitude*1000)/1000 + "<br><strong>Longitude: </strong>" + Math.floor(d.longitude*1000)/1000 + "<br><strong>Type: </strong> " + d.parameter + "<br><strong>Value (mg/kg): </strong>" + Math.floor(d.result*100)/100
	})
// enter code to create svg
var svg = d3.select("#choropleth").append("svg")
            .attr("class", "choropleth")
            .attr("width", window.innerWidth)
            .attr("height", window.innerHeight)
            .append("g")
            .attr("transform", "translate(" + margin.left +20+ "," + margin.top + ")");

var defs = svg.append("defs");
var linearGradient = defs.append("linearGradient")
                        .attr("id", "linear-gradient");

svg.call(tip);
// vertical gradient
linearGradient.attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "0%")
            .attr("y2", "100%");

//Set the color for the start (0%)
linearGradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", d3.interpolateReds(0));

//Set the color for the end (100%)
linearGradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", d3.interpolateReds(1));

var dom_min = 0.0001
var dom_max = 50
var average = 0 
var variance = 1
// set color scale
colorscale = d3.scaleSequential(function(t) {return d3.interpolateReds(t)}).domain([dom_min,dom_max]);

//Draw the rectangle and fill with gradient
svg.append("rect")
    .attr("width", 20)
    .attr("height", 150)
    .attr("transform", "translate(" + width + ", 0)")
    .style("fill", "url(#linear-gradient)");

var year_array = []
for (let i = 1986; i <= 2015; i++) {
year_array.push(i)
}

var time_scale = d3.scaleLinear()
                .domain([1986, 2015])
                .range([250, 850])
                .clamp(true);

var time_slider = svg.append("g")
                    .attr("class", "slider")
                    .attr("transform", "translate(" + (margin.left+width*0.05) + "," + (height) + ")");

time_slider.append("line")
        .attr("class", "track")
        .attr("x1", time_scale.range()[0])
        .attr("x2", time_scale.range()[1])
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-inset")
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-overlay")


time_slider.insert("g", ".track-overlay")
        .attr("class", "ticks")
        .attr("transform", "translate(0," + 18 + ")")
        .selectAll("text")
        .data(year_array)
        .enter()
        .append("text")
        .attr("x", function(d) { return time_scale(d); })
        .attr("y", 10)
        .style("font-size", "10px")
        .attr("text-anchor", "middle")
        .text(function(d) { if (d%2==0) {return d;} });

var handle = time_slider.insert("circle", ".track-overlay")
                    .attr("class", "handle")
                    .attr("r", 9)
                    .attr("cx", 250);

var label = time_slider.append("text")
                    .attr("class", "label")
                    .attr("text-anchor", "middle")
                    .text(1986)
                    .attr("transform", "translate(0," + (-25) + ")")
                    .attr("x", 250);

var update = time_slider.data(year_array)

console.log(margin.top)
// enter code to define projection and path required for Choropleth
var projection = d3.geoAlbersUsa()
    .translate([width/2, height/2 - margin.top +30])
    .scale([1000]);

var path = d3.geoPath()
            .projection(projection);
//
// define any other global variables
var parameter = "DDT"; // default parameter


Promise.all([
    // enter code to read files
    //d3.json("http://bl.ocks.org/mapsam/6090056?fbclid=IwAR0rZOxc5B_4KlJX3bL4VWgo6e215Jfvy4aI16dsII8Elc1fLwzNxv3pivA#states.json"),
    //d3.json("https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/us.json"),
    //d3.json("http://bl.ocks.org/mbostock/raw/4090846/world-50m.json"),
    d3.json("https://gist.githubusercontent.com/danab/11432969/raw/1c4f7305da43736b81ed594e4ef54f814525b2a7/topo.json"),
    d3.dsv(",", "/static/data/new.csv")
]).then(
// enter code to call ready() with required arguments

function loadData(data) {
    //console.log(data[0])
    ready(usa_state = data[0]
        , marine_data = data[1]);
}
).catch(function(error) {
    console.log(error);
});


function ready(usa_state, marine_data) {

// plot the us map
svg.append("g").selectAll("path")
    .data(topojson.feature(usa_state, usa_state.objects.usStates).features)
    .enter()
    .append("path")
    .attr("class", "states")
    .attr("d", path);

// default plot
createMapAndLegend(marine_data, 1986, parameter);

time_slider.call(d3.drag()
        .on("start.interrupt", function() { time_slider.interrupt(); })
        .on("start drag", function() {
            currentValue = d3.event.x;
            year = time_scale.invert(currentValue-width*0.05);
            handle.attr("cx", time_scale(year));
            label.attr("x", time_scale(year))
                    .text(Math.round(year));
            console.log(Math.round(year))
            // filter data set and redraw plot
            d3.selectAll(".legend").remove();
            d3.selectAll(".data_point").remove();
            // create corresponding choropleth
            createMapAndLegend(marine_data, Math.round(year), parameter);
        })
        );

}

function setpara(para){
    if(parameter != para){
        parameter = para;
        // filter data set and redraw plot
        d3.selectAll(".legend").remove();
        d3.selectAll(".data_point").remove();
        // create corresponding choropleth
        if(parameter == "PAH" ){
            d3.select("#PAH_button").attr("class", "btn btn-primary")
            d3.select("#PCB_button").attr("class", "btn btn-secondary")
            d3.select("#DDT_button").attr("class", "btn btn-secondary")

        }
        if(parameter == "PCB"){
            d3.select("#PAH_button").attr("class", "btn btn-secondary")
            d3.select("#PCB_button").attr("class", "btn btn-primary")
            d3.select("#DDT_button").attr("class", "btn btn-secondary")

        }
        if(parameter == "DDT"){
            d3.select("#DDT_button").attr("class", "btn btn-primary")
            d3.select("#PCB_button").attr("class", "btn btn-secondary")
            d3.select("#PAH_button").attr("class", "btn btn-secondary")
        }
        
        
        createMapAndLegend(marine_data, +label.text(), parameter);
    }
}

function createMapAndLegend(marine_data, selectedYear, selectedParameter){

    // filter gameData by selectedGame
    marine_yearly_data = marine_data.filter(function(d) {
        return d.year == selectedYear;
    }).filter(function(d) {
        if (d["latitude"] > 20  && d["latitude"] < 90 &&  d["longitude"] < -70 && d["longitude"] >  -140)
        {return d.parameter == selectedParameter;
        }
    });
    find_max_min(marine_yearly_data);
    //console.log(dom_min, dom_max, average, variance)
    // set color domain
    colorscale.domain([dom_min,dom_max])
    /*
    .domain([
        d3.min(marine_yearly_data, function(d) { 
            console.log(d.result);
            return +d.result; }),
        d3.max(marine_yearly_data, function(d) { 
            console.log(d.result);
            return +d.result; })
    ]);*/
    radScale = d3.scaleSqrt()
                .domain([dom_min,dom_max])
            
    //console.log(marine_yearly_data)

    // add circles to svg
    svg.selectAll("circle")
        .data(marine_yearly_data)
        .enter()
        .append("circle")
        .attr("class", "data_point")
        .attr('cx', function(d) {
			if (d["latitude"] > 20  && d["latitude"] < 90 &&  d["longitude"] < -70 && d["longitude"] >  -140) {
				return projection([d["longitude"], d["latitude"]])[0];
			}
		})
        .attr("cy", function(d) {
			if (d["latitude"] > 20  && d["latitude"] < 90 &&  d["longitude"] < -70 && d["longitude"] >  -140) {
				return projection([d["longitude"], d["latitude"]])[1];
			}
		})
        .attr("r", function(d) {
            //console.log(radScale(d["result"]))
            if(radScale(d["result"])< 0.05 ) {return "5";}
            else if(radScale(d["result"])< 0.2 ) {return "8";}
            else if (radScale(d["result"])<  0.5) return "11";
            else if (radScale(d["result"])<  0.8) return "14";
            else return "17";
            })
        .style("opacity", 0.85)
        .attr("fill", function(d){if (+d.result == 0) {return "#DCDCDC"} else {return colorscale(+d.result)}})
        .attr("stroke", "#6e6e6e")
        .on("mouseover", function(d) {
    			tip.show(d);
    		})
    		.on("mouseout", function(d) {
    			tip.hide(d);
          });
          

    // add color legend
    var axisScale = d3.scaleSqrt()
                        .domain(colorscale.domain())
                        .range([-150, 0])

    svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + (width+60) + ", 150)")
        .call(d3.axisLeft(axisScale));
}



function find_max_min(data) {
    //console.log(data)
    dom_max  = 0.001 
    dom_min = 10
    average  = 0 
    variance = 1 
    var tmp = 0
    var all = 0 
	for (var i = 0; i < data.length; i++) {
        res = data[i]["result"]
        //console.log(res)
		if (dom_max < res) dom_max = res
		if (res < dom_min) dom_min = res
        //if (no2_aqi > no2_aqi_max_all) no2_aqi_max_all = no2_aqi
        average += parseInt(res)
        all += parseInt(res)
        tmp = tmp+ parseInt(res)*parseInt(res)
    }
    average  = Math.round(average / data.length)
    variance = Math.sqrt((tmp - all)/average )
    if(dom_min > dom_max)
    {
        dom_min = 0;
        dom_max = 10;
    }
}