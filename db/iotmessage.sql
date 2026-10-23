/*
 Navicat Premium Dump SQL

 Source Server         : me
 Source Server Type    : MySQL
 Source Server Version : 80042 (8.0.42)
 Source Host           : localhost:3306
 Source Schema         : wlw2023

 Target Server Type    : MySQL
 Target Server Version : 80042 (8.0.42)
 File Encoding         : 65001

 Date: 27/06/2026 10:57:58
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for iotmessage
-- ----------------------------
DROP TABLE IF EXISTS `iotmessage`;
CREATE TABLE `iotmessage`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `wendu` float NULL DEFAULT NULL COMMENT '温度',
  `shidu` float NULL DEFAULT NULL COMMENT '湿度',
  `tuoji` float NULL DEFAULT NULL COMMENT '舵机',
  `hongwai` int NULL DEFAULT NULL COMMENT '红外感知',
  `fenmingqi` int NULL DEFAULT NULL COMMENT '蜂鸣器',
  `createTime` datetime NULL DEFAULT NULL COMMENT '添加时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of iotmessage
-- ----------------------------

SET FOREIGN_KEY_CHECKS = 1;
