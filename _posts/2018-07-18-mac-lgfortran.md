---
layout: post
published: true
title: Mac에서 library not found for lgfortran 에러 해결하기
mathjax: false
featured: false
comments: true
headline: library not found for lgfortran error
categories: R
tags: R
---

![cover-image](/images/taking-notes.jpg)

맥에서 MCMCglmm 라이브러리를 설치하려고 하는데 중간 과정에서 에러가 발생했다. 정확하게는 MCMCglmm의 디펜던시인 ape 라이브러리가 설치되지 않았다. 무슨 문젠가 하고 살펴보았는데, 어디선가 많이 보았던 에러... `ld: library not found for -lgfortran` !!

사실 도커 컨테이너 내부도 아니고 시스템에 직접 뭔가를 설치해야 하는 상황에서는 잘 건드리지 않는 편이지만, 한 번만 시도해보기로 했다. 그리고 다행히 짧은 시행착오 끝에 무사히 라이브러리 설치를 마무리할 수 있었다.

# lgfortran error 해결하기

정리에 앞서 현재 맥북 환경은 Sierra를 기준으로 한다. 그리고 homebrew가 설치되어 있어야 한다.

## 문제상황

설치 과정에서 나타난 에러 메세지는 다음과 같다

```
ld: warning: directory not found for option '-L/usr/local/lib/gcc/x86_64-apple-darwin13.0.0/4.8.2'
ld: library not found for -lgfortran
clang: error: linker command failed with exit code 1 (use -v to see invocation)
make: *** [ape.so] Error 1
ERROR: compilation failed for package ‘ape’
* removing ‘/Library/Frameworks/R.framework/Versions/3.3/Resources/library/ape’
```

## 해결과정

### 1) gfortran 설치

우선 시스템에 gfortran이 설치되어 있는지 확인해보았다

```
$ gfortran --version
-bash: gfortran: command not found

$ which gfortran
# 아무런 결과도 반환되지 않음
```

확인해보니 설치가 되지 않은 것 같다. 설치를 위해 찾아보니 homebrew를 통해 gcc를 설치하면 되는 것 같다. [링크](https://stackoverflow.com/a/26922770)

homebrew로 gcc를 설치한다.

```
brew install gcc
```

기대를 해보았지만 아직까지는 동일한 에러메세지가 발생했다. 조금만 더 검색을 해보기로 했다. 얼마 지나지 않아 다음과 같은 해결방법을 발견했다.

### 2) Makevars

- `~/.R/Makevars` 파일에 아래 값을 추가한다. [링크](https://stackoverflow.com/a/39372766)
- 내 경우에는 `~/.R/` 폴더가 없어서 `~` 위치에서 mkdir로 폴더를 생성한 후 Makevars 파일을 만들었다.

```
FLIBS=`gfortran -print-search-dirs | grep '^libraries:' | sed 's|libraries: =||' | sed 's|:| -L|g' | sed 's|^|-L|'`
```

여기까지 하고 다시 라이브러리를 설치하니 잘 설치되는 것을 확인할 수 있었다. 문제 해결!
