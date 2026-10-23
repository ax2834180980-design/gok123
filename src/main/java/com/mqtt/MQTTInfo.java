package com.mqtt;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.stereotype.Component;

/**
 * 程序启动就开始订阅指定的主题
 *
 * @author wyj
 * 2026-6-28
 */
@Component
@EnableScheduling
@Slf4j
public class MQTTInfo {

    // 订阅消息1
    @Value("${spring.mqtt.client-topic}")
    private String TOPIC;

    private final MQTTProviderService mqttserver;

    public MQTTInfo(MQTTProviderService mqttserver) {
        this.mqttserver = mqttserver;
    }

    @PostConstruct
    public void startMQTT() {
        /**
         * 订阅主题
         *
         * @param topic 要订阅的主题名称，需要 /
         * @param qos   消息级别
         * @return
         */
        mqttserver.start();
//        new Thread(() -> {
//            try {
//                mqttserver.start();
//            } catch (Exception e) {
//                e.printStackTrace();
//            }
//        }).start();

        String str = "订阅主题'" + TOPIC + "'成功\n";
        log.info(str);
    }
}
