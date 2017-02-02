---
layout: post
published: true
title: dplyr advanced - data_frame
mathjax: false
featured: true
comments: true
headline: Making blogging easier for masses
categories: R
tags: jekyll
---

![cover-image](../../images/macphoto.jpg)

## data_frame

dplyr은 data.frame을 더 편리하게 사용할 수 있도록 변형된 형태의 data.frame을 제공한다

초창기부터 제공했던 `tbl_df` 을 이용하면 화면에 맞게 행과 열의 수를 제한해서 볼 수 있고

dplyr과 관련된 추가적인 정보(`group_by` 정보, column의 type, source정보 등)를 제공한다

이후에 추가된 `data_frame`은 tbl_df와 data.frame을 기반으로 하여 data.frame을 더욱 편리하게 사용할 수 있도록 여러가지 기능을 제공한다

dplyr의 기능과 궁합이 잘 맞는 데이터 형태이기 때문에 차이점을 명확하게 알고 쓴다면 도움이 많이 될 것 같다

---

아래 내용은 dplyr 패키지 내부에 있는 `data_frames` 문서를 정리하고 일부 내용을 추가했다

R에서는 dplyr 패키지를 불러온 후에 `vignette('data_frames')` 명령어로 문서를 볼 수 있으며

[CRAN 페이지](https://cran.r-project.org/web/packages/dplyr/vignettes/data_frames.html)에서도 문서를 확인할 수 있다


```r
library(dplyr)
```

```
## 
## Attaching package: 'dplyr'
## 
## The following objects are masked from 'package:stats':
## 
##     filter, lag
## 
## The following objects are masked from 'package:base':
## 
##     intersect, setdiff, setequal, union
```

<br />

## data.frame과의 차이점

<br />

data.frame은 `stringsAsFactors = FALSE` 를 해주지 않으면 문자열을 factor로 가져간다


```r
data.frame(month = month.abb) %>% sapply(class)
```

```
##    month 
## "factor"
```

data_frame은 입력한 데이터의 type을 변경하지 않는다


```r
data_frame(month = month.abb) %>% sapply(class)
```

```
##       month 
## "character"
```

---

<br />

list를 값으로 가지는 column을 쉽게 생성할 수 있다


```r
list_col = data_frame(index = 1:3,
                      rnorm = list(rnorm(10, 0, 1), 
                                   rnorm(5, 0, 1), 
                                   rnorm(7, 0, 1))
                      )
list_col[1,2][[1]]
```

```
## [[1]]
##  [1] -0.21884373 -0.83728231  0.74070271 -0.01440668  1.92528622
##  [6]  0.64657433  1.53596809  0.37297701  0.75368773  1.26919784
```


이 경우 rnorm column은 list의 형태로 출력되기 때문에

sapply 함수를 이용하면 mutate와 함께 자료를 정리할 수 있다


```r
list_col %>% 
  mutate(mean = sapply(rnorm, function(x) mean(x)))
```

```
## Source: local data frame [3 x 3]
## 
##   index     rnorm       mean
##   (int)     (chr)      (dbl)
## 1     1 <dbl[10]>  0.6173861
## 2     2  <dbl[5]> -0.2303840
## 3     3  <dbl[7]> -0.2237431
```

---

<br />

data_frame은 변수의 이름을 변경하지 않는다


```r
# space.variable
data.frame('space variable' = 1) 
```

```
##   space.variable
## 1              1
```

```r
# space variable
data_frame('space variable' = 1) 
```

```
## Source: local data frame [1 x 1]
## 
##   space variable
##            (dbl)
## 1              1
```

---

<br />

값을 계산할 때 느긋(lazy)하게 순차적으로 진행한다

다시 말하자면, dplyr의 mutate 함수를 사용하는 것처럼 data_frame을 생성할 수 있다


```r
# Error
data.frame(x = 1:5, y = 3*x) 
```
```
Error in data.frame(x = 1:5, y = 3 * x) : object 'x' not found
```


```r
data_frame(x = 1:5, y = 3*x)
```

```
## Source: local data frame [5 x 2]
## 
##       x     y
##   (int) (dbl)
## 1     1     3
## 2     2     6
## 3     3     9
## 4     4    12
## 5     5    15
```

---

<br />

## 기타 특이사항들

<br />

#### data_frame은 `row.names()`를 사용하지 않는다

<br />

tidy data의 관점에서 변수는 attribute로 관리하지 않고 테이블 안에서 변수로 직접 관리한다

---

<br />

#### data_frame에서 벡터의 재사용은 길이 1의 벡터로만 한정한다

<br />

큰 단위의 벡터에서 벡터 재사용은 버그의 빈번하게 발생시킨다

아래 예제에서 보면 x와 y 벡터는 길이가 다르지만 

data.frame에서는 y를 다시 사용하는 방식으로 길이를 맞춰서 data.frame을 생성한다

data_frame은 그러한 벡터 재사용을 허용하지 않는다


```r
data.frame(x = 1:4, y = 1:2)
```

```
##   x y
## 1 1 1
## 2 2 2
## 3 3 1
## 4 4 2
```


```r
# Error
data_frame(x = 1:4, y = 1:2) 
```
```
Error in data_frame_(lazyeval::lazy_dots(...)) : 
  arguments imply differing number of rows: 4, 2
```

---

<br />

#### data_frame은 tbl_df 클래스를 추가시킨다

<br />

따라서 기본적으로는 데이터를 호출했을 때 데이터의 일부만 보이게 된다

`print(data_frame, n = 100)` 등의 함수로 원하는 만큼의 데이터를 볼 수 있다

<br />

#### tbl_df 클래스로 인해서 [ ]의 동작도 달라진다

<br />

기존 data.frame에서는 해당 열을 벡터로 바꾸어서 출력하는 반면에 

data_frame에서는 형태를 변경하지 않는다


```r
iris_head = head(iris)
iris_df = tbl_df(iris_head)

iris_head[,'Species']
```

```
## [1] setosa setosa setosa setosa setosa setosa
## Levels: setosa versicolor virginica
```

```r
iris_df[,'Species']
```

```
## Source: local data frame [6 x 1]
## 
##   Species
##    (fctr)
## 1  setosa
## 2  setosa
## 3  setosa
## 4  setosa
## 5  setosa
## 6  setosa
```
<br />

#### data_frame으로 변경하려면 `as_data_frame()`함수를 사용하면 된다

`as.data.frame()`보다 훨씬 빠르다


```r
as_data_frame(iris)
```

```
## Source: local data frame [150 x 5]
## 
##    Sepal.Length Sepal.Width Petal.Length Petal.Width Species
##           (dbl)       (dbl)        (dbl)       (dbl)  (fctr)
## 1           5.1         3.5          1.4         0.2  setosa
## 2           4.9         3.0          1.4         0.2  setosa
## 3           4.7         3.2          1.3         0.2  setosa
## 4           4.6         3.1          1.5         0.2  setosa
## 5           5.0         3.6          1.4         0.2  setosa
## 6           5.4         3.9          1.7         0.4  setosa
## 7           4.6         3.4          1.4         0.3  setosa
## 8           5.0         3.4          1.5         0.2  setosa
## 9           4.4         2.9          1.4         0.2  setosa
## 10          4.9         3.1          1.5         0.1  setosa
## ..          ...         ...          ...         ...     ...
```
