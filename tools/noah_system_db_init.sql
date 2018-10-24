
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

CREATE DATABASE noah_system;
<<<<<<< HEAD
=======

>>>>>>> aa9ede170ef1b23d0eb7290c3b8bdbd64721a6a2
USE noah_system;

# Dump of table tb_app
# ------------------------------------------------------------

CREATE TABLE `tb_app` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `appKey` varchar(32) NOT NULL DEFAULT '' COMMENT 'app的惟一ID',
  `name` varchar(50) NOT NULL DEFAULT '' COMMENT 'APP的名字，全局惟一',
  `ownerId` int(11) unsigned NOT NULL COMMENT 'app拥有者的ID',
  `platform` tinyint(11) unsigned NOT NULL COMMENT '1-android; 2-ios',
  `entryFile` varchar(250) DEFAULT '' COMMENT '打包时的入口文件',
  `bundleName` varchar(200) NOT NULL DEFAULT '' COMMENT '打包时，产出的JS文件名',
  `gitUrl` varchar(200) DEFAULT '' COMMENT 'git仓库的地址',
  `desc` varchar(200) DEFAULT NULL COMMENT 'app 的描述信息',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_appid` (`appKey`),
  UNIQUE KEY `uk_app_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



# Dump of table tb_package
# ------------------------------------------------------------

CREATE TABLE `tb_package` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `appId` int(11) unsigned NOT NULL COMMENT '所属的app的id',
  `packageVersion` int(11) unsigned NOT NULL COMMENT '全量包的版本号',
  `appVersion` varchar(100) NOT NULL DEFAULT '' COMMENT '该RN支持的native版本号',
  `desc` text NOT NULL COMMENT '该版本描述',
  `abTest` text COMMENT '小流量相关配置',
  `status` tinyint(11) unsigned NOT NULL DEFAULT '1' COMMENT '1不对外开放；2开放下载',
  `forceUpdate` tinyint(3) unsigned NOT NULL DEFAULT '0' COMMENT '是否强制更新：0不强制；1强制更新',
  `disablePatch` tinyint(4) DEFAULT '0' COMMENT '是否禁用增量包下载更新。0允许增量更新；1禁用增量更新',
  `md5` varchar(100) NOT NULL DEFAULT '' COMMENT '下载包的md5',
  `filePath` varchar(200) NOT NULL DEFAULT '' COMMENT '全量包的绝对路径',
  `userId` int(11) NOT NULL COMMENT '本次发版的用户ID',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_app_native_rn` (`appId`,`packageVersion`,`appVersion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='全量包数据表';



# Dump of table tb_patch
# ------------------------------------------------------------

CREATE TABLE `tb_patch` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `appId` int(11) unsigned NOT NULL COMMENT '所属的APP ID',
  `packageId` int(11) NOT NULL COMMENT '外键，指向本增量包所对应的全量包表中的自增ID',
  `packageVersion` int(11) unsigned NOT NULL COMMENT '当前RN版本',
  `compareVersion` int(11) unsigned NOT NULL COMMENT '生成diff的老的RN版本',
  `status` tinyint(11) unsigned NOT NULL DEFAULT '2' COMMENT '1不对外开放；2开放下载',
  `md5` varchar(100) NOT NULL DEFAULT '' COMMENT '增量包MD5',
  `filePath` varchar(200) NOT NULL DEFAULT '' COMMENT '增量包绝对路径',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='增量包数据';



# Dump of table tb_task
# ------------------------------------------------------------

CREATE TABLE `tb_task` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `appId` int(11) unsigned NOT NULL COMMENT '打包任务对应的app id',
  `userId` int(11) unsigned NOT NULL COMMENT '提交本次打包任务的用户ID',
  `branchName` varchar(100) DEFAULT '' COMMENT '本次发版的分支名',
  `appVersion` varchar(100) NOT NULL COMMENT '该RN所属的APP版本',
  `status` tinyint(11) unsigned NOT NULL DEFAULT '0' COMMENT '本次打包任务状态：0已提交；1进行中；2失败；3全量包完成；4增量包完成；5增量包失败',
  `packageId` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '本次打包任务，成功后，对应发版表中的ID；任务成功前，默认为0，表示任务还未成功',
  `logFile` varchar(200) NOT NULL DEFAULT '' COMMENT '本次任务执行过程中，日志文件的绝对路径',
  `desc` varchar(500) NOT NULL DEFAULT '' COMMENT '本次发版的描述',
  `abTest` text COMMENT 'AB Test相关配置',
  `uploadFullPackagePath` text COMMENT '离线上传的全量包，在服务器上的绝对路径',
  `uploadFullPackageMd5` varchar(100) DEFAULT NULL COMMENT '上传全量包的md5',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='提交的发版任务表';



# Dump of table tb_user
# ------------------------------------------------------------

CREATE TABLE `tb_user` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL DEFAULT '' COMMENT '用户名',
  `pwd` varchar(100) NOT NULL DEFAULT '' COMMENT '密码',
  `status` tinyint(10) unsigned NOT NULL DEFAULT '1' COMMENT '1正常；2禁用;',
  `level` tinyint(11) unsigned NOT NULL DEFAULT '1' COMMENT '用户级别：1普通用户；99管理员',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后修改时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='后台系统的用户表';

LOCK TABLES `tb_user` WRITE;
/*!40000 ALTER TABLE `tb_user` DISABLE KEYS */;

INSERT INTO `tb_user` (`id`, `name`, `pwd`, `status`, `level`, `createdAt`, `updatedAt`)
VALUES
	(24,'admin','$2b$10$nLQFdpNfU7bkYA4Cv/RVX.qOVKeBMKIVsIDLmFpId4dGJkBXFU5Ai',1,99,'2018-10-09 11:30:10','2018-10-09 11:30:39');

/*!40000 ALTER TABLE `tb_user` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table tb_user_app
# ------------------------------------------------------------

CREATE TABLE `tb_user_app` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `appId` int(11) unsigned NOT NULL COMMENT '某个APP的id',
  `userId` int(11) unsigned NOT NULL COMMENT '用户ID',
  `access` tinyint(11) unsigned NOT NULL DEFAULT '1' COMMENT '1 无权限；2 可读；3读写',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_app` (`appId`,`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户和APP对应的权限';




/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
