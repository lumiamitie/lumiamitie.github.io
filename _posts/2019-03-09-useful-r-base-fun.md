---
layout: post
published: true
title: Useful R Base Functions
mathjax: false
featured: false
comments: true
headline: Useful R Base Functions
categories: R
tags: R
---

# 유용한 R Base 함수들

이 문서에서는 평소 유용하게 사용할 수 있는 R 기본함수들에 대해서 정리해두려고 한다. 
각각의 함수들을 아래와 같이 카테고리로 나누어서 정리하고, 간단한 설명과 사용법을 정리할 예정이다.
문서의 내용은 계속해서 추가될 예정이다. 마지막으로 업데이트된 날짜는 **2019-03-09**이다.

- 수치형 자료
- 문자열 처리
- 데이터 다루기
- 모델링
- Miscellaneous

## 수치형 자료

TODO

## 문자열 처리

TODO

## 데이터 다루기

### head

- `head`는 vector, matrix, data.frame 등 다양한 자료형들의 앞부분만 볼 수 있게 하는 함수이다
- 데이터프레임의 경우 `head(데이터프레임, 보여줄 행의 개수)` 의 형태로 사용한다
    - 기본적으로는 위에서부터 6개 행을 보여준다


```r
# 기본적으로 맨 위 6개행을 보여준다
head(iris)
```

```
##   Sepal.Length Sepal.Width Petal.Length Petal.Width Species
## 1          5.1         3.5          1.4         0.2  setosa
## 2          4.9         3.0          1.4         0.2  setosa
## 3          4.7         3.2          1.3         0.2  setosa
## 4          4.6         3.1          1.5         0.2  setosa
## 5          5.0         3.6          1.4         0.2  setosa
## 6          5.4         3.9          1.7         0.4  setosa
```


```r
# n=3으로 지정해서 앞에서부터 3개 행만 확인한다
head(iris, n = 3)
```

```
##   Sepal.Length Sepal.Width Petal.Length Petal.Width Species
## 1          5.1         3.5          1.4         0.2  setosa
## 2          4.9         3.0          1.4         0.2  setosa
## 3          4.7         3.2          1.3         0.2  setosa
```


### tail

- `tail` 함수는 head와 반대로 뒤에서부터 데이터를 보여준다
- 데이터프레임의 경우 `tail(데이터프레임, 보여줄 행의 개수)` 의 형태로 사용한다
    - 기본적으로는 아래부터 6개 행을 보여준다


```r
tail(iris)
```

```
##     Sepal.Length Sepal.Width Petal.Length Petal.Width   Species
## 145          6.7         3.3          5.7         2.5 virginica
## 146          6.7         3.0          5.2         2.3 virginica
## 147          6.3         2.5          5.0         1.9 virginica
## 148          6.5         3.0          5.2         2.0 virginica
## 149          6.2         3.4          5.4         2.3 virginica
## 150          5.9         3.0          5.1         1.8 virginica
```


```r
tail(iris, n = 3)
```

```
##     Sepal.Length Sepal.Width Petal.Length Petal.Width   Species
## 148          6.5         3.0          5.2         2.0 virginica
## 149          6.2         3.4          5.4         2.3 virginica
## 150          5.9         3.0          5.1         1.8 virginica
```


### str

- `str` 함수는 주어진 R 객체의 내부 구조를 보여주는 함수다
- `str(object)` 형태로 사용한다
    - 데이터프레임에 적용할 겅우, <u>행/열의 수</u>와 <u>각 변수의 type</u>, <u>데이터의 일부</u>를 표시해준다


```r
# 문자열 벡터에 적용
str(letters)
```

```
##  chr [1:26] "a" "b" "c" "d" "e" "f" "g" "h" "i" ...
```



```r
# 데이터프레임에 적용
str(iris)
```

```
## 'data.frame':	150 obs. of  5 variables:
##  $ Sepal.Length: num  5.1 4.9 4.7 4.6 5 5.4 4.6 5 4.4 4.9 ...
##  $ Sepal.Width : num  3.5 3 3.2 3.1 3.6 3.9 3.4 3.4 2.9 3.1 ...
##  $ Petal.Length: num  1.4 1.4 1.3 1.5 1.4 1.7 1.4 1.5 1.4 1.5 ...
##  $ Petal.Width : num  0.2 0.2 0.2 0.2 0.2 0.4 0.3 0.2 0.2 0.1 ...
##  $ Species     : Factor w/ 3 levels "setosa","versicolor",..: 1 1 1 1 1 1 1 1 1 1 ...
```

## 모델링

TODO

## Miscellaneous

### is.na

- NA (Not Available) 값일 들어오면 TRUE를 반환한다
- `is.na(value)`


```r
is.na(NA)
```

```
## [1] TRUE
```


```r
is.na(c(1,2,NA,4))
```

```
## [1] FALSE FALSE  TRUE FALSE
```


### ifelse

- `ifelse` 함수는 `IF ... ELSE ...` 문을 하나의 함수로 처리할 수 있게 해준다
- `ifelse(조건, 참일 경우 값, 거짓일 경우 값)`


```r
# 2로 나누었을 때 나머지가 1이면 Odd, 0이면 Even으로 처리해보자
x = 1:10
ifelse(x %% 2 == 1, 'Odd', 'Even')
```

```
##  [1] "Odd"  "Even" "Odd"  "Even" "Odd"  "Even" "Odd"  "Even" "Odd"  "Even"
```


```r
# NA값을 발견할 경우 0으로 바꿔보자
x2 = c(1,2,3,NA,5)
ifelse(is.na(x2), 0, x2)
```

```
## [1] 1 2 3 0 5
```

- `ifelse` 함수의 경우 테스트하려는 조건 및 결과값에 따라 타입이 변경될 수 있다
    - 아래 예제를 보면 TRUE일 때의 값은 integer, FALSE일 때의 값은 double 타입을 갖는다
        - 테스트 argument에 NA값이 들어가면 결과물이 logical
        - TRUE 값이 들어가면 integer
        - FALSE 값이 들어가면 double
        - 세 가지 타입 모두 존재하는 경우에는 double 타입으로 반환되는 것을 볼 수 있다
    - 이러한 특성은 분석하는 과정에서 편리하게 활용할 수도 있지만, 오류가 발생했을 때 원인을 발견하기 어렵게 만드는 원인이 된다
- 이러한 문제를 해결하기 위해 `dplyr` 라이브러리에는 비슷한 기능을 제공하는 `if_else` 함수가 존재한다
    - `if_else` 에서는 아래와 같은 상황에서 에러가 발생한다


```r
value_for_ture = c(1L, 2L, 3L)
value_for_false = c(0.1, 0.2, 0.3)

ifelse(NA, value_for_ture, value_for_false)                 # NA   : <logical>
ifelse(TRUE, value_for_ture, value_for_false)               # 1    : <integer>
ifelse(FALSE, value_for_ture, value_for_false)              # 0.1  : <double>
ifelse(c(NA, TRUE, FALSE), value_for_ture, value_for_false) # NA 2.0 0.3 : <double>
```
