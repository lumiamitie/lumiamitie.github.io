---
layout: post
published: true
title: 마크다운에 Dropbox 공유 이미지 링크하기
mathjax: false
featured: false
comments: true
headline: Making blogging easier for masses
categories: Web
tags: jekyll
---

![cover-image](../../images/taking-notes.jpg)

커버이미지를 등록하는 것 때문에 매번 필요한 사진이 생기면 다운로드 받아서 jekyll 폴더에 넣어줘야 하는지 고민하다가 Dropbox에 사진을 넣고 공유해서 그 링크를 첨부하는 방식을 생각했다. 그런데 막상 해보니 제대로 링크가 연결되지 않아서 파일을 직접 넣어주는 방향으로 생각하고 있었는데, 마크다운 문법 때문에 블로그를 돌아다니다가 [Song Young-jin님의 블로그](http://scriptogr.am/myevan/post/markdown-syntax-guide-for-scriptogram)에서 적절한 해결 방안을 발견했다.

원래 공유를 하면 다음과 같은 링크가 주어진다

> https://www.dropbox.com/s/randomrandom/image.png?dl=0

여기서 https 를 http로, www를 dl로 변경하고 ?dl=0 을 제거한다

> http://dl.dropbox.com/s/randomrandom/image.png

위 링크를 사용하면 마크다운에서 Dropbox 공유 이미지를 불러올 수 있다

![서울시 구별 사과 평균가격](http://dl.dropbox.com/s/hw5qjxa91jy560g/apple_mean_price.png)