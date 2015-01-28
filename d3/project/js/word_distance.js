var margin = {top: 20, right: 15, bottom: 60, left: 60} //차트 여백
  , width = 740 - margin.left - margin.right //차트 너비
  , height = 370 - margin.top - margin.bottom; //차트 높이



var chart = d3.select('div') //svg 구성
					.append('svg')
					.attr('width', width + margin.right + margin.left)
					.attr('height', height + margin.top + margin.bottom)
					.attr('class', 'chart')
var main = chart.append('g') 
						.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
						.attr('width', width)
						.attr('height', height)
						.attr('class', 'main')   
	
var color = d3.scale.category20(); //색상지정 함수


d3.json("data/word_distance.json", function(data){
	var x = d3.scale.linear() //X축 스케일
			  .domain([0.8 * d3.min(data, function(d) { return d.x; }), 
						1.1 * d3.max(data, function(d) { return d.x; })])
			  .range([ 0, width ]);

	var y = d3.scale.linear() //y축 스케일
			  .domain([0.8 * d3.min(data, function(d) { return d.y; }), 
						1.1 *d3.max(data, function(d) { return d.y; })])
			  .range([ height, 0 ]);
			  
	var z = d3.scale.linear() //원 반지름 스케일
				.domain([d3.min(data, function(d) {return d.score; }), 
						d3.max(data, function(d) {return d.score; })])
				.range([10, 30])
				
	var xAxis = d3.svg.axis() // x축 설정
					.scale(x)
					.orient('bottom')
					.outerTickSize(0)
					.tickPadding(10);
						
	var xAxis_call = main.append('g') //x축 불러오기
			.attr('transform', 'translate(0,' + height + ')')
			.attr('class', 'main axis date')
			.call(xAxis);
	
	chart.append("text") //y축 이름
			.text("단어빈도수")
			.attr("x", 10)
			.attr("y", 20)
			.attr("class", "axis_name")
			
	chart.append("text") //x축 이름
			.text("거리 평균")
			.attr("x", width)
			.attr("y", height + margin.bottom)
			.attr("class", "axis_name")
						
	var yAxis = d3.svg.axis() //y축 설정
					.scale(y)
					.orient('left')
					.ticks(5)
					.innerTickSize(-width)
					.outerTickSize(0)
					.tickPadding(10);
					
	var yAxis_call = main.append('g') //y축 불러오기
			.attr('transform', 'translate(0,0)')
			.attr('class', 'main axis date')
			.call(yAxis);		
	
	
	var g = main.append("svg:g"); 
	
	var selectedDot = 0;
	g.selectAll(".scatter-dots")
	  .data(data)
	  .enter()
		  .append("circle")
		  .attr("cx", function (d,i) { return x(d.x); } ) //x축 좌표 지정
		  .attr("cy", function (d) { return y(d.y); } ) //y축 좌표 지정
		  .attr("r", function (d) { return z(d.score); }) // 반지름 지정
		  .attr("fill", function(d){return color(d.word)}) //색상 지정
		  .attr("class", "scatter-dots") //class 지정
		  .style("opacity", 0.6) //투명도 지정
		  .on("click",function(d,i){ //클릭시 이벤트
			if(selectedDot !== i){
				d3.selectAll(".scatter-dots")
					.style("opacity",0.6) // 기본 표현
					.style("stroke","none");
				d3.select(this)
					.style("opacity", 1)
					.style("stroke", "black") //선택된 항목에 대한 표현
					.style("stroke-width", "2px");
				selectedDot = i;
			} else { //선택된 항목을 클릭했을 때는 선택 취소
				d3.selectAll(".scatter-dots")
					.style("stroke","none")
					.style("opacity",0.6);
			}
		  })
		.on("mouseover", function(d){ //마우스오버시 이벤트
				tooltip.transition()
						.duration(200)
						.style("opacity", 0.9);
				tooltip.html("<b>"+d.word+"</b>" + "<br/>"+ "<br/>"+
							"거리 평균 :" + d3.round(d.x, 2) +"<br/>"+
							"단어빈도수: " + d3.round(d.y, 2) +"<br/>"+
							"총점수: "+ d3.round(d.score,2))
							//툴팁에 들어가는 내용들
							//값들은 전부 소수점 둘째자리까지만 보이도록
						.style("left", (d3.event.pageX) + "px") 
						//툴팁 x좌표
						.style("top", (d3.event.pageY - 28) + "px"); 
						//툴팁 y좌표	
			})
			.on("mouseout", function(d){ //마우스 벗어날때 이벤트
				tooltip.transition()
						.duration(500)
						.style("opacity", 0);
			});;
	
	//Label    
	g.selectAll("text") //원안의 텍스트
		.data(data)
		.enter()
		.append("text")
		.text(function(d) {return d.word;}) //텍스트 항목
		.attr("x", function(d,i) {return x(d.x);}) //x축
		.attr("y", function(d,i) {return y(d.y);}) //y축
		.attr("fill",'black')
		.attr("class","circle_label")
		.attr("text-anchor","middle"); //좌표를 기준으로 가운데 정렬

	var tooltip = d3.select("div").append("div") //툴팁이 들어갈 div 구성
			.attr("class", "tooltip")
			.style("opacity", 0);
	
});
