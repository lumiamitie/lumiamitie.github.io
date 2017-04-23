---
layout: post
published: true
title: Jekyll3 Trailing Slash 문제
mathjax: false
featured: false
comments: true
headline: Jekyll3 Trailing Slashed Error
categories: Web
tags: jekyll
---

![cover-image](/images/macphoto.jpg)

# Jekyll3 Trailing Slashes Error

---

현재 이 블로그는 github pages를 이용하고 있다. (2017년 4월 23일 기준) 원래 블로그를 할 때 Jekyll2에서 빌드를 한 다음에 파일을 push하는 방식으로 쓰고 있었는데, 노트북을 바꿀 때마다 jekyll 설치하는게 너무 번거로워서 그냥 jekyll 프로젝트를 github pages에 올리는 방식으로 바꿨다. 왜 진작 이렇게 안했을까.. 하면서 쫑알거렸는데 이렇게 안했던 이유를 오늘에서야 발견했다.....

사실 조짐은 꽤 오래전부터 있었다. 우선, 최근 들어 갑자기 **404** 페이지에 방문하는 세션수가 크게 늘었다. 그 때까지만 해도 누군가 링크를 이상하게 달아 놓아서 엄한 곳으로 방문하는 사람일 것이라고 생각했었다. 그런데 오늘 오랜만에 구글 Search Console을 들어가서 확인해보니 크롤링 오류가 계속 증가하고 있는게 아닌가!! 뭐지!! 하고 링크를 눌러보니 Page Not Found. 블로그 주소가 틀린 것도 아닌데 접근이 되지 않는 현상을 확인할 수 있었다. 그리고 URL 맨 마지막에 붙어있는 slash를 빼니 정상적으로 페이지에 진입할 수 있었다.

<br /><br />

# Jekyll2 vs Jekyll3

---

구글에 어떻게 검색을 해야 할지 순간적으로 막막했지만, 다행히도 금방 원인을 찾아낼 수 있었다. [(링크)](http://jekyllrb.com/docs/upgrading/2-to-3/#relative-permalink-support-removed) 원래 내가 로컬에서 빌드할 때는 지킬 2버전을 사용하고 있었는데, 여기서는 *permalink* 를 세팅할 때 자동으로 trailing slash를 반영한다. config에서 `permalink:   /:categories/:title` 라고 반영을 할 경우, `http://lumiamitie.github.io/r/mac-sierra-locale` 와 `http://lumiamitie.github.io/r/mac-sierra-locale/` 양쪽 모두에 접근할 수 있게 된다. 하지만 지킬3 버전에는 url 맨 뒤쪽의 슬래시를 자동으로 반영해 주지 않는다. 따라서 지킬3에서 문제를 해결하기 위해서는 *permalink* 를 설정할 때 맨 뒤에 slash를 추가해 주면 된다. `permalink:   /:categories/:title/`

추가로 github pages를 이용할 때 변경사항 없이 바로 지킬 프로젝트를 빌드하고 싶다면 아래와 같이 빈 커밋을 푸시하면 된다. [(링크)](http://stackoverflow.com/questions/24098792/how-to-force-github-pages-build) 

```
git commit -m 'rebuild pages' --allow-empty
git push
```

문제도 해결했으니 블로그 방문자가 좀 늘었으면 하는 바람이다 ㅜㅜ