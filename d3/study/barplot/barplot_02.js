var svg = d3.select("body")
			.append("svg")
			.attr("width",400)
			.attr("height",400);

var data = [40, 100, 80, 140, 60, 70];

var x = d3.scale.linear()
		.domain([0,200])
		.range([10, 300]);
		
var y = d3.scale.ordinal()
		.domain(d3.range(0, data.length))
		.rangeRoundBands([0, 200]);
		
var rect = svg.selectAll("rect")
			.data(data)
			.enter()
			.append("rect")
			.attr("x",10)
			.attr("y", function(d, i){return y(i) })
			.attr("width",function(d){return x(d)})
			.attr("height", 20)
			.attr("fill", "steelblue");
	
var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom")
		.ticks(5)
		.outerTickSize(0)
		.tickPadding(-5);
		
svg.append("g")
	.attr("class", "x axis")
	.attr("transform", 
		"translate(0," + (y(data.length-1)+y.rangeBand()) + ")"
		)
	.call(xAxis);

var label = svg.selectAll(".label")
	.data(data)
	.enter()
	.append("text")
	.attr("x", function(d, i){return x(d)})
	.attr("y", function(d, i){return y(i) + 16})
	.attr("text-anchor","end")
	.text(function(d){return d})
	.style("fill", "white");