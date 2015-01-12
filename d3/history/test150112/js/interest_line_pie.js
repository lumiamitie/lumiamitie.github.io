var margin = {top: 20, right: 80, bottom: 60, left: 50},
	width = 760 /* - margin.left - margin.right */,
	height = 800 /* - margin.top - margin.bottom */,
	radius = 200;

var parseDate = d3.time.format("%Y%m%d").parse;

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
			
var x = d3.time.scale()
				.range([0, width-margin.right-margin.left]);
						
var y = d3.scale.linear()
				.range([height/3, 0]);
						
var svg_line = d3.select("div")
			 .append("svg")
				.attr("width", width)
				.attr("height", height)
			 .append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
			.attr("class","line");

var xAxis = d3.svg.axis()
					.scale(x)
					.orient("bottom")
//					.innerTickSize(-height)
					.outerTickSize(0)
					.ticks(5)
					.tickPadding(10);
					
var yAxis = d3.svg.axis()
					.scale(y)
					.orient("left")
					.innerTickSize(-width + margin.left + margin.right)
					.ticks(5)
					.outerTickSize(0)
					.tickPadding(10);
	
var line = d3.svg.line()
					.interpolate("monotone") 
					.x(function(d) { return x(d.date); })
					.y(function(d) { return y(d.count); });
var test_data = []
var test_keywords = []

			
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

var svg = d3.select("svg")	
			.attr("width", width)
			.attr("height", height)
			.append("g")
			.attr("transform", "translate("+[width/2, height-radius-10]+")")
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
		
		
d3.json("data/mainkeywd_line_new.json", function(error, data) { 
	//날짜는 문자열 "20140101", 값들은 문자/숫자 관계없음
	color.domain(d3.keys(data[0])
		.filter(function(key) { 
			return key !== "date"; 
		})
	);
test_data = data;	  
	  data.forEach(function(d) {
			d.date = parseDate(d.date);
	  });

	  keywords = d3.nest().key(function(d){return d.key}).entries(data)
test_keywords = keywords;

	  x.domain(d3.extent(data, function(d) { return d.date; }));
	  y.domain([
			d3.min(keywords, function(c) { 
				return d3.min(c.values, function(v) { return v.count; }); 
			}),
			d3.max(keywords, function(c) { 
				return d3.max(c.values, function(v) { return v.count + 10; }); 
			})
	  ]);
	  svg_line.append("g")
			  .attr("class", "x axis")
			  .attr("transform", "translate(0," + (height/3 - 0) + ")")
			  .call(xAxis);
			  
	  svg_line.append("g")
			  .attr("class", "y axis")
			  .call(yAxis);
	  var keywordToClick = []
	  var keyword = svg_line.selectAll(".keyword")
								.data(keywords)
								.enter()
								.append("g")
								.attr("class", function(d, i){ return "keyword_" + d.key});
	   
		keyword.append("path")
					  .attr("class", "line")
					  .attr("id", function(d, i){ return "line_" + d.key})
					  .attr("d", function(d) { return line(d.values); })
					  .style("fill", "none")
					  .style("stroke", function(d) { return color(d.key); });
		
	var tip = svg_line.append("g").attr("class","tip");

	tip.selectAll(".tips")
		.data(data)
		.enter()
		.append("circle")
		.attr("cx",function(d){return x(d.date)})
		.attr("cy", function(d){return y(d.count)})
		.attr("r",2)
		.style("fill","white")
		.attr("stroke","#ccc")
		.attr("class", function(d){return "tip_"+d.key;});	  
		
	  var legend = svg_line.append("g")
		  .attr("class", "legend")
		  .attr("x", width/3)
		  .attr("y", -20)
		  .attr("height", 100)
		  .attr("width", 100);    
		
		legend.selectAll('g').data(keywords)
		  .enter()
		  .append('g')
		  .each(function(d, i) {
				var g = d3.select(this);
					g.append("rect")
					  .attr("x", i*120)
					  .attr("y", height/3 + 51)
					  .attr("width", 10)
					  .attr("height", 10)
					  .style("fill", function(){
										return color(d.key)})
					  .on("click", function(d){
					if (d3.select("#line_" + d.key).style("display") == "inline"){
					  d3.select("#line_" + d.key)
							.style('display','none');
					  d3.selectAll(".tip_" + d.key)
						.style('display', 'none');
					  g.select("rect")
							.style("opacity", 0.3);
					} else {
					   d3.select("#line_" + d.key)
							.style('display', 'inline');
					   d3.selectAll('.tip_'+d.key)
							.style('display', 'inline');
					   g.select("rect")
							.style("opacity", 1);
					}
					
				  });
					
					g.append("text")
					  .attr("x", (i) * 120 + 15)
					  .attr("y", height/3 + 60)
					  .attr("height", 30)
					  .attr("width", 100)
					  .style("fill", "black")
					  .text(function(){
								return d.key;
						});
			});
	  
});