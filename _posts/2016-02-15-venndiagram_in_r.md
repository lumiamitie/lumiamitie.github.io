---
layout: post
published: true
title: VennDiagram in R - 벤 다이어그램
mathjax: false
featured: false
comments: true
headline: R에서 벤 다이어그램 그리기 - VennDiagram in R
categories: R Visualization
tags: R visualization diagram
---


![cover-image](/images/desk-pen-ruler.jpg)


# VennDiagram

# 벤 다이어그램 그리기

집합간의 대략적인 관계를 보여줄 때 벤 다이어그램을 사용하는 경우가 많다. 수학의 정석 맨 앞부분에 있는 **집합과 명제** 단원에서 소개가 되기 때문에 많은 사람들이 한 번쯤은 접하게되는 시각화 방법이다. 집합의 개수가 많지 않다면 적은 요소를 가지고도 효과적으로 내용을 전달할 수 있다. 
 
 사실 원 두개로 이루어진 간단한 벤 다이어그램이라면 그냥 엑셀이나 파워포인트를 가지고 그리는 것이 더 간단할 수 있다. 그리고 원이 네 개만 넘어가도 벤 다이어그램의 전달력은 급격하게 감소한다. 그래서 그냥 손으로 그리는게 더 편하다고 해도 할 말 없지만, 사람 일은 모르는 것이기 때문에.. R로 벤 다이어그램 그리는 방법에 대해서 정리해보려고 한다. R로는 간단하게 그린 다음에 SVG 형태로 출력해서 일러스트레이터 등 전문 도구를 활용해 글꼴 정도만 가볍게 손보는 형태로 활용할 수도 있다.

<br />

---

이 글은 R Studio Pubs의 관련 자료를 바탕으로 작성되었습니다. 
<http://rstudio-pubs-static.s3.amazonaws.com/13301_6641d73cfac741a59c0a851feb99e98b.html>

<br />

---

# 벤 다이어그램 그리기

## 1. 기본적인 벤 다이어그램

`VennDiagram` 패키지를 설치한 후에 진행한다. `draw.single.venn`은 가장 기본적인 형태의 벤 다이어그램이다. 그냥 원 하나를 그리고 카테고리와 데이터 값을 보여준다.


```r
# install.packages('VennDiagram')
library(VennDiagram)
```


```r
draw.single.venn(area = 10, category = 'single')
```

![](/images/post_image/venndiagram/unnamed-chunk-1-1.png)


<br />

---

### 1.2 면 색상, 선 종류 변경하기

새로운 다이어그램을 그리기 위해서는 `grid.newpage()`를 한 번 적용시킨다(안하면 겹쳐서 그려짐)

**lty**는 선의 종류(line type)를 변경

**fill**은 면의 색상을 변경


```r
grid.newpage()
draw.single.venn(area = 20, 
                 category = "single - colorful", 
                 lty = "blank", 
                 fill = "steelblue", 
                 alpha = 0.5)
```

![](/images/post_image/venndiagram/unnamed-chunk-2-1.png)


<br />

---

## 2. 두 개의 원으로 구성된 벤 다이어그램 그리기

두 개의 원으로 구성된 벤 다이어그램을 그리기 위해서는 `draw.pairwise.venn()`함수를 사용한다. 교집합 부분의 데이터는 `cross.area`에 값을 지정하면 된다. 

`area1`, `area2`는 각 원 전체의 면적을 의미한다. 따라서 벤 다이어그램에 실제로 표시되는 값은 `area1 - cross.area`, `cross.area`, `area2 - cross.area`가 된다



```r
grid.newpage()
draw.pairwise.venn(area1 = 25, 
                   area2 = 20, 
                   cross.area = 10, 
                   category = c("diagram A", "diagram B"))
```

![](/images/post_image/venndiagram/unnamed-chunk-3-1.png)


<br />

---

### 2.1 카테고리 레이블 위치 지정하기

`cat.pos`는 카테고리 레이블의 위치를 표시한다. 원의 중심을 기준으로 시계방향 각도(0~360도)를 통해 레이블의 위치를 나타내게 된다. 0이면 12시 방향(원의 중심 바로 위), 90이면 3시 방향(원 우측), 180이면 6시 방향(원 아래)에 위치한다

`cat.dist`는 카테고리 레이블이 원의 가장자리로부터 얼마나 떨어져있는지 거리를 의미한다. 값이 커질수록 원에서 멀어진다



```r
# cat.dist = 0 일 때, cat.pos 45와 180 비교
grid.newpage()
draw.pairwise.venn(area1 = 22, area2 = 20, cross.area = 11, 
                   category = c("45 degree, 0 dist", "180 degree 0 dist"), 
                   lty = rep("blank", 2), 
                   fill = c("light blue", "pink"), 
                   alpha = rep(0.5, 2), 
                   cat.pos = c(45,180), 
                   cat.dist = c(0, 0))
```

![](/images/post_image/venndiagram/unnamed-chunk-4-1.png)



```r
# cat.pos = 0 일 때, cat.dist 0.1과 -0.1 비교
grid.newpage()
draw.pairwise.venn(area1 = 22, area2 = 20, cross.area = 11, 
                   category = c("0 degree, 0.1 dist", "0 degree -0.1 dist"), 
                   lty = rep("blank", 2), 
                   fill = c("light blue", "pink"), 
                   alpha = rep(0.5, 2), 
                   cat.pos = c(0,0), 
                   cat.dist = c(0.1, -0.1))
```

![](/images/post_image/venndiagram/unnamed-chunk-5-1.png)


<br />

---

### 2.2 원의 크기 변경 여부 결정하기

`draw.pairwise.venn()` 함수는 기본적으로 원의 넓이(area1, area2)에 맞게 원의 크기가 조정된다


```r
grid.newpage()
draw.pairwise.venn(area1 = 30, area2 = 10, cross.area = 5, 
                   category = c("bigger", "smaller"), 
                   lty = rep("blank", 2), 
                   fill = c("light blue", "pink"), 
                   alpha = rep(0.5, 2),
                   cat.pos = c(0, 0))
```

![](/images/post_image/venndiagram/unnamed-chunk-6-1.png)


원의 크기를 값과 상관없이 고정시키려면 `scaled = FALSE` 옵션을 추가하면 된다


```r
grid.newpage()
draw.pairwise.venn(area1 = 30, area2 = 10, cross.area = 5, 
                   category = c("bigger", "smaller"), 
                   lty = rep("blank", 2), 
                   fill = c("light blue", "pink"), 
                   alpha = rep(0.5, 2),
                   cat.pos = c(0, 0),
                   scaled = FALSE)
```

![](/images/post_image/venndiagram/unnamed-chunk-7-1.png)


<br />

---

### 2.3 겹쳐져 있지 않은 벤 다이어그램

`euler.d = TRUE` 옵션을 지정하면 서로 겹치지 않는 원을 그릴 수 있다. 

`euler.d = TRUE`일 때, sep.dist 옵션을 통해 원 사이의 간격을 지정할 수 있다.
`rotation.degree`를 통해 원 사이의 각도를 조정할 수 있다.

`euler.d = FALSE` 옵션을 사용하기 위해서는 항상 `scaled = FALSE` 옵션과 같이 사용되어야 한다. 이 경우 원의 크기가 변하지 않는 벤 다이어그램이 강제로 그려진다(intersection값이 0)



```r
# sep.dist = 0.01, rotation.degree = 45
grid.newpage()
draw.pairwise.venn(area1 = 20, area2 = 5, cross.area = 0, 
                   category = c("Bigger", "Smaller"), 
                   lty = rep("blank", 2), 
                   fill = c("steelblue", "firebrick"), 
                   alpha = rep(0.5, 2), 
                   cat.pos = c(0, 180), 
                   euler.d = TRUE, sep.dist = 0.01, 
                   rotation.degree = 45) 
```

![](/images/post_image/venndiagram/unnamed-chunk-8-1.png)



```r
# sep.dist = 0.2, rotation.degree = 45
grid.newpage()
draw.pairwise.venn(area1 = 20, area2 = 5, cross.area = 0, 
                   category = c("Bigger", "Smaller"), 
                   lty = rep("blank", 2), 
                   fill = c("steelblue", "firebrick"), 
                   alpha = rep(0.5, 2), 
                   cat.pos = c(0, 180), 
                   euler.d = TRUE, sep.dist = 0.2, 
                   rotation.degree = 45) 
```

![](/images/post_image/venndiagram/unnamed-chunk-9-1.png)



```r
# sep.dist = 0.2, rotation.degree = 135
grid.newpage()
draw.pairwise.venn(area1 = 20, area2 = 5, cross.area = 0, 
                   category = c("Bigger", "Smaller"), 
                   lty = rep("blank", 2), 
                   fill = c("steelblue", "firebrick"), 
                   alpha = rep(0.5, 2), 
                   cat.pos = c(0, 180), 
                   euler.d = TRUE, sep.dist = 0.2, 
                   rotation.degree = 135) 
```

![](/images/post_image/venndiagram/unnamed-chunk-10-1.png)



<br />

---

## 3. 세 개의 원으로 구성된 벤 다이어그램 그리기

벤 다이어그램의 원이 3개로 증가하면 7개의 부분집합을 고려하게 된다.

**area1, 2, 3**는 원 두개짜리 벤 다이어그램과 마찬가지로 각 원 전체의 면적을 의미한다. 교집합 부분인 **n12, n23, n13**도 전체 교집합인 **n123**의 값을 포함한 상태이기 때문에 이 점에 유의해서 데이터를 입력하자.

주의해야 할 점은 `VennDiagram` 패키지의 함수의 경우 원이 세 개가 되면 원의 크기가 고정된다. 

**cex**는 데이터 레이블의 글꼴 크기, cat.cex는 카테고리 레이블의 글꼴 크기를 의미한다. 부분집합이 7개이기 때문에 `rep(1.2, 7)`을 통해 길이 7의 벡터를 생성했다. 마찬가지로 카테고리는 3개이기 때문에 길이 3의 벡터를 생성했다.

색상은 색 이름을 직접 입력하지 않고 `RColorBrewer` 패키지의 함수를 이용해 색상을 받아왔다.


```r
grid.newpage()
draw.triple.venn(
  area1 = 1000,
  area2 = 500,
  area3 = 100,
  n12 = 30,
  n23 = 20,
  n13 = 15,
  n123 = 10,
  category = c('Biggest', 'Bigger', 'Big'),
  fill = RColorBrewer::brewer.pal(3, 'Accent'),
  lty = 'blank',
  cex = rep(1.2, 7),
  cat.cex = rep(1.5, 3)
)
```

![](/images/post_image/venndiagram/unnamed-chunk-11-1.png)

