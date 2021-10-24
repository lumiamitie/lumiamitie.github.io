---
layout: post
published: true
title: R 개발/분석을 위한 안전한 모듈 관리 - box
mathjax: false
featured: true
comments: true
headline: R module using box
categories: dev
tags: dev r
---

![cover-image](/images/taking-notes.jpg)

R의 라이브러리, 특히 모듈 시스템은 다른 개발 언어들과 비교했을 때 매우 독특합니다. 
사실 좋게 말해서 독특한 것이지, 발전이 없는 상태로 너무나 오랜 시간이 지난 것은 아닌가 하는 생각도 듭니다. 
R의 라이브러리와 모듈 시스템은 인터렉티브한 분석에서는 어느 정도 편리한 부분을 제공하지만, 프로젝트가 커질 경우 안정적으로 개발하는데 굉장히 불리한 특성을 가지고 있습니다. 

기본적으로 R은 별도의 패키지를 만들지 않으면 별도의 네임스페이스로 분리하기 어려운 환경을 가지고 있는데요. 
패키지 만드는 것이 이전 대비 쉬워졌다지만, 그래도 코드 모듈화 하나를 위해 패키지를 만드는 것도 번거로운 것이 사실입니다. 
또한 라이브러리를 로딩하면서 발생하는 사이드 이펙트가 다른 코드에 쉽게 영향을 미칠 수 있는 구조라는 점도 안정적인 개발에 어려움을 주는 요소입니다.

분석만 할 때는 크게 신경쓰지 않았던 부분이지만, 자동화나 개발적인 부분을 고민하다 보면 역시 모듈화에 대한 고민으로 이어지게 됩니다. 
최근까지 안정적인 R 모듈화 개발을 위해 많은 고민을 했는데요. 이번에는 `box` 라이브러리를 통한 모듈화 방식을 소개합니다.

우선 기존의 방식부터 잠깐 살펴보고 box가 어떤 방식을 통해 문제를 해결하는지 알아보겠습니다.

# 기존 방식

R에서 코드를 모듈화하기 위해서는 보통 스크립트를 별도로 분리해서 `source` 함수로 불러오거나 패키지로 분리해두는 방식을 사용했습니다. 
기존에도 몇몇 모듈화 기능을 제공하는 R 라이브러리가 있긴 했지만, 해당 내용은 이번 글에서는 다루지 않도록 하겠습니다.

## source 또는 sys.source 적용

- 스크립트 실행 후 그 결과를 현재 environment 또는 지정한 environment 에 붙이는 방식입니다.
- **장점**
    - 간단하게 실행할 수 있습니다.
- **단점**
    - 스크립트에서 발생한 사이드 이펙트가 기존 환경에 영향을 쉽게 미칠 수 있습니다.
    - 특히 `library` 함수로 인해 라이브러리를 불러오는 과정에서 함수 간 충돌이 발생하는 문제가 많이 발생합니다.
    - 예를 들어, 머신러닝 모델링 라이브러리를 불러올 때 `stats::predict` 제네릭 함수를 불러오는 경우가 많습니다. 이 때 stats 라이브러리가 로딩되면서 dplyr 의 `filter` 함수를 덮어쓰는 경우가 자주 있었습니다.

## 패키지 작성

- 필요한 함수 및 기능을 모아서 패키지로 작성합니다.
- **장점**
    - 네임스페이스 관리 및 모듈화를 할 수 있게 됩니다.
- **단점**
    - R 패키지를 만들기 위해 필요한 작업들이 많다보니 간단한 스크립트 모듈화에는 적합하지 않습니다.
    - 패키지를 만들게 되면 보통 레포지토리를 별도로 관리하기 때문에, 모델링 및 분석 코드와 분리된 상태에서 관리하게 되어 코드를 통합하여 관리하는데 어려움이 생깁니다.

# box를 사용한 깔끔한 모듈 관리

box 라이브러리는 재사용 가능한 코드를 패키지로 만들지 않더라도, R 파일과 폴더 구조를 통해 코드를 모듈로 관리할 수 있게 해줍니다. 
또한 `library` 나 `require` 함수를 대신하여 더 안전하게 함수를 불러올 수 있는 방법을 제공합니다.

[box 라이브러리](https://klmr.me/box/){:target="_blank"} 사용법을 간단하게 살펴보겠습니다.

## 설치한 라이브러리에서 코드 불러오기

- box를 통해 라이브러리 또는 모듈에서 코드를 불러오려면 `box::use` 를 사용합니다.
- `box::use` 의 기본적인 구조는 다음과 같습니다.

```r
box::use(
  ModuleName = LibraryName[FunctionToAttach, ...]
)
```

- 다음과 같은 형태로 사용할 수 있습니다.

```r
box::use(
  stringr,                        # 1
  CI = CausalImpact,              # 2
  magrittr[`%>%`, extract],       # 3
  glue = glue[glue, glue_sql],    # 4
  grf[train = causal_forest, ...] # 5
)

# 1
# stringr 라이브러리를 이름 그대로 불러온다.
stringr$str_detect()

# 2
# CausalImpact 라이브러리를 CI 라는 이름으로 불러온다.
CI$CausalImpact()

# 3
# magrittr 라이브러리의 다음 두 함수를 현재 env에 attach한다.
%>%
extract

# 4
# glue 라이브러리 전체를 모듈로 불러온다.
glue$glue()
glue$glue_sql()
glue$as_glue()

# 다음 두 함수는 현재 env에 attach한다.
glue()
glue_sql()

# 5
# causal_forest() 함수를 train() 으로 이름을 변경하여 env에 attach한다.
# 그 외 모든 함수는 그대로 env에 attach한다.
train()
```

- 참고로, `box::use` 는 실행된 함수 스코프 내에서만 유효합니다.
    - 다음과 같이 함수 내에서 필요한 함수만 불러올 수 있습니다.

```r
get_data_from_query <- function(connection, query, print_only = FALSE, ...) {
  box::use(
    DBI[dbGetQuery],
    glue[glue_sql],
    tidyr[as_tibble],
    magrittr[`%>%`]
  )
  glue_query <- glue_sql(query, .con = connection, ...)
  if (print_only) {
    print(glue_query)
    invisible(NULL)
  } else {
    dbGetQuery(connection, glue_query) %>% as_tibble()
  }
}
```

## 재사용 가능한 모듈 작성하기

- R 패키지에서 함수를 export 하는 방식과 유사합니다.
- 별도의 R 스크립트 작성 후 export 디렉티브(`#' @export`)를 추가하면 됩니다.
- 다음과 같이 `common_scripts/connection.R` 파일을 작성했다고 해보겠습니다.

```r
#' @export
athena <- function() {
  box::use(DBI[dbConnect])
  dbConnect(
    # Information to make DB connection
  )
}

#' @export
get_data_from_query <- function(connection, query, print_only = FALSE, ...) {
  box::use(
    DBI[dbGetQuery],
    glue[glue_sql],
    tidyr[as_tibble],
    magrittr[`%>%`]
  )
  glue_query <- glue_sql(query, .con = connection, ...)
  if (print_only) {
    print(glue_query)
    invisible(NULL)
  } else {
    dbGetQuery(connection, glue_query) %>% as_tibble()
  }
}
```

## 모듈에서 코드 불러오기

- 모듈에서 코드를 불러올 때는 코드가 동작하는 스크립트를 기준으로 path를 제공합니다.
- 모듈 스크립트가 `app/common_scripts/connection.R` 에 있을 때 모듈에서 코드를 불러오는 방법은 다음과 같습니다.

```r
# app/test.R 에서 실행하는 경우
box::use(common_scripts/connection)
box::use(./common_scripts/connection)

# app/analysis/test.R 에서 실행하는 경우
box::use(../common_scripts/connection)
```

- 이후 코드를 실행하는 방식은 라이브러리를 불러올 때와 동일합니다.

```r
box::use(common_scripts/connection)

con <- connection$athena()
test_data <- connection$get_data_from_query(
  # ...
)
```

# 마무리

개인적으로 R의 모듈 시스템에는 아쉬운 점이 많습니다. 
특히 다양한 라이브러리를 로딩하여 활용하는 상황에서 특정 코드가 미치는 영향을 제한하는 것이 굉장히 어렵다는 문제가 있었습니다. 
그래서 R이 3 버전을 지나 4버전으로 메이저 업데이트가 진행되었을 때는 이런 문제가 해결되지 않을까 하는 기대를 했었는데요. 
메이저 버전업에도 불구하고 모듈 시스템이 고도화되지 않은 것을 보고 아쉬움이 더 깊어졌습니다.

하지만 R의 개발 생태계도 이전보다는 더욱 풍부해졌으며, 전 세계의 많은 개발자 분들이 문제를 해결할 다양한 방법을 공유하고 있습니다. 
오늘 소개한 box도 그 중 하나이구요. R을 사용하면서 가장 충격을 받았던 때 중 하나가 바로 magrittr에서 파이프 오퍼레이터 `%>%` 가 등장했을 때입니다. 
결국 시간이 꽤 흐르고 나서 4.1 버전에서야 이 기능을 R에서 공식적인 연산자로 제공하게 되었습니다. 
지금은 라이브러리를 통해 적용하고 있는 모듈화 기능도, 언젠가 R에서 자체적으로 지원해주지 않을까 하는 기대를 해봅니다.
