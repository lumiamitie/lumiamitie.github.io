---
layout: post
published: true
title: Pie Gauge Chart in ggplot2
mathjax: false
featured: false
comments: true
headline: How to Draw Pie Gauge Chart in ggplot2
categories: R
tags: R Visualization
---

![cover-image](/images/macphoto.jpg)

요새 회사에서 대시보드 차트 기획을 많이 하다보니, 다양한 형태의 차트를 그리게 되었다. 산점도, 막대, 선 그래프 등의 기본적인 형태의 그래프는 다른 시각화 도구를 사용하면 금방 그리니까 슥슥 진행했는데, 조금만 복잡하거나 일반적이지 않은 그래프는 어쩔 수 없이 직접 그리는 수밖에 없었다. 에버노트에 정리만 해두고 있었지만 아무래도 까먹기 전에 블로그에는 올려야 할 것 같아서 정리정리

# Pie Gauge Chart

음... 사실 이 그래프 모양은 아는데 이름을 몰라서 찾는데 애먹었다. 검색해보니 Pie Gauge Chart라는 명칭으로 부르는 것 같다. 최종적으로 그려볼 형태는 다음과 같다.

![](/images/post_image/pie_gauge_in_ggplot2/unnamed-chunk-3-1.png)

이제 이 그래프를 ggplot2로 그려보자!! 현재 ggplot2가 3.0 까지 나왔지만, 일단 해당 그래프는 2.2.1 버전에서 작성되었다. 


```r
library('tidyverse')
```

임의의 데이터를 구성해보았다. 


```r
data = data_frame(
  type = c('Type A', 'Type A', 'Type B', 'Type B'),
  group = c('A', 'B', 'A', 'B'),
  ratio = c(0.6, 0.72, 0.34, 0.55)
)
```

ggplot2에서 pie gauge 차트를 그리는 과정은 다음과 같다

- 1) 막대그래프를 그린다 (가운데를 쉽게 비우려면 bar 대신 rect를 통해 그린다)
- 2) 좌표계를 직교좌표계에서 극좌표계로 바꾼다 (y값이 각도와 맵핑되도록 한다)
- 3) x축의 범위를 조정한다! (가운데를 비운다면 xlim이 0부터 시작하도록 강제한다)
- 4) 스타일을 변경한다



```r
data %>%
  mutate(xmin = if_else(group == 'A', 2, 3),
         xmax = xmin + 1) %>% 
  ggplot(aes(fill = group)) +
    geom_rect(aes(xmin = xmin, xmax = xmax, ymin = 0, ymax = ratio), 
              color = 'white') +
    geom_text(aes(x = (xmin + xmax) / 2, y = ratio,
                  label = scales::percent(ratio)), 
              # family = 'Apple SD Gothic Neo', # 맥 사용자는 한글이 깨질 경우 여기를 추가해주세요!
              size = 3, nudge_y = 0.015) +
    facet_wrap(~ type, ncol = 6) +
    scale_fill_manual(values = c('#1DCDBC', '#38C6F4')) +
    scale_x_continuous(limits = c(0, NA)) +
    scale_y_continuous(limits = c(0, 1)) +
    xlab('') + ylab('') +
    coord_polar(theta = 'y') + #시계방향으로 돈다
    # coord_polar(theta = 'y', direction = -1) + #시계반대방향으로 돈다
    theme_void() + #### 윈도우/리눅스 사용자 ####
    # theme_void(base_family = 'Apple SD Gothic Neo') + #### 맥 사용자 ####
    theme(legend.position = 'bottom', axis.text = element_blank())
```

![](/images/post_image/pie_gauge_in_ggplot2/unnamed-chunk-3-1.png)

`coor_polar(theta = 'y', direction = 1)` 에서 direction 값이 1일 경우 막대가 시계방향으로 휜다. 시계 반대방향으로 돌리려면 `direction = -1` 로 설정을 변경하면 된다

![](/images/post_image/pie_gauge_in_ggplot2/unnamed-chunk-4-1.png)
