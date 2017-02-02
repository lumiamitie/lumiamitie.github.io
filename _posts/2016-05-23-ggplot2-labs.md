---
layout: post
published: true
title: ggplot2 label 설정하기
mathjax: false
featured: true
comments: true
headline: R ggplot2 제목/축이름/범례이름 등 설정하기
categories: R Visualization
tags: R visualization ggplot2
---

![cover-image](/images/desk-pen-ruler.jpg)

# ggplot2 labs

 데이터를 살펴보다보면 여러 가지 그래프를 그리게 된다. 분석 과정에서 인사이트를 얻기 위해 그리는 그래프라면 최대한 빠르고 간단하게 다양한 그래프를 그린다. 하지만 다른 사람에게 정보를 전달하기 위해서 그래프를 그리게 된다면 그래프를 보고 한눈에 이해할 수 있도록 신경써야 하는 것들이 생긴다. 이 그래프가 무엇을 설명하려고 하는 것인지 전체적인 제목이 필요할테고, x축과 y축이 각각 어떤 변수를 말하는지 제목을 붙이는 것도 필요하다. 그래프의 의미를 명확하게 전달하려면 그래프를 그린 사람이 직접 설명해주는 것이 제일 좋겠지만, 그래프만 보더라도 의미를 유추할 수 있도록 최소한의 정보는 표시해 두는 것이 제일 좋다. (그리고 이렇게 해두면 많은 경우 미래의 나에게 도움을 줍니다.......ㅠㅠ)
 
 따라서 이번 글에서는 그래프의 제목을 달아보고, x/y 축과 범례에 이름을 지정하는 방법을 알아보려고 한다. 그리고 추가로 facet을 구성할 때 facet의 label을 임의로 지정하는 방법까지 살펴볼 것이다.

혹시 ggplot2가 익숙하지 않은 분들을 위해, 좀 예전 버전 ggplot2를 대상으로 작성되었지만 그래도 아직 쓸만한 것 같은 예전 포스팅들 링크를 첨부한다.

[ggplot2 01 : GRAMMAR OF GRAPHICS](http://lumiamitie.github.io/r/visualization/ggplot2-01/) <br />
[ggplot2 02 : DRAWING GRAPHS](http://lumiamitie.github.io/r/visualization/ggplot2-02/) <br />
[ggplot2 03](http://lumiamitie.github.io/r/visualization/ggplot2-03/) <br />

---

<br />

## Library

그래프와 데이터를 위해 ggplot2를 불러온다. 그리고 개인적인 취향(..)으로 magrittr의 파이프 연산자(`%>%`)를 자주 섞어서 사용하고 있다. 파이프 연산자를 좋아하지 않는다면 `ggplot2`만 불러와서 진행하면 된다.

`magrittr` 패키지의 더 자세한 사용법이 궁금하시다면 [예전 포스팅](http://lumiamitie.github.io/r/magrittr/) 에서 확인!


```r
library(ggplot2)
library(magrittr)
```

---

<br />

## Diamonds data

ggplot2 패키지에서 기본적으로 제공하는 `diamonds` 데이터를 가지고 간단한 누적 막대그래프를 그린다.


```r
p_dia = diamonds %>% 
  ggplot(aes(x = color, fill = cut)) +
    geom_bar(stat = 'count', position = 'fill') +
    scale_fill_brewer(palette = 'Paired')
```

윈도우 등 그래프에서 한글 출력 이슈가 없는 경우에는 상관없지만 Mac에서는 이후에 추가할 한글 제목들이 깨져서 출력될 수 있다.

따라서 Mac 사용자는 아래와 같이 진행한다.
한글을 포함하는 글꼴로 지정해 주어야 한글 출력이 가능해진다.


```r
p_dia = diamonds %>% 
  ggplot(aes(x = color, fill = cut)) +
    geom_bar(stat = 'count', position = 'fill') +
    scale_fill_brewer(palette = 'Paired') +
    theme_gray(base_family = 'AppleGothic') # 이 부분은 Mac 사용자만!

p_dia
```

![](/images/post_image/ggplot2_labs/unnamed-chunk-3-1.png)

---

<br />

## 그래프 제목, 축 이름 넣기

x축, y축에는 각각 `xlab`, `ylab` 함수를 통해서 축 이름을 넣을 수 있다


```r
p_dia +
  xlab('색상') +
  ylab('비율')
```

![](/images/post_image/ggplot2_labs/unnamed-chunk-4-1.png)

<br />

그래프에 제목을 넣고 싶다면 `ggtitle` 함수를 사용하면 된다


```r
p_dia +
  xlab('색상') +
  ylab('비율') +
  ggtitle('색상별 등급 비율')
```

![](/images/post_image/ggplot2_labs/unnamed-chunk-5-1.png)

---

<br />
<br />

## 범례 이름넣기

범례 항목의 이름을 바꾸는 방법은 여러 가지가 있다
우선 해당하는 에스테틱의 scale 함수에서 `name` 항목을 지정해주면 된다
`cut` 변수가 `fill` 에스테틱과 연결되어 있기 때문에 `scale_fill_xxxx` 함수에 제목을 넣는다


```r
diamonds %>% 
  ggplot(aes(x = color, fill = cut)) +
    geom_bar(stat = 'count', position = 'fill') +
    scale_fill_brewer(name = '등급', palette = 'Paired') +
    theme_gray(base_family = 'AppleGothic') +
    xlab('색상') + 
    ylab('비율') +
    ggtitle('색상별 등급 비율')
```

![](/images/post_image/ggplot2_labs/unnamed-chunk-6-1.png)


또는 `labs` 함수를 통해서 `fill` 에스테틱에 해당하는 이름을 지정할 수 있다


```r
p_dia +
  xlab('색상') +
  ylab('비율') +
  ggtitle('색상별 등급 비율') +
  labs(fill = '등급')
```

![](/images/post_image/ggplot2_labs/unnamed-chunk-7-1.png)


`labs` 함수를 사용하면 `xlab`, `ylab`, `ggtitle`도 한꺼번에 같이 지정할 수 있다.


```r
p_dia +
  labs(list(title = '색상별 등급 비율',
            x = '색상', 
            y = '비율',
            fill = '등급'))
```

![](/images/post_image/ggplot2_labs/unnamed-chunk-8-1.png)

---

<br />
<br />

## Facet Labelling - 표기 방법 변경

TRUE/FALSE로 구분되는 logical 변수를 두 개 만들고 Facet으로 구분해서 그래프를 그려보자. 1캐럿이 넘는지 여부로 한 번 구분하고, 가격이 $1000가 넘는지 여부로 한 번 더 구분한다. 그리고 각 그룹별로 등급이 어떻게 구분되어 있는지 살펴보자.


```r
diamonds_subset = data.frame(
  carat_over1 = diamonds$carat > 1,
  price_over1000 = diamonds$price > 1000,
  cut = diamonds$cut
)
```

`carat ~ price` 의 형태로 `facet_grid`를 적용한다


```r
diamonds_subset %>% 
  ggplot(aes(x = cut)) +
    geom_bar(fill = 'steelblue') +
    facet_grid(carat_over1 ~ price_over1000)
```

![](/images/post_image/ggplot2_labs/unnamed-chunk-10-1.png)

```r
diamonds_subset %>% head()
```

```
##   carat_over1 price_over1000       cut
## 1       FALSE          FALSE     Ideal
## 2       FALSE          FALSE   Premium
## 3       FALSE          FALSE      Good
## 4       FALSE          FALSE   Premium
## 5       FALSE          FALSE      Good
## 6       FALSE          FALSE Very Good
```

<br />

가로 구분도 TRUE/FALSE, 세로 구분도 TRUE/FALSE이기 때문에 어디가 어떤 변수인지 파악하기 힘들다. 

따라서 facet의 label에 변수값과 변수명이 동시에 표시되도록 설정해버리자

`labeller` 옵션에 `label_both` 함수를 지정해준다


```r
diamonds_subset %>% 
  ggplot(aes(x = cut)) +
    geom_bar(fill = 'steelblue') +
    facet_grid(carat_over1 ~ price_over1000, 
               labeller = label_both)
```

![](/images/post_image/ggplot2_labs/unnamed-chunk-11-1.png)

<br />

labeller에 사용할 수 있는 옵션은 다음과 같다

  - `label_value` : 값만 표시한다 (기본값)

  - `label_both` : 변수와 값을 모두 표시한다

  - `label_context` : v1 ~ v2 + v3 처럼 한 쪽에 여러 개의 변수가 들어가는 상황에는 `label_both`, 그렇지 않다면 `label_value`를 사용한다

  - `label_parsed` : label에 수식을 넣고 싶을 때 사용한다

<br />

자세한 내용을 확인하고 싶다면 콘솔창에 `?labellers`로 검색해보면 된다.

---

<br />
<br />

## Facet Labelling - 표기 내용 변경

`facet_wrap`에서 label을 이름 자체를 바꾸고 싶을 때도 있다. 가장 쉽게 접근하는 방법은 ggplot 그래프를 만들기 전에 변수명 자체를 바꿔버리는 것이다. 하지만 띄어쓰기가 포함된 제목을 넣고 싶다면?? 변수 이름으로 지정할 수 없는 형태의 문자열을 넣어야 한다면 어떻게 해야 할까?


```r
iris %>% 
  ggplot(aes(x = Sepal.Length, y = Sepal.Width)) +
    geom_point()+
    facet_wrap(~ Species)
```

![](/images/post_image/ggplot2_labs/unnamed-chunk-12-1.png)

<br />

변수명 - 표시하려는 이름 형태로 변수를 만든다


```r
species_label = c(
  setosa = 'Group A',
  versicolor = 'Group B',
  virginica = 'Group C'
)
```

<br />

`labeller`함수를 통해 Species 변수와 변경하려는 이름이 지정된 벡터를 연결시킨다


```r
iris %>% 
  ggplot(aes(x = Sepal.Length, y = Sepal.Width)) +
    geom_point()+
    facet_wrap(~ Species, 
               labeller = labeller(Species = species_label))
```

![](/images/post_image/ggplot2_labs/unnamed-chunk-14-1.png)


---

<br />
<br />

여기서 설명했던 내용들은 혼자 분석하고 내가 볼 그래프를 그리기만 할 때는 크게 중요하지 않은 내용이지만, 의외로 필요할 때는 시간을 많이 잡아먹는 것들이다. 정말 해결이 안되는 문제라면 pdf / svg 로 내보내거나 메타데이터 형태로 빼내어서 외부 프로그램을 통해 수정하는 것들이 더 빠를 수 있다. 하지만 반복적인 작업이 필요한 경우라면 최대한 코드를 통해 해결할 수 있는 방법을 찾는 것이 좋다. 
