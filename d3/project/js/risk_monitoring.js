var margin = {top: 20, right: 40, bottom: 80, left: 50},
	width = 740 - margin.left - margin.right,
	height = 370 - margin.top - margin.bottom;

var parseDate = d3.time.format("%Y%m%d").parse;
var returnDate = d3.time.format("%m/%d");

var x = d3.time.scale()
						.range([0, width]);
						
var y = d3.scale.linear()
						.range([height, 0]);
						
var svg = d3.select("div")
			 .append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
			 .append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
				
var color = d3.scale.category20();

var xAxis = d3.svg.axis()
					.scale(x)
					.orient("bottom")
					.outerTickSize(0)
					.ticks(10)
					.tickFormat(returnDate)
					.tickPadding(10);
					
var yAxis = d3.svg.axis()
					.scale(y)
					.orient("left")
					.innerTickSize(-width)
					.ticks(5)
					.outerTickSize(0)
					.tickPadding(10);
	
var line = d3.svg.line()
					.interpolate("monotone")
					.x(function(d) { return x(d.date); })
					.y(function(d) { return y(d.count); });


d3.json("data/mainkeywd_line_15lgn.json", function(error, data) { 

	  color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }));
	  
	  data.forEach(function(d) {
			d.date = parseDate(d.date);
	  });
  
	  keywords = d3.nest().key(function(d){return d.key}).entries(data)

	  x.domain(d3.extent(data, function(d) { return d.date; }));
	  y.domain([
			d3.min(keywords, function(c) { return d3.min(c.values, function(v) { return v.count; }); }),
			d3.max(keywords, function(c) { return d3.max(c.values, function(v) { return v.count + 10; }); })
	  ]);
	  svg.append("g")
			  .attr("class", "x axis")
			  .attr("transform", "translate(0," + height + ")")
			  .call(xAxis);
	  svg.append("g")
			  .attr("class", "y axis")
			  .call(yAxis)

	  var keyword = svg.selectAll(".keyword")
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
		  
	  var legend = svg.append("g")
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
					  .attr("x", i%7 *100 -12)
					  .attr("y", height+35 + Math.floor(i/7)*14)
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
					  .attr("x", i%7 * 100)
					  .attr("y", height + 43+ Math.floor(i/7)*14)
					  .attr("height", 30)
					  .attr("width", 100)
					  .style("fill", "black")
					  .text(function(){
								return d.key;
						});
			});
			
	var tooltip = d3.select("div").append("div")
			.attr("class", "tooltip")
			.style("opacity", 0);

	var tip = svg.append("g")
					.attr("class","tips")
					;

	tip.selectAll(".tips")
		.data(data)
		.enter()
		.append("circle")
		.attr("cx",function(d){return x(d.date)})
		.attr("cy", function(d){return y(d.count)})
		.attr("r",2)
		.style("fill","white")
		.attr("stroke","#ccc")
		.attr("class", function(d){return "tip_"+d.key;})
			.on("mouseover", function(d){
				tooltip.transition()
						.duration(200)
						.style("opacity", 0.9);
				tooltip.html(d.key+"<br/>"+returnDate(d.date)+ "<br/>"+d.count)
						.style("left", (d3.event.pageX) + "px")
						.style("top", (d3.event.pageY - 28) + "px");			
			})
			.on("mouseout", function(d){
				tooltip.transition()
						.duration(500)
						.style("opacity", 0);
			});

	  
});
