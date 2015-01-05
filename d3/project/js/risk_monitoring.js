var margin = {top: 20, right: 80, bottom: 60, left: 50},
	width = 780 - margin.left - margin.right,
	height = 400 - margin.top - margin.bottom;

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
				
var color = d3.scale.category10();

var xAxis = d3.svg.axis()
					.scale(x)
					.orient("bottom")
//					.innerTickSize(-height)
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

var test_k=[];
var test_data = [];
d3.json("data/mainkeywd_line_new.json", function(error, data) { 
console.log(data);
	//날짜는 문자열 "20140101", 값들은 문자/숫자 관계없음
	  color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }));
	  
	  data.forEach(function(d) {
			d.date = parseDate(d.date);
	  });
/* 	  var keywords = color.domain().map(function(name) {
		return {
		  name: name,
		  values: data.map(function(d) {
			return {date: d.date, count: +d[name]};
		  })
		};
	  }); */
test_k = data;
	  
	  keywords = d3.nest().key(function(d){return d.key}).entries(data)
console.log(keywords);
test_data = keywords;
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
/* 			.append("text")
			  .attr("transform", "rotate(-90)")
			  .attr("y", 6)
			  .attr("dy", ".71em")
			  .style("text-anchor", "end")
			  .text("Count"); */

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
	var tip = svg.append("g").attr("class","tips");

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
					  .attr("x", margin.left + i*80 -12)
					  .attr("y", height+40)
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
					  .attr("x", margin.left + i * 80)
					  .attr("y", height + 48)
					  .attr("height", 30)
					  .attr("width", 100)
					  .style("fill", "black")
					  .text(function(){
								return d.key;
						});
			});
	  
});