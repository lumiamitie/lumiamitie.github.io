var width = 760;//차트 사이즈
var height = 370;

var d_pent = 150;	//중심으로부터 노드까지의 거리	
d3.json("data/issue_relation.json", function(data){			
	var coord = [{"x": width/2, "y": (height/2)-d_pent, "node" : "top", "focused" : 0},
				{"x": width/2 + d_pent * Math.cos(Math.PI/10), 
					"y": height/2 - d_pent * Math.sin(Math.PI/10),
					"node" : "mid_right",
					"focused" : 0},
				{"x": width/2 + d_pent * Math.cos(3*Math.PI/10), 
					"y": height/2 + d_pent * Math.sin(3*Math.PI/10),
					"node" : "bot_right",
					"focused" : 0},
				{"x": width/2 - d_pent * Math.cos(3*Math.PI/10), 
					"y": height/2 + d_pent * Math.sin(3*Math.PI/10),
					"node" : "bot_left",
					"focused" : 0},
				{"x": width/2 - d_pent * Math.cos(Math.PI/10), 
					"y": height/2 - d_pent * Math.sin(Math.PI/10),
					"node" : "mid_left",
					"focused" : 0}]; 
					//각 타원의 위치를 지정
					//중심으로부터의 각도를 가지고 좌표 계산
					
	var keyword = d3.nest() // 타원에 들어갈 단어 5가지를 추출
					.key(function(d){return d.main})
					.entries(data)
					.map(function(d){return d.key})
			
	var main_data = data //뒤에서 %계산을 위한 메인 단어의 수치 계산
					.map(function(d){
						if(d.main === d.linked){
							return d.data
						}else{
							return data
								.filter(function(e){
									return e.main ===d.main
									})
								.filter(function(e){
									return e.linked ===d.main
									})[0].data
						}
					});	
	
	var line_pair = data.map(function(d, i ){ // 각 라인에 대한 정보
		return {"data":d.data, //연관단어의 등장 count
				"linked":d.linked, //연관단어
				"main":d.main, //중심단어
				"source" : keyword.indexOf(d.main), //선 연결 index(시작점)
				"target" : keyword.indexOf(d.linked), //선 연결 index(도착점)
				"main_data": main_data[i]} //중심단어의 등장 coount
				}
			);

	for (i =0 ; i < 5 ; i++){
		coord[i].keyword = keyword[i];
	};// 단어명을 추가

	var svg = d3.select(".contents")
				.append("svg")
				.attr("width", width)
				.attr("height", height);
	
	//여기부터 타원 뒤쪽 그림자 효과
	var defs = svg.append("defs");
	
	var filter = defs.append("filter")
					.attr("id", "drop-shadow")
					.attr("height", "130%");
					
	filter.append("feGaussianBlur")
			.attr("in", "SourceAlpha")
			.attr("stdDeviation", 5)
			.attr("result", "blur");
			
	filter.append("feOffset")
			.attr("in", "blur")
			.attr("dx", 5)
			.attr("dy", 5)
			.attr("result", "offsetBlur");
	
	var feMerge = filter.append("feMerge");
	
	feMerge.append("feMergeNode")
			.attr("in", "offsetBlur")
			
	feMerge.append("feMergeNode")
			.attr("in", "SourceGraphic")
	//여기까지 그림자 효과
	
	var link = svg.selectAll("line") //각 타원끼리 서로 직선을 연결
			.data(line_pair)
			.enter()
			.append("line")
			.attr("x1",function(d){return coord[d.source].x}) //시작점 x좌표
			.attr("y1",function(d){return coord[d.source].y}) //시작점 y좌표
			.attr("x2",function(d){return coord[d.target].x}) //도착점 x좌표
			.attr("y2",function(d){return coord[d.target].y}) //도착점 y좌표
			.attr("class", function(d){ //선이 지정하는 양쪽 위치로 class명 지정
					return coord[d.source].node + " " + coord[d.target].node;	
				})
			.style("stroke","black")
			.style("stroke-width", "3px")
			.style("opacity", 0.3);
			
	var tooltip = d3.select("div") //툴팁이 들어갈 공간 구성
			.append("div")
			.attr("class", "tooltip")
			.style("opacity", 0);
					
	var ellipse = svg.selectAll("ellipse")
			.data(coord)
			.enter()
			.append("ellipse")
			.attr("cx", function(d){return d.x;}) //x축 좌표
			.attr("cy", function(d){return d.y;}) //y축 좌푶
			.attr("rx", 50) //x축 반지름
			.attr("ry", 30) //y축 반지름
			.style("fill", function(d){ // 타원 색상 지정
				if (d.focused === 0){ //반복되는 구간이라 함수로 따로 구성필요
						return "#4DB8FF";
					} else if(d.focused ===1){
						return "#99D6FF";
					} else {
						return "#0099FF";
					}
				}) 
			.style("filter", "url(#drop-shadow)") //위에서 생성한 필터 적용
			.on("click", function(d){ 
				if(d.focused !== 2){ //클릭한 항목이 선택된 항목이 아닐경우
					focus_rev(d); //선택항목 표기
					d3.selectAll("ellipse")
						.style("fill", function(d){ //선택상태에 따라 색 변경
							if (d.focused === 0){
								return "#4DB8FF"; // 기본 색상
							} else if(d.focused ===1){
								return "#99D6FF"; // 선택되지 않은 경우
							} else {
								return "#0099FF"; // 선택된 경우
							}
						});
					d3.selectAll("line") //우선 전체선을 흐리게 만든다
						.style("opacity", 0.2);
						
					d3.selectAll("." + d.node) //선택항목과 연결된 선은 진하게
						.style("opacity", 0.9);
						
					d3.selectAll(".label") // 전체 label 보이지 않게
						.style("display","none");

						d3.selectAll(".label_" + d.keyword) 
						.style("display","inline");
						//선택항목과 연결된 label만 보이도록
						
						//여기부터는 차트 수정하면서 필요없어진 구간인듯
						d3.select(".legend")
						.selectAll(".main")
						.style("display","none");

						d3.select(".legend")
						.selectAll(".linked_legend")
						.style("display","none")
						
						d3.select(".legend")
						.selectAll(".legend_"+d.keyword)
						.style("display","inline");
						//여기까지
						
				} else { //클릭한 항목이 선택된 항목일 경우
					focus_reset(d); // 선택 해제
					d3.selectAll("ellipse")
						.style("fill", function(d){
							if (d.focused === 0){ // 선택 상태에 맞게 색상 변경
								return "#4DB8FF";
							} else if(d.focused ===1){
								return "#99D6FF";
							} else {
								return "#0099FF";
							}
						});
					d3.selectAll(".label") //label 전부 보이지 않게 설정
						.style("display","none")
						
					d3.selectAll("line") //투명도 기본상태로 조정
						.style("opacity", 0.2);
					
					//삭제해도 될 것 같다 Tooltip으로 대체
					d3.select(".legend")
						.selectAll(".linked_legend")
						.style("display","none")
					d3.select(".legend")
						.selectAll(".main")
						.style("display","inline")
				}
			})
			.on("mouseover",function(d){ //마우스오버시 툴팁 등장 이벤트
				// 선택된 항목이 main인 데이터로 필터링
				var tooltip_text = data.filter(function(datum){
												return datum.main === d.keyword;
											})
										.map(function(datum){
												return {"linked":datum.linked, "count":datum.data};
											});
				tooltip.transition()
						.duration(200) //툴팁 등장하는데 걸리는 시간
						.style("opacity", 0.9); //투명도 0 -> 0.9로
				tooltip.html(tooltip_text[0].linked +" : "+ tooltip_text[0].count +"건"+"<br/>"+
								tooltip_text[1].linked +" : "+ tooltip_text[1].count +"건"+"<br/>"+
								tooltip_text[2].linked +" : "+ tooltip_text[2].count +"건"+"<br/>"+
								tooltip_text[3].linked +" : "+ tooltip_text[3].count +"건"+"<br/>"+
								tooltip_text[4].linked +" : "+ tooltip_text[4].count +"건"+"<br/>")
						.style("left", (d3.event.pageX) + "px") 
						//현재 마우스의 x축 좌표를 툴팁 x축로 지정
						.style("top", (d3.event.pageY - 28) + "px"); 
						//혆재 마우스의 y축 좌표를 툴팁 y축으로 지정		
				})
			.on("mouseout", function(d){ //마우스 벗어나면 사라지는 이벤트
				tooltip.transition()
					.duration(500) //사라지는데 걸리는 시간
					.style("opacity", 0); //투명도 0.9 -> 0
				});
				
			svg.selectAll("rect") //%가 표시되는 상자 구성
					.data(line_pair)
					.enter()
					.append("rect")
						.attr("x",function(d){ //선의 중간
							return (coord[d.source].x+coord[d.target].x)/2-5
							})
						.attr("y",function(d){ // 선의 중간
							return (coord[d.source].y+coord[d.target].y)/2-15
							})
						.attr("width", 35) // 박스 너비
						.attr("height",20) // 박스 높이
						.attr("fill", "white") // 흰색 바탕
						.style("opacity", 0.5) //투명도
						.attr("class",  function(d){if (d.main === d.linked){
								return "none"; //선택된 항목이 linked가 아닌 경우를 보여줌
							} else {
								return "label label_" + d.main;
							}						
						})
						.style("display","none");
	
			svg.selectAll("text") //타원 위에 올라가는 단어명
					.data(coord)
					.enter()
					.append("text")
						.attr("x", function(d){return d.x;}) //x축 좌표
						.attr("y", function(d){return d.y + 5;}) //y축 좌표
						.text(function(d){return d.keyword;}) 
						//데이터의 keyword 항목으로 텍스트를 작성
						.attr("fill", "black")
						.style("text-anchor","middle"); 
						//좌표를 기준으로 가운데 정렬
			
			svg.selectAll(".labels") //label에 올라가는 % 정보
					.data(line_pair)
					.enter()
					.append("text")
						.attr("x",function(d){ //선의 중간
							return (coord[d.source].x+coord[d.target].x)/2
							})
						.attr("y",function(d){ //선의 중간
							return (coord[d.source].y+coord[d.target].y)/2
							})
						.text(function(d){
							if (d.main_data != 0){ //데이터가 0이 아닐경우
								return d3.format("%")(d.data/d.main_data)
								// % 포맷으로 리턴
							} else {//0으로 나눌경우 강제로 0% 리턴
								return "0%";
							}
							})
						.attr("class", function(d){
							if (d.main === d.linked){
								return "none";
								//선택된 항목이 linked 경우는 안보여줌
							} else {
								return "label label_" + d.main;
							}						
						})
						.style("display","none")
						; 
						
	function focus_rev(d)	{ //선택상태
		for(i=0 ; i<5 ; i++){
			coord[i].focused = 1 //선택되지 않은 항목은 1로 표기
		};
		d.focused = 2; //선택된 항목만 2로 표기
	};

	function focus_reset(d) { //선택 취소
		for(i=0 ; i<5 ; i++){
			coord[i].focused =0; // 전체 항목 0으로 표기
		};
	};
})
