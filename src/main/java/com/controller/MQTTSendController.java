package com.controller;

import com.mqtt.MQTTProviderService;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/mqtt")
public class MQTTSendController {

    private static final int SERVO_MIN_ANGLE = 0;
    private static final int SERVO_MAX_ANGLE = 180;
    private static final int SERVO_MIN_PULSE_US = 500;
    private static final int SERVO_MAX_PULSE_US = 2500;

    @Value("${spring.mqtt.client-send}")
    private String deviceControlTopic;

    @Autowired
    MQTTProviderService mqttProviderService;

    @GetMapping("/send")
    public Map<String, Object> sendmessage() {
        String command = "open beep";
        boolean success = mqttProviderService.publish(0, false, deviceControlTopic, command);
        return alarmResult(success, command, "蜂鸣器开启指令已发送", "蜂鸣器开启指令发送失败");
    }

    @GetMapping("/close")
    public Map<String, Object> closemessage() {
        String command = "close beep";
        boolean success = mqttProviderService.publish(0, false, deviceControlTopic, command);
        return alarmResult(success, command, "蜂鸣器关闭指令已发送", "蜂鸣器关闭指令发送失败");
    }

    @GetMapping("/duoji")
    public Map<String, Object> duoji(@RequestParam int currentAngle) {
        int angle = clampServoAngle(currentAngle);
        int pulseWidth = angleToPulseWidth(angle);
        String command = "duoji:" + pulseWidth;
        boolean success = mqttProviderService.publish(0, false, deviceControlTopic, command);
        return Map.of(
                "success", success,
                "topic", deviceControlTopic,
                "angle", angle,
                "pulseWidth", pulseWidth,
                "command", command,
                "message", success ? "舵机指令已发送" : "舵机指令发送失败"
        );
    }

    private int clampServoAngle(int angle) {
        return Math.max(SERVO_MIN_ANGLE, Math.min(SERVO_MAX_ANGLE, angle));
    }

    private int angleToPulseWidth(int angle) {
        return SERVO_MIN_PULSE_US
                + angle * (SERVO_MAX_PULSE_US - SERVO_MIN_PULSE_US)
                / (SERVO_MAX_ANGLE - SERVO_MIN_ANGLE);
    }

    private Map<String, Object> alarmResult(boolean success, String command, String successMessage, String failMessage) {
        return Map.of(
                "success", success,
                "topic", deviceControlTopic,
                "command", command,
                "message", success ? successMessage : failMessage
        );
    }
}
