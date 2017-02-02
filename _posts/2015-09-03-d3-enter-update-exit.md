---
layout: post
published: true
title: D3 - enter/update/exit
mathjax: false
featured: true
comments: true
headline: Making blogging easier for masses
categories: D3
tags: jekyll
---

![cover-image](/images/old-book.jpg)

# D3

거창하게 D3라는 제목으로 시작하고 있는 글이지만 그렇다고 해서 이 글을 읽고나면 없던 그래프가 생긴다거나 하는 것은 아닙니다. 다만 이제 막 간단한 그래프 예제들을 따라 그려보고 슬슬 예제를 고쳐서 본인이 생각하는 형태의 그래프를 그려보기 시작하는 분들께 도움이 되었으면 하는 내용입니다. 

D3를 처음 접했던 프로젝트 초반에 저를 가장 괴롭혔던 것들 중 하나가 바로 `enter` 의 개념입니다. 물론 저는 개발자도 아니고 다른 언어라고 해봤자 R이나 간신히 쓰던 수준이라 "언어가 달라지니 헷갈려서 힘드네요 하하" 와 같은 드립은 생각도 못하는 흔한 문과생입니다. 게다가 다른 데서는 저런거 보기도 힘들지요. 덕분에 꽤나 오랜 시간동안 저 `enter` 라는 것에 대해서 고민을 하고 (잘못된) 결론을 내린 끝에 지금 다시보면 부끄러워질 결과물들을 내놓았습니다. 막상 프로젝트할 때는 일단 돌아가긴 하니까 덮어두고 신경을 꺼버렸습니다. 아니, 신경을 못썼죠. 프로젝트 마감 기한이 계속 다가오니 일단 작동하는 것에 대해선 신경을 쓸 여유가 없었습니다. 그렇게 프로젝트에서 직접 뒹굴면서 말도 안되는 코딩을 하다가 나중에서야 조금이나마 더 이해하게 된 것들입니다. 만약 이것도 틀렸다면... 음 더 공부해야죠 ㅠㅠ

---

## enter?

사실 제가 멍청이인게, 지금 쓰는 내용들은 그냥 [Thinking with Joins](http://bost.ocks.org/mike/join/) 라는 글로 Mike Bostock가 올려놓은 내용입니다. 저도 이거 몇 번 읽은 것 같은데 그 때는 그냥 그렇구나 하고 넘겼던 내용들이 사람을 참 힘들게 만들었죠. 

사실 enter는 그냥 단순하게 막대그래프 하나만을 그릴 때는 그렇게 어려운 개념이 아닙니다. 비어있는 selection을 하나 선택하고, data()로 어떤 데이터랑 연결시킬지 결정하고, enter()로 실제 요소들과 연결시킨 후에, append()로 데이터의 개수만큼 요소를 추가시킵니다. 일단 그래프가 뙇 하고 만들어지는걸 보니까 이후에는 저걸 그냥 공식처럼 외워서 써먹었습니다.

```javascript
d3.select('svg')
  .selectAll('.empty')
  .data(dataset)
  .enter()
	  .append('rect')
```

대략 이런 형태가 되겠네요. 사실 그 때 잘 이해가 안됐던 것은 `.selectAll('.empty')` 입니다. 예제들을 보면 뒤에서 만들 요소들을 선택하는게 보통이긴 한데 어찌됐든 저 시점에서는 아무 것도 안잡히니까 결국 비어있는 selection이거든요. 그래서 나름 실험해본답시고 다른, 전혀 상관없는 선택을 잡아서 해보니까 그래도 그래프는 그려집니다. 점점 저부분이 필요없는 부분인가 하고 고민을 하게 됩니다.

## New Graph?

이제 두 번째 오해입니다. 버튼을 누르든지 뭐든지 무엇인가 이벤트가 생기면 데이터를 바꿔서 차트를 다시 그려야하는 상황이 되었습니다. 안돌아가는 머리를 열심히 굴려서 생각해낸 방법은 이렇습니다.

> 새로 지정된 데이터가 지금 차트에 그려진 데이터랑 같은가?
	> 맞다 ---> 가만히 놔둔다
	> 다르다 ---> 데이터를 표시하는 요소들을 전부 지우고 새로 그린다

지금 생각해보면 프로젝트가 그래도 무사히 끝나서 정말 다행이라는 생각이 듭니다. 저는 결국 이벤트마다 if문을 열심히 적어가면서 화면에 보이는 것과 입력받은 데이터가 같은지 확인하고 그래프를 직접 지우고 새로 그리고 하는 과정을 반복시켰습니다. 뭐 어찌됐든 원하는대로 돌아가니까요. 

---

# enter / update / exit

d3에서 enter와 관련된 개념을 볼 때 자주 등장하는 그림이 있습니다. 

![](/images/post_image/d3_enter_update_exit/d3_enter_update_exit01.PNG)

저걸 보고 처음 했던 생각은 '우와 update라는 함수도 있나보네' 였습니다. 하하. enter()라는 함수가 있으니 당연히 update()랑 exit()가 나중에 나오겠구나. 그런데 책을 뒤져봐도 update라는 함수는 안보이죠. 그렇게 멘붕이 시작되었습니다.

결론부터 말씀드리자면, 결국 책에서 하는 것과 동일한 내용입니다. 설명을 위해 위에서 보았던 코드 구조를 살짝 바꿔서 다시 적어보겠습니다.

```javascript
d3.select('svg')
  .selectAll('rect')
  .data(dataset)
  .enter().append('rect')
	  .attr()
	  .attr()
```

`.selectAll('rect')` 로 선택하면 맨 처음에는 아무 것도 없습니다. 그리고 dataset이 들어옵니다. 요소가 아무것도 없는데 data는 있으니까 그 개수만큼 `append('rect')` 가 실행됩니다. enter의 역할은 여기까지 입니다. 빈 rect 요소들이 생겼으니 뒤에서 attr를 통해서 값을 추가합니다. 그렇다면 이미 사각형 요소들이 존재할 때 데이터를 바꿔서 그리려면 어떻게 할까요? 새로 들어온 데이터가 더 적으면요??

---

![](/images/post_image/d3_enter_update_exit/d3_enter_update_exit02.PNG)

그림에서 update는 점선으로 된 사각형이 없습니다. 반면 enter와 exit는 점선으로 특정 요소들을 선택해놓았습니다. enter는 새로 생긴 요소들에 대한 선택이고, exit는 새로 들어온 데이터가 반영되지 않는 요소들을 선택합니다. 그리고 update는 앞에 selectAll이 선택한 요소들을 그대로 받아와서 변경합니다.

---

결국 **update**라는 것은 선택한 요소들의 attr값을 바꿔주는 것 뿐입니다. 데이터가 바뀌었으니 막대의 너비나 높이 값을 변경하고 선의 패스 위치를 바꿔야 합니다. 기존에 만들었던 사각형들이 있는데 새로 들어온 데이터의 개수가 동일하다면 기껏 만들어놓은 사각형들을 지우고 새로 만들 필요가 없습니다. 자원낭비죠. 그러니까 있는 요소들을 다시 선택해서 재활용을 시도합니다. 막대의 너비로 데이터를 표시했다면, 높이나 x,y 좌표 등은 그대로 놔두고 너비의 값만 바꿔주면 되겠네요. 이렇게 이미 존재하는 요소들을 **재활용**하기 위해서는 처음에 그래프를 만들때 앞으로 우리가 만들 요소들을 선택하도록 잡아주는 것이 편할겁니다. 'rect'로 잡아도 좋고, 다른데서도 rect요소를 쓸 것 같으면 클래스를 하나 정해두면 좋겠네요.

**Enter**는 data()로 받아들인 요소의 수가 이미 존재하는 객체보다 많을 때 새로 생성된 요소들을 선택합니다. 저처럼 if 같은걸로 상황구분할 필요없이, 조건이 되면 발동되는 요소인거죠 ( you just activated....) 이 경우에는 모자란만큼 append를 해서 data만큼 요소들 만들어주고, 새로 생성한 요소들의 attr를 data에 맞게 넣어줍니다. enter 이후의 코드들은 새로 생성된 요소들에 반영됩니다.

**Exit**은 data()로 들어온 요소보다 이미 존재하는 객체가 적을 때, 선택받지 못한 요소들을 선택합니다. 보통 선택을 받지 못한 요소들이 아무것도 안하고 놀기 시작하니까 **remove** 메서드를 통해서 해당 요소들을 지우는 작업이 따라붙게 됩니다.

그리고 선택하는 작업을 반복할 수는 없으니 적당한 변수에다가 selection + data 까지만 진행에서 담아두고, 그 이후에 메서드 체인을 이용해서 enter, update, exit 작업을 지정하게 됩니다. svg를 생성해서 선택하고 svg라는 변수에 저장한 이후라고 하면 아래와 같은 형식이 됩니다.

```javascript
var rect = svg.selectAll('rect')
			  .data(dataset);

//enter
rect.enter().append()
	.attr()
	.attr();

//update
rect.attr()
	.attr()

//exit	
rect.exit().remove()
```

---

남들 앞에 보이기엔 부끄러운 코드지만 위 내용을 반영해서 버튼을 통해 데이터를 변경하는 예제를 아주아주 단순화시켜서 작성해 보았으니 참고해보시면 좋을 것 같습니다. 실행되는 결과는 [여기](http://lumiamitie.github.io/d3datavis/d3_enter_update_exit.html) 에서 확인하실 수 있습니다.

```
<!DOCTYPE HTML>
<html>
<head>
<meta charset="utf-8">
<title>enter, update, exit</title>
</head>

<body>
<div id="select">
	<button value='data1'>data1</button>
	<button value='data2'>data2</button>
	<button value='data3'>data3</button>
	<button value='data4'>data4</button>
</div>
<div id="chart"></div>

	<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.6/d3.min.js" charset="utf-8"></script>
	<script>
	var svg = d3.select("#chart")
				.append("svg")
				.attr("width",500)
				.attr("height",500);
	
	// sample data
	var data = {'data1':[10,20,30,40,50,60,70,80,90,100],
				'data2':[50,55,60,65,70,75,80,85,90],
				'data3':[40,20,30,80,10,25,90,45],
				'data4':[5,100,15,70,35,90,25,75,45,50,100]};
	
	// 초기화면에서 나타날 그래프
	drawbar(data['data1']);
	
	// button event	
	d3.selectAll("button")
		.on("click", function(){
			var selectedData = this.value;
			drawbar(data[selectedData])
		})
	
	// 막대그래프를 그리는 함수	
	function drawbar(bardata) {
		var bars = d3.select("svg")
					.selectAll("rect")
					.data(bardata);
		
		//enter			
		bars.enter()
			.append("rect")
			.attr("width", function(d){
				return d;
			})
			.attr("height", 15)
			.attr("x", 20)
			.attr("y", function(d, i){
				return	20 + i*20;
			});

		//update
		bars.attr("width", function(d){
			return d;
		})

		//exit
		bars.exit()
			.remove();
			
	};
	</script>
</body>
</html>
```


