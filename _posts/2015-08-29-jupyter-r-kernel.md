---
layout: post
published: true
title: Jupyter with R
mathjax: false
featured: false
comments: true
headline: Jupyter for R
categories: R Python
tags: jekyll
---

![cover-image](/images/rocks-waves.jpg)

## jupyter

**jupyter**(또는 ipython notebook)는 ipython을 기반으로 해서 코딩과 마크다운 문서작성을 함께 할 수 있게 해주는 웹기반 어플리케이션이다. 기존의 ipython 에서는 ipython만을 사용할 수 있었지만 jupyter로 업그레이드 되면서 다른 언어들도 사용할 수 있게 되었다. 

보통 R 관련해서 강의나 스터디와 관련된 자료를 만들 때 knit과 rmarkdown을 이용했었다. 웹페이지나 웹기반 슬라이드, pdf 등 다양한 형태로 만들 수 있다는 것이 장점이지만 그림자료가 많아질 수록 매번 knit 시키기는 시간이 너무 길어지기도 했고 코드와 주석으로만 작성되어있던 R 소스코드를 markdown형식과 code chunk의 형태로 변환하는게 번거로웠다. 마침 최근 github에서 jupyter의 ipynb파일을 직접 렌더링해주도록 업데이트 되었다는 사실을 알게 되었다. 

<https://github.com/blog/1995-github-jupyter-notebooks-3>

파이썬은 jupyter로 코드를 작성하고 있었지만 R도 jupyter에서 코드를 작성해서 github에 자료를 모으면 비교적 편리하게 문서를 작성할 수 있을 것 같다는 생각이 들어서 R커널을 윈도우에 설치하는 방법을 찾아보게 되었다.

<br />
<br />

## jupyter with R (windows)

우선 여기서는 python, ipython, jupyter, 그리고 R까지 모두 설치되어 있다는 것을 전제로 진행하려고 한다. python과 R의 설치는 비교적 쉽게 할 수 있지만, ipython과 jupyter의 경우에는 구글에서 관련된 내용으로 검색해가면서 진행해야 할 것 같다. 

설치하는 과정은 <https://github.com/IRkernel/IRkernel> 의 readme 문서를 참고했다. 

```r
install.packages(c('rzmq','repr','IRkernel','IRdisplay'),
                 repos = c('http://irkernel.github.io/', getOption('repos')))
```

위와 같이 커널 설치를 위해 필요한 패키지를 한꺼번에 설치할 수 있다. 패키지를 모두 설치하고 나면

```r
IRkernel::installspec()
```
위 명령어를 통해 커널을 설치할 수 있다. 옵션없이 설치를 하게 되면 해당 사용자에 대해서 설치를 하게 되는데, 시스템 전체에 대해서 설치하고 싶다면 `user = FALSE` 옵션을 추가하면 된다. 64bit 윈도우7이 설치된 i5 LG그램에서 설치를 하고 있었는데 `installspec()` 만으로는 제대로 설치가 되지 않아서 `user = FALSE` 옵션을 켜고 설치를 진행했다. 

설치가 완료되었다면 `C:\Users\[username]\Documents\.ipython\kernels\ir\kernel.json` 등 ipython이 설치된 내부 폴더에서 R커널이 설치된 폴더로 찾아들어가야 한다. `kernel.json` 파일을 열어보면

```
{"argv": ["R", "--quiet", "-e","IRkernel::main()","--args","{connection_file}"],
 "display_name":"R",
 "language":"R"
}
```
와 같이 작성되어 있는 것을 볼 수 있다. 만약에 R 실행파일의 위치가 path로 잡혀있다면 저 상태로 실행시켜도 된다. path가 설정되어 있지 않다면 R 실행파일을 path로 잡아주거나, `"C:/Program Files/R/R-3.2.1/bin/R.exe"` 처럼 실행파일을 직접 지정해줄 수 있다. 실행파일을 직접 지정해줄 경우 아래와 같은 형태가 된다. 

```
{"argv": ["C:/Program Files/R/R-3.2.1/bin/R.exe", "--quiet", "-e","IRkernel::main()","--args","{connection_file}"],
 "display_name":"R",
 "language":"R"
}
```

이제 jupyter를 실행시키면 새 파일을 생성하는 New 항목에 Python 뿐만 아니라 R이 선택 가능해진다

![](/images/post_image/jupyter_with_r/jupyterwithr00.PNG)

R을 선택해서 새 파일을 만들고 `plot(iris)` 를 작성한 후에 crtl + enter를 눌러서 코드를 실행시키면 아래처럼 제대로 실행되는 모습을 볼 수 있다.

![](/images/post_image/jupyter_with_r/jupyterwithr01.PNG)

---

**2017-01-31 추가**

이유는 잘 모르겠지만 이 포스팅의 조회수가 정말 꾸준하게 나오는 것 같아서 몇 줄 추가하려고 합니다.

Anaconda가 설치되어 있을 경우에는 `conda install -c r r-essentials` 명령어를 통해 쉽게 R 커널을 세팅할 수 있습니다. 특히 **R Essentials 번들**을 설치하게 되면 많이 사용되는 R 라이브러리가 설치된 상태로 커널까지 세팅되기 때문에 편리하게 사용할 수 있습니다. 자세한 내용은 [관련 링크](https://www.continuum.io/blog/developer/jupyter-and-conda-r) 를 통해 확인해 보세요.

저는 요즘 R notebooks 를 사용해보고 있습니다. 기존의 Rmarkdown의 경우에는 knit할 때마다 시간이 너무 오래걸려서, 문서가 길어지거나 작업이 오래걸리는 경우에는 사용하기가 많이 꺼려졌었는데요. R notebooks을 사용하면 jupyter notebook을 사용하는 것처럼 코드작성과 문서작업을 동시에 진행할 수 있어서 좋습니다. 아직 jupyter에 비하면 불편한 점이 많지만 버전관리는 더 쉽다는 장점이 있어요. Rstudio를 주로 사용하시는 분들이라면 한 번쯤 확인해보시면 좋을 것 같습니다. <http://rmarkdown.rstudio.com/r_notebooks.html>



