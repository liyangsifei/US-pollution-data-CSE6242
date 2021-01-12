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
var color = d3.scaleQuantize().range(d3.schemeBlues[1,5]);
// d3.scaleLinear()
// 			  .range(["rgb(213,222,217)","rgb(69,173,168)","rgb(84,36,55)","rgb(217,91,67)"]);
var labelScale = d3.scaleOrdinal(d3.schemeBlues[9])
      //.range();

var legendText = [];
var selectedDate = '2020/5/'
var so2_aqi_max = 0;
var so2_aqi_min = 0.0;
var no2_aqi_max = 0;
var no2_aqi_min = 100;
var co_aqi_max = 0;
var co_aqi_min = 0.0;
var o3_aqi_max = 0;
var o3_aqi_min = 100;
var so2_aqi = 0;
var no2_aqi = 0
var o3_aqi = 0
var co_aqi = 0

var so2_aqi_max_all = 0;
var so2_aqi_min_all = 100;
var no2_aqi_max_all = 0;
var no2_aqi_min_all = 100;
var co_aqi_max_all = 0;
var co_aqi_min_all = 100;
var o3_aqi_max_all = 0;
var o3_aqi_min_all = 100;
var sep_time =(new Date("2020-12-31")).valueOf();


var tip = d3.tip()
	.offset([0, 0])
	.attr('class', 'd3-tip')
	.html(function(d) {
		so2 = d.properties.so2_aqi
		no2 = d.properties.no2_aqi
		o3 = d.properties.o3_aqi
		co = d.properties.co_aqi
		if (!so2 || so2 == 0) so2 = "NaN"
		if (!no2 || no2 == 0) no2 = "NaN"
		if (!co || co == 0) co = "NaN"
		if (!o3 || o3 == 0) o3 = "NaN"
		return "<strong>State: </strong>" + d.properties.name + " <br><strong>SO2 AQI:</strong> " + so2 + "<br><strong>O3 AQI:</strong> " + o3 + "<br><strong>NO2 AQI:</strong> " + no2 + "<br><strong>CO AQI:</strong> " + co;
	})


    var tip_county = d3.tip()
    .offset([0, 0])
    .attr('class', 'd3-tip')
    .html(function(d) {
        return "<strong>State: </strong>" + d.properties.name + "<br><strong>County: </strong>" + d.properties.county + " <br><strong>SO2 AQI:</strong> " + d.properties.so2_aqi + "<br><strong>O3 AQI:</strong> " + d.properties.o3_aqi+ "<br><strong>NO2 AQI:</strong> " + d.properties.no2_aqi + "<br><strong>CO AQI:</strong> " + d.properties.co_aqi;
    })
//Create SVG element and append map to the SVG
var svg = d3.select("#map")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

var div = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

map = d3.json("https://raw.githubusercontent.com/python-visualization/folium/master/examples/data/us-states.json");

var method = 2
var county = 0
var county_json = []

result = d3.csv("/static/data/air_predict_data_.csv", function(d){ return d;});
svg.call(tip);
Promise.all([map, result]).then(function(data) {
	json = data[0];
	data = data[1];
  find_max_min(data)
	load_map(json, data)

	d3.select('#btn-so2').on('click', ()=>{
	  gas_type = "SO2";
		d3.select("#btn-so2").attr("class", "btn btn-primary")
		d3.select("#btn-co").attr("class", "btn btn-secondary")
		d3.select("#btn-no2").attr("class", "btn btn-secondary")
		d3.select("#btn-o3").attr("class", "btn btn-secondary")
	  load_map(json, data)
	})
	d3.select('#btn-co').on('click', ()=>{
    gas_type = "CO";
		d3.select("#btn-co").attr("class", "btn btn-primary")
		d3.select("#btn-so2").attr("class", "btn btn-secondary")
		d3.select("#btn-no2").attr("class", "btn btn-secondary")
		d3.select("#btn-o3").attr("class", "btn btn-secondary")
	  load_map(json, data)
	})
	d3.select('#btn-no2').on('click', ()=>{
	  gas_type = "NO2";
		d3.select("#btn-no2").attr("class", "btn btn-primary")
		d3.select("#btn-co").attr("class", "btn btn-secondary")
		d3.select("#btn-so2").attr("class", "btn btn-secondary")
		d3.select("#btn-o3").attr("class", "btn btn-secondary")
	    load_map(json, data)
	})
	d3.select('#btn-o3').on('click', ()=>{
	  gas_type = "O3";
		d3.select("#btn-o3").attr("class", "btn btn-primary")
		d3.select("#btn-co").attr("class", "btn btn-secondary")
		d3.select("#btn-no2").attr("class", "btn btn-secondary")
		d3.select("#btn-so2").attr("class", "btn btn-secondary")
		load_map(json, data)
	})
	d3.select('#btn-state').on('click', ()=>{
		d3.select("#btn-state").attr("class", "btn btn-primary")
		d3.select("#btn-county").attr("class", "btn btn-secondary")
		load_map(json, data)
	})
	d3.select('#btn-county').on('click', ()=>{
		d3.select("#btn-county").attr("class", "btn btn-primary")
		d3.select("#btn-state").attr("class", "btn btn-secondary")
		load_map(json, data)
	})

	//slider part
	var formatDateIntoYear = d3.timeFormat("%Y-%m");
	var formatDate = d3.timeFormat("%b %Y");
	var strFromatDate = d3.timeFormat("%Y-%m");
	var parseDate = d3.timeParse("%m/%d/%y");

    var startDate2 = new Date("2020-05-01")
	    endDate = new Date("2020-07-31");

	var slider_margin = {top:0, right:50, bottom:50, left:100},
	    slider_width = 400,
	    slider_height = 100 - slider_margin.top - slider_margin.bottom;

	var currentValue = 0;
	var targetValue = slider_width;

	var svg_slider = d3.select("#slider")
	    .append("svg")
	    .attr("width", slider_width + slider_margin.left + slider_margin.right)
	    .attr("height", slider_height + slider_margin.top + slider_margin.bottom);

	var x = d3.scaleTime()
	  .domain([startDate2, endDate])
	  .range([0, targetValue])
	  .clamp(true);

	var slider = svg_slider.append("g")
	    .attr("class", "slider")
	    .attr("transform", "translate(" + 15 + "," + (slider_height/5+25) + ")");

	slider.append("text")
		.attr("class", "label")
		.attr("text-anchor", "middle")
		.text("2020-05")
		.attr("transform", "translate(0," + 29 + ")")
		.attr("x", 10)
		.style('font-size', '11px');

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
		.data(x.ticks(3))
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
	    .text(formatDate(startDate2))
	    .attr("transform", "translate(0," + (-25) + ")")

	var plot = svg_slider.append("g")
		.attr("class", "plot")
		.attr("transform", "translate(" + slider_margin.left + "," + slider_margin.top + ")");

	function update(h) {
		d3.selectAll("path").remove();
		//d3.selectAll("circle"). ();
		d3.selectAll(".data_point").remove();
		d3.selectAll("#dot").remove();
		handle.attr("cx", x(h));
		label.attr("x", x(h))
			.text(formatDate(h));
		selectedDate = strFromatDate(h)
		load_map(json, data)
	}
})

function load_map(json, data){
	//console.log(data, method)
so2_aqi_max = 0;
no2_aqi_max = 0;
co_aqi_max = 0;
o3_aqi_max = 0;
var strTime = selectedDate + "01";
timestamp =(new Date(strTime)).valueOf();
if (timestamp < sep_time || method == 0 || method == 1 || method == 3){
	if (county == 1) {
		for (var j = 0; j < json.features.length; j++)  {
				json.features[j].properties.so2_aqi = 0
				json.features[j].properties.so2_aqi_count = 0
				json.features[j].properties.no2_aqi = 0
				json.features[j].properties.no2_aqi_count = 0
				json.features[j].properties.co_aqi = 0
				json.features[j].properties.co_aqi_count = 0
				json.features[j].properties.o3_aqi = 0
				json.features[j].properties.o3_aqi_count = 0
		}
	}

	for (var i = 0; i < data.length; i++) {
		month = data[i]['Date Local'].substring(0, 7)
		if (month == selectedDate) {

			var dataState = data[i]["State"];
			so2_aqi = Math.floor(parseFloat(data[i]["SO2_AQI"]) * 100)/100
			no2_aqi = Math.floor(parseFloat(data[i]["NO2_AQI"]) * 100)/100;
			o3_aqi = Math.floor(parseFloat(data[i]["O3_AQI"]) * 100)/100;
			co_aqi = Math.floor(parseFloat(data[i]["CO_AQI"]) * 100)/100;
			//so2_aqi_max, no2_aqi_max, co_aqi_max, o3_aqi_max = 0;
			if (so2_aqi > so2_aqi_max) so2_aqi_max = so2_aqi
			if (so2_aqi < so2_aqi_min) so2_aqi_min = so2_aqi
			if (no2_aqi > no2_aqi_max) no2_aqi_max = no2_aqi
			if (no2_aqi < no2_aqi_min) no2_aqi_min = no2_aqi
			if (co_aqi > co_aqi_max) co_aqi_max = co_aqi
			if (co_aqi < co_aqi_min) co_aqi_min = co_aqi
			if (o3_aqi > o3_aqi_max) o3_aqi_max = o3_aqi
			if (o3_aqi < o3_aqi_min) o3_aqi_min = o3_aqi

			if (county == 1) {
				data_dict = {"Latitude": data[i]["Latitude"], "Longitude": data[i]["Longitude"], "properties": {"name": data[i]["State"], "county":data[i]["County"], "so2_aqi": so2_aqi, "no2_aqi": no2_aqi, "o3_aqi": o3_aqi, "co_aqi": co_aqi}}
				county_json.push(data_dict)
			}

			for (var j = 0; j < json.features.length; j++)  {
				var jsonState = json.features[j].properties.name;

				if (dataState == jsonState && county == 1) {
					json.features[j].properties.so2_aqi += so2_aqi
					json.features[j].properties.so2_aqi_count += 1
					json.features[j].properties.no2_aqi += no2_aqi
					json.features[j].properties.no2_aqi_count += 1
					json.features[j].properties.co_aqi += co_aqi
					json.features[j].properties.co_aqi_count += 1
					json.features[j].properties.o3_aqi += o3_aqi
					json.features[j].properties.o3_aqi_count += 1
				} else if (dataState == jsonState) {
					json.features[j].properties.so2_aqi = so2_aqi
					json.features[j].properties.no2_aqi = no2_aqi
					json.features[j].properties.co_aqi = co_aqi
					json.features[j].properties.o3_aqi = o3_aqi
					json.features[j].properties.so2_aqi_count = 1
					json.features[j].properties.no2_aqi_count = 1
					json.features[j].properties.co_aqi_count = 1
					json.features[j].properties.o3_aqi_count = 1
				}
			}
		}
	}
}
if (method == 2 || method == 3) {
	for (var i = 0; i < data.length; i++) {
		month = data[i]['Date Local'].substring(0, 7)
		//console.log(typeof month, typeof selectedDate)
		//console.log(month,selectedDate )
		if (month == selectedDate) {
			var dataState = data[i]["State"];
			so2_aqi = Math.floor(parseFloat(data[i]["SO2_AQI"]) * 100)/100
            no2_aqi = Math.floor(parseFloat(data[i]["NO2_AQI"]) * 100)/100;
			o3_aqi = Math.floor(parseFloat(data[i]["O3_AQI"]) * 100)/100;
			co_aqi = Math.floor(parseFloat(data[i]["CO_AQI"]) * 100)/100;
			//so2_aqi_max, no2_aqi_max, co_aqi_max, o3_aqi_max = 0;
			if (so2_aqi > so2_aqi_max) so2_aqi_max = so2_aqi
			if (so2_aqi < so2_aqi_min) so2_aqi_min = so2_aqi
			if (no2_aqi > no2_aqi_max) no2_aqi_max = no2_aqi
			if (no2_aqi < no2_aqi_min) no2_aqi_min = no2_aqi
			if (co_aqi > co_aqi_max) co_aqi_max = co_aqi
			if (co_aqi < co_aqi_min) co_aqi_min = co_aqi
			if (o3_aqi > o3_aqi_max) o3_aqi_max = o3_aqi
			if (o3_aqi < o3_aqi_min) o3_aqi_min = o3_aqi

			if (county == 1) {
				data_dict = {"Latitude": data[i]["Latitude"], "Longitude": data[i]["Longitude"], "properties": {"name": data[i]["State"], "county": data[i]["County"], "so2_aqi": so2_aqi, "no2_aqi": no2_aqi, "o3_aqi": o3_aqi, "co_aqi": co_aqi}}
				county_json.push(data_dict)
			}

			for (var j = 0; j < json.features.length; j++)  {
				var jsonState = json.features[j].properties.name;
				if (dataState == jsonState && county == 1) {
					json.features[j].properties.so2_aqi += so2_aqi
					json.features[j].properties.so2_aqi_count += 1
					json.features[j].properties.no2_aqi += no2_aqi
					json.features[j].properties.no2_aqi_count += 1
					json.features[j].properties.co_aqi += co_aqi
					json.features[j].properties.co_aqi_count += 1
					json.features[j].properties.o3_aqi += o3_aqi
					json.features[j].properties.o3_aqi_count += 1
				} else if (dataState == jsonState) {
					json.features[j].properties.so2_aqi = so2_aqi
					json.features[j].properties.no2_aqi = no2_aqi
					json.features[j].properties.co_aqi = co_aqi
					json.features[j].properties.o3_aqi = o3_aqi

				}
			}
		}
	}
}
load_gas(json)


// update legend
svg.append("g")
	  .attr("class", "legendSequential")
	  .attr("transform", "translate(" + (width - 50) + ",20)");
//
// var legend = d3.select("svg")
// 	.append("g")
// 	.attr("class", "legend")
//   .attr("width", 140)
//   .attr("height", 200)
// 	.selectAll("g")
// 	.data(legendText)
// 	.enter()
// 	.append("g")
// 	.attr("transform", function(d, i) {
// 		return "translate(" + width + "," + i * 20 + ")"; });
//
// 	var legendSequential = d3.legendColor()
//     .shapeWidth(20)
//     .cells(10)
//     .orient("vertical")
//     .scale(labelScale)
// 	svg.select(".legendSequential")
//   .call(legendSequential);
}


function find_max_min(data) {
	for (var i = 0; i < data.length; i++) {
		so2_aqi = Math.floor(parseFloat(data[i]["SO2_AQI"]) * 100)/100
		no2_aqi = Math.floor(parseFloat(data[i]["NO2_AQI"]) * 100)/100;
		o3_aqi = Math.floor(parseFloat(data[i]["O3_AQI"]) * 100)/100;
		co_aqi = Math.floor(parseFloat(data[i]["CO_AQI"]) * 100)/100;

		if (so2_aqi > so2_aqi_max_all) so2_aqi_max_all = so2_aqi
		if (so2_aqi < so2_aqi_min_all) so2_aqi_min_all = so2_aqi
		if (no2_aqi > no2_aqi_max_all) no2_aqi_max_all = no2_aqi
		if (no2_aqi < no2_aqi_min_all) no2_aqi_min_all = no2_aqi
		if (co_aqi > co_aqi_max_all) co_aqi_max_all = co_aqi
		if (co_aqi < co_aqi_min_all) co_aqi_min_all = co_aqi
		if (o3_aqi > o3_aqi_max_all) o3_aqi_max_all = o3_aqi
		if (o3_aqi < o3_aqi_min_all) o3_aqi_min_all = o3_aqi
	}

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
		var so2_aqi = Math.floor(d.properties.so2_aqi/d.properties.so2_aqi_count * 100) / 100;
		var o3_aqi = Math.floor(d.properties.o3_aqi/d.properties.o3_aqi_count * 100) / 100;
		var no2_aqi = Math.floor(d.properties.no2_aqi/d.properties.no2_aqi_count * 100) / 100;
		var co_aqi = Math.floor(d.properties.co_aqi/d.properties.co_aqi_count * 100) / 100;

		if (gas_type == "SO2") {
			min = so2_aqi_min_all
			max = so2_aqi_max_all
			aqi = so2_aqi
		} else if (gas_type == "O3") {
			min = o3_aqi_min_all
			max = o3_aqi_max_all
			aqi = o3_aqi
		} else if (gas_type == "NO2") {
			min = no2_aqi_min_all
			max = no2_aqi_max_all
			aqi = no2_aqi
		} else if (gas_type == "CO") {
			min = co_aqi_min_all
			max = co_aqi_max_all
			aqi = co_aqi
		} else {
			return "rgb(213,222,217)";
		}
		// segment = Math.floor(max/4 * 100) / 100
    // color.domain([min, max])
		if (aqi == 0) {
			return "rgb(213,222,217)"
		}
		if (aqi <= 50.0) {
			//Green - Yellow: 0-50
			//127 255 0 - 255 255 0
			r = scale_color(aqi, 0, 50, 127, 255)
			g = 255
			b = 0
			return "rgb("+r+","+g+","+b+")"
		} else if (aqi <= 100.0) {
			//Yellow - Orange: 50-100
			//255 255 0 - 255 97 0
			r = 255
			g = scale_color(aqi, 50, 100, 255, 97)
			b = 0
			return "rgb("+r+","+g+","+b+")"
		} else if (aqi <= 150.0) {
			//Orange - Red: 100-150
			//255 97 0 - 255 0 0
			r = 255
			g = scale_color(aqi, 100, 150, 97, 0)
			b = 0
			return "rgb("+r+","+g+","+b+")"
		} else if (aqi <= 200.0) {
			//Red - Perple: 150-200
			//255 0 0 - 148 0 211
			r = scale_color(aqi, 150, 200, 255, 148)
			g = 0
			b = scale_color(aqi, 150, 200, 0, 211)
			return "rgb("+r+","+g+","+b+")"
		} else if (aqi <= 300.0){
			//Purple - Marron: 200-300
			//148 0 211 - 128 0 0
			r = scale_color(aqi, 200, 300, 148, 128)
			g = 0
			b = scale_color(aqi, 200, 300, 211, 0)
			return "rgb("+r+","+g+","+b+")"
		} else if (aqi > 300.0) {
			//Marron: 300+
			return "rgb(128, 0, 0)"
		} else {
			//GREY
			return "rgb(213,222,217)"
		}

	})
	.on('mouseover',function(d){
		tip.show(d);
		d3.select(this)
			.style("opacity", 0.8)
			.style("stroke","white")
			.style("stroke-width",3);
		})
		.on('mouseout', function(d){
			tip.hide(d);
			d3.select(this)
				.style("opacity", 1)
				.style("stroke","white")
				.style("stroke-width",0.3);
		});
	//legendText = [min, "" + (min + segment), "" + (min + 2 * segment), "" + (min + 3 * segment), max]
	min = parseFloat(min)
	max = parseFloat(max)
	legendText = create_range(min, max, 9)
	labelScale.domain(legendText)
}

function create_range(start, end, len=9) {
    //const len = Math.floor((end - start) / step) + 1
      step = (end - start)/(len - 1)
      arr = Array(len).fill().map((_, idx) => Math.floor(start + (idx * step) * 100)/100)
    return arr
  }
  function load_county(data) {
      var circles = svg.selectAll("circle")
          .data(data)
          .enter()
          .append("circle")
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
              return 5
          })
          .style("fill", "rgb(217,91,67)")
          .style("opacity", 0.85)
          .on("mouseover", function(d) {
              tip_county.show(d);
          })
          .on("mouseout", function(d) {
              tip_county.hide(d);
        });
  }

	function scale_color(t, min_in, max_in, min_out, max_out) {
		color = parseInt((t - min_in) * (max_out - min_out) / (max_in - min_in) + min_out)
		return color
	}
