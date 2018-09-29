/**
 * 开发&测试机器上的redis集群地址
 * Created by jess on 2017/2/21.
 */



'ues strict';

//本地测试用的集群，业务测试环境使用该集群
const cluster_local = [
  {
    host : '172.16.3.99',
    port : 7000
  },
  {
    host : '172.16.3.99',
    port : 7001
  },
  {
    host : '172.16.3.99',
    port : 7002
  }
];

module.exports = {
  //本地测试也改为使用qa的集群
  cluster_local : cluster_local,
};