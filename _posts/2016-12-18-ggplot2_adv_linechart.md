---
layout: post
published: true
title: KOSPI200 데이터를 가지고 선그래프 그려보기
mathjax: false
featured: true
comments: true
headline: ggplot2 scale labels
categories: R
tags: ggplot2 R
---

![cover-image](/images/macphoto.jpg)


# KOSPI200 데이터를 가지고 선그래프 그려보기

---

`ggplot2` 사용해서 기본적인 그래프를 그리는 방법에 대해서는 몇 번의 포스팅을 통해 살펴본적이 있었다. 이번에는  간단한 선 그래프를 더 완성도 있게 구성하는 방법에 대해서 알아보려고 한다. 

<br />

`ggplot2`의 기본적인 기능들이 알고 싶다면 예전에 올려둔 포스팅을 참고하면 된다. 라이브러리 버전에는 좀 차이가 있지만 큰 틀을 잡는데 도움이 될 것이다.

- [ggplot2 01](http://lumiamitie.github.io/r/visualization/ggplot2-01/) <br />
- [ggplot2 02](http://lumiamitie.github.io/r/visualization/ggplot2-02/) <br />
- [ggplot2 03](http://lumiamitie.github.io/r/visualization/ggplot2-03/) <br />

## 라이브러리

---


```r
library(tidyverse)
# install.packages('ggthemes') 패키지가 없으면 설치!
library(ggthemes)
```

<br />

## 데이터 불러오기

---

[Google Finance](https://www.google.com/finance) 에서 KOSPI 200 지수의 데이터를 가져와서 추세를 살펴보자. 

`quantmod` 패키지의 `getSymbols` 함수를 사용하면 데이터를 쉽게 불러올 수 있다. 
추가적인 내용은 [여기](http://blog.naver.com/lisist/220382983076) 페이지를 참고하면 된다. 

데이터는 다음과 같다. 일별 시가, 종가, 최고가, 최저가, Volume 으로 구성되어 있다. 


```r
# 맥 기본 로케일로 데이터를 받아오니 날짜가 제대로 불러지지 않았음
# withr 패키지의 with_locale 함수를 통해 임시로 로케일을 변경하여 세팅
withr::with_locale(c('LC_TIME' = 'C'),
  kospi <- quantmod::getSymbols("KRX:KOSPI200",src="google",auto.assign=F,from='2016-01-01','2016-12-15')
  )

# 받아온 데이터 tibble 형태로 정제
tidy_kospi = kospi %>% 
  broom::tidy() %>% 
  tbl_df %>% 
  mutate(series = stringr::str_replace_all(series, '\\.', '_'))

tidy_kospi
```

```
## # A tibble: 1,185 × 3
##         index            series  value
##        <date>             <chr>  <dbl>
## 1  2016-01-04 KRX_KOSPI200_Open 239.30
## 2  2016-01-05 KRX_KOSPI200_Open 233.96
## 3  2016-01-06 KRX_KOSPI200_Open 236.48
## 4  2016-01-07 KRX_KOSPI200_Open 233.23
## 5  2016-01-08 KRX_KOSPI200_Open 230.40
## 6  2016-01-11 KRX_KOSPI200_Open 230.77
## 7  2016-01-12 KRX_KOSPI200_Open 232.45
## 8  2016-01-13 KRX_KOSPI200_Open 232.24
## 9  2016-01-14 KRX_KOSPI200_Open 230.68
## 10 2016-01-15 KRX_KOSPI200_Open 233.38
## # ... with 1,175 more rows
```

<br />

### 기본적인 추세 보기

---

1) 필요한 데이터만 골라낸다

- kospi 200 데이터에서 시가만 살펴본다. <br />
- `filter()`를 사용해서 `KRX_KOSPI200_Open` 항목만 찾는다 <br />

<br />

2) ggplot2를 이용해 데이터를 그린다

- 데이터는 `kospi_open`을 사용한다. <br />
- x축은 날짜, y축은 값이면 된다 `aes()` 함수를 통해 적용한다 <br />
- `geom_line()`을 사용해서 선그래프를 그린다<br />


```r
# 시가만 살펴보자
kospi_open = tidy_kospi %>% filter(series == 'KRX_KOSPI200_Open')  

# 선만 그리기
ggplot(kospi_open, aes(x = index, y = value)) +
  geom_line()
```

![](/images/post_image/ggplot2_adv_linechart/unnamed-chunk-3-1.png)


<br />

### 추세선 그리기 

---

추세를 확인하기 위해 loess 곡선을 추가해보자. 

- `geom_smooth()`를 추가한다. 
- 만약 직선으로 fitting하고 싶다면 `geom_smooth(method = 'lm')` 으로 실행시킨다.


```r
ggplot(kospi_open, aes(x = index, y = value)) +
  geom_line() +
  geom_smooth()
```

![](/images/post_image/ggplot2_adv_linechart/unnamed-chunk-4-1.png)

<br />

### 그래프를 꾸며보자

---

그래프를 조금 더 꾸며보도록 하자. 

- 추세선의 색상을 `#990000`으로 바꾸자 
- 일단 x축이 분명 날짜로 구성이 되어있는데, 축에 날짜 표시가 안되어 있으니 날짜를 표시한다.
    + `scale_x_date` 로 x축에 대한 설정을 변경할 수 있다
    + 01/08 의 형태로 표시해보자. `date_labels = '%m/%d` 로 날짜 포맷을 지정한다.
- 차트에 제목을 넣어보자
    + `ggtitle()` 함수를 사용한다
- 축 제목을 변경하자
    + `xlab()`, `ylab()` 으로 각각 x축과 y축의 제목을 변경할 수 있다
- 맥 사용자의 경우 한글이 포함되면 폰트 문제로 출력이 제대로 되지 않을 수 있다
    + `theme_gray(base_family = 'AppleGothic')` 을 추가해서 한글 폰트를 지정한다


```r
ggplot(kospi_open, aes(x = index, y = value)) +
  geom_line() +
  geom_smooth(colour = '#990000') +
  scale_x_date(date_labels = '%m/%d') +
  xlab('날짜') + ylab('지수') +
  ggtitle('KOSPI200 시가\n2016-01-01 ~ 2016-12-15 ') +
  theme_gray(base_family = 'AppleGothic') # 이 부분은 맥 사용자만!
```

![](/images/post_image/ggplot2_adv_linechart/unnamed-chunk-5-1.png)

<br />

### 테마를 추가해보자

---

`ggthemes` 패키지를 설치하면 추가적인 테마를 적용할 수 있다. 

- 월스트리트 저널 테마를 적용하자. 이 테마는 x, y축 제목을 포함하지 않기 때문에 해당 부분은 세팅할 필요가 없다.
- 이 테마의 경우 본문과 제목의 폰트를 따로 세팅할 수 있는데, 둘 다 오버워치 폰트를 사용해서 꾸며보자.

폰트는 [여기](http://kr.battle.net/forums/static/fonts/koverwatch/koverwatch.ttf)서 다운로드 받을 수 있다.

윈도우는 `extrafont` 패키지를 통해 폰트를 등록하고 (페이지 맨 밑에서 추가 설명) 맥은 `서체관리자`에서 폰트를 설치하면 바로 적용할 수 있다


```r
ggplot(kospi_open, aes(x = index, y = value)) +
  geom_line() +
  geom_smooth(colour = '#990000') +
  scale_x_date(date_labels = '%m/%d') +
  ggtitle('KOSPI200 시가\n2016-01-01 ~ 2016-12-15 ') +
  theme_wsj(base_family = 'Koverwatch', title_family = 'Koverwatch')
```

![](/images/post_image/ggplot2_adv_linechart/unnamed-chunk-6-1.png)

<br />
<br />
<br />
<br />

## 윈도우에서 폰트 세팅하기

---

윈도우에서 그래프 작업을 할 때 폰트를 적용하기 위해서는 `extrafont` 패키지에 미리 폰트를 등록시켜 놓아야 한다.

- `extrafont` 패키지를 설치하고 `font_import()` 함수를 실행시키면 된다
- 시간이 오래걸린다.... 윈도우용으로 쓰는 예전 i5 그램에서는 50분 정도 걸린듯. 폰트가 많을수록 느려진다
- 처음 폰트를 불러올때는 `loadfonts` 함수가 필요하지만 이후에는 라이브러리 불러올때 자동으로 로드된다.


```r
install.packages('extrafont')
library(extrafont)
font_import() # y를 누르면 font 등록을 시작한다
loadfonts(device = 'win')
# 이제 그래프에서 폰트를 사용할 수 있다!
```

