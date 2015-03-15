var svg = d3.select("body")
			.append("svg")
			.attr("width",400)
			.attr("height",400);

var data = [40, 100, 80, 140, 60, 70];

var x = d3.scale.ordinal()
		.domain(d3.range(0, data.length))
		.rangeRoundBands([0, 200], 0.1);

var y = d3.scale.linear()
		.domain([0,200])
		//.range([10, 200]) //y축 눈금이 반대가 됨
		.range([200, 10]);
		
var rect = svg.selectAll("rect")
			.data(data)
			.enter()
			.append("rect")
			.attr("x", function(d, i){return x(i);})
			//.attr("y", function(d, i){return y(200)-y(d);})
			.attr("y", function(d, i){return y(d);})
			.attr("width",function(d){return x.rangeBand();})
			//.attr("height", function(d){return y(d);})
			.attr("height", function(d){return y(0) - y(d);})
			.attr("fill", "steelblue");
	
var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left")
		.ticks(5)
		.outerTickSize(0)
		.tickPadding(-5);
		
svg.append("g")
	.attr("class", "y axis")
	//.attr("transform", 
	//	"translate(0," + (y(data.length-1)+y.rangeBand()) + ")"
	//	)
	.attr("transform", "translate(230,0)")
	.call(yAxis);

var label = svg.selectAll(".label")
	.data(data)
	.enter()
	.append("text")
	.attr("x", function(d, i){return x(i)+ x.rangeBand()/2})
	//.attr("y", function(d, i){return y(200) - 10})
	.attr("y", function(d, i){return y(0) - 10})
	.attr("text-anchor","middle")
	.text(function(d){return d})
	.style("fill", "white");