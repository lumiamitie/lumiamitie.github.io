---
layout: post
published: true
title: ggplot2 축 레이블 포맷 바꾸기
mathjax: false
featured: true
comments: true
headline: ggplot2 scale labels
categories: R Visualization
tags: ggplot2 label
---

![cover-image](/images/macphoto.jpg)

# 축 레이블 포맷 바꾸기

그냥 혼자서 그래프를 볼 때에는 크게 중요하지 않을 수 있지만, 다른 사람에게 전달하고자 하는 그래프를 작성할 때 중요한 것 중 하나가 축의 레이블 포맷이다. x축, y축이 각각 어느 정도의 값을 나타내는 것인지 명확하게 나타내지 않는다면 보는 사람을 혼란스럽게 만들 우려가 있다. (그리고, 미래의 나를 위해 친절을 베푼다고 생각하자. 하루만 지나도 내그래프를 내가 이해하지 못하는 경우가 종종 발생한다) 따라서 명확한 의미 전달을 위해, 축의 눈금값(밑에서는 계속 레이블이라고 부를 것이다)의 포맷을 지정하는 방법을 알아보려고 한다! 

<br />

---

라이브러리는 ggplot2를 사용하며, 해당 패키지 내부의 `diamonds`, `economics` 데이터를 실습에 사용할 것이다.


```r
# ggplot2 2.1.0
library(ggplot2)
```

<br />
<br />

## comma로 구분하는 포맷 적용하기

ggplot2에서는 수치가 커질 경우, 수치를 자동으로 부동소수점으로 변환하여 표기한다.


```r
df_largenum = data.frame(
  label = letters[1:5],
  num = c(100000000, 3000000, 50000000, 80000000, 100000000)
)

ggplot(df_largenum, aes(x = label, y = num)) +
  geom_bar(stat = 'identity')
```

![](/images/post_image/ggplot2_scale_label/unnamed-chunk-2-1.png)

<br />

부동소수점 표기를 원하지 않을 경우 label 표기에 대한 함수를 지정해주면 원하는 형식으로 값을 볼 수 있다. 만약 콤마(,)로 구분된 숫자 표기를 원한다면 scales 패키지의 `comma` 함수를 사용하면 된다.

y축의 continuous한 숫자에 대한 scale 변경이므로, `scale_y_continuous` 함수에서 적용한다.


```r
ggplot(df_largenum, aes(x = label, y = num)) +
  geom_bar(stat = 'identity') +
  scale_y_continuous(labels = scales::comma)
```

![](/images/post_image/ggplot2_scale_label/unnamed-chunk-3-1.png)

<br />

`scales` 패키지에는 여러 가지 유용한 함수들이 있다. 모든 함수를 살펴보면 좋겠지만 이 글에서는 `comma`와 `percent`만 간단하게 다룬다.

<br />

---

## 한글 숫자단위로 수치 나타내기 (Custom Label)

K, B 등의 영문자로 단위를 나타내거나 만, 억 등 자신이 원하는 단위로 눈금을 나타내고 싶은 경우가 있다. 특히나 매출같은 경우 단위가 1억원을 훌쩍 넘기는 상황도 많이 발생한다. 한글로 수치를 표현하려면 어떻게 해야할까?  

<br />

`100,000,000` 이 아니라 `1억` 으로 표시하려면 어떻게 해야하는지 살펴보자!

<br />

우선 economics 데이터로 간단한 그래프를 그린다. y축을 보면 20만부터 32만까지 값이 존재한다. `200000`을 `20만`으로 변경해보자!


```r
ggplot(economics, aes(x = date, y = pop)) +
  geom_line()
```

![](/images/post_image/ggplot2_scale_label/unnamed-chunk-4-1.png)

<br />

사용자가 임의로 지정하는 레이블 함수를 만들 수 있다. 눈금에 해당하는 수치를 받아서 원하는 표기의 문자열을 반환하는 함수를 만들면 된다. y축의 숫자를 만단위로 표시하는 함수를 만들고, scale에 적용하자.


```r
label_ko_num = function(num) {
  ko_num = function(x) {
    new_num = x %/% 10000
    return(paste(new_num, '만', sep = ''))
  }
  # vapply를 쓰고 싶지만 가끔 문자열대신 NA가 출력되는 경우도 있으니 
  # 여기서는 간단하게 sapply를 적용
  return(sapply(num, ko_num))
}
```

<br />

그러면 아래 그래프와 같이 한글 숫자표기가 적용된 눈금을 확인할 수 있다.


```r
ggplot(economics, aes(x = date, y = pop)) +
  geom_line() +
  scale_y_continuous(labels = label_ko_num)
```

![](/images/post_image/ggplot2_scale_label/unnamed-chunk-6-1.png)

<br />

---

범용적인 스케일 함수를 만들고 싶다면 여러 가지 상황을 고려하여 함수를 만들어야 한다. 하지만 해당 그래프에 대해서만 적용해도 상관없다면 이렇게 상황에 맞는 간단한 함수를 만들어 쓰면 된다.

<br />
<br />

## 백분율(%) 포맷 적용하기

아래 그래프의 y축에서는 0부터 1 사이의 소수로 비율을 표시하고 있다


```r
ggplot(diamonds, aes(x = cut, fill = color)) +
  geom_bar(position = 'fill') +
  scale_fill_brewer(palette = 'Paired')
```

![](/images/post_image/ggplot2_scale_label/unnamed-chunk-7-1.png)

<br />

직접 %를 적용하는 함수를 만들어도 좋겠지만 `scales::percent` 함수를 바로 적용해보자


```r
ggplot(diamonds, aes(x = cut, fill = color)) +
  geom_bar(position = 'fill') +
  scale_y_continuous(labels = scales::percent) +
  scale_fill_brewer(palette = 'Paired')
```

![](/images/post_image/ggplot2_scale_label/unnamed-chunk-8-1.png)

<br />
<br />

---

평소에는 크게 중요하게 생각하지 않았지만 막상 일을 하면서 중요하다고 느꼈던 것이 바로 이런 것들이었다. 제목, 축, 범례 등등. 결국 그래프를 처음 보는 사람도 한 눈에 보고 이해할 수 있으려면 친절한 '가이드'가 필요하다. 생각보다 손이 많이가고 귀찮기 때문에 건드리기 싫은 영역이긴 하지만, 좋은 그래프를 위해 한 번만 더 신경써보자.