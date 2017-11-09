---
layout: post
published: true
title: t-SNE in R/Python
mathjax: false
featured: false
comments: true
headline: t-SNE for R and Python
categories: R Python
tags: t-SNE r python scikit-learn tsne
---

![cover-image](/images/macphoto.jpg)

# t-SNE

---

최근 딥러닝 등 연구의 결과물을 보면 t-SNE를 적용해 고차원의 데이터를 축소시켜서 시각화하는 경우가 많다. 회사에서 작업을 하다 보니 t-SNE를 활용해 볼 기회가 생겼는데, R과 파이썬 양쪽 모두에서 테스트를 하게 되었다. 이렇게 억지로라도 정리를 하지 않으면 다 까먹을 것 같아서 반쯤은 기록용으로 (오래간만에) 포스팅을 시작한다.

*이러이러하게 작업하면 결과물이 나온다 그리고 어떤걸 주의해라!* 라는 것을 정리하기 위한 글이기 때문에, 알고리즘의 원리라든지 파라미터에 대한 자세한 정리는 하지 않기로 했다. 그건 나중에 공부를 더 해보고 써야지..

다만 내용을 이해하는데 도움이 되었던 글을 몇 가지 첨부해본다. (이것도 기록을 위해 ㅎㅎ)

- [송호연님 브런치: MNIST 시각화-차원감소(번역)](https://brunch.co.kr/@chris-song/37)
- [SlideShare: Visualizing data using t-SNE](https://www.slideshare.net/ssuser06e0c5/visualizing-data-using-tsne-73621033)
- [ratsgo 블로그: t-SNE](https://ratsgo.github.io/machine%20learning/2017/04/28/tSNE/)

<br /><br />

# R에서 t-SNE 적용하기

---

R에서는 `tsne` 라이브러리를 사용해서 작업을 진행했다. 다만 주의해야할 사항은 데이터가 커질수록 어마어마하게 메모리를 많이 잡아먹는다. 작업할 때 4000x150 사이즈의 행렬을 사용하는데도 profile 돌려보면 10기가정도의 메모리를 사용하기도 했다. 아무 생각없이 데이터 몽땅 넣고 돌렸다가 메모리 180기가 필요하다고 에러나고 뻗어버려서 당황...

특히 `tsne::tsne` 함수의 경우 sparse matrix에 대한 고려가 전혀 되어있지 않다. `dgCMatrix` 같은 sparse matrix 형태로 넣어도, 중간 과정 곳곳에서 `as.matrix()`를 통해 메모리 먹는 하마로 변신시켜버린다. 대량의 데이터를 사용해야 하는 경우라면 아래에 나와있는 파이썬 코드를 참고할 것을 추천한다.

```r
library('tidyverse')

# 결과물 재현을 위해 seed를 설정
set.seed(1)

# iris 데이터를 matrix로 변환시킨 후 t-SNE 적용
iris_tsne = tsne::tsne(as.matrix(iris[1:4]))

# 맵핑된 결과물에 원래의 레이블을 달아보자
df_iris_tsne = iris_tsne %>% 
  as.data.frame() %>% 
  tbl_df() %>% 
  mutate(species = iris$Species)
```

```r
df_iris_tsne

# A tibble: 150 x 3
#          V1       V2 species
#        <dbl>    <dbl>  <fctr>
#  1 12.197062 4.489194  setosa
#  2  9.148197 7.107035  setosa
#  3  9.200707 4.079943  setosa
#  4  7.615295 3.000362  setosa
#  5 11.569645 2.735391  setosa
#  6 14.241100 7.158919  setosa
#  7  9.526712 2.048142  setosa
#  8 10.980824 3.994848  setosa
#  9  5.954990 3.698045  setosa
# 10  8.069608 5.287997  setosa
# ... with 140 more rows
```

```r
df_iris_tsne %>% 
  ggplot(aes(x = V1, y = V2, color = species)) +
    geom_point() +
    scale_color_brewer(palette = 'Paired') +
    ggtitle('t-SNE result : iris dataset (Real Species)') +
    theme(axis.title.x = element_blank(),
          axis.title.y = element_blank())
```

![](/images/post_image/tsne_for_r_py/tsne_for_r_py_01.png)

이제 t-SNE 결과물을 DBScan 알고리즘을 통해 군집화하고 그 결과를 살펴보자. setosa 종이 하나의 클러스터, versicolor와 virginica가 하나의 클러스터를 구성하는 것을 볼 수 있다.

```r
result_dbscan = fpc::dbscan(iris_tsne, eps = 3)

df_iris_tsne %>% 
  mutate(cluster = result_dbscan$cluster) %>% 
  ggplot(aes(x = V1, y = V2, color = factor(cluster))) +
    geom_point() +
    scale_color_brewer(name = 'cluster', palette = 'Paired') +
    ggtitle('t-SNE result : iris dataset (DBScan Result)') +
    theme(axis.title.x = element_blank(),
          axis.title.y = element_blank())
```

![](/images/post_image/tsne_for_r_py/tsne_for_r_py_02.png)

<br /><br />

# Python에서 t-SNE 적용하기

---

이번에는 파이썬에서 **scikit-learn**을 통해 t-SNE를 적용해보자. 각종 파라미터에 대한 설명은 [공식문서](http://scikit-learn.org/stable/modules/generated/sklearn.manifold.TSNE.html) 에서 확인할 수 있다.

시각화는 vega를 기반으로 하는 [Altair](https://altair-viz.github.io/) 를 사용했다.

```python
import pandas as pd
import numpy as np
from sklearn.manifold import TSNE
import altair as alt

# iris 데이터
iris = pd.read_csv('https://raw.githubusercontent.com/mwaskom/seaborn-data/master/iris.csv')

# 결과물 재현을 위해 seed를 설정
np.random.seed(1)

# iris 데이터를 matrix로 변환시킨 후 t-SNE 적용
iris_matrix = iris.iloc[:, 0:4].values
iris_tsne_result = TSNE(learning_rate=300, init='pca').fit_transform(iris_matrix)

# 맵핑된 결과물에 원래의 레이블을 달아보자
df_iris_tsne_result = (
  pd.DataFrame(iris_tsne_result, columns=['V1', 'V2'])
    .assign(species = iris['species'])
)
```

```python
(df_iris_tsne_result
  .pipe(alt.Chart, width=800, height=400)
  .mark_point()
  .encode(x='V1:Q', y='V2:Q', color='species:N')
)
```

![](/images/post_image/tsne_for_r_py/tsne_for_r_py_03.png)