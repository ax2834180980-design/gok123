let clientId = Math.random().toString(36).slice(2);
let websocket = new WebSocket("ws://127.0.0.1:8080/ws/" + clientId);
let latestTemperature = null;
let autoAlarmActive = null;
let lastAutoAboveThreshold = null;
let manualAutoCloseHold = false;

function setAutoControlStatus(message, isAlarm) {
    const status = document.getElementById('autoControlStatus');
    if (!status) {
        return;
    }
    status.textContent = message;
    status.style.color = isAlarm ? '#fca5a5' : '#94a3b8';
}

function isAutoModeEnabled() {
    const mode = document.getElementById('controlMode');
    return mode && mode.value === '1';
}

function getAutoThreshold() {
    const input = document.getElementById('temperatureThreshold');
    const value = input ? Number(input.value) : 40;
    return Number.isFinite(value) ? value : 40;
}

function getAutoServoAngle() {
    const input = document.getElementById('autoServoAngle');
    const value = input ? Number(input.value) : 90;
    if (typeof clampServoAngle === 'function') {
        return clampServoAngle(value);
    }
    return Math.max(0, Math.min(180, Math.round(Number.isFinite(value) ? value : 90)));
}

function readServoAngleForAutoControl() {
    if (typeof window.readCurrentServoAngle === 'function') {
        return window.readCurrentServoAngle();
    }
    const slider = document.getElementById('slider');
    const value = slider ? Number(slider.value) : 0;
    if (typeof clampServoAngle === 'function') {
        return clampServoAngle(value);
    }
    return Math.max(0, Math.min(180, Math.round(Number.isFinite(value) ? value : 0)));
}

function getAutoServoTargetAngle() {
    const currentAngle = readServoAngleForAutoControl();
    const rotateAngle = getAutoServoAngle();
    const forwardAngle = currentAngle + rotateAngle;
    const backwardAngle = currentAngle - rotateAngle;

    if (forwardAngle <= 180) {
        return forwardAngle;
    }
    if (backwardAngle >= 0) {
        return backwardAngle;
    }
    return forwardAngle - 180 <= Math.abs(backwardAngle)
        ? 180
        : 0;
}

function sendAutoAlarmCommand(shouldAlarm) {
    if (shouldAlarm && typeof switchAlarm === 'function') {
        return switchAlarm();
    }
    if (!shouldAlarm && typeof switchDisable === 'function') {
        return switchDisable({fromAuto: true});
    }
    return axios.get(shouldAlarm ? '/mqtt/send' : '/mqtt/close');
}

function sendAutoServoCommand(angle) {
    if (typeof setServoAngle === 'function') {
        return setServoAngle(angle);
    }
    return axios.get('/mqtt/duoji?currentAngle=' + angle);
}

function isAlarmPanelShowingAlarm() {
    const light = document.getElementById('light');
    return !!(light && light.classList.contains('red-alarm'));
}

function runAutoControlCommand(shouldAlarm, temperature, threshold) {
    const rotateAngle = getAutoServoAngle();
    const targetAngle = shouldAlarm ? getAutoServoTargetAngle() : null;
    autoAlarmActive = shouldAlarm;
    manualAutoCloseHold = false;
    setAutoControlStatus(shouldAlarm ? '触发自动报警，正在发送指令...' : '温度恢复，正在关闭报警...', shouldAlarm);

    const commandChain = sendAutoAlarmCommand(shouldAlarm)
        .then(function () {
            return shouldAlarm ? sendAutoServoCommand(targetAngle) : null;
        });

    return commandChain
        .then(function () {
            setAutoControlStatus(
                shouldAlarm
                    ? '自动报警中：温度 ' + temperature + '℃ >= 阈值 ' + threshold + '℃，舵机旋转 ' + rotateAngle + '° 到 ' + targetAngle + '°'
                    : '自动待机：温度 ' + temperature + '℃ < 阈值 ' + threshold + '℃',
                shouldAlarm
            );
        })
        .catch(function (error) {
            console.log(error);
            autoAlarmActive = !shouldAlarm;
            setAutoControlStatus('自动指令发送失败，请检查 MQTT 服务', true);
        });
}

function updateAutoStatusOnly(shouldAlarm, temperature, threshold) {
    const rotateAngle = getAutoServoAngle();
    const message = shouldAlarm
        ? (autoAlarmActive === true
            ? '自动报警中：温度 ' + temperature + '℃ >= 阈值 ' + threshold + '℃，舵机已旋转 ' + rotateAngle + '°'
            : '自动条件已满足，但已手动关闭；温度降到阈值以下后会重新等待触发')
        : '自动待机：温度 ' + temperature + '℃ < 阈值 ' + threshold + '℃';

    setAutoControlStatus(message, shouldAlarm && autoAlarmActive === true);
}

function handleTemperatureAutoControl(wendu) {
    const temperature = Number(wendu);
    if (!Number.isFinite(temperature)) {
        return;
    }

    latestTemperature = temperature;

    if (!isAutoModeEnabled()) {
        autoAlarmActive = null;
        lastAutoAboveThreshold = null;
        manualAutoCloseHold = false;
        setAutoControlStatus('手动模式，自动联动暂停', false);
        return;
    }

    const threshold = getAutoThreshold();
    const shouldAlarm = temperature >= threshold;
    const previousAboveThreshold = lastAutoAboveThreshold;
    lastAutoAboveThreshold = shouldAlarm;

    if (previousAboveThreshold === null) {
        if (shouldAlarm) {
            if (manualAutoCloseHold) {
                updateAutoStatusOnly(true, temperature, threshold);
            } else {
                runAutoControlCommand(true, temperature, threshold);
            }
        } else {
            autoAlarmActive = false;
            manualAutoCloseHold = false;
            updateAutoStatusOnly(false, temperature, threshold);
        }
        return;
    }

    if (previousAboveThreshold === false && shouldAlarm) {
        if (manualAutoCloseHold) {
            updateAutoStatusOnly(true, temperature, threshold);
        } else {
            runAutoControlCommand(true, temperature, threshold);
        }
        return;
    }

    if (previousAboveThreshold === true && !shouldAlarm) {
        if (autoAlarmActive === true || isAlarmPanelShowingAlarm()) {
            runAutoControlCommand(false, temperature, threshold);
        } else {
            autoAlarmActive = false;
            manualAutoCloseHold = false;
            updateAutoStatusOnly(false, temperature, threshold);
        }
        return;
    }

    if (shouldAlarm && !manualAutoCloseHold && autoAlarmActive === true && !isAlarmPanelShowingAlarm()) {
        runAutoControlCommand(true, temperature, threshold);
        return;
    }

    updateAutoStatusOnly(shouldAlarm, temperature, threshold);
}

function refreshAutoControl() {
    if (latestTemperature === null) {
        setAutoControlStatus(isAutoModeEnabled() ? '自动模式待机' : '手动模式，自动联动暂停', false);
        return;
    }

    if (!isAutoModeEnabled()) {
        autoAlarmActive = null;
        lastAutoAboveThreshold = null;
        manualAutoCloseHold = false;
        setAutoControlStatus('手动模式，自动联动暂停', false);
        return;
    }

    const threshold = getAutoThreshold();
    const rotateAngle = getAutoServoAngle();
    const currentlyAboveThreshold = latestTemperature >= threshold;

    if (!currentlyAboveThreshold && (autoAlarmActive === true || isAlarmPanelShowingAlarm())) {
        lastAutoAboveThreshold = false;
        runAutoControlCommand(false, latestTemperature, threshold);
        return;
    }

    if (!currentlyAboveThreshold) {
        manualAutoCloseHold = false;
    }

    if (currentlyAboveThreshold && !manualAutoCloseHold && (autoAlarmActive !== true || !isAlarmPanelShowingAlarm())) {
        lastAutoAboveThreshold = true;
        runAutoControlCommand(true, latestTemperature, threshold);
        return;
    }

    lastAutoAboveThreshold = currentlyAboveThreshold;
    setAutoControlStatus(
        '配置已更新：当前温度 ' + latestTemperature + '℃，阈值 ' + threshold + '℃，舵机旋转 ' + rotateAngle + '°；只保存参数',
        false
    );
}

window.refreshAutoControl = refreshAutoControl;
window.markAutoAlarmManuallyClosed = function () {
    autoAlarmActive = false;
    if (latestTemperature !== null && isAutoModeEnabled()) {
        lastAutoAboveThreshold = latestTemperature >= getAutoThreshold();
        manualAutoCloseHold = lastAutoAboveThreshold;
    }
    setAutoControlStatus('蜂鸣器已手动关闭；温度重新越过阈值时会再次自动报警', false);
};

//连接成功的回调方法
websocket.onopen = () => console.log('连接成功');

//连接发生错误时触发的方法
websocket.onerror = (err) => console.log("error:", err);

//发送消息
setInterval(() => {
    if (websocket.readyState === WebSocket.OPEN) {
        websocket.send("测试:" + new Date().toLocaleTimeString());
    }
}, 5000);

//接受消息
websocket.onmessage = (event) => {
    let {wendu, shidu, hongwai} = JSON.parse(event.data);
    console.log('收到消息:', wendu, shidu, hongwai);
    myChart.setOption({
        series: [{
            data: [{value: wendu, name: '温度'}]
        }]
    });

    myChartB.setOption({
        series: [{
            id: 'main-gauge', // 通过 ID 定位
            data: [{value: shidu / 100, name: '湿度'}]
        }]
    });


    <!--    测试是否有人：1有人；0无人-->
    option_rentiganzhi.series[0].data[0].value = hongwai
    myChart_rentiganzhi.setOption(option_rentiganzhi);
    handleTemperatureAutoControl(wendu);

}

//连接关闭
websocket.onclose = () => console.log("连接关闭！")
