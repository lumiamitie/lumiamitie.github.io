var margin = {top: 20, right: 40, bottom: 80, left: 50}, // 여백
	width = 740 - margin.left - margin.right, // 차트 너비
	height = 370 - margin.top - margin.bottom; //차트 높이

var parseDate = d3.time.format("%Y%m%d").parse; //날짜 파싱하기
var returnDate = d3.time.format("%m/%d"); // 축에 들어갈 날자 형태

var x = d3.time.scale() // x축 스케일
						.range([0, width]); //x()의 리턴값 범위
						
var y = d3.scale.linear()
						.range([height, 0]);
						
var svg = d3.select("div") // SVG 구성
			 .append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
			 .append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
				
var color = d3.scale.category20(); //색상에 대한 함수

var xAxis = d3.svg.axis()//x축 구성
				.scale(x)//x()함수
				.tickFormat(returnDate)// x축 눈금 포맷 결정
				.orient("bottom")
				.tickPadding(10)// 축과 눈금텍스트 사이 여백 결정
				.outerTickSize(0);//x축 선 안보임

var yAxis = d3.svg.axis() //y축 구성
					.scale(y) // y()함수
					.orient("left")
					.innerTickSize(-width)
					.ticks(5)
					.outerTickSize(0)
					.tickPadding(10);
	
var line = d3.svg.line() //선 그리는 함수
					.interpolate("monotone") //각 지점을 연결하는 방법 결정
					.x(function(d) { return x(d.date); }) //x축에 해당하는 값
					.y(function(d) { return y(d.count); }); //y축에 해당하는 값


d3.json("data/mainkeywd_line_week.json", function(error, data) { 

	  color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; })); //색상에 대한 domain지정인데 없어도 상관없을듯
	  
	  data.forEach(function(d) { //각 데이터의 날짜들을 파싱
			d.date = parseDate(d.date);
	  });
  
	  keywords = d3.nest() // key를 기준으로 nest 지정
					.key(function(d){return d.key})
					.entries(data)
	
		//x, y 축 스케일의 domain 지정
	  x.domain(d3.extent(data, function(d) { return d.date; }));
	  y.domain([
		d3.min(keywords, function(c) { 
			return d3.min(c.values, function(v) { 
				return v.count; 
				}); 
			}),
		d3.max(keywords, function(c) { 
			return d3.max(c.values, function(v) { 
				return v.count + 10; 
				}); 
			})
	  ]);
	  
		// 각 키워드별로 그룹 지정
	  var keyword = svg.selectAll(".keyword")
						.data(keywords)
						.enter()
						.append("g")
						.attr("class", function(d, i){ return "keyword_" + i});
		//각 키워드별로 선을 그림
		keyword.append("path")
					  .attr("class", "line")
					  .attr("id", function(d, i){ return "line_" + i})
					  .attr("d", function(d) { return line(d.values); })
					  .style("fill", "none")
					  .style("stroke", function(d) { return color(d.key); });
		
		var tick_number = keywords[0].values.length < 8 ? sentiment[0].values.length  : 7;
		
		xAxis.ticks(tick_number);
		  // x,y축 함수를 호출, 실제로 축을 그리는 부분
	  svg.append("g")
			  .attr("class", "x axis")
			  .attr("transform", "translate(0," + height + ")")
			  .call(xAxis);
	  svg.append("g")
			  .attr("class", "y axis")
			  .call(yAxis)
	
		//범레  
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
					  .attr("x", i % 7 *100 -12)
					  .attr("y", height+35 + Math.floor(i/7)*14)
					  //7개가 넘어가면 한줄씩 내려가도록
					  .attr("width", 10)
					  .attr("height", 10)
					  .style("fill", function(){ //색은 선과 동일하게
										return color(d.key)})
					  .on("click", function(d){ //클릭하면 선이 on/off
							if (d3.select("#line_" + i).style("display") == "inline"){
							  d3.select("#line_" + i)
									.style('display','none');
							  d3.selectAll(".tip_" + i)
								.style('display', 'none');
							  g.select("rect")
									.style("opacity", 0.3);
							} else {
							   d3.select("#line_" + i)
									.style('display', 'inline');
							   d3.selectAll('.tip_'+i)
									.style('display', 'inline');
							   g.select("rect")
									.style("opacity", 1);
							}
					
				  });
					
					g.append("text") //범례 텍스트
					  .attr("x", i%7 * 100)
					  .attr("y", height + 43+ Math.floor(i/7)*14)
					  .attr("height", 30)
					  .attr("width", 100)
					  .style("fill", "black")
					  .text(function(){
								return d.key;
						});
			});
	
	//툴팁 만들기
	var tooltip = d3.select("div")
					.append("div")
					.attr("class", "tooltip")
					.style("opacity", 0);

	var tip = svg.append("g") 
				.attr("class","tips");

	tip.selectAll(".tips") 
		.data(data)
		.enter()
		.append("circle") // 데이터의 위치에 원을 형성
		.attr("cx",function(d){return x(d.date)}) //원의 x축
		.attr("cy", function(d){return y(d.count)}) //원의 y축
		.attr("r",4) //원의 반지름
		.style("fill","white")
		.attr("stroke",function(d){//색은 선과 동일하게
										return color(d.key)})
		.attr("stroke-width", "2px")
		.attr("class", function(d, i){ //선별로 클래스 다르게 지정
				return "tip_"+ keywords.map(function(e){return e.key})
										.indexOf(d.key);
			})
			.on("mouseover", function(d){//마우스오버 이벤트
				tooltip.transition()
						.duration(200)
						.style("opacity", 0.9);
				tooltip.html(d.key+"<br/>"+returnDate(d.date)+ "<br/>"+d.count)
						.style("left", (d3.event.pageX) + "px")
						.style("top", (d3.event.pageY - 28) + "px");			
			})
			.on("mouseout", function(d){//마우스 벗어날때
				tooltip.transition()
						.duration(500)
						.style("opacity", 0);
			});

   d3.select("#saveImage")
	.on("click", function(){
		d3.select("body")
			.append('div')
			.attr("class","image");
		Pablo('svg')
			.append(Pablo('.css'))
			.toImage() // 'png' 옵션은 빼는게 나을듯....
			.appendTo('.image');
		// 익스플로러에서는 Pablo('svg').append(Pablo('.css')).toImage().appendTo('.image');
		});
});

