package com;

import java.awt.Desktop;
import java.net.URI;
import java.util.Locale;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.env.Environment;

@SpringBootApplication
public class Wlw2023JavaApplication implements ApplicationRunner {

    private final Environment environment;

    public Wlw2023JavaApplication(Environment environment) {
        this.environment = environment;
    }

    public static void main(String[] args) {
        SpringApplication.run(Wlw2023JavaApplication.class, args);
    }

    @Override
    public void run(ApplicationArguments args) {
        String port = environment.getProperty("local.server.port",
                environment.getProperty("server.port", "8080"));
        String dashboardUrl = "http://localhost:" + port + "/";

        try {
            if (Desktop.isDesktopSupported() && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
                Desktop.getDesktop().browse(new URI(dashboardUrl));
            } else if (System.getProperty("os.name", "").toLowerCase(Locale.ROOT).contains("win")) {
                new ProcessBuilder("cmd", "/c", "start", "", dashboardUrl).start();
            } else {
                System.out.println("请在浏览器中打开仪表盘：" + dashboardUrl);
                return;
            }
            System.out.println("仪表盘已自动打开：" + dashboardUrl);
        } catch (Exception e) {
            System.out.println("请在浏览器中打开仪表盘：" + dashboardUrl);
        }
    }

}
