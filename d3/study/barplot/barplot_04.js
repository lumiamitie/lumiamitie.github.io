var svg = d3.select("body")
			.append("svg")
			.attr("width",800)
			.attr("height",600);

var x = d3.scale.ordinal()
		//.domain(d3.range(0, data.length))
		.rangeRoundBands([10, 750], 0.1);

var y = d3.scale.linear()
		//.domain([0,200])
		.range([400, 10]);
		
d3.json("data/votes.json", function(data){
	testdata = data;
	
	// 총투표수 데이터만 추출
	var totalVotes = data.filter(function(d){return d.variable === "총투표수"})
	
	// 총투표수 기준으로 정렬하기
	totalVotes.sort(function(a, b){return b.value - a.value;})
	
	testvote = totalVotes;
	
	x.domain(d3.range(0, totalVotes.length))
	y.domain([0, d3.max(
		totalVotes.map(function(d){return d.value;}))
	])
	var rect = svg.selectAll("rect")
				.data(totalVotes)
				.enter()
				.append("rect")
				.attr("x", function(d, i){return x(i);})
				.attr("y", function(d, i){return y(d.value);})
				.attr("width",function(d){return x.rangeBand();})
				.attr("height", function(d){return y(0) - y(d.value);})
				.attr("fill", "steelblue");
		
	var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left")
			.ticks(5)
			.outerTickSize(0)
			.tickPadding(-5);
			
	svg.append("g")
		.attr("class", "y axis")
		.attr("transform", "translate(800,0)")
		.call(yAxis);

	var label = svg.selectAll(".label")
		.data(totalVotes)
		.enter()
		.append("text")
		.attr("x", function(d, i){return x(i)+ x.rangeBand()/2})
		.attr("y", function(d, i){return y(0) + 10})
		.attr("text-anchor","start")
		.text(function(d){return d.region})
		.attr("class", "label")
		.style("fill", "#aaa");
		
})