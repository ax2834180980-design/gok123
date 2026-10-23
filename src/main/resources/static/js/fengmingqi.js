function renderAlarmPanel() {
    const panel = document.getElementById('alarmPanel');
    if (!panel) {
        return;
    }

    panel.innerHTML = `
        <div id="fengmingqi" class="alarm-chart"></div>
        <div class="alarm-content">
            <div class="alarm-header">
                <div>
                    <div class="alarm-title">报警控制</div>
                    <div class="alarm-subtitle">蜂鸣器远程控制</div>
                </div>
                <div class="alarm-badge" id="alarmBadge">待机</div>
            </div>
            <div class="alarm-visual">
                <div class="status-light gray-disable" id="light"></div>
                <div class="alarm-base"></div>
            </div>
            <div class="alarm-status" id="alarmStatus">蜂鸣器当前关闭</div>
            <div class="alarm-actions">
                <button class="alarm-btn alarm-open" id="alarmOpenBtn" onclick="switchAlarm()">报警</button>
                <button class="alarm-btn alarm-close" id="alarmCloseBtn" onclick="switchDisable()">关闭</button>
            </div>
        </div>
    `;
}

renderAlarmPanel();

var myChart_fengmingqi = echarts.init(document.getElementById('fengmingqi'));
myChart_fengmingqi.setOption({
    backgroundColor: 'transparent'
});

window.addEventListener('resize', function () {
    myChart_fengmingqi.resize();
});

function setAlarmLoading(isLoading) {
    const openBtn = document.getElementById('alarmOpenBtn');
    const closeBtn = document.getElementById('alarmCloseBtn');
    if (openBtn) {
        openBtn.disabled = isLoading;
    }
    if (closeBtn) {
        closeBtn.disabled = isLoading;
    }
}

function setAlarmState(isAlarm, message) {
    const light = document.getElementById('light');
    const badge = document.getElementById('alarmBadge');
    const status = document.getElementById('alarmStatus');

    if (light) {
        light.className = isAlarm ? 'status-light red-alarm' : 'status-light gray-disable';
    }
    if (badge) {
        badge.textContent = isAlarm ? '报警中' : '待机';
        badge.className = isAlarm ? 'alarm-badge active' : 'alarm-badge';
    }
    if (status) {
        status.textContent = message || (isAlarm ? '蜂鸣器已开启' : '蜂鸣器当前关闭');
    }
}

function sendAlarmCommand(url, isAlarm, successText) {
    setAlarmLoading(true);
    setAlarmState(isAlarm, '指令发送中...');

    return axios.get(url)
        .then(function (response) {
            if (response.data && response.data.success === false) {
                throw new Error(response.data.message || '指令发送失败');
            }
            setAlarmState(isAlarm, successText);
            return response;
        })
        .catch(function (error) {
            console.log(error);
            setAlarmState(false, '发送失败，请检查 MQTT 服务');
            return Promise.reject(error);
        })
        .finally(function () {
            setAlarmLoading(false);
        });
}

function switchAlarm() {
    return sendAlarmCommand('/mqtt/send', true, '蜂鸣器已开启');
}

function switchDisable(options) {
    const isAutoCommand = options && options.fromAuto === true;
    return sendAlarmCommand('/mqtt/close', false, '蜂鸣器已关闭')
        .then(function (response) {
            if (!isAutoCommand && typeof markAutoAlarmManuallyClosed === 'function') {
                markAutoAlarmManuallyClosed();
            }
            return response;
        });
}
