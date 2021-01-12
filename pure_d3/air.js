//Width and height of map
var width = 1000;
var height = 500;
var margin = {top:50, bottom:0, left:100, right:100}
var worldmap = d3.map();
// D3 Projection
var projection = d3.geoAlbersUsa()
				   .translate([width/2, height/2 + margin.top/2])
				   .scale([1000]);

var path = d3.geoPath().projection(projection);

var gas_type = "SO2";
// Define linear scale for output
var color = d3.scaleQuantize().range(d3.schemeBlues[1,5]);
// d3.scaleLinear()
// 			  .range(["rgb(213,222,217)","rgb(69,173,168)","rgb(84,36,55)","rgb(217,91,67)"]);
var labelScale = d3.scaleOrdinal()
	  .range(d3.schemeBlues[1,5]);

var legendText;
var selectedDate = '2000-01'
var so2_aqi_max = 0;
var so2_aqi_min = 0.0;
var no2_aqi_max = 0;
var no2_aqi_min = 5.0;
var co_aqi_max = 0;
var co_aqi_min = 0.0;
var o3_aqi_max = 0;
var o3_aqi_min = 5.0;
var so2_aqi = 0;
var no2_aqi = 0
var o3_aqi = 0
var co_aqi = 0
//Create SVG element and append map to the SVG
var svg = d3.select("#map")
			.append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom);

var div = d3.select("body")
		    .append("div")
    		.attr("class", "tooltip")
    		.style("opacity", 0);

map = d3.json("us-states.json");
result = d3.csv("result.csv", function(d){ return d;});


Promise.all([map, result]).then(function(data) {
	json = data[0];
	data = data[1];


	load_map(json, data)

	d3.select('#btn-so2').on('click', ()=>{
	      gas_type = "SO2";
	      load_map(json, data)
	})
	d3.select('#btn-co').on('click', ()=>{
	      gas_type = "CO";
	      load_map(json, data)
	})
	d3.select('#btn-no2').on('click', ()=>{
	      gas_type = "NO2";
	      load_map(json, data)
	})
	d3.select('#btn-o3').on('click', ()=>{
	      gas_type = "O3";
	      load_map(json, data)
	})


	//slider part
	var formatDateIntoYear = d3.timeFormat("%Y");
	var formatDate = d3.timeFormat("%b %Y");
	var strFromatDate = d3.timeFormat("%Y-%m");
	var parseDate = d3.timeParse("%m/%d/%y");

	var startDate = new Date("2000-01-01"),
	    endDate = new Date("2020-04-01");

	var slider_margin = {top:0, right:50, bottom:50, left:100},
	    slider_width = 600 - slider_margin.left - slider_margin.right,
	    slider_height = 300 - slider_margin.top - slider_margin.bottom;

	var currentValue = 0;
	var targetValue = slider_width;

	var svg_slider = d3.select("#slider")
	    .append("svg")
	    .attr("width", slider_width + slider_margin.left + slider_margin.right)
	    .attr("height", slider_height + slider_margin.top + slider_margin.bottom);

	var x = d3.scaleTime()
	    .domain([startDate, endDate])
	    .range([0, targetValue])
	    .clamp(true);

	var slider = svg_slider.append("g")
	    .attr("class", "slider")
	    .attr("transform", "translate(" + slider_margin.left + "," + slider_height/5 + ")");

	slider.append("line")
	    .attr("class", "track")
	    .attr("x1", x.range()[0])
	    .attr("x2", x.range()[1])
	  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
	    .attr("class", "track-inset")
	  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
	    .attr("class", "track-overlay")
	    .call(d3.drag()
	        .on("start.interrupt", function() { slider.interrupt(); })
	        .on("start drag", function() {
	          currentValue = d3.event.x;
	          update(x.invert(currentValue));
	        })
	    );

	slider.insert("g", ".track-overlay")
	    .attr("class", "ticks")
	    .attr("transform", "translate(0," + 18 + ")")
	    .selectAll("text")
	    .data(x.ticks(10))
	    .enter()
	    .append("text")
	    .attr("x", x)
	    .attr("y", 10)
	    .attr("text-anchor", "middle")
	    .text(function(d) { return formatDateIntoYear(d); });

	var handle = slider.insert("circle", ".track-overlay")
	    .attr("class", "handle")
	    .attr("r", 9);

	var label = slider.append("text")
	    .attr("class", "label")
	    .attr("text-anchor", "middle")
	    .text(formatDate(startDate))
	    .attr("transform", "translate(0," + (-25) + ")")

	var plot = svg_slider.append("g")
		.attr("class", "plot")
		.attr("transform", "translate(" + slider_margin.left + "," + slider_margin.top + ")");

	function prepare(d) {
		d.id = d.id;
		d.date = parseDate(d.date);
		return d;
	}

	function update(h) {
		handle.attr("cx", x(h));
		label.attr("x", x(h))
			.text(formatDate(h));
		selectedDate = strFromatDate(h)
		load_map(json, data)
	}

})

// cities & points
// d3.csv("cities-lived.csv", function(data) {
//
// svg.selectAll("circle")
// 	.data(data)
// 	.enter()
// 	.append("circle")
// 	.attr("cx", function(d) {
// 		return projection([d.lon, d.lat])[0];
// 	})
// 	.attr("cy", function(d) {
// 		return projection([d.lon, d.lat])[1];
// 	})
// 	.attr("r", function(d) {
// 		return Math.sqrt(d.years) * 4;
// 	})
// 		.style("fill", "rgb(217,91,67)")
// 		.style("opacity", 0.85)
//
// 	.on("mouseover", function(d) {
//     	div.transition()
//       	   .duration(200)
//            .style("opacity", .9);
//            div.text(d.place)
//            .style("left", (d3.event.pageX) + "px")
//            .style("top", (d3.event.pageY - 28) + "px");
// 	})
//
//     // fade out tooltip on mouse out
//     .on("mouseout", function(d) {
//         div.transition()
//            .duration(500)
//            .style("opacity", 0);
//     });
// });
//

function load_map(json, data){

for (var i = 0; i < data.length; i++) {
	month = data[i]['Date Local'].substring(0, 7)

	if (month == selectedDate) {
		var dataState = data[i]["State"];
		so2_aqi = data[i]["SO2 AQI"];
		no2_aqi = data[i]["NO2 AQI"]
		o3_aqi = data[i]["O3 AQI"]
		co_aqi = data[i]["CO AQI"]
		so2_aqi_max, no2_aqi_max, co_aqi_max, o3_aqi_max = 0;
		for (var j = 0; j < json.features.length; j++)  {
			var jsonState = json.features[j].properties.name;

			if (dataState == jsonState) {
				json.features[j].properties.so2_aqi = parseFloat(so2_aqi);
				json.features[j].properties.no2_aqi = parseFloat(no2_aqi);
				json.features[j].properties.co_aqi = parseFloat(co_aqi);
				json.features[j].properties.o3_aqi = parseFloat(o3_aqi);
				if (so2_aqi > so2_aqi_max) so2_aqi_max = so2_aqi
				if (no2_aqi > no2_aqi_max) no2_aqi_max = no2_aqi
				if (co_aqi > co_aqi_max) co_aqi_max = co_aqi
				if (o3_aqi > o3_aqi_max) o3_aqi_max = o3_aqi
			}
		}
	}
}
load_gas(json)

// update legend

var legend = d3.select("svg")
	.append("g")
	.attr("class", "legend")
  .attr("width", 140)
  .attr("height", 200)
	.selectAll("g")
	.data(color.domain())
	.enter()
	.append("g")
	.attr("transform", function(d, i) {
		return "translate(" + width + "," + i * 20 + ")"; });

legend.append("rect")
  .attr("width", 18)
  .attr("height", 18)
  .style("fill", color);

legend.append("text")
	.data(legendText)
	.attr("x", 24)
	.attr("y", 9)
	.attr("dy", ".35em")
	.text(function(d) { return d; });
}

function load_gas(json) {

	var min = 0.0
	var max = 0.0
	var segment = 0.0

	usmap = svg.append("g")
		.attr("class", "counties")
		.selectAll("path")
		.data(json.features)
		.enter()
		.append("path")
		.attr("d", path)
		.style("stroke", "#fff")
		.style("stroke-width", "1")
		.style("fill", function(d) {
		var so2_aqi = d.properties.so2_aqi;
		var o3_aqi = d.properties.o3_aqi;
		var no2_aqi = d.properties.no2_aqi;
		var co_aqi = d.properties.co_aqi;

		if (gas_type == "SO2") {
			min = so2_aqi_min
			max = so2_aqi_max
			aqi = so2_aqi
		} else if (gas_type == "O3") {
			min = o3_aqi_min
			max = o3_aqi_max
			aqi = o3_aqi
		} else if (gas_type == "NO2") {
			min = no2_aqi_min
			max = no2_aqi_max
			aqi = no2_aqi
		} else if (gas_type == "CO") {
			min = co_aqi_min
			max = co_aqi_max
			aqi = co_aqi
		} else {
			return "rgb(213,222,217)";
		}
		segment = max/3
		color.domain([min, min+segment, min + 2 * segment, max])
		if (aqi) {
			return color(aqi);
		} else {
			return "rgb(213,222,217)";
		}

	});
	legendText = ["0", "" + segment, "" + 2 * segment, max]
	labelScale.domain(legendText)
}
