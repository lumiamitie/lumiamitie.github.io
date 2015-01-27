var node_size = d3.scale.linear() //원의 반지름에 대한 스케일
					.range([6,16]);
					
var node_color = d3.scale.category10(); //원의 색깔

var node_distance = d3.scale.linear() //적용안함
								.range([10, 250]);

var link_opacity = d3.scale.linear() // 선의 투명도
							.range([0.05, 0.8]);
							
d3.json("data/topic_analysis.json",function(data){

	var links = data.edge;
	var nodes = data.node;
	
	node_distance.domain(d3.extent(nodes, function(d){return d.prob})); //적용안함
	
	var width = 740, //차트 사이즈
		height = 370;
		
	var force = d3.layout.force() //force layout 적용
		.nodes(d3.values(nodes)) //node에 해당하는 데이터
		// https://github.com/mbostock/d3/wiki/Force-Layout 에서 옵션 내용 확인
		.links(links) //link에 해당하는 데이터
		.size([width, height]) // 레이아웃 적용 범위(차트와 같게 조정)
		.linkDistance(100) // 연결선 최대 길이
		.friction(0.5)
		.charge(-500)
		.gravity(0.2) //중심점에 몰리는 정도
		.on("tick", tick) // 매순간 좌표값을 계산해서 움직이도록 조정
		.start();
		
	var svg = d3.select("div").append("svg") //SVG 구성
		.attr("width", width)
		.attr("height", height);
	
	link_opacity.domain(d3.extent(links, function(d){return d.lift}));
		// link_opacity 함수의 domain 설정
	
	var link = svg.selectAll(".link") //연결선 그리기
					.data(force.links())
					.enter()
					.append("line")
					.attr("class", "link");
		
	link.style("opacity", function(d){return link_opacity(d.lift)});
		// link_opacity 함수를 적용해서 투명도 반영
		
	var node = svg.selectAll(".node") //노드 그리기
		.data(force.nodes())
		.enter()
		.append("g")
		.attr("class", "node")
		.on("mouseover", mouseover) // 마우스 오버 이벤트
		.on("mouseout", mouseout) // 마우스 뗄때 이벤트
		.on("click",selectCluster) //클릭시 이벤트
		.call(force.drag);
		
	node_size.domain([d3.min(nodes, function(d){return d.prob}), 
					  d3.max(nodes, function(d){return d.prob})]);
	
	node.append("circle")
		.attr("r", function(d){return node_size(d.prob);})
		.style("fill",function(d){return node_color(d.cluster);});
		
	node.append("text")
		.attr("x", 12)
		.attr("dy", ".35em")
		.text(function(d) { return d.name; });
		
	function tick() { //max, min을 적용하지 않으면 화면 밖으로 나감
		  link
		  .attr("x1", function(d) { 
			return Math.max(18, Math.min(width - 18, d.source.x)); 
			})
		  .attr("y1", function(d) { 
			return Math.max(18, Math.min(height - 18, d.source.y)); 
			})
		  .attr("x2", function(d) { 
			return Math.max(18, Math.min(width - 18, d.target.x)); 
			})
		  .attr("y2", function(d) { 
			return Math.max(18, Math.min(height - 18, d.target.y)); 
			});
 
	  node
		  .attr("transform", function(d) { 
			d.x = Math.max(18, Math.min(width - 18, d.x));
			d.y = Math.max(18, Math.min(height - 18, d.y))
			return "translate(" + d.x + "," + 
									d.y + ")"; });

	}
	
	function mouseover() { //마우스오버하면 원이 커짐
	  d3.select(this).select("circle").transition()
		  .duration(750)
		  .attr("r", function(d){return 1.5 * node_size(d.prob)});
	}
	
	function mouseout() {//원이 원래대로 돌아감
	  d3.select(this).select("circle").transition()
		  .duration(750)
		  .attr("r", function(d){return node_size(d.prob)});
	}
	var selectedCluster = 0;
	function selectCluster(d){ //클릭시 해당 클러스터만 하이라이트
		if(selectedCluster !== d.cluster){
			node.selectAll("circle")
				.attr("class",function(node){
					if(node.cluster === d.cluster){
						return "node focused";
					} else {
						return "node out_focused"
					}
				})
			node.selectAll("text")
				.attr("class",function(node){
					if(node.cluster === d.cluster){
						return "node focused";
					} else {
						return "node out_focused";
					}
				})
			selectedCluster = d.cluster;
		} else {
			node.selectAll("circle")
				.attr("class", "node focused")
			node.selectAll("text")
				.attr("class", "node focused")	
			selectedCluster = 0;
		}

	}
});
