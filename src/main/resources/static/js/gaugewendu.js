// 基于准备好的dom，初始化echarts实例
var myChart = echarts.init(document.getElementById('gaugewendu'));

// 指定图表的配置项和数据
var option = {
    series: [
        {
            type: 'gauge',
            min: 0,
            max: 50,
            radius: '90%',
            center: ['50%', '55%'],
            axisLine: {
                lineStyle: {
                    width: 18,
                    color: [
                        [0.35, '#38d5ff'],
                        [0.72, '#fbbf24'],
                        [1, '#ef4444']
                    ]
                }
            },
            pointer: {
                itemStyle: {
                    color: 'auto'
                }
            },
            axisTick: {
                distance: -20,
                length: 8,
                lineStyle: {
                    color: '#dff5ff',
                    width: 2
                }
            },
            splitLine: {
                distance: -20,
                length: 20,
                lineStyle: {
                    color: '#dff5ff',
                    width: 3
                }
            },
            axisLabel: {
                color: '#b7c8d8',
                distance: 35,
                fontSize: 14
            },
            title: {
                offsetCenter: [0, '40%'],
                fontSize: 20,
                color: '#edf7ff'
            },
            detail: {
                valueAnimation: true,
                formatter: '{value} °C',
                color: '#38d5ff',
                fontSize: 28,
                fontWeight: 800,
                offsetCenter: [0, '70%']
            },
            data: [
                {
                    value: 0,
                    name: '温度'
                }
            ]
        }
    ]
};

// 使用刚指定的配置项和数据显示图表。
myChart.setOption(option);
// setInterval(function () {
//     myChart.setOption({
//         series: [
//             {
//                 data: [
//                     {
//                         value: +(Math.random() * 50).toFixed(2),
//                         name: '温度'
//                     }
//                 ]
//             }
//         ]
//     });
// }, 2000);

// 【新增代码】监听窗口大小变化，自动重绘图表
window.addEventListener('resize', function () {
    myChart.resize();
});
