import * as d3 from 'd3';
import rotateComponent from './lib/rotateComponent';
import rotateComponentcss from './lib/rotateComponent.css';
let rotateInstance = new rotateComponent();
let chart = null;//图表的实例
let sortType = false;//是否排序
let chartType = 'bar';//图表类型
let mapType = 'heatMap';//地图类型

d3.json("data/city.json",function(error,data){
    chart = rotateInstance.init('#rotate-container',data,chartType,sortType,mapType);
});


let changeButton = document.querySelector('#changeChartType');
changeButton.addEventListener('change',function(e){
    console.log(this.value);
    if(chart==null){
        return;
    } 

    if(this.value == '柱状图'){
        chartType = 'bar';
    }else if(this.value == '折线图'){
        chartType = 'line';
    }else if(this.value == '热力图'){
        mapType = 'heatMap';
    }else if(this.value == '圆形图'){
        mapType = 'circleMap';
    }
    chart.changeDrawType(chartType,sortType,mapType);
},true);


let changeSortButton = document.querySelector('#changeSortType');
changeSortButton.addEventListener('change',function(e){
    console.log(this.value);
    if(chart==null){
        return;
    } 
    if(this.value == '升序'){
        sortType = true;
    }else if(this.value == '不排序'){
        sortType = false;
    }
    chart.changeDrawType('line',sortType,'circleMap');
},true);
