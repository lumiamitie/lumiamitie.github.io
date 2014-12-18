var margin = {top: 20, right: 80, bottom: 60, left: 50},
	width = 900 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;

var parseDate = d3.time.format("%Y%m%d").parse;

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
					.innerTickSize(-height)
					.outerTickSize(0)
					.tickPadding(10);
					
var yAxis = d3.svg.axis()
					.scale(y)
					.orient("left")
					.innerTickSize(-width)
					.outerTickSize(0)
					.tickPadding(10);
	
var line = d3.svg.line()
					//.interpolate("basis") // 이 부분이 활성화되면 선이 곡선으로 변경됨
					.x(function(d) { return x(d.date); })
					.y(function(d) { return y(d.count); });

var test_k=[];
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
			.append("text")
			  .attr("transform", "rotate(-90)")
			  .attr("y", 6)
			  .attr("dy", ".71em")
			  .style("text-anchor", "end")
			  .text("Count");
	  var keywordToClick = []
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
/* 		keyword.append("text")
					  .datum(function(d) { 
							return {key: d.key, value: d.values[d.values.length - 1]}; 
							})
					  .attr("transform", function(d) { 
							return "translate(" + x(d.value.date) + "," + y(d.value.count) + ")"; 
							})
					  .attr("x", 3)
					  .attr("dy", ".35em")
					  .text(function(d) { 
							return d.key; 
							})
					  .on("click", function(d){
							if (d3.select("#line_" + d.key).style("display") == "inline"){
								d3.select("#line_" + d.key).style('display','none');
								} else {
								d3.select("#line_" + d.key).style('display','inline');
							}
					  }); */
		  
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
					  .attr("x", width/3 + i*70 -12)
					  .attr("y", height+30)
					  .attr("width", 10)
					  .attr("height", 10)
					  .style("fill", function(){
										return color(d.key)})
					  .on("click", function(d){
					if (d3.select("#line_" + d.key).style("display") == "inline"){
					  d3.select("#line_" + d.key)
							.style('display','none');
					  g.select("rect")
							.style("opacity", 0.3);
					} else {
					   d3.select("#line_" + d.key)
							.style('display', 'inline');
					   g.select("rect")
							.style("opacity", 1);
					}
					
				  });
					
					g.append("text")
					  .attr("x", width / 3 + i * 70)
					  .attr("y", height + 38)
					  .attr("height", 30)
					  .attr("width", 100)
					  .style("fill", "black")
					  .text(function(){
								return d.key;
						});
			});
	  
});
