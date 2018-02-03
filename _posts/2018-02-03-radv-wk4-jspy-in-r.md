---
layout: post
published: true
title: JS and python in R (R-adv week4)
mathjax: false
featured: true
comments: true
headline: JS and Python in R
categories: R
tags: R Python Javascript
---

![cover-image](/images/taking-notes.jpg)

# R에서 js, 파이썬 코드 사용하기

 라이브러리를 구성할 때, 원하는 기능을 R로 직접 구현할 수 있다면 제일 좋겠지만 현실은 그렇지 않을 때가 많다. 이미 널리 알려진 구현체가 존재할 수도 있고, 다른 언어를 사용해서 성능 향상을 시도해 볼 수도 있다. R 라이브러리를 보면 속도를 끌어올리기 위해 Rcpp을 많이 사용하고, 자바의 풍부한 라이브러리를 활용하기 위해 rJava를 쓰는 경우가 많다. 하지만 여기서는 C++이나 자바 대신 js와 파이썬을 활용하는 방법을 알아보려고 한다.

 왜 하필 자바스크립트와 파이썬일까? 라고 하면, 사실 가장 큰 이유는 스터디를 함께하는 구성원들이 많이 사용할 법한 언어라는 점이었다. 데이터 분석과 모델링, 시각화를 주로 공부하다보니 나만해도 거의 R, Python, JS 세 가지 언어만을 활용하고 있다. 아무리 C++ 이나 자바가 필요한 경우가 있다고 한들, 그 언어들을 잘 활용하지 못하는 이상 적어도 지금 단계에서 공부할 내용은 아니라고 생각했다.
 
 어찌됐든, 자바스크립트와 파이썬이 널리 쓰이고 있는 것은 사실이고, npm과 pypi라는 거인의 어깨에 올라타는 것은 R 패키지를 만드는 사람에게도 한 번쯤은 꼭 필요한 과정일 것이다.
 
참고로 스터디 멤버 전원이 **맥북**을 사용하고 있기 때문에! 아래의 코드들은 윈도우에서 동작한다는 보장이 없다... (윈도우에서 npm이나 browserify 잘 되나요..????)
 
<br /><br />

# Javascript in R : V8

**V8**은 구글에서 만든 자바스크립트 엔진이다. R의 `V8` 라이브러리를 설치하면 v8 엔진을 통해 자바스크립트 코드를 직접 동작시킬 수 있다.

<br />

## Basic

`V8::v8()` 함수를 사용하면 자바스크리트 코드를 동작시킬 context를 생성한다. context는 브라우저로 치면 탭 하나라고 생각하면 되는데, 특정 context에서 실행되는 코드는 다른 context에 영향을 주지 않는다. 


```r
# 예제를 실행하기 전에 먼저 V8 라이브러리를 설치한다
# install.packages('V8')
ct = V8::v8()
```

<br />

자바스크립트 라이브러리를 불러오기 위해서는 컨텍스트 객체의 `$source()` 메서드를 사용하면 된다. V8 라이브러리는 설치될 때 `crossfilter`와 `underscore` 두 개의 라이브러리를 포함하고 있다. `system.file()` 함수를 통해 `underscore.js`의 위치를 찾고, `$source()` 메서드에 해당 파일의 주소를 인자로 넣는다. 


```r
# V8 패키지가 설치된 위치에 존재하는 js/underscore.js 파일의 full path를 받는다
path_to_underscore = system.file("js/underscore.js", package="V8")
ct$source(path_to_underscore) # 컨텍스트에 라이브러리를 불러온다
```

<br />

v8 컨텍스트 내에 올라가 있는 자바스크립트 함수는 `$call()` 메서드를 통해 사용할 수 있다. call 메서드 안에 있는 모든 argument를 (첫 번째 인자는 제외하고) json으로 변환하기 때문에 R의 데이터프레임을 인자로 넣더라도 아래와 같이 잘 동작한다. 인자에 js 함수를 넣기 위해서는 `V8::JS` 함수로 문자열을 감싸주어야 한다.


```r
ct$call("_.filter", mtcars, V8::JS("function(x){return x.mpg < 15}"))
```

```
##                      mpg cyl disp  hp drat    wt  qsec vs am gear carb
## Duster 360          14.3   8  360 245 3.21 3.570 15.84  0  0    3    4
## Cadillac Fleetwood  10.4   8  472 205 2.93 5.250 17.98  0  0    3    4
## Lincoln Continental 10.4   8  460 215 3.00 5.424 17.82  0  0    3    4
## Chrysler Imperial   14.7   8  440 230 3.23 5.345 17.42  0  0    3    4
## Camaro Z28          13.3   8  350 245 3.73 3.840 15.41  0  0    3    4
```

<br />

컨텍스트에서 `$console()` 메서드를 사용하면 R console에서 자바스크립트를 직접 구동해 볼 수 있다.


```r
ct$console()
```

<br />

## npm 라이브러리 사용하기

### Browserify

node.js 등 환경에서 npm을 통해 내려받은 라이브러리를 불러올 때는 disk에 직접 접근한다. 하지만 V8 엔진에는 해당 기능이 없다. 따라서 npm을 통해 받은 라이브러리 중 파일 단위로 모듈이 쪼개져있는 경우에는 번들러를 통해 하나의 js파일로 통합하여 사용해야 한다. 자바스크립트 파일을 번들링해주는 도구는 여러 가지가 있지만, 여기서는 간단하게 사용할 수 있는 browserify를 써보자! <http://browserify.org/>

<br />

### 번들링 과정

**(0) npm 설치**

node.js를 설치하면 npm이 함께 설치된다. ( https://nodejs.org/ko/ )

<br />

**(1) npm을 통해 d3 다운로드 받는다**

글로벌 설치가 아니므로 원하는 폴더로 이동해서 아래 명령어를 실행시킨다. `node_modules` 폴더 아래에 라이브러리와 관련 디펜던시를 다운받게 된다.

```
npm install d3
```

<br />

**(2) npm에서 글로벌 옵션으로 browserify 설치**

`-g` 옵션을 추가해서 browserify를 글로벌로 설치한다. 혹시 권한 문제로 잘 동작하지 않는다면 앞에 `sudo`를 추가해서 실행시켜보면 된다.

```
npm install -g browserify
# 권한 문제로 설치되지 않는다면 sudo npm install -g browserify
```

<br />

**(3) d3.color, d3.format을 단일 파일로 번들링**

먼저, d3가 설치된 node_module 폴더와 같은 곳에 (`node_modules/in.js`) 아래와 같이 in.js 파일을 작성한다.

```
// in.js
global.d3_color = require('d3-color');
global.d3_format = require('d3-format');
```

그리고 browerify를 통해 bundle.js 파일로 번들링한다. `node_modules` 폴더에서 다음 명령을 실행한다.

```
browserify in.js -o bundle.js
```

<br />

**(4) V8에서 불러서 사용하는 함수를 만들어보자**

컨텍스트에 번들링한 파일을 올려보자. `$call()` 메서드를 사용해서 제대로 동작하는지 확인해보자.




```r
# bundle.js 파일을 적당한 곳에 옮겨놓거나, 해당 파일의 위치를 직접 입력한다
ct$source('bundle.js')
```


```r
# $eval 메서드는 문자열 전체를 파싱하여 실행시킨다
# ct$eval("d3_format.format('.1%')(0.1234)")
# ct$eval("d3_color.color('steelblue')")

# $call 메서드는 js 함수를 먼저 받고, R 객체를 받아서 js 함수에 넘겨준다.
ct$call("d3_format.format('.1%')", 0.1234)
```

```
## [1] "12.3%"
```

```r
ct$call('d3_color.color', 'steelblue')
```

```
## $r
## [1] 70
## 
## $g
## [1] 130
## 
## $b
## [1] 180
## 
## $opacity
## [1] 1
```

<br /><br />

# Python in R : reticulate

Rstudio에서 만든 reticulate는 R 코드 형태로 파이썬을 사용할 수 있게 해주는 라이브러리다. R의 텐서플로우와 케라스가 바로 이 reticulate를 바탕으로 작성되었다.


```r
# install.packages('reticulate')
library('reticulate')
```


## 특정 파이썬 가상환경 사용하기

아나콘다를 사용할 경우, `reticulate::conda_list()` 함수를 실행시켜보면 현재 로컬에 설치된 콘다 가상환경의 종류가 보인다. 특정 환경을 사용할 경우 `reticulate::use_condaenv()` 함수에 원하는 env name을 입력하면 된다. virtualenv를 사용할 경우에는 `use_virtualenv()`를 쓰면 되고, 파이썬이 설치된 위치를 직접 입력하려면 `use_python`을 쓰자.


```r
conda_list()
#       name                                          python
# 1 anaconda             /Users/username/anaconda/bin/python
# 2    env1    /Users/username/anaconda/envs/env1/bin/python
# 3    env2    /Users/username/anaconda/envs/env2/bin/python

# conda env를 사용할 경우
use_condaenv('anaconda', required = TRUE)

# python path를 직접 입력할 경우
use_python('/Users/miika/anaconda/bin/python', required = TRUE)
```

<br />

이대로 잘 따라했는데 이상하게 제대로 동작하지 않는다면 파이썬 환경이 제대로 설정되었는지 확인해보자. `py_config()`를 실행시켜보고 python 위치가 제대로 잡혀있는지 보면 된다. 만약 첫 줄에서 `python:  /usr/bin/python` 이라고 잡혀있다면 아나콘다나 다른 환경이 아닌 맥 기본 파이썬이 잡혀있는 것이다. 내 경우에는 한 번 **Terminate R** 해주고 다시 시도하면 잘 동작했다. 

<br />

## 파이썬 스크립트 실행하기

이미 파이썬 코드로 작성된 스크립트는 `py_run_file()` 함수로 실행시킬 수 있다. 아래 파이썬 코드를 작성해서 `py_test.py` 라고 저장하고 R에서 실행시켜보자.


```python
#### py_test.py ####
from datetime import datetime, timedelta

d = datetime(2018, 1, 1)

date_list = []
for i in range(0, 10):
  target_dt = d + timedelta(days=i)
  date_list.append(target_dt.strftime('%Y-%m-%d'))
```

<br />

스크립트를 실행시킨 객체에서 프로퍼티 형태로 결과를 조회할 수 있다.


```r
py_run_result = py_run_file('py_test.py')
py_run_result$date_list
```

```
##  [1] "2018-01-01" "2018-01-02" "2018-01-03" "2018-01-04" "2018-01-05"
##  [6] "2018-01-06" "2018-01-07" "2018-01-08" "2018-01-09" "2018-01-10"
```

<br />

## 파이썬 라이브러리 불러오기

reticulate를 사용하면 파이썬 라이브러리를 R에서 직접 불러서 사용할 수도 있다. 아래 코드는 numpy를 이용해 `np.sum([1,2,3,4])` 코드를 R에서 작성한 결과다.


```r
np = import('numpy')
np$sum(c(1,2,3,4))
```

```
## [1] 10
```

<br />

이번에는 Scikit-Learn 라이브러리를 가지고 cars 데이터에 대해 간단한 회귀분석을 시도해보자.


```r
sklearn = import('sklearn', convert = FALSE)

regr = sklearn$linear_model$LinearRegression()
regr$fit(X = array_reshape(cars$speed, dim = c(-1, 1)), 
         y = array_reshape(cars$dist, dim = c(-1, 1)))

print(sprintf('slope: %f', py_to_r(regr$coef_)[1]))
print(sprintf('intercept: %f', py_to_r(regr$intercept_)[1]))
```

```
## [1] "slope: 3.932409"
## [1] "intercept: -17.579095"
```

<br />

사실 reticulate는 이전에 다룬 적이 있다. R에서 flask가 돌아가는지 간단하게 확인만 해 본 정도지만, 궁금한 분들은 확인해보시길! <http://lumiamitie.github.io/r/flask-on-r/>

<br /><br />

# 마무리

 사실 이렇게 외부의 디펜던시를 끼워넣게 되면, 다른 모든 사용자에게 동일한 경험을 주기 위해 필요한 작업이 점점 많아지게 된다. V8의 경우에는 패키지를 배포할 때 js 파일을 직접 담아 보내면 되니 V8엔진만 잘 설치되면 된지만 파이썬의 경우에는 기본으로 설치된 파이썬 환경과 충돌하는 경우도 있고 다양한 문제가 생길 수 있다. rJava는 정말이지 잘못 걸리면 극한의 지옥을 맛볼 수도 있다. 하지만 그렇게 고생 끝에 잘 동작하는 라이브러리 하나만 만들어낼 수 있다면, 이 생태계에 기여할 수 있는 패키지 작성자가 된다. 겁먹지 말고 할 수 있는 것부터 차근차근 시도해보자. :)
