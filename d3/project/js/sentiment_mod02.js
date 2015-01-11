var width = 740,
	height = 370,
	margin = {top:20, right:30, bottom:70, left:20},
	parseDate = d3.time.format("%Y%m%d").parse,
    returnDate = d3.time.format("%m/%d")
	;
	
var svg = d3.select("div").append("svg")
			.attr("width", width)
			.attr("height", height)
			.append("g")
			.attr("transform","translate("+margin.left+","+margin.top+")");

var test_data = [];	
var test_senti = [];		
d3.json("data/sentiment_neutral_2month.json", function(data) {
	var sentiment = d3.nest()
					.key(function(d){return d.sentiment})
					.entries(data.map(function(d){return {"count":d.count, "sentiment":d.sentiment, "date":parseDate(d.date)};}));
test_data = data;
test_senti = sentiment;

	drawAxes(data);
	drawLine(sentiment[2].values, "neu", "monotone");
	drawArea(sentiment[0].values,"pos","monotone");
	drawArea(sentiment[1].values, "neg","monotone");

	function drawAxes(data){
		y = d3.scale.linear()
					.domain(d3.extent(data,function(d){
							return d.count;
						})
					)
					.range([height - margin.top - margin.bottom, margin.top]);

		x = d3.time.scale()
					.domain(d3.extent(data,function(d){
							return parseDate(d.date);
						})
					)
					.range([margin.left, width - margin.left - margin.right]);
		
		
		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(" + [0, height - margin.top - margin.bottom] + ")")
			.call(d3.svg.axis()
					.scale(x)
					.tickFormat(returnDate)
					.orient("bottom")
					.tickPadding(10)
					.ticks(10)
					.outerTickSize(1)
				);
		svg.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(" + [margin.left, 0] + ")")
			.call(d3.svg.axis()
					.scale(y)
					.orient("left")
					.tickPadding(10)
					.ticks(5)
					.outerTickSize(1)
				);
	}
						
	function drawLine(dataSet, clsName, intp_type){
		var line_neu = d3.svg.line()
							.x(function(d){return x(d.date)})
							.y(function(d){return y(d.count)})
							.interpolate("monotone");							;
							
		var lineElements = svg.append("path")
								.attr("class","line "+ clsName)
								.attr("d", line_neu(dataSet));
	}
	
	function drawArea(dataSet, clsName, intp_type){
		var area = d3.svg.area()
						.x(function(d){return x(d.date)})
						.y0(function(d){return height-margin.top - margin.bottom})
						.y1(function(d){return y(d.count)})
						.interpolate("monotone");
						
		var areaElements = svg.append("path")
								.attr("class", "area "+clsName)
								.attr("d", area(dataSet));
	}
});