---
layout: post
published: true
title: Color Quantization in R (w. imager)
mathjax: false
featured: false
comments: true
headline: Color Quantization with R imager library
categories: R
tags: R imager
---

![cover-image](/images/macphoto.jpg)

아 정말 시험기간도 아니고, 나와는 전혀 상관없는 다른 분야의 것들이 괜히 재밌어 보일 때가 있다. 이번 긴 연휴 동안 관심있던 주제가 몇 가지 있었는데, 그 중의 한 가지를 시간나는대로 조금씩 정리해보려고 한다.  

# 색상 양자화

내가 왜 이걸 보고있었는지 사실 아직도 잘 모르겠다. 하지만 일단 시작해보자.

[위키백과에 따르면,](https://ko.wikipedia.org/wiki/양자화_(정보_이론)) 양자화란 다음과 같다.

> **양자화**는 유한 집합에 대량의 입력값을 매핑하는 과정을 말한다

완전한 흰색부터 검은색까지 그레이스케일을 기준으로 생각해보자. (갑자기 마비노기가 생각난다. 리얼화이트 로브...) 실제 현실세계의 색상은 0부터 1까지의 실수범위로 존재한다고 볼 수 있다. 가장 밝은 흰색이 1이고, 가장 어두운 검은색이 0일 것이다. 하지만 이걸 사진이나 그림으로 재현한다고 해보자. 그림을 배워본 사람은 알겠지만, 처음 소묘를 접하면 열심히 팔을 움직이면서 가장 밝은 색부터 어두운 색까지 명암을 10단계 정도로 나누는 연습을 한다. 그리고 실제 사물을 보면서 각 면이 몇 단계에 해당되는지 보고, 러프한 수준에서 큰 명암을 잡는다. 그 다음에는 점차 단계를 세부적으로 쪼개가면서 실물과 가까운 수준으로 발전시켜 나간다. 실제 현실에 존재하는 0 ~ 1 사이의 명암을 0, 0.1, 0.2 ... 1 처럼 우리가 구분할 수 있는 수준으로 나누어서 사용하는 것. 이러한 과정을 양자화라고 볼 수 있겠다. 

![](http://sasdartdepartment.weebly.com/uploads/1/7/7/3/17733027/3808545_orig.jpg)

아무래도 전공자가 아니라서 이 이상 깊은 설명은 힘들 것 같으니 글을 작성하면서 많이 참고했던 블로그의 링크를 남기도록 하겠다. [이미지 샘플링과 양자화](http://twlab.tistory.com/entry/Digital-Image-Fundamentals-이미지-샘플링과-양자화Quantization) 

<br /><br />

# Imager

---

이제 관련된 R 예제를 찾아보기로 했다. 구글에서 검색하다보니 R-blogger에 다음과 같은 글이 있었다. [Color Quantization in R](https://www.r-bloggers.com/color-quantization-in-r/)

굉장히 잘 설명되어있고, 크게 어렵지 않은 코드로 구성되어 있지만 코드가 너무 길다... 그래서 `imager` 라이브러리를 사용해 같은 과정을 단순하게 처리해보기로 했다.

## Installing imager

`imager` 라이브러리를 설치하기 위해서는 사전에 몇 가지 준비가 필요하다. [해당 라이브러리의 github README를](https://github.com/dahtah/imager) 보고 필요한 것들을 설치하면 된다. 나는 MacOS에서 진행했기 때문에, `XQuartz`와 `FFTW`를 설치하고 나서 `install.packages('imager')` 로 라이브러리 설치를 완료할 수 있었다.

<br /><br />

# Color Quantization Tutorial

---

라이브러리는 `imager`와 `tidyverse`를 불러온다.


```r
library('imager')
library('tidyverse')
```

원숭이책으로 유명한 맨드릴 이미지를 불러와서 예제를 진행해보자.


```r
mandrill_url = 'http://graphics.cs.williams.edu/data/images/mandrill.png'
mandrill_im = load.image(mandrill_url)
plot(mandrill_im, axes = FALSE)
```

![](/images/post_image/imager_color_quantization/unnamed-chunk-2-1.png)<!-- -->

원래 예제에서는 RGB 색공간을 그대로 사용했지만, 여기서는 Lab 색공간으로 옮겨서 작업을 진행한다. RGB인 상태로 해도 진행하는데 무리는 없다. 


```r
mandrill_df = mandrill_im %>% 
  sRGBtoLab() %>% # 원래 예제대로 따라간다면 이 부분은 skip
  as.data.frame(wide = 'c') %>%
  tbl_df()

mandrill_df
```

```
## # A tibble: 262,144 × 5
##        x     y      c.1       c.2       c.3
##    <int> <int>    <dbl>     <dbl>     <dbl>
## 1      1     1 61.79309 -5.198888 42.876971
## 2      2     1 23.94095 -1.785148 17.117049
## 3      3     1 21.00300 11.782596 26.022035
## 4      4     1 38.96015 -7.196971 27.442783
## 5      5     1 58.42075 -2.629929 37.749110
## 6      6     1 40.10130 -8.196894 35.581860
## 7      7     1 25.97737 16.642471 15.342146
## 8      8     1 12.56329 13.697664  2.240548
## 9      9     1 30.52502  1.667580 21.553337
## 10    10     1 32.70443 16.715056 20.719276
## # ... with 262,134 more rows
```

K means 알고리즘을 이용해 대표 색상 4가지를 추출한다.


```r
mandrill_cluster = mandrill_df %>% 
  select(-x, -y) %>% 
  kmeans(4)
```

각 클러스터의 중앙에 해당하는 색상을 찾고, 원본 테이블과 조인시키기 위해 label을 붙인다.


```r
cluster_colors = mandrill_cluster$centers %>% 
  tbl_df %>% 
  mutate(label = as.character(row_number()))

cluster_colors
```

```
## # A tibble: 4 × 4
##        c.1       c.2        c.3 label
##      <dbl>     <dbl>      <dbl> <chr>
## 1 56.33512 54.342659  42.022211     1
## 2 35.21639 -2.582515   6.850087     2
## 3 62.58927 -8.055263  29.271564     3
## 4 69.28018 -4.570472 -13.544698     4
```

원본 테이블의 색상값을 클러스터링을 통해 추출된 색상으로 변경한다. 


```r
mandrill_df_cluster = mandrill_df %>% 
  mutate(label = as.character(mandrill_cluster$cluster)) %>% 
  select(x, y, label) %>% 
  left_join(cluster_colors, by = 'label') %>% 
  select(-label) %>% 
  # as.cimg 를 사용하기 위해 포맷을 맞춘다 (x, y, cc, value 열로 구성)
  gather(key = 'cc', value = 'value', starts_with('c.')) %>% 
  mutate(cc = as.integer(gsub('c\\.', '', cc)))

mandrill_df_cluster
```

```
## # A tibble: 786,432 × 4
##        x     y    cc    value
##    <int> <int> <int>    <dbl>
## 1      1     1     1 62.58927
## 2      2     1     1 35.21639
## 3      3     1     1 35.21639
## 4      4     1     1 35.21639
## 5      5     1     1 62.58927
## 6      6     1     1 62.58927
## 7      7     1     1 35.21639
## 8      8     1     1 35.21639
## 9      9     1     1 35.21639
## 10    10     1     1 35.21639
## # ... with 786,422 more rows
```

이제 데이터프레임을 다시 원래의 cimg 포맷으로 되돌린다. 그러면 양자화된 결과물을 확인할 수 있다.


```r
mandrill_cluster_result = mandrill_df_cluster %>% 
  as.cimg(dim = dim(mandrill_im) ) %>% 
  LabtosRGB() # 맨 처음에 Lab 로 변경했다면 다시 RGB로 되돌린다

plot(mandrill_cluster_result, axes = FALSE)
```

![](/images/post_image/imager_color_quantization/unnamed-chunk-7-1.png)<!-- -->

위 과정을 `quantize`라는 함수를 만들어서 구성해보았다. 그리고 양자화 수준에 따라서 이미지가 어떻게 달라지는지 확인하기 위해 `compare_quant` 함수를 만들어 비교해보기로 했다.


```r
# cimg 클래스의 이미지 데이터를 양자화시킨다
quantize = function(im, level) {
  im_df = im %>% 
    sRGBtoLab() %>% 
    as.data.frame(wide = 'c') %>%
    tbl_df()
  
  im_cluster = im_df %>% 
    select(-x, -y) %>% 
    kmeans(level)
  
  cluster_colors = im_cluster$centers %>% 
    tbl_df %>% 
    mutate(label = as.character(row_number()))
  
  im_df_cluster = im_df %>% 
    mutate(label = as.character(im_cluster$cluster)) %>% 
    select(x, y, label) %>% 
    left_join(cluster_colors, by = 'label') %>% 
    select(-label) %>% 
    gather(key = 'cc', value = 'value', starts_with('c.')) %>% 
    mutate(cc = as.integer(gsub('c\\.', '', cc)))
  
  im_cluster_result = im_df_cluster %>% 
    as.cimg(dim = dim(mandrill_im) ) %>% 
    LabtosRGB() 
  
  return (im_cluster_result)
}

# 양자화 수준에 따라 이미지가 어떻게 달라지는지 비교
compare_quant = function(im, levels, mfcol) {
  if (missing(mfcol)) { # 기본값 설정
    mfcol = c(1, length(levels))
  }
  
  old_par = par(no.readonly = TRUE) # 기존 설정
  par(mfcol = mfcol) # 변경할 항목
  on.exit(par(old_par)) # 함수가 종료될 때 기존의 설정으로 복원
  
  for (l in levels) {
    quantize(mandrill_im, level = l) %>% 
      plot(axes = FALSE, main = paste0('Level : ', l))
  }
  
  invisible(im)
}
```

이제 양자화 수준을 1, 2, 4, 8로 두었을 때 각각의 이미지가 어떻게 변하는지 살펴보자


```r
mandrill_im %>% 
  compare_quant(levels = c(1,2,4,8))
```

![](/images/post_image/imager_color_quantization/unnamed-chunk-9-1.png)<!-- -->

<br /><br />

# 마무리

---

사실 이미지를 가지고 원래 하고 싶었던 작업은 따로 있는지라, 당분간은 시간이 날 때마다 삽질을 하게 될 것 같다. 이게 일과 전혀 관련이 없는지라 좀 걱정이 되기는 하지만 어디서 어떻게 도움이 될지 사람일은 모르는 거니까.. 라고 위안을 삼고 있다.

관련하여 더 전문적인 작업을 하실 수 있는 능력자들이 많이 계실테니, 많이 공유해주시거나 코멘트를 주시면 감사하겠습니다. ㅎㅎ
