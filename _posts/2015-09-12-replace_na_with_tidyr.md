---
layout: post
published: true
title: Replace NA with tidyr
mathjax: false
featured: false
comments: true
headline: Making blogging easier for masses
categories: R
tags: jekyll
---

![cover-image](../../../images/taking-notes.jpg)

9월 7일에 업데이트된 tidyr 0.3 버전에는 NA 값을 처리하는 함수들이 일부 추가되었다.

그 중에서 `replace_na`와 `fill` 함수에 대해 살펴보려고 한다


```r
library(tidyr)
library(dplyr)
```

```r
df = data_frame(x = c(1, 2, NA), y = c("a", NA, "b"))
```

---

<br />
<br />

우선 `replace_na` 함수는 각 열별로 NA를 대체할 값을 list를 통해 전달한다


```r
df %>% 
  replace_na(list(x=0, y='unknown'))
```

```
## Source: local data frame [3 x 2]
## 
##       x       y
##   (dbl)   (chr)
## 1     1       a
## 2     2 unknown
## 3     0       b
```

---

`fill`함수는 NA값이 등장하면 해당 열에서 마지막으로 나온 NA값이 아닌 값으로 NA를 채워넣는다


```r
df %>% 
  fill(x,y)
```

```
## Source: local data frame [3 x 2]
## 
##       x     y
##   (dbl) (chr)
## 1     1     a
## 2     2     a
## 3     2     b
```

<br />

fill 함수 내부에서 select문의 변수 선택 용법대로 값을 채워넣을 열을 선택할 수도 있다.


```r
df %>% 
  fill(x:y) # x열부터 y열까지
```

```
## Source: local data frame [3 x 2]
## 
##       x     y
##   (dbl) (chr)
## 1     1     a
## 2     2     a
## 3     2     b
```

```r
df %>% 
  fill(x, -y) # x열 포함, y열 제외
```

```
## Source: local data frame [3 x 2]
## 
##       x     y
##   (dbl) (chr)
## 1     1     a
## 2     2    NA
## 3     2     b
```

---

<br />
<br />

<http://www.nytimes.com/movies/boxoffice/us/weekend.html> 에서 데이터를 가져와서 이번주 영화 순위와 저번주 영화순위만으로 데이터를 다시 정리했다.


```r
movie_thiswk = read.csv('weekly_thiswk.csv', stringsAsFactors = FALSE)
movie_thiswk
```

```
##    thiswk                             title
## 1       1                          War Room
## 2       2            Straight Outta Compton
## 3       3               A Walk in the Woods
## 4       4 Mission Impossible : Rogue Nation
## 5       5          The Transporter Refueled
## 6       6                         No Escape
## 7       7                        Inside Out
## 8       8           The Man From U.N.C.L.E.
## 9       9        Un Gallo Con Muchos Huevos
## 10     10                        Sinister 2
```

```r
movie_lastwk = read.csv('weekly_lastwk.csv', stringsAsFactors = FALSE)
movie_lastwk
```

```
##    lastwk                             title
## 1       1            Straight Outta Compton
## 2       2                          War Room
## 3       3 Mission Impossible : Rogue Nation
## 4       4                         No Escape
## 5       5                        Sinister 2
## 6       6           The Man From U.N.C.L.E.
## 7       7                  Hitman: Agent 47
## 8       8                           Ant-Man
## 9       9                    Jurassic World
## 10     10                          The Gift
```

---

<br />

`movie_thiswk`와 `movie_lastwk`를 left_join으로 묶어서 생기는 NA값을 처리하려고 한다


```r
mv_rank = movie_thiswk %>% 
  left_join(movie_lastwk, by = 'title')

mv_rank
```

```
##    thiswk                             title lastwk
## 1       1                          War Room      2
## 2       2            Straight Outta Compton      1
## 3       3               A Walk in the Woods     NA
## 4       4 Mission Impossible : Rogue Nation      3
## 5       5          The Transporter Refueled     NA
## 6       6                         No Escape      4
## 7       7                        Inside Out     NA
## 8       8           The Man From U.N.C.L.E.      6
## 9       9        Un Gallo Con Muchos Huevos     NA
## 10     10                        Sinister 2      5
```

lastwk 열의 NA값을 0으로 대체하려면 다음과 같이 할 수 있다


```r
mv_rank %>% 
  replace_na(list(lastwk = 0))
```

```
##    thiswk                             title lastwk
## 1       1                          War Room      2
## 2       2            Straight Outta Compton      1
## 3       3               A Walk in the Woods      0
## 4       4 Mission Impossible : Rogue Nation      3
## 5       5          The Transporter Refueled      0
## 6       6                         No Escape      4
## 7       7                        Inside Out      0
## 8       8           The Man From U.N.C.L.E.      6
## 9       9        Un Gallo Con Muchos Huevos      0
## 10     10                        Sinister 2      5
```

---

<br />
<br />

`gcookbook`패키지의 `aapl`데이터에서 2012-09-20일 이후의 데이터는 3건이 있다

9월 21일부터 10월 2일까지 날짜 데이터에 aapl 데이터를 left_join 시키고 `fill` 함수를 이용해서 처리하려고 한다


```r
library(gcookbook)
head(aapl)
```

```
##         date adj_price
## 1 1984-09-07      3.01
## 2 1984-09-14      3.17
## 3 1984-09-21      3.05
## 4 1984-09-28      2.85
## 5 1984-10-05      2.83
## 6 1984-10-12      2.58
```

```r
aapl_data = aapl %>% filter(date > '2012-09-20')

aapl_data
```

```
##         date adj_price
## 1 2012-09-21    700.09
## 2 2012-09-28    667.10
## 3 2012-10-01    659.39
```

```r
daily_price = data.frame(date = as.Date('2012-09-21', format='%Y-%m-%d')+0:11) %>% 
  left_join(aapl_data)
```

```r
daily_price
```

```
##          date adj_price
## 1  2012-09-21    700.09
## 2  2012-09-22        NA
## 3  2012-09-23        NA
## 4  2012-09-24        NA
## 5  2012-09-25        NA
## 6  2012-09-26        NA
## 7  2012-09-27        NA
## 8  2012-09-28    667.10
## 9  2012-09-29        NA
## 10 2012-09-30        NA
## 11 2012-10-01    659.39
## 12 2012-10-02        NA
```

아래와 같이 `fill`함수를 사용하면 NA값들이 직전에 나온 값으로 대체되는 것을 볼 수 있다.


```r
daily_price %>% 
  fill(adj_price)
```

```
##          date adj_price
## 1  2012-09-21    700.09
## 2  2012-09-22    700.09
## 3  2012-09-23    700.09
## 4  2012-09-24    700.09
## 5  2012-09-25    700.09
## 6  2012-09-26    700.09
## 7  2012-09-27    700.09
## 8  2012-09-28    667.10
## 9  2012-09-29    667.10
## 10 2012-09-30    667.10
## 11 2012-10-01    659.39
## 12 2012-10-02    659.39
```

