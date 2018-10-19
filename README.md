# noah-system

React Native 热更新后台系统，维护RN的离线打包、发版、版本灰度配置、数据统计(TODO)等功能


## native打包下载全量包

由于全量包版本，没有在源代码里，是在后台系统维护的，因此，native在打包时，需要实时向后台
请求当前native版本对应的最新全量包，拿到全量包后，校验md5，解压放到native里。

后台开放下载全量包接口如下：

url: `/dash/apps/downloadLatestPackage?appKey=${appKey}&appVersion=${nativeVersion}`

有2个 **必填** 参数： `appKey`(在后台创建的应用Key)和`appVersion`(当前的native版本号)

接口响应情况：

* http 200: 直接返回全量包的zip文件。在 `response header`中，包含了 `x-package-md5` 这个
header，值是该全量包的 `md5` 值。客户端打包流程中，在下载完全量包后，应先校验下载的全量包md5，是否和`x-package-md5`返回的值匹配
* 其他 http code：失败，停止打包流程

