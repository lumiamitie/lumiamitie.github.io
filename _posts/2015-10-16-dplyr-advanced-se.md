---
layout: post
published: true
title: dplyr advanced - Standard Evaluation
mathjax: false
featured: true
comments: true
headline: Making blogging easier for masses
categories: R
tags: tutorial
---

![cover-image](../../../images/old-book.jpg)

# Non-standard Evaluation

dplyr은 기본적으로 non-standard evaluation (NSE)을 사용하여 연산을 처리한다

사실 이 글을 쓰는 지금도 NSE가 정확히 어떤 것인지는 잘 모르겠다... 

모든 값을 계산하지 않고 필요할 때만 계산하는? 것이라고 알아들었기는 하지만 정확한 동작 방식은 정말 모르겠다..

내부적으로 어떻게 다른지는 알 수 없지만 한 가지 눈에 보이는 확실한 차이점은 존재한다

---

NSE는 아래 코드처럼 column name을 하나의 object 처럼 사용한다


```r
library(dplyr)
```

```r
iris %>% 
  head() %>% 
  mutate(sl2 = 2 * Sepal.Length)
```

```
##   Sepal.Length Sepal.Width Petal.Length Petal.Width Species  sl2
## 1          5.1         3.5          1.4         0.2  setosa 10.2
## 2          4.9         3.0          1.4         0.2  setosa  9.8
## 3          4.7         3.2          1.3         0.2  setosa  9.4
## 4          4.6         3.1          1.5         0.2  setosa  9.2
## 5          5.0         3.6          1.4         0.2  setosa 10.0
## 6          5.4         3.9          1.7         0.4  setosa 10.8
```

```r
iris %>% 
  group_by(Species) %>% 
  summarise(mean = mean(Sepal.Length))
```

```
## Source: local data frame [3 x 2]
## 
##      Species  mean
##       (fctr) (dbl)
## 1     setosa 5.006
## 2 versicolor 5.936
## 3  virginica 6.588
```

반면에 r의 기본 함수(`[`, `$` 등)들은 column name을 문자열의 형태로 받는다


```r
iris %>% 
  head() %>% 
  '['('Sepal.Length') 
```

```
##   Sepal.Length
## 1          5.1
## 2          4.9
## 3          4.7
## 4          4.6
## 5          5.0
## 6          5.4
```

---

dplyr에서는 filter, mutate, summarise, arrange, select, group_by 등의 함수에서 nse를 사용한다

이들 함수는 각각 se버전을 가지고 있는데, 함수 이름 뒤에 _ 를 붙이면 된다

`filter_`, `mutate_`, `summarise_`, `arrange_`, `select_`, `group_by_` 등이 각 함수의 se 버전이다

---

<br / >
<br / >

# Standard Evaluation

se버전의 함수를 사용할 때는 함수의 input값을 따옴표로 감싸진 문자열로 넣게 된다

se버전에서 함수에 인자를 넘기는 방법은 크게 세 가지가 있다


```r
# String
iris %>% 
  head %>% 
  mutate_('mean(Sepal.Length)')
```

```
##   Sepal.Length Sepal.Width Petal.Length Petal.Width Species
## 1          5.1         3.5          1.4         0.2  setosa
## 2          4.9         3.0          1.4         0.2  setosa
## 3          4.7         3.2          1.3         0.2  setosa
## 4          4.6         3.1          1.5         0.2  setosa
## 5          5.0         3.6          1.4         0.2  setosa
## 6          5.4         3.9          1.7         0.4  setosa
##   mean(Sepal.Length)
## 1               4.95
## 2               4.95
## 3               4.95
## 4               4.95
## 5               4.95
## 6               4.95
```


```r
# quote()
iris %>% 
  head %>% 
  mutate_(quote(mean(Sepal.Length)))
```

```
##   Sepal.Length Sepal.Width Petal.Length Petal.Width Species
## 1          5.1         3.5          1.4         0.2  setosa
## 2          4.9         3.0          1.4         0.2  setosa
## 3          4.7         3.2          1.3         0.2  setosa
## 4          4.6         3.1          1.5         0.2  setosa
## 5          5.0         3.6          1.4         0.2  setosa
## 6          5.4         3.9          1.7         0.4  setosa
##   mean(Sepal.Length)
## 1               4.95
## 2               4.95
## 3               4.95
## 4               4.95
## 5               4.95
## 6               4.95
```


```r
# formula
iris %>% 
  head %>% 
  mutate_(~mean(Sepal.Length))
```

```
##   Sepal.Length Sepal.Width Petal.Length Petal.Width Species
## 1          5.1         3.5          1.4         0.2  setosa
## 2          4.9         3.0          1.4         0.2  setosa
## 3          4.7         3.2          1.3         0.2  setosa
## 4          4.6         3.1          1.5         0.2  setosa
## 5          5.0         3.6          1.4         0.2  setosa
## 6          5.4         3.9          1.7         0.4  setosa
##   mean(Sepal.Length)
## 1               4.95
## 2               4.95
## 3               4.95
## 4               4.95
## 5               4.95
## 6               4.95
```

---

이 중에서 가장 좋은 방법은 formula를 쓰는 것이다

따옴표나 quote를 사용할 때는 해당 입력값이 어느 environment에 존재하는지 못찾게 되는 경우도 있다


```r
divide_by_two = function(num) return(num/2)

# 제대로 실행된다
iris %>% 
  head %>% 
  mutate_(~divide_by_two(Sepal.Length))
```

```
##   Sepal.Length Sepal.Width Petal.Length Petal.Width Species
## 1          5.1         3.5          1.4         0.2  setosa
## 2          4.9         3.0          1.4         0.2  setosa
## 3          4.7         3.2          1.3         0.2  setosa
## 4          4.6         3.1          1.5         0.2  setosa
## 5          5.0         3.6          1.4         0.2  setosa
## 6          5.4         3.9          1.7         0.4  setosa
##   divide_by_two(Sepal.Length)
## 1                        2.55
## 2                        2.45
## 3                        2.35
## 4                        2.30
## 5                        2.50
## 6                        2.70
```


```r
# 오류 발생
iris %>% 
  head %>% 
  mutate_('divide_by_two(Sepal.Length)')
```

```
Error: could not find function "divide_by_two"
```


```r
# 오류 발생
iris %>% 
  head %>% 
  mutate_(quote(divide_by_two(Sepal.Length)))
```

```
Error: could not find function "divide_by_two"
```

---

<br />
<br />

여러 가지 input을 한꺼번에 입력하거나, 변수명을 지정해야 할 때에는 `.dots` argument에 값을 넘기면 된다

setNames 함수를 사용해서 함수의 내용과 변수명을 함께 지정해주면 된다


```r
iris %>% 
  summarise_(.dots = setNames(c('mean(Sepal.Length)', 'sd(Sepal.Length)'), c('mean', 'sd')))
```

```
##       mean        sd
## 1 5.843333 0.8280661
```


```r
iris %>% 
  summarise_(.dots = setNames(c(~mean(Sepal.Length), ~sd(Sepal.Length)), c('mean', 'sd')))
```

```
##       mean        sd
## 1 5.843333 0.8280661
```

---

이러한 se버전의 함수를 어떻게 활용할까?

변수를 만들 때 고정된 문자열과 변하는 숫자, 문자열을 이용해 많은 수의 변수를 생성해야 한다고 생각해보자

예를 들면


```r
iris %>%
  select(Sepal.Length) %>% 
  head %>% 
  mutate(sl10 = Sepal.Length + 10,
         sl20 = Sepal.Length + 20,
         sl30 = Sepal.Length + 30)
```

```
##   Sepal.Length sl10 sl20 sl30
## 1          5.1 15.1 25.1 35.1
## 2          4.9 14.9 24.9 34.9
## 3          4.7 14.7 24.7 34.7
## 4          4.6 14.6 24.6 34.6
## 5          5.0 15.0 25.0 35.0
## 6          5.4 15.4 25.4 35.4
```

위와 같은 형태로 변수를 만들어야 한다고 생각해보자

위 예제는 3개만 만드니까 다 타이핑할 수 있겠지만

저렇게 변수를 10개 이상? 100개를 만들어야 한다면?

<br />

이러한 상황에서 se버전의 함수를 이용하면 해결할 수 있다



```r
iris %>% 
  select(Sepal.Length) %>% 
  head %>% 
  mutate_(
    .dots = setNames(
              sapply(c(10,20,30), function(x) paste0('Sepal.Length + ', x, collapse = ' ')),
              sapply(c(10,20,30), function(x) paste0('sl', x, collapse = ' '))
            )
    )
```

```
##   Sepal.Length sl10 sl20 sl30
## 1          5.1 15.1 25.1 35.1
## 2          4.9 14.9 24.9 34.9
## 3          4.7 14.7 24.7 34.7
## 4          4.6 14.6 24.6 34.6
## 5          5.0 15.0 25.0 35.0
## 6          5.4 15.4 25.4 35.4
```

`paste0()`는 둘 이상의 문자열을 하나로 묶어주는 역할을 한다

`sapply` 는 첫 번째의 인자의 요소들이 차례대로 두 번째 인자의 함수에 parameter로 들어가서 값이 계산되고

그 결과물을 벡터 등으로 묶어서 반환해준다

for문을 짧은 함수 형태로 사용하는 것과 비슷한 효과를 낼 수 있다

---

<br />

일반적인 상황에서 데이터를 정제하고 분석할 때는 크게 필요를 느끼지 못할 수도 있지만

엄청나게 반복적인 작업을 해야할 때에는 이러한 방식으로 연산하면 시간을 크게 절약할 수도 있다
