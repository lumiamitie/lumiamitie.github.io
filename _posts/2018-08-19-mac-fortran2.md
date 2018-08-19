---
layout: post
published: true
title: Mac에서 gfortran4.8 에러 해결하기
mathjax: false
featured: false
comments: true
headline: make gfortran4.8 No such file or directory
categories: R
tags: R
---

![cover-image](/images/taking-notes.jpg)

TIL 포스팅을 작성하기 위해 간만에 맥북 R 환경에 igraph를 설치하려고 했는데 뭔가 문제가 발생했다. 역시 귀찮아서 그냥 서버에서 작업을 할까도 했지만, 그래도 나름 중요한 라이브러리니까 해결하긴 해야겠다 싶어서 정리!

# 맥에서 igraph 설치하는 과정에서 발생하는 gfortran4.8 에러 해결하기

## 문제상황

현재 사용하고 있는 맥북은 Sierra 환경이다. igraph를 설치하는 중 다음과 같은 에러가 발생했다

```
gfortran-4.8   -fPIC  -g -O2  -c AMD/Source/amd.f -o AMD/Source/amd.o
make: gfortran-4.8: No such file or directory
make: *** [AMD/Source/amd.o] Error 1
ERROR: compilation failed for package ‘igraph’
* removing ‘/Library/Frameworks/R.framework/Versions/3.3/Resources/library/igraph’
Warning in install.packages :
  installation of package ‘igraph’ had non-zero exit status
```

## 해결방법

간단히 설명하자면 gfortran4.8 설치 후 `~/.R/Makevars` 파일을 수정하면 된다. [이전 포스팅](https://lumiamitie.github.io/r/mac-lgfortran/) 과 연결된 부분이 많으니 참고. 

대부분 <https://code.i-harness.com/en/q/16ceebb> 코드를 바탕으로 해결했다. 우선 gfortran 4.8 버전부터 설치하자.

```
# gfortran4.8 다운로드
curl -O http://r.research.att.com/libs/gfortran-4.8.2-darwin13.tar.bz2
mkdir /tmp/gfortran
tar fvxz gfortran-4.8.2-darwin13.tar.bz2 -C /tmp/gfortran

# homebrew를 간섭하는 alias 제거
rm /tmp/gfortran/usr/local/bin/gfortran

# gfortran 4.8 설치
cp -r /tmp/gfortran/usr/local/ /usr/local

# ~/.R/Makevars 파일을 만든다 (이미 존재한다면 패쓰)
# mkdir -p ~/.R
# touch ~/.R/Makevars
```

이전에 발생했던 다른 문제로 인해 `Makevars` 파일에 사전에 설정해 둔 값이 있다. 따라서 `Makevars` 파일은 다음과 같이 구성된다.

```
FLIBS=`gfortran -print-search-dirs | grep '^libraries:' | sed 's|libraries: =||' | sed 's|:| -L|g' | sed 's|^|-L|'`
F77="gfortran-4.8"
FC="gfortran-4.8"
```

해당 파일 변경 후 igraph 라이브러리가 정상적으로 설치된 것을 확인하였다.
