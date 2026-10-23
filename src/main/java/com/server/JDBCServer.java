package com.server;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class JDBCServer {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * 保存数据
     *
     * @param obj sql语句的参数
     * @return
     */
    public boolean saveIOT(Object... obj) {
        String sql = "insert into iotmessage(wendu,shidu, tuoji,hongwai,fenmingqi,createTime) values(?,?,?,?,?,?)";
        int num = jdbcTemplate.update(sql, obj);
        if (num == 1) {
            return true;
        }
        return false;
    }


}
