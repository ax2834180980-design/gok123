package com.websocket;

import jakarta.websocket.*;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import java.io.IOException;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
@ServerEndpoint("/ws/{sid}")
public class WebSocketServer {

    private static Map<String, Session> sessionMap = new HashMap<>();

    /**
     * 连接建立成功调用的方法
     */
    @OnOpen
    public void onOpen(Session session, @PathParam("sid") String sid) {
        log.info("有客户端连接服务器，{}", sid);
        sessionMap.put(sid, session);
    }

    /**
     * 收到客户端消息后调用的方法
     */
    @OnMessage
    public void onMessage(Session session, String message, @PathParam("sid") String sid) {
        log.info("来自客户端用户：{} 消息:{}", sid, message);
    }

    /**
     * 发生错误时调用
     */
    @OnError
    public void onError(Session session, @PathParam("sid") String sid, Throwable error) {
        log.error("出错了1/2！:{}", sid);
        log.error("出错了2/2！:{}", error.getMessage());
        error.printStackTrace();
    }

    /**
     * 连接关闭调用的方法
     */
    @OnClose
    public void onClose(Session session, @PathParam("sid") String sid) {
        log.info("连接断开：{}", sid);
        sessionMap.remove(sid);
    }

    /**
     * 向客户端以广播的方式发送消息
     */
    public void sendMessageALL(String message) throws IOException {
        //获取所有session
        Collection<Session> sessions = sessionMap.values();
        //判断sessions是否为空
        if (!CollectionUtils.isEmpty(sessions)) {
            //循环所有的session，同时给每个session发生消息
            for (Session session : sessions) {
                session.getBasicRemote().sendText(message);
            }
        }
    }

    /**
     * 通过sid向指定客户端发送消息
     */
    public void sendMessageByUserId(String sid, String message) throws IOException {
        log.info("服务端发送消息到{},消息：{}", sid, message);
        sessionMap.get(sid).getBasicRemote().sendText(message);
    }
}
