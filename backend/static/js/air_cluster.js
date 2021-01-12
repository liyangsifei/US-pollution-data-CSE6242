//Width and height of map

var width = 1000;
var height = 500;
var margin = {top:50, bottom:0, left:100, right:100}
var usmap = d3.map();
// D3 Projection
var projection = d3.geoAlbersUsa()
	.translate([width/2, height/2 + margin.top/2])
	.scale([1000]);

var path = d3.geoPath().projection(projection);

var gas_type = "SO2";
// Define linear scale for output
var color = d3.scaleQuantize().range(d3.schemeDark2.slice(0,6)).domain([0, 5]);
// d3.scaleLinear()
// 			  .range(["rgb(213,222,217)","rgb(69,173,168)","rgb(84,36,55)","rgb(217,91,67)"]);
var legendText = ["Cluster 0","Cluster 1","Cluster 2", "Cluster 3", "Cluster 4", "Cluster 5"];
var labelScale = d3.scaleOrdinal(d3.schemeDark2.slice(0,6)).domain(legendText);
      //.range();

var selectedDate = '2000-01'
var so2_aqi = 0;
var no2_aqi = 0
var o3_aqi = 0
var co_aqi = 0

var tip_county = d3.tip()
  .offset([0, 0])
  .attr('class', 'd3-tip')
  .html(function(d) {
    return "<strong>State:</strong>" +d.properties.state + "<br><strong>County:</strong>" +d.properties.county +"<br><strong>SO2 AQI:</strong> " + d.properties.so2_aqi + "<br><strong>O3 AQI:</strong> " + d.properties.o3_aqi+ "<br><strong>NO2 AQI:</strong> " + d.properties.no2_aqi + "<br><strong>CO AQI:</strong> " + d.properties.co_aqi;
})
//Create SVG element and append map to the SVG
var svg = d3.select("#map")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);
		
svg.append('text').attr('x', 10)
	.attr('y', 20)
	.style('fill', 'steelblue')
	.style('font-size', '18px').style('font-weight', 'bold').text("Given 4-6 clusters,we use four compounds' concentration as features");
//"有X個cluster, 用4種化合物濃度當作feature透過計算"

svg.append('text').attr('x', 10)
	.attr('y', 40)
	.style('fill', 'steelblue')
	.style('font-size', '18px').style('font-weight', 'bold').text("to run the spectral clustering algorithm and get class 1 to class 6")


var div = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

map = d3.json("https://raw.githubusercontent.com/python-visualization/folium/master/examples/data/us-states.json");

var county_json = []

result = d3.csv("/static/data/air_cluster_withCounty.csv", function(d){ return d;});
svg.call(tip_county)
//var label = [1, 2, 3, 4, 5, 6]

Promise.all([map, result]).then(function(data) {
	json = data[0];
	data = data[1];

	load_map(json, data)

	//slider part
	var formatDateIntoYear = d3.timeFormat("%Y-%m");
	var formatDate = d3.timeFormat("%b %Y");
	var strFromatDate = d3.timeFormat("%Y-%m");
	var parseDate = d3.timeParse("%m/%d/%y");

  var startDate = new Date("2000-01-01"),
    	endDate = new Date("2020-04-01");

	var slider_margin = {top:0, right:50, bottom:50, left:100},
	    slider_width = 750 ,
	    slider_height = 100 - slider_margin.top - slider_margin.bottom;

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
	    .attr("transform", "translate(" + 15 + "," + (slider_height/5+25) + ")");

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

		slider.append("text")
                    .attr("class", "label")
                    .attr("text-anchor", "middle")
                    .text("2000-01")
                    .attr("transform", "translate(0," + 28 + ")")
					.attr("x", 10);
					
	var plot = svg_slider.append("g")
		.attr("class", "plot")
		.attr("transform", "translate(" + slider_margin.left + "," + slider_margin.top + ")");

	function update(h) {
    d3.selectAll("path").remove();
		d3.selectAll(".data_point").remove();
		d3.selectAll("#dot").remove();
		county_json = []
		handle.attr("cx", x(h));
		label.attr("x", x(h))
			.text(formatDate(h));
		selectedDate = strFromatDate(h)
		load_map(json, data)
	}
})

function load_map(json, data){
	for (var i = 0; i < data.length; i++) {
		month = data[i]['Date'].substring(0, 7)
		if (month == selectedDate) {

			var dataState = data[i]["State"];
			so2_aqi = Math.floor(parseFloat(data[i]["SO2 AQI"]) * 100)/100
			no2_aqi = Math.floor(parseFloat(data[i]["NO2 AQI"]) * 100)/100;
			o3_aqi = Math.floor(parseFloat(data[i]["O3 AQI"]) * 100)/100;
			co_aqi = Math.floor(parseFloat(data[i]["CO AQI"]) * 100)/100;

			data_dict = {"Latitude": data[i]["Latitude"], "Longitude": data[i]["Longitude"], "properties": {"label": data[i]["label"], "so2_aqi": so2_aqi, "no2_aqi": no2_aqi, "o3_aqi": o3_aqi, "co_aqi": co_aqi, "state": data[i]["State"], "county": data[i]["County"]}}

			county_json.push(data_dict)

		}
	}

load_gas(json)

svg.selectAll(".data_point").remove();
load_county(county_json)

// update legend
svg.append("g")
	  .attr("class", "legendSequential")
	  .attr("transform", "translate(" + (width - 50) + ",20)");

var legend = d3.select("svg")
	.append("g")
	.attr("class", "legend")
  .attr("width", 140)
  .attr("height", 200)
	.selectAll("g")
	.data(legendText)
	.enter()
	.append("g")
	.attr("transform", function(d, i) {
		return "translate(" + width + "," + i * 20 + ")"; });

	var legendSequential = d3.legendColor()
    .shapeWidth(20)
    .cells(6)
    .orient("vertical")
    .scale(labelScale)
	svg.select(".legendSequential")
  .call(legendSequential);
}

function load_gas(json) {

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
			return "rgb(213,222,217)";
	})
	.on('mouseover',function(d){
		d3.select(this)
			.style("opacity", 0.8)
			.style("stroke","white")
			.style("stroke-width",3);
		})
		.on('mouseout', function(d){
			d3.select(this)
				.style("opacity", 1)
				.style("stroke","white")
				.style("stroke-width",0.3);
		});
}

function load_county(data) {

	var circle =  svg.selectAll("circle")
		.data(data)
		.enter()
		.append("circle")
		.attr("class", "data_point")
		.attr("id", "dot")
		.attr("cx", function(d) {
			if (d["Longitude"] != 0 && d["Latitude"] != 0) {
				return projection([d["Longitude"], d["Latitude"]])[0];
			}
		})
		.attr("cy", function(d) {
			if (d["Longitude"] != 0 && d["Latitude"] != 0) {
			return projection([d["Longitude"], d["Latitude"]])[1];
		}
		})
		.attr("r", function(d) {
			return 15;
		})
		.style("fill", function(d) {
			return color(d["properties"]["label"])
		})
		.style("opacity", 0.75)
		.on("mouseover", function(d) {
			tip_county.show(d);
		})
		.on("mouseout", function(d) {
			tip_county.hide(d);
	  });
}
