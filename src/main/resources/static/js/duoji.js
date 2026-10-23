const slider = document.getElementById('slider');
const valueDisplay = document.getElementById('sliderValue');
let timeoutId;

function clampServoAngle(angle) {
    const number = Number(angle);
    if (!Number.isFinite(number)) {
        return 90;
    }
    return Math.max(0, Math.min(180, Math.round(number)));
}

function angleToPulseWidth(angle) {
    const currentAngle = clampServoAngle(angle);
    return 500 + Math.round(currentAngle * 2000 / 180);
}

function updateSliderValue(angle) {
    const currentAngle = clampServoAngle(angle ?? slider.value);
    valueDisplay.textContent = `${currentAngle}°`;
    const newPosition = (currentAngle - slider.min) / (slider.max - slider.min);
    valueDisplay.style.left = `calc(${newPosition * 100}% - ${newPosition * 54}px)`;
}

function syncServoAngle(angle) {
    const currentAngle = clampServoAngle(angle);
    slider.value = currentAngle;
    updateSliderValue(currentAngle);
    updateChart_duoji(currentAngle);
    return currentAngle;
}

function sendServoCommand(angle) {
    const currentAngle = syncServoAngle(angle);
    return axios.get('/mqtt/duoji?currentAngle=' + currentAngle)
        .then(function (response) {
            if (response.data && response.data.success === false) {
                throw new Error(response.data.message || '舵机指令发送失败');
            }
            console.log('舵机角度:', currentAngle + '°', '脉宽:', angleToPulseWidth(currentAngle) + 'us', response.data);
            return response;
        })
        .catch(function (error) {
            console.log(error);
            return Promise.reject(error);
        });
}

slider.addEventListener('input', function () {
    syncServoAngle(this.value);
});

slider.addEventListener('change', function () {
    clearTimeout(timeoutId);
    sendServoCommand(this.value);
});

slider.addEventListener('mousedown', function () {
    clearTimeout(timeoutId);
});

slider.addEventListener('mouseup', function () {
    timeoutId = setTimeout(function () {
        console.log(`当前舵机角度: ${slider.value}°`);
    }, 200);
});

myChart_duoji = echarts.init(document.getElementById('duoji'));

function updateChart_duoji(angle) {
    const currentAngle = clampServoAngle(angle);
    const option_duoji = {
        title: {
            text: '舵机',
            subtext: currentAngle + '°',
            subtextStyle: {fontSize: '20px', color: '#38d5ff', fontWeight: 800},
            textStyle: {fontSize: '0', color: 'transparent'},
            top: '42%',
            left: 'center',
        },
        series: [{
            type: 'pie',
            itemStyle: {
                borderColor: 'rgba(7, 17, 28, 0.86)',
                borderWidth: 1,
                borderType: 'solid'
            },
            center: ['50%', '48%'],
            radius: ['42%', '70%'],
            startAngle: 90,
            clockwise: true,
            color: ['#38d5ff', 'rgba(148, 169, 189, 0.18)'],
            data: [
                {value: currentAngle, name: '当前角度'},
                {value: 180 - currentAngle, name: '剩余角度'}
            ],
            label: {
                show: false,
                formatter: function (params) {
                    return params.name + ': ' + params.value + '°\n(' + (params.percent).toFixed(1) + '%)';
                }
            }
        }]
    };
    myChart_duoji.setOption(option_duoji);
}

window.clampServoAngle = clampServoAngle;
window.angleToPulseWidth = angleToPulseWidth;
window.syncServoAngle = syncServoAngle;
window.setServoAngle = sendServoCommand;
window.readCurrentServoAngle = function () {
    return clampServoAngle(slider.value);
};

window.addEventListener('resize', function () {
    myChart_duoji.resize();
});

syncServoAngle(slider.value);
