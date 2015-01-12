var width = 760,
	height = 800,
	radius = 200;

var color = d3.scale.category10();

var outer_arc = d3.svg.arc()
			.outerRadius(radius - 10)
			.innerRadius(radius/2);
			
var inner_arc = d3.svg.arc()
			.outerRadius(radius/2-1)
			.innerRadius(radius/4);
			
var pie = d3.layout.pie()
			.value(function(d){return d.value;})
			.sort(null);
			
var data = [{"keyword":"a", "channel":"news", "value":5},
			{"keyword":"a", "channel":"community", "value":3},
			{"keyword":"a", "channel":"blog", "value":1},
			{"keyword":"a", "channel":"twitter", "value":2},
			{"keyword":"b", "channel":"news", "value":5},
			{"keyword":"b", "channel":"community", "value":3},
			{"keyword":"b", "channel":"blog", "value":5},
			{"keyword":"b", "channel":"twitter", "value":2},
			{"keyword":"c", "channel":"news", "value":5},
			{"keyword":"c", "channel":"community", "value":11},
			{"keyword":"c", "channel":"blog", "value":1},
			{"keyword":"c", "channel":"twitter", "value":4},
			{"keyword":"e", "channel":"news", "value":5},
			{"keyword":"e", "channel":"community", "value":3},
			{"keyword":"e", "channel":"blog", "value":8},
			{"keyword":"e", "channel":"twitter", "value":2},];

data.sort(function(a,b){
	if (a.channel < b.channel) {
			return -1
		} else {
			return 1
		} 
	});

var data_chn = d3.nest()
				.key(function(d){return d.channel})
				.entries(data);
data_chn.sort(function(a,b){
	if (a.key < b.key) {
			return -1
		} else {
			return 1
		} 
	});
	
var data_chn_sum = data_chn.map(function(d){
			return {"channel": d.key,
					"value": d3.sum(d.values.map(function(e){
						return e.value;
					}))
				}
			})

var svg = //d3.select(".contents").append("svg")
		d3.select("svg")	
			.attr("width", width)
			.attr("height", height)
			.append("g")
			.attr("transform", "translate("+[width/2, height-radius-40]+")")
			.attr("class","pie")
			;
var outer_g = svg.selectAll(".outer")
			.data(pie(data))
			.enter()
			.append("g")
			.attr("class", "outer arc");
			
outer_g.append("path")
	.attr("d", outer_arc)
	.style("fill", function(d, i){
		return d3.rgb(color(d.data.channel))
					.darker((i % 2)/7)
					.toString();
		});

outer_g.append("text")
		.attr("transform", function(d){return "translate("+ outer_arc.centroid(d)+")";})
		.text(function(d){return d.data.keyword})
		.attr("text-anchor","middle");
		
var inner_g = svg.selectAll(".inner")
				.data(pie(data_chn_sum))
				.enter()
				.append("g")
				.attr("class", "inner arc");
				
inner_g.append("path")
	.attr("d",inner_arc)
	.style("fill", function(d, i){
		return d3.rgb(color(d.data.channel))
					.brighter(1/3)
					.toString();
		});

inner_g.append("text")
		.attr("transform", function(d){return "translate("+ inner_arc.centroid(d)+")";})
		.text(function(d){return d.data.channel})
		.attr("text-anchor","middle");