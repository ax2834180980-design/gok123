package com.mqtt;

import com.alibaba.fastjson2.JSONObject;
import com.server.JDBCServer;
import com.websocket.WebSocketServer;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.paho.client.mqttv3.IMqttAsyncClient;
import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.MqttCallback;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
@Slf4j
public class MQTTProviderCallBack implements MqttCallback {
    private static final Pattern SENSOR_PATTERN = Pattern.compile("([htp])\\s*:\\s*(-?\\d+)");

    @Value("${spring.mqtt.client-id}")
    private String clientId;


    @Autowired
    private WebSocketServer webSocketServer;

    @Autowired
    private JDBCServer jdbcServer;

    /**
     * 与服务器断开的回调
     */
    @Override
    public void connectionLost(Throwable cause) {
        log.info(clientId + "与MQTT服务端断开连接！！！！！");
    }

    /**
     * 监听消息到达的回调
     */
    @Override
    public void messageArrived(String topic, MqttMessage message) throws Exception {
//        log.info("MQTT客户端接收到原始消息是：{}\t 数据来自主题topic：{}", message, topic);
        String str = new String(message.getPayload());
        // 将换行符(\n)和回车符(\r)替换为空格
        String result = str.replaceAll("[\\r\\n]+", " ");
        // 1. 获取当前时间
        LocalDateTime now = LocalDateTime.now();
        // 2. 定义格式化模式
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        // 3. 格式化输出
        String formattedTime = now.format(formatter);

        log.info("MQTT客户端接收到处理后的数据是：{}\t 数据来自主题topic：{} \t数据采集时间：{}", result, topic, formattedTime);
        JSONObject jsonObject = parseSensorPayload(result);
        if (jsonObject == null) {
            return;
        }

        int wendu = jsonObject.getIntValue("wendu");
        int shidu = jsonObject.getIntValue("shidu");
        int hongwai = jsonObject.getIntValue("hongwai");
        jdbcServer.saveIOT(wendu, shidu, 45, hongwai, 0, formattedTime);
        webSocketServer.sendMessageALL(jsonObject.toJSONString());
    }

    private JSONObject parseSensorPayload(String payload) {
        Integer humi = null;
        Integer temp = null;
        Integer people = null;

        Matcher matcher = SENSOR_PATTERN.matcher(payload);
        while (matcher.find()) {
            String key = matcher.group(1);
            int value = Integer.parseInt(matcher.group(2));
            if ("h".equals(key)) {
                humi = value;
            } else if ("t".equals(key)) {
                temp = value;
            } else if ("p".equals(key)) {
                people = value;
            }
        }

        if (humi == null || temp == null || people == null) {
            log.info("MQTT message is not sensor data, skip websocket chart update: {}", payload);
            return null;
        }

        JSONObject jsonObject = new JSONObject();
        jsonObject.put("wendu", temp);
        jsonObject.put("shidu", humi);
        jsonObject.put("hongwai", people);
        return jsonObject;
    }

    /**
     * 消息发布成功的回调
     */
    @Override
    public void deliveryComplete(IMqttDeliveryToken token) {
        IMqttAsyncClient client = token.getClient();
        log.info(client.getClientId() + "发布消息成功！");
    }

}
