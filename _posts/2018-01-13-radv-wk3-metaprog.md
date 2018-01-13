---
layout: post
published: true
title: MetaProgramming (R-adv week3)
mathjax: false
featured: true
comments: true
headline: Metaprogramming in R (NSE, Quasiquotation)
categories: R
tags: R metaprogramming NSE quasiquotation
---

![cover-image](/images/taking-notes.jpg)

# MetaProgramming

 위키피디아에 따르면 [메타프로그래밍](https://ko.wikipedia.org/wiki/메타프로그래밍) 이란 자기 자신 혹은 다른 컴퓨터 프로그램을 데이터로 처리함으로써 **프로그램을 작성/수정하는 프로그램을 작성**하는 것을 말한다. 더 단순하게 말하자면 코드가 다른 코드를 수정할 수 있다는 것이다. 메타프로그래밍은 R에서 상당히 중요한 위치를 차지한다. R은 단순한 프로그래밍 언어가 아니라, 인터랙티브하게 데이터를 탐색하는 환경이기 때문이다. R 언어 자체도 그렇고, 많은 라이브러리에서 분석 작업의 편의를 위해 메타프로그래밍 기법들이 많이 활용되었다. R에서 메타프로그래밍이 적용되는 사례 중 가장 일반적인 것은, 데이터프레임에서 column을 선택할 때 global environment에 존재하는 변수처럼 사용할 수 있다는 점이다. 이러한 특성은 `dplyr`, `ggplot2` 등 많은 라이브러리에서 데이터를 편리하게 다룰 수 있도록 하는 특정한 문법을 제공할 수 있게 해주었다.

 이번 3주차 스터디에서는 사용자의 작업을 편리하게 만들 수 있는 기법들에 대해서 살펴보려고 한다. 워낙 광범위하고 복잡한 분야이기 때문에, 우리는 R에서 많이 활용하는 두 가지 개념인 **1.Non-Standard Evaluation**과 **2.Quasiquotation**에 대해 알아본다. 그리고 그 중에서도 **기존에 우리가 많이 사용하던 함수들이 어떤 식으로 구현되어 있는지**를 중심으로 살펴보려고 한다.

<br /><br />

# 1. NSE: Non-Standard Evaluation

기본적으로 expression을 평가(eval)하지 않은 채로 잡아두었다가 일부 변수를 교체하고 필요한 시점에 계산하는 방식으로 사용한다.

<br />

## 1.1 왜 쓸까?

인터렉티브한 데이터 분석 환경에서 사용자의 타이핑을 줄이거나 편의를 제공하는 역할을 한다. R에서는 데이터프레임의 column을 변수처럼 다룰 수 있게 하거나, 다양한 DSL (Domain Specific Language)를 정의하고 활용하는데 주로 활용된다.

<br /><br />

## 1.2 Base R의 관련 함수들

- `quote`: expression을 계산하지 않고 그대로 받는다.
- `substitute`: global env 에서는 quote와 동일. 함수 내부에서는 원래 정의된 변수를 함수의 인자로 받은 expression으로 교체해주는 역할을 한다.
- `deparse` : 계산되지 않은 expression을 문자열로 바꾼다
- `eval` : expression을 계산한다

<br />

## 1.3 subset 구현 예제

### 1.3.1 Basic

Base R에 있는 `subset` 함수는 벡터, 매트릭스, 데이터프레임 등을 받아서 특정 조건식에 맞는 부분집합을 반환한다. (tidyverse 에서는 `dplyr:filter`가 이와 비슷한 기능을 한다) NSE가 어떤 방식으로 동작하는지 확인해보기 위해서 데이터프레임 한정으로 기존 `subset`과 (`subset.data.frame`) 동일한 기능을 수행하는 subset2 함수를 구현해보자.


```r
subset2 = function(df, cond) {
  cond_call = substitute(cond)
  idx = eval(cond_call, df)
  df[idx, ]
}
```


```r
subset2(iris, Sepal.Length > 7 & Petal.Width > 2)
```

```
##     Sepal.Length Sepal.Width Petal.Length Petal.Width   Species
## 103          7.1         3.0          5.9         2.1 virginica
## 106          7.6         3.0          6.6         2.1 virginica
## 110          7.2         3.6          6.1         2.5 virginica
## 118          7.7         3.8          6.7         2.2 virginica
## 119          7.7         2.6          6.9         2.3 virginica
## 136          7.7         3.0          6.1         2.3 virginica
```

```r
#     Sepal.Length Sepal.Width Petal.Length Petal.Width   Species
# 103          7.1         3.0          5.9         2.1 virginica
# 106          7.6         3.0          6.6         2.1 virginica
# 110          7.2         3.6          6.1         2.5 virginica
# 118          7.7         3.8          6.7         2.2 virginica
# 119          7.7         2.6          6.9         2.3 virginica
# 136          7.7         3.0          6.1         2.3 virginica
```

위 코드를 자세히 살펴보자

<br />

1. **`substitute(cond)`는 주어진 조건문을 평가하지 않고 캡쳐**하는 역할을 한다.

우리는 아래와 같이 열 이름을 변수처럼 사용해야 한다. 그런데 iris 데이터셋의 `Sepal.Length` 를 예로 들면, 이 변수는 현재 Global Environment에는 존재하지 않는 변수다. 우리가 `Sepal.Length = 1` 처럼 사전에 해당 이름으로 변수를 생성하지 않았기 때문에, 그 이름을 가진 변수는 아직은 없다. (만약 있다면? 무엇인가 문제가 발생할 수 있다. 조금 밑에서 확인해보자) 따라서 지금 당장은 expression을 평가(하는 순간 변수가 없다고 에러가 날 테니)하지 않고 캡쳐만 해둔다. 

`quote` 대신 `substitute` 를 사용하는 이유는 무엇일까? `quote` 함수는 정말 단순하게 해당 함수에 들어온 인자를 반환할 뿐이다. 따라서 위 예제에서 `cond_call = quote(cond)`라고 정의한다면, 조건식을 아무리 바꾸어넣더라도 함수 내부에서 정의된 `cond` 만을 반환한다. 하지만 `substitute` 함수는 이름 자체로 식을 대치시켜주기 때문에, `cond = a > 10`라는 식이 들어가면 `substitute(cond)` 는 `a > 10` 이라는 expression으로 변환해준다.

<br />

2. **`eval(cond_call, df)`은 특정 데이터프레임을 기준으로 하여 조건식을 평가**한다.

`Sepal.Length` 라는 변수는 Global Environment (우리가 콘솔에서 변수를 생성하면 기본적으로는 여기에 생성된다)에는 없지만 `iris` 라는 환경에는 존재하는 변수다. 따라서 해당 데이터프레임을 기준으로 식을 평가(실행)하면, 각 row마다 해당 조건에 맞는지 여부를 판별하고 `nrow(df)` 길이의 벡터가 반환된다. 그리고 이 결과물로 데이터프레임을 필터링해서 반환하면 끝.

<br />

### 1.3.2 Scoping Issues

위에서 구현한 subset2 함수는 잘 동작하는 것 같지만, 변수에 들어있는 값이 같더라도 변수 이름에 따라서 예상치 못한 동작을 할 수도 있다. subset2 함수 안에 들어있는 변수명으로 동일한 값을 대입해보자


```r
a = 7.5
df = 7.5
cond = 7.5
cond_call = 7.5
```


```r
subset2(iris, Sepal.Length > a)
#     Sepal.Length Sepal.Width Petal.Length Petal.Width   Species
# 106          7.6         3.0          6.6         2.1 virginica
# 118          7.7         3.8          6.7         2.2 virginica
# 119          7.7         2.6          6.9         2.3 virginica
# 123          7.7         2.8          6.7         2.0 virginica
# 132          7.9         3.8          6.4         2.0 virginica
# 136          7.7         3.0          6.1         2.3 virginica

subset2(iris, Sepal.Length > df)
# Warning message:
#   In Ops.factor(left, right) : ‘>’ not meaningful for factors

subset2(iris, Sepal.Length > cond)
# Error in eval(expr, envir, enclos) : object 'Sepal.Length' not found

subset2(iris, Sepal.Length > cond_call)
# [1] Sepal.Length Sepal.Width  Petal.Length Petal.Width  Species     
# <0 rows> (or 0-length row.names)
```

함수 내부에서 사용한 변수 이름을 쓰면 에러가 발생하는 것을 볼 수 있다. 이러한 문제는 `subset2`에서 사용한 함수 `eval()`이 함수 내부의 변수를 참조해버려서 발생한다. 데이터프레임 내부에 원하는 변수가 존재하지 않았다면 그 다음으로는 함수 내부의 변수를 탐색한다. 따라서 우리가 원하는 값이 아니라 다른 값으로 대치되어 문제가 생긴다.

일단, 단기적으로 위 문제를 해결하기 위해서는 `eval` 함수의 옵션을 조정하면 된다. `eval(expr, envir, enclos)` 함수에서 세 번째 인자 enclos는 envir에 원하는 변수가 없을 경우에 참조하는 environment 위치를 나타낸다.

`eval()` 함수를 수정한 `subset3()` 함수를 만들어보자


```r
subset3 = function(df, cond) {
  cond_call = substitute(cond)
  # parent.frame()은 subset3 함수가 "실행"되는 environment를 말한다
  idx = eval(cond_call, df, parent.frame())
  df[idx, ]
}
```


```r
subset3(iris, Sepal.Length > df)
```

```
##     Sepal.Length Sepal.Width Petal.Length Petal.Width   Species
## 106          7.6         3.0          6.6         2.1 virginica
## 118          7.7         3.8          6.7         2.2 virginica
## 119          7.7         2.6          6.9         2.3 virginica
## 123          7.7         2.8          6.7         2.0 virginica
## 132          7.9         3.8          6.4         2.0 virginica
## 136          7.7         3.0          6.1         2.3 virginica
```

```r
subset3(iris, Sepal.Length > cond)
```

```
##     Sepal.Length Sepal.Width Petal.Length Petal.Width   Species
## 106          7.6         3.0          6.6         2.1 virginica
## 118          7.7         3.8          6.7         2.2 virginica
## 119          7.7         2.6          6.9         2.3 virginica
## 123          7.7         2.8          6.7         2.0 virginica
## 132          7.9         3.8          6.4         2.0 virginica
## 136          7.7         3.0          6.1         2.3 virginica
```

```r
subset3(iris, Sepal.Length > cond_call)
```

```
##     Sepal.Length Sepal.Width Petal.Length Petal.Width   Species
## 106          7.6         3.0          6.6         2.1 virginica
## 118          7.7         3.8          6.7         2.2 virginica
## 119          7.7         2.6          6.9         2.3 virginica
## 123          7.7         2.8          6.7         2.0 virginica
## 132          7.9         3.8          6.4         2.0 virginica
## 136          7.7         3.0          6.1         2.3 virginica
```

수정된 함수는 제대로 동작한다.

<br />

### 1.3.3 Quoted Expression

이제 우리가 만든 함수가 다른 함수 내부에서 실행되는 상황을 테스트해보자. 


```r
subset_test = function(df, cond) {
  subset3(df, cond)
}

subset_test(iris, Species == 'setota')
# Error in eval(expr, envir, enclos) : object 'Species' not found

Species = 'aaa'
subset_test(iris, Species == 'setota')
# [1] Sepal.Length Sepal.Width  Petal.Length Petal.Width  Species     
# <0 rows> (or 0-length row.names)
```

아까는 잘 동작하던 함수에서 에러가 발생했다. 심지어 Species라는 변수가 존재할 경우에는 또 다른 문제가 발생하는 것을 볼 수 있다. 

이 문제는 `subset3()` 에서 `cond_call` 이 실행될 때 `cond` expression에 정의된 Species라는 변수를 찾지 못해서 발생한다. `parent_env`에서 Species 변수를 찾지만, `subset_test`  함수 내부에는 그러한 변수가 존재하지 않는다. 따라서 에러가 발생한다.

`substitute` 등을 활용하여 만들어 놓은 코드는 사용하는 사람이 타이핑해야하는 코드량을 줄이고 편리하고 분석을 할 수 있게 해준다. 하지만 주의해서 사용하지 않으면 위와 같이 문제가 발생할 가능성 또한 존재한다. 안전한 작업을 위해서는 standard evaluation을 이용한 다른 버전의 함수(Escape Hatch)를 작성할 필요가 있다. Quoted Expression 자체를 인자로 받는 새로운 함수를 만들고, 함수 뒤에 `_q` 를 붙여서 표기해두자.


```r
subset4_q = function(df, cond) {
  idx = eval(cond, df, parent.frame())
  df[idx, ]
}
subset_test2 = function(df, cond) {
  subset4_q(df, substitute(cond))
}

head( subset_test2(iris, Species == 'setosa') )
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

이제 위에서 만든 `subset4_q` 를 바탕으로 NSE 버전의 함수를 작성할 수 있다
 

```r
subset4 = function(df, cond) {
  subset4_q(df, substitute(cond))
}
```

위 과정을 응용해서 다른 함수를 만들어보자. 조건에 맞는 행으로 필터링한 뒤 특정 n개의 행을 추출하는 함수는 다음과 같이 작성할 수 있다.


```r
shuffle = function(df, cond, n = 10) {
  sample_df = function(df, n) df[sample(nrow(df), n),]
  sample_df(subset4_q(df, substitute(cond)), n)
}

shuffle(iris, Species == 'setosa')
```

```
##    Sepal.Length Sepal.Width Petal.Length Petal.Width Species
## 2           4.9         3.0          1.4         0.2  setosa
## 29          5.2         3.4          1.4         0.2  setosa
## 18          5.1         3.5          1.4         0.3  setosa
## 9           4.4         2.9          1.4         0.2  setosa
## 36          5.0         3.2          1.2         0.2  setosa
## 19          5.7         3.8          1.7         0.3  setosa
## 40          5.1         3.4          1.5         0.2  setosa
## 20          5.1         3.8          1.5         0.3  setosa
## 48          4.6         3.2          1.4         0.2  setosa
## 50          5.0         3.3          1.4         0.2  setosa
```

<br />

`dplyr` 패키지에서는 이러한 문제로 두 가지 버전의 함수를 제공해왔다. (~ 0.5 버전까지. 현재는 아래에서 함께 살펴볼 tidyeval 방식으로 전환하였다) NSE 버전의 기존 함수와 (`select`, `mutate`, `filter` 등등) SE 버전의 함수가 (`select_`, `mutate_`, `filter_` 등) 함께 존재했었는데, 해당 함수들이 왜 필요했던 것인지 알 수 있는 사례라고 볼 수 있다.

<br />

## 1.4 기타 특수한 상황들

### 1.4.1 옵션을 통한 NSE 제한

Base R의 일부 함수는 option을 통해 NSE 기능을 제한하는 경우도 있다. 예를 들면 `library` 함수의 경우, `character.only=TRUE` 옵션을 설정할 경우 NSE가 동작하지 않도록 제한된다.


```r
hms = 'glue'
library(hms) # hms 라이브러리가 로드됨
library(hms, character.only = TRUE) # glue 라이브러리가 로드됨
```

<br />

### 1.4.2 substitute를 이용한 expression 치환

만약 `subset4_q` 같은 함수가 존재하지 않거나 `character.only` 등 NSE를 제한하는 옵션이 없다면 어떻게 해야 할까? 이런 경우에는 `substitute` 함수를 가지고 해결할 수 있다.

`substitute` 함수는 global environment 에서 동작할 경우에는 `quote` 함수와 동일한 역할을 한다. 하지만 함수 내부에서 사용할 경우 expression 자체를 수정할 수 있다. global environment에서도 expression을 수정할 수 있는 기능을 원한다면 `pryr::subs` 함수를 참고하면 된다.

아래 함수는 `substitute` 를 활용해 expression을 변형한다. 예를들면 `with(data, plot(y ~ x, ...))` 는 disp와 mpg, mtcars 인자가 들어온다면 `with(mtcars, plot(mpg ~ disp, ...))` 라는 코드로 치환되어서 실행된다.


```r
plot_scatter_loess = function(x, y, data, ...) {
  plot_call = substitute( with(data, plot(y ~ x, ...)) )
  model_call = substitute( loess(y ~ x, data = data) )
  lines_call = substitute( lines(sort(x), predict(m_loess, sort(x)), lty = 2) )
  
  eval(plot_call)
  m_loess = eval(model_call)
  # eval(lines_call, data, parent.frame()) # 이렇게 하면 마크다운 knit가 안됨...
  eval(lines_call, data)
  
  invisible(data)
}
```


```r
plot_scatter_loess(disp, mpg, mtcars, main = 'LOESS Curve : mtcars data')
```

![](/images/post_image/radv_wk3_metaprog/unnamed-chunk-13-1.png)


<br />

## 1.5 참조 투명성 (Referential Transparency)

NSE의 가장 큰 문제는 **참조 투명성**이 깨어지기 쉽다는 것이다. 

임의의 함수 f가 참조 투명성을 가지고 있다면, `a = b = 20` 일 때, `f(a) = f(b) = f(20)` 이 성립해야 한다. 하지만 Scoping Issues 절의 예제들을 살펴보면 `a = cond = 7.5`이지만 `f(a) = f(7.5) != f(cond)` 가 되어 참조투명성이 깨어진 것을 볼 수 있다. 또한 NSE 버전의 함수를 다른 함수 내부에서 사용하는 경우에도 문제가 생길 수 있다는 것을 확인했다.

모든 함수들에서 참조 투명성이 지켜져야 하는 것은 아니다. 코드를 짜는데 가장 중요한 함수 중 하나라고 볼 수 있는 assignment operator `<-` 도 참조투명성이 보장된 함수는 아니다. 다만 중요한 것은 해당 함수에서 참조 투명성이 깨어지면서 우리가 얻을 수 있는 이익이 얼마나 되는가? 라는 선택의 문제다. 

새로운 함수를 작성할 때는 NSE를 사용하여 얻을 수 있는 이익과 손해를 구분하고, Escape Hatch를 제공하여 필요할 경우 참조투명성을 달성할 수 있도록 해야 한다. 

<br /><br />

# 2. Quasiquotation

Quasiquotation 은 Lisp에서 **프로그램을 생성하는 프로그램**을 만들기 위해 주로 사용했던 용어이다. 동작시킬 코드의 중간중간을 비워두거나 파라미터처럼 세팅해두고, 나중에 코드를 완성시켜서 수행한다. 쉽게 말하면 코드 자체를 **템플릿**처럼 활용하는 것이다.

<br />

## 2.1 Base R (using bquote)

Base R에는 `bquote` 라는 함수가 있어서 Quasiquotation을 가능하게 한다. 하지만 Base R에 함수 중에서 bquote를 사용해 Quasiquotation을 구현한 경우는 거의 없다. 또한 기능에 제한이 있다. (unquoting-splicing이 불가능)

여기서는 이런 함수가 있다는 것만 확인하고 넘어가도록 하자.


```r
x = quote((x + y + z))
bquote(- .(x) / 2) # -(x + y + z)/2
```

```
## -(x + y + z)/2
```

<br /><br />

## 2.2 lazyeval (using Formula)

`lazyeval`은 0.5 버전까지의 `dplyr`에서 NSE 처리를 담당했던 라이브러리이다. formula를 통해 명시적으로 expression 을 다룬다.

<br />

### 2.2.1 Basics

`lazyeval` 라이브러리에서는 formula (`~`) 를 사용해 명시적인 quote 작업을 수행한다. 


```r
x = 10
lazyeval::f_eval(~ x) # 10
lazyeval::f_eval(~ x, list(x = 30)) # 30
lazyeval::f_eval(~ f(x), list(x = 10, f = function(x) x * 20)) # 200
lazyeval::f_eval(~ mean(Sepal.Length), data = iris) # 5.843333
```

<br />

NSE를 사용할 때는 Scoping이 모호해지는 경우가 있다. 이러한 문제를 방지하기 위해 `lazyeval` 에서는 `.env`, `.data` 라는 두 개의 키워드를 정의해 두었다

- `.env` : formula의 envrionment에 바인딩된다
- `.data` : data.frame에 바인딩 된다

아래 예제를 보면 동일하게 x라는 오브젝트를 탐색하지만 바인딩 대상에 따라 다른 값이 출력되는 것을 볼 수 있다.


```r
x = 10
mydata <- data.frame(x = 100, y = 1)
lazyeval::f_eval(~ .env$x, data = mydata) # 10
lazyeval::f_eval(~ .data$x, data = mydata) # 100
```

<br />

`lazyeval::f_eval`을 이용해서 subset을 다시 구현해보자.


```r
subset_lz_ = function(df, cond) {
  idx = lazyeval::f_eval(cond, df)
  df[idx, ]
}
subset_lz_(iris, ~ Sepal.Length > 7.5)
```

```
##     Sepal.Length Sepal.Width Petal.Length Petal.Width   Species
## 106          7.6         3.0          6.6         2.1 virginica
## 118          7.7         3.8          6.7         2.2 virginica
## 119          7.7         2.6          6.9         2.3 virginica
## 123          7.7         2.8          6.7         2.0 virginica
## 132          7.9         3.8          6.4         2.0 virginica
## 136          7.7         3.0          6.1         2.3 virginica
```

```r
subset_lz_(iris, ~ .data$Sepal.Length > 7.5)
```

```
##     Sepal.Length Sepal.Width Petal.Length Petal.Width   Species
## 106          7.6         3.0          6.6         2.1 virginica
## 118          7.7         3.8          6.7         2.2 virginica
## 119          7.7         2.6          6.9         2.3 virginica
## 123          7.7         2.8          6.7         2.0 virginica
## 132          7.9         3.8          6.4         2.0 virginica
## 136          7.7         3.0          6.1         2.3 virginica
```

<br />

`lazyeval::f_capture` 를 통해 expression을 formula로 변경할 수 있다. 명시적인 formula 없이 NSE를 통해 expression 처리하는 함수는 아래와 같은 방법으로 작성할 수 있다.


```r
subset_lz = function(df, cond) {
  subset_lz_(df, lazyeval::f_capture(cond))
}
subset_lz(iris, Sepal.Length > 7.5)
```

```
##     Sepal.Length Sepal.Width Petal.Length Petal.Width   Species
## 106          7.6         3.0          6.6         2.1 virginica
## 118          7.7         3.8          6.7         2.2 virginica
## 119          7.7         2.6          6.9         2.3 virginica
## 123          7.7         2.8          6.7         2.0 virginica
## 132          7.9         3.8          6.4         2.0 virginica
## 136          7.7         3.0          6.1         2.3 virginica
```

```r
subset_lz(iris, .data$Sepal.Length > 7.5)
```

```
##     Sepal.Length Sepal.Width Petal.Length Petal.Width   Species
## 106          7.6         3.0          6.6         2.1 virginica
## 118          7.7         3.8          6.7         2.2 virginica
## 119          7.7         2.6          6.9         2.3 virginica
## 123          7.7         2.8          6.7         2.0 virginica
## 132          7.9         3.8          6.4         2.0 virginica
## 136          7.7         3.0          6.1         2.3 virginica
```

<br />

### 2.2.2 Quasiquotation in lazyeval

`lazyeval`에서 qusaiquotattion은 `f_interp` 함수를 통해서 지원한다. unquote는 `uq`, unquote-splicing은 `uqs` 함수를 사용한다. unquote-splicing은 파이썬의 `*args`, `**kargs` 와 유사한 형태로 활용할 수 있다.


```r
v = ~cyl
extra_args = list(na.rm = FALSE)

full_expr = withr::with_package('lazyeval', { 
  f_interp(~ mean(uq(v), uqs(extra_args))) 
})
# ~mean(cyl, na.rm = FALSE)

lazyeval::f_eval(full_expr, mtcars)
```

```
## [1] 6.1875
```

```r
# 6.1875
```

<br />

위에서 살펴본 예시들을 사용해 **데이터 프레임에서 특정 열의 평균을 계산하는 함수**를 작성해보자. 


```r
get_mean = function(df, col, extra_args = list(na.rm = TRUE)) {
  full_expr = withr::with_package('lazyeval', {
    f_interp(~ mean(uq(col), uqs(extra_args)))
  })
  
  lazyeval::f_eval(full_expr, df)
}
```


```r
get_mean(mtcars, ~cyl) # 6.1875
```

```
## [1] 6.1875
```

```r
get_mean(mtcars, ~cyl, list(na.rm = FALSE))
```

```
## [1] 6.1875
```

<br /><br />

## 2.3 tidyeval (rlang package)

`dplyr` 라이브러리의 0.7 버전에서 가장 눈에 띄었던 변화는 바로 `tidy evaluation` 이라는 새로운 lazy evaluation 시스템을 도입했다는 것이다. `rlang` 라이브러리를 통해 구현된 새로운 시스템을 통해 expression이 적합한 context에서 실행될 수 있게 되었고, 기존에 SE / NSE 쌍으로 제공하던 함수들을 하나의 함수로 제공할 수 있게 되었다.

### 2.3.1 Basics

`expr`과 `quo` 함수는 `base::quote` 와 동일한 기능을 한다. `expr`은 `quote`와 동일하게 Raw Expression을 반환하고, `quo`는 특수한 형태의 formula인 quosure를 반환한다.


```r
rlang::expr(Sepal.Length > 7.5)
```

```
## Sepal.Length > 7.5
```

```r
# Sepal.Length > 7.5

rlang::quo(Sepal.Length > 7.5)
```

```
## <quosure: global>
## ~Sepal.Length > 7.5
```

```r
# <quosure: global>
#   ~Sepal.Length > 7.5
```

`expr`, `quo` 함수의 경우 실행되는 시점의 값을 그대로 받아온다. 따라서 함수 내부에서 사용하기에는 적절하지 않다. 함수 내부에서 사용하는 용도로는 `enexpr`, `enquo` 을 사용한다. 이 함수들은 `base::substitute` 와 비슷한 역할을 한다.


```r
f = function(x) rlang::expr(x)
f(x + y + z) 
# x

f = function(x) rlang::enexpr(x)
f(x + y + z) 
# x + y + z

f = function(x) rlang::quo(x)
f(x + y + z)
# <quosure: local>
# ~x

f = function(x) rlang::enquo(x)
f(x + y + z)
# <quosure: global>
# ~x + y + z
```

`rlang` 라이브러리를 사용해서 subset 함수를 구현해보면 다음과 같다. `lazyeval`과 마찬가지로 `.data` 등 키워드를 사용할 수 있다.


```r
subset_tidy = function(df, cond) {
  cond_call = rlang::enquo(cond)
  idx = rlang::eval_tidy(cond_call, df)
  df[idx, ]
}

subset_tidy(iris, Sepal.Length > 7.5)
```

```
##     Sepal.Length Sepal.Width Petal.Length Petal.Width   Species
## 106          7.6         3.0          6.6         2.1 virginica
## 118          7.7         3.8          6.7         2.2 virginica
## 119          7.7         2.6          6.9         2.3 virginica
## 123          7.7         2.8          6.7         2.0 virginica
## 132          7.9         3.8          6.4         2.0 virginica
## 136          7.7         3.0          6.1         2.3 virginica
```

```r
subset_tidy(iris, .data$Sepal.Length > 7.5)
```

```
##     Sepal.Length Sepal.Width Petal.Length Petal.Width   Species
## 106          7.6         3.0          6.6         2.1 virginica
## 118          7.7         3.8          6.7         2.2 virginica
## 119          7.7         2.6          6.9         2.3 virginica
## 123          7.7         2.8          6.7         2.0 virginica
## 132          7.9         3.8          6.4         2.0 virginica
## 136          7.7         3.0          6.1         2.3 virginica
```

### 2.3.2 Quasiquotation in tidyeval

tidyeval에서는 `!!` 연산자로 unquote를 수행할 수 있다. `!!!` 로는 unquote-splice 를 수행하는데, 리스트의 name, value를 받아서 다른 expression에 반영하는데 사용된다. 파이썬의 `*args`, `**kargs` 와 비슷하다.

- `!!` : unquote (value)
- `!!!` : unquote-splice (key, value)


```r
q1 = rlang::quo(Sepal.Length > 7.5)
rlang::expr( !!q1 )
# <quosure: global>
# ~Sepal.Length > 7.5

q2 = list(na.rm = TRUE, trim = 0.1)
rlang::expr( mean(x, !!!q2) )
# mean(x, na.rm = TRUE, trim = 0.1)
```

subset 예제에는 다음과 같이 적용할 수 있다.


```r
cond_str = rlang::quo(Sepal.Length > 7.5)
subset_tidy(iris, !!cond_str)
```

```
##     Sepal.Length Sepal.Width Petal.Length Petal.Width   Species
## 106          7.6         3.0          6.6         2.1 virginica
## 118          7.7         3.8          6.7         2.2 virginica
## 119          7.7         2.6          6.9         2.3 virginica
## 123          7.7         2.8          6.7         2.0 virginica
## 132          7.9         3.8          6.4         2.0 virginica
## 136          7.7         3.0          6.1         2.3 virginica
```

tidyeval을 사용하는 라이브러리들은 `...` 를 처리하는 과정에서 unquote-splice를 활용하는 것을 종종 볼 수 있다. 


```r
get_mean_tidy = function(df, col, ...) {
  col_quo = rlang::enquo(col)
  .target_col = rlang::eval_tidy(col_quo, data = df)
  
  do.call('mean', rlang::dots_list(x = .target_col, ...), envir = parent.frame())
}

get_mean_tidy(mtcars, cyl, na.rm = TRUE)
```

```
## [1] 6.1875
```

```r
# 6.1875

var = rlang::quo(cyl)
mean_params = list(na.rm = TRUE, trim = 0.1)
get_mean_tidy(mtcars, !!var, !!!mean_params)
```

```
## [1] 6.230769
```

```r
# => mean(mtcars$cyl, na.rm = TRUE, trim = 0.1) 과 동일한 연산
# 6.230769
```

<br />

`dplyr` 등 최근의 tidyverse 코드에서는 다음과 같이 활용할 수 있다. 0.5 버전 이하의 dplyr에서는 `group_by_`를 사용해야 한다.


```r
suppressPackageStartupMessages( 
  library(tidyverse) 
)
```



```r
group_by_mean = function(df, col) {
  group_key = rlang::enquo(col)
  
  df %>% 
    tbl_df() %>% 
    group_by(!!group_key) %>% 
    summarise_all(mean)  
}

group_by_mean(iris, Species)
```

```
## # A tibble: 3 x 5
##      Species Sepal.Length Sepal.Width Petal.Length Petal.Width
##       <fctr>        <dbl>       <dbl>        <dbl>       <dbl>
## 1     setosa        5.006       3.428        1.462       0.246
## 2 versicolor        5.936       2.770        4.260       1.326
## 3  virginica        6.588       2.974        5.552       2.026
```

<br /><br />

# 3. 참고자료

[(1) Advanced R: Non-Standard Evaluation](http://adv-r.had.co.nz/Computing-on-the-language.html)

[(2) Advanced R SE: Metaprogramming](https://adv-r.hadley.nz/meta.html)

[(3) Hadley Wickham: lazyeval](https://rpubs.com/hadley/lazyeval)

[(4) Programming with dplyr](http://dplyr.tidyverse.org/articles/programming.html)

[(5) Alan Bawden: Quasiquotation in Lisp](http://repository.readscheme.org/ftp/papers/pepm99/bawden.pdf)
