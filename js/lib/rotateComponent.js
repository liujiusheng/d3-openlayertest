/**
 * @name 可翻转的组件
 * @description 一个有两面展示效果的组件，包括d3做统计图表，openlayer做热力图、柱状图、饼状图等效果
 */

import * as d3 from 'd3';
import Map from 'ol/Map';
import View from 'ol/View';
import {Heatmap as HeatmapLayer,Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import {OSM, TileArcGISRest, Vector as VectorSource} from 'ol/source';
import Feature from 'ol/Feature.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import Circle from 'ol/geom/Circle.js';
import {Circle as CircleStyle, Fill, Stroke, Style, Icon} from 'ol/style.js';
import ImageLayer from 'ol/layer/Image.js';
import Projection from 'ol/proj/Projection.js';
import Static from 'ol/source/ImageStatic.js';
import Point from 'ol/geom/Point';
import WebGLMap from 'ol/WebGLMap';


export default class {
    construtor(){}


    /**
     * @name 初始化
     */
    init(dom,data,type,asc,mapType){
        if(this.checkData(data)){
            this.buildDom(dom);
            this.initDraw(type,asc);
            this.initMap(mapType);
            return this;
        }
    }


    /**
     * @name 修改绘制类型
     */
    changeDrawType(type,asc,mapType){
        this.buildDom(this.dom);
        this.initDraw(type,asc);
        this.initMap(mapType);
    }


    //检查输入的数据,若数据为json则绑定到全局
    checkData(data){
        if(typeof data === 'object'){
            let newData = [];
            for(let i in data){
                newData.push({city:i,x:data[i][0],y:data[i][1],value:data[i][2]});
            }
            this.data = newData;
            return true;
        }else{
            console.error('输入数据有误！必须为json格式');
            return false;
        }
    }


    //生成必要的html节点,宽度和高度与用户指定容器内容一致（不包含容器的边框和外边距）
    buildDom(dom){
        if(dom.indexOf('#')==0){
            let node = document.querySelector(dom);
            let width = node.clientWidth;
            let height = node.clientHeight;
            let html = `<div class="flip-container" style="width:${width}px;height:${height}px;">
                <div style="position:absolute;right:5px;top:5px;z-index:2;">
                    <button onclick="flip()">翻转</button>
                </div>
                <div class="flipper">
                    <div class="front" style="width:${width}px;height:${height}px;">
                        <svg width="${width}" height="${height}"></svg>
                    </div>
                    <div class="back" style="width:${width}px;height:${height}px;">
                        <div id="map" style="width:${width}px;height:${height}px;"></div>
                    </div>
                </div>
            </div>`;
            node.innerHTML = html;
            //点击“翻转”按钮翻转
            window.flip = function(){
                let flipper = document.querySelector(".flipper");
                flipper.style.transform == 'rotateY(180deg)'?flipper.style.transform = 'rotateY(0deg)':flipper.style.transform = 'rotateY(180deg)';
            }
            this.dom = dom;
        }else{
            console.error('输入的ID有误！');
        }
    }


/**
 * 背面
 * --------------------------------------------------------------------------------------------------
 */
    //初始化地图
    initMap(mapType){
        let extent = [-180, -90, 180, 90];
        let projection = new Projection({
            code: 'xkcd-image',
            units: 'pixels',
            extent: extent
        });

        let layers = [
            new TileLayer({
                source: new OSM()
            }),
            // new ImageLayer({
            //     source: new Static({
            //       url: './images/2.jpg',
            //       projection: projection,
            //       imageExtent: extent
            //     })
            //   })
            // new TileLayer({
            //     extent: [-13884991, 2870341, -7455066, 6338219],
            //     source: new TileArcGISRest({
            //     url: url
            //     })
            // })
        ];
        this.map = new Map({
            layers: layers,
            target: 'map',
            view: new View({
                projection: 'EPSG:4326',
                center: [112, 30],
                zoom: 4
            })
        });
        if(mapType == 'heatMap'){
            this.drawHeatMap();
        }else if(mapType == 'circleMap'){
            this.drawCircle();    
        }else{
            console.error('暂只支持热力图和圆形图！');
        }
    }


    //用图片代替圆,是以像素为单位，可随地图缩放
    drawCity(){
        
        // let max = d3.max(this.data.map(function(row){
        //     return row.value;
        // }));
        // //创建圆圈
        //   let circleFeatures = this.data.map(function(row){
        //       let height = row.value/max*100;
        //       return row.style=new Style({
        //           image:new Icon({
        //               src:'images/2.jpg',
        //               size:[height,height],
        //               imgSize:[height,height]
        //           })
        //       });
        //   });
        //   let circleLayer = new VectorLayer({
        //     style: function(feature) {
        //       return feature.get('style');
        //     },
        //     source: new VectorSource({features: circleFeatures})
        //   });
        //   this.map.addLayer(circleLayer);
    }


    //画圆
    drawCircle(){
        let max = d3.max(this.data.map(function(row){
            return row.value;
        }));
        let vectorSource = new VectorSource();
        let features = this.data.map(function(row){
            return new Feature(new Circle([row.x, row.y], row.value/max));
        });
        //这个圆的半径单位没怎么搞懂
        vectorSource.addFeatures(features);
        let vectorLayer = new VectorLayer({
            source: vectorSource
        });
        this.map.addLayer(vectorLayer);
    }


    //画热力图
    drawHeatMap(){
        let max = d3.max(this.data.map(function(row){
            return row.value;
        }));
        let features = this.data.map(function(row){
            return new Feature({geometry:new Point([row.x, row.y]),weight:row.value});
        });
        let vectorSource = new VectorSource();
        vectorSource.addFeatures(features);

        //创建热力图层并根据value值设置权重
        let Heatmap = new HeatmapLayer({
            source: vectorSource,
            weight:function(row){
                return row.values_.weight/max;
            }
        });
        this.map.addLayer(Heatmap);
    }


/**
 * 正面
 * -------------------------------------------------------------------------------------------------------------------
 */

    /**
     * @name 初始化图表
     * @description 初始化图表
     * @type:string 图表类型（柱状图或折线图）
     * @asc:boolean 是否升序排列
     */
    initDraw(type,asc){
        let newData = [];
        if(asc == true){
            newData = this.sort();
        }else{
            newData = this.data;
        }
        let svg = d3.select("svg"),
        margin = {top: 20, right: 40, bottom: 30, left: 40},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;
        let x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
            y = d3.scaleLinear().rangeRound([height, 0]);
        let g = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        x.domain(newData.map(function(d) {
                return d.city;
        }));
        y.domain([0, d3.max(newData, function(d) { 
            return d.value; 
        })]);
        g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

        g.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(y).ticks(5))
        .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("value");
        
        if(type == 'bar'){
            this.drawBar(newData,g,x,y,height);
        }else if(type == 'line'){
            this.drawLine(newData,g,x,y);
        }else{
            console.error('暂时只支持柱状图和折线图！');
        }
    }


    /**
     * @name 绘制柱状图
     * @description 绘制柱状图
     * @argument newData:array 数据
     */
    drawBar(newData,g,x,y,height){
        let currentNode = null;
        g.selectAll(".bar")
            .data(newData)
            .enter().append("rect")
                .attr("class", "bar")
                .attr("x", function(d) { return x(d.city); })
                .attr("y", function(d) { return y(d.value); })
                .attr("width", x.bandwidth())
                .attr("height", function(d) { return height - y(d.value); });
                g.selectAll(".bar").on('mouseover',function(a){
                    currentNode =g.append('text').text(a.value).attr('x',function(){return x(a.city)+x.bandwidth()/2;}).attr('y',function(){return y(a.value)-5;}).attr('text-anchor',"middle").attr('stroke','black');
                }).on('mouseout',function(a){
                    currentNode.remove();
                });
    }


    /**
     * @name 绘制折线
     * @description 绘制折线
     * @argument newData 要绘制的数据
     * @argument g 
     * @argument x
     * @argument y
     */
    drawLine(newData,g,x,y){
        let currentNode = null;
        let line = d3.line()
        .x(function(d) { return x(d.city)+x.bandwidth()/2; })
        .y(function(d) { return y(d.value); });

        let path = g.append("path")
        .datum(newData)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", line);
        g.selectAll('circle').data(newData).enter().append("circle").attr('cx',function(d){return x(d.city)+x.bandwidth()/2;}).attr('cy',function(d){return y(d.value);}).attr('r',5).style('fill','red');
        g.selectAll('circle').on('mouseover',function(a){
            currentNode =g.append('text').text(a.value).attr('x',function(){return x(a.city)+x.bandwidth()/2;}).attr('y',function(){return y(a.value)-5;}).attr('text-anchor',"middle").attr('stroke','black');
        }).on('mouseout',function(a){
            currentNode.remove();
        });
    }


    /**
     * @name 生成升序排序数据
     */
    sort(){
        let newData = [];
        for(let i in this.data){
            newData.push(this.data[i]);
        }
        return newData.sort(function(a,b){
            return d3.ascending(a.value, b.value); 
        });
    }
}