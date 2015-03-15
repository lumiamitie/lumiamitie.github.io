var svg = d3.select("body")
			.append("svg")
			.attr("width",800)
			.attr("height",600);

var x = d3.scale.ordinal()
		//.domain(d3.range(0, data.length))
		.rangeRoundBands([10, 750], 0.1);

var y = d3.scale.linear()
		//.domain([0,200])
		.range([450, 10]);
		
var color = d3.scale.category10();
		
// stack layout
var stack = d3.layout.stack();
		
d3.json("data/votes.json", function(data){
	testdata = data;
	
	var totalVotes = data.filter(function(d){
		return d.variable !== "총투표수" && d.variable !== "선거인수";
		})
	
	// 총투표수 기준으로 정렬하기
	//totalVotes.sort(function(a, b){return b.value - a.value;})
	
	testvote = totalVotes;

	var nested = d3.nest()
				.key(function(d){return d.variable}) 
				.entries(totalVotes);
	testnested = nested;			
	
	var nested_st = nested.map(function(d){
		return d.values.map(function(e){
			return {x: e.region, y: e.value, t: e.variable}
			})
		})
	testnest = nested_st
	
	var x_label = data.filter(function(d){
			return d.variable === "선거인수";
			})
		.map(function(d){
			return d.region;
			})
	
	x.domain(x_label)
	y.domain([0, d3.max(
		data.map(function(d){return d.value;}))
	])
	var rect = svg.selectAll("rect")
				.data(d3.merge(stack(nested_st))) //stack 적용
				.enter()
				.append("rect")
				.attr("x", function(d, i){return x(d.x);})
				.attr("y", function(d, i){return y(d.y+d.y0);})
				.attr("width",function(d){return x.rangeBand();})
				.attr("height", function(d, i){
					return y(d.y0) - y(d.y+d.y0);
					})
				.attr("fill", function(d){
					return color(d.t);
				});
		
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
		.data(x_label)
		.enter()
		.append("text")
		.attr("x", function(d, i){return x(d)+ x.rangeBand()/2})
		.attr("y", function(d, i){return y(0) + 10})
		.attr("text-anchor","start")
		.text(function(d){return d})
		.attr("class", "label")
		.style("fill", "#aaa");
		
})