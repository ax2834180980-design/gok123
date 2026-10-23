// 基于准备好的dom，初始化echarts实例
var myChartB = echarts.init(document.getElementById('gaugeshidu'));

// 指定图表的配置项和数据
optionB = {
    series: [
        {
            type: 'gauge',
            id: 'main-gauge', // 设置 ID
            startAngle: 180,
            endAngle: 0,
            center: ['50%', '75%'],
            radius: '100%',
            min: 0,
            max: 1,
            // 修改1：将分割数改为 6 或 3 的倍数，以便均匀分布
            // 这里设为 6，每 0.1666 一个刻度，或者保持 8 但调整颜色节点
            // 为了严格3等分，建议配合 color 数组使用
            splitNumber: 6,

            axisLine: {
                lineStyle: {
                    width: 16,
                    color: [
                        [1 / 3, '#fbbf24'],
                        [2 / 3, '#4ade80'],
                        [1, '#38d5ff']
                    ]
                }
            },
            pointer: {
                icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
                length: '12%',
                width: 20,
                offsetCenter: [0, '-60%'],
                itemStyle: {
                    color: 'auto'
                }
            },
            axisTick: {
                length: 12,
                lineStyle: {
                    color: 'auto',
                    width: 2
                }
            },
            splitLine: {
                length: 20,
                lineStyle: {
                    color: 'auto',
                    width: 5
                }
            },
            axisLabel: {
                color: '#edf7ff',
                fontSize: 17,
                distance: -60,
                rotate: 'tangential',
                formatter: function (value) {
                    if (value > 0.8 && value < 0.9) {
                        return '潮湿';
                    } else if (value > 0.45 && value < 0.55) {
                        return '舒适';
                    } else if (value > 0.1 && value < 0.2) {
                        return '干燥';
                    }
                    return '';
                }
            },
            title: {
                offsetCenter: [0, '0%'],
                fontSize: 20,
                color: '#edf7ff'
            },
            detail: {
                fontSize: 30,
                offsetCenter: [0, '-35%'],
                valueAnimation: true,
                formatter: function (value) {
                    return Math.round(value * 100) + '';
                },
                color: '#38d5ff',
                fontWeight: 800
            },
            data: [
                {
                    value: 0,
                    name: '湿度'
                }
            ]
        },
        {
            type: 'gauge',
            startAngle: 180,
            endAngle: 0,
            center: ['50%', '75%'],
            radius: '100%', // 与主系列半径一致，确保刻度位置对齐
            min: 0,
            max: 1,
            axisLine: {show: false}, // 隐藏轴线，因为主系列已经画了
            axisTick: {show: false}, // 隐藏刻度线
            splitLine: {show: false}, // 隐藏分割线
            pointer: {show: false},  // 隐藏指针
            title: {show: false},
            detail: {show: false},
            splitNumber: 10, // 数字刻度的密度，10表示显示0,10,20...100
            axisLabel: {
                show: true,
                distance: 35,
                color: '#94a9bd',
                fontSize: 12,
                formatter: function (value) {
                    return Math.round(value * 100);
                }
            },
            data: [] // 辅助系列不需要数据
        }
    ]
};


// 使用刚指定的配置项和数据显示图表。
myChartB.setOption(optionB);
// setInterval(function () {
//     myChartB.setOption({
//         series: [
//             {
//                 id: 'main-gauge', // 通过 ID 定位
//                 data: [
//                     {
//                         value: +(Math.random() ).toFixed(2),
//                         name: '湿度'
//                     }
//                 ]
//             }
//         ]
//     });
// }, 3000);
// 【新增代码】监听窗口大小变化，自动重绘图表
window.addEventListener('resize', function () {
    myChartB.resize();
});
