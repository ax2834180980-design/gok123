package com.controller;

import com.alibaba.fastjson2.JSONObject;
import com.server.JDBCServer;
import com.websocket.WebSocketServer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/websocket")
public class WebSocketController {

    @Autowired
    private WebSocketServer webSocketServer;

    @Autowired
    private JDBCServer jdbcServer;

    @GetMapping("/sendmessage")
    public void sendmessage(int wendu, int shidu, int hongwai) {
        // 1. 获取当前时间
        LocalDateTime now = LocalDateTime.now();
        // 2. 定义格式化模式
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        // 3. 格式化输出
        String formattedTime = now.format(formatter);

        jdbcServer.saveIOT(wendu, shidu, 45, hongwai, 0, formattedTime);
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("wendu", wendu);
        jsonObject.put("shidu", shidu);
        jsonObject.put("hongwai", hongwai);
        try {
            webSocketServer.sendMessageALL(jsonObject + "");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
