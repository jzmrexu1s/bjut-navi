var ss;
window.onload=function()
{
    var h=document.documentElement.clientHeight;//可见区域高度
    ss=document.getElementById('abc');
    ss.style.height=h+"px";
};

date = new Date();
date.setTime(date.getTime());
$(function () {
    $('#datetimepicker1').datetimepicker({
        format: 'HH:mm',
        initialDate: date,
    });
});
$(function () {
    $('#datetimepicker2').datetimepicker({
        // format: 'HH:mm',
        initialDate: date,
    });
});
$(function () {
    $('#datetimepicker3').datetimepicker({
        // format: 'HH:mm',
        initialDate: date,
    });
});

var times = [];

Date.prototype.clone = function(){
    return new Date(this.valueOf());
};

function search() {
    if($("#datetimepicker1").find("input").val() === '') {
        return;
    }
    var start_time = $("#datetimepicker1").find("input").val();
    start_time = start_time.split(':');
    var start_t = new Date(2019, 11, 4, start_time[0], start_time[1], 0);
    var walking = new AMap.Walking({
    });
    routes = new Array(display.length * display.length);
    var timeSeq = new Array(display.length * display.length);
    times = new Array(display.length * 2);
    times[0] = start_t.clone();
    times[1] = start_t.clone();
    for (var i = 0; i < display.length; i ++) {
        for (var j = 0; j < display.length; j ++) {
            (function (i, j) {
                walking.search(coordinates[display[i]['id']], coordinates[display[j]['id']], function (status, result) {
                    routes[i * display.length + j] = result;
                    // console.log(result);
                    timeSeq[i * display.length + j] = result['routes']['0']['time'];
                })
            })(i, j);
        }
    }
    setTimeout(function () {
        $.ajax({
            cache: false,
            type: "POST",
            dataType:'json',
            data: {"timeSeq": JSON.stringify(timeSeq)},
            url: "http://127.0.0.1:5000/getseq",
            async: false,
            crossDomain: true,
            traditional: true,
            success: function (data) {
                seq = JSON.parse(data['seq']);
                renders = new Array(seq.length - 1);
                for (var i = 0; i < seq.length - 1; i ++) {
                    render = new Lib.AMap.WalkingRender();
                    render.autoRender({
                        data: routes[(seq[i] - 1) * display.length + (seq[i + 1] - 1)],
                        map: map,
                    });
                    renders[i] = render;
                }
                var k = 2;
                for (var j = 1; j < seq.length - 1; j += 1) {
                    var t = times[k - 1].clone();
                    var t_s = t.getTime();
                    t.setTime(t_s + timeSeq[(seq[j - 1] - 1) * display.length + (seq[j] - 1)] * 1000);
                    times[k] = t.clone();
                    t_s = t.getTime();
                    t.setTime(t_s + display[(seq[j] - 1)]['time'] * 60 * 1000);
                    times[k + 1] = t.clone();
                    k = k + 2;
                }
                var t = times[k - 1].clone();
                var t_s = t.getTime();
                t.setTime(t_s + timeSeq[(seq[seq.length - 2] - 1) * display.length + (seq[seq.length - 1] - 1)] * 1000);
                times[1] = t.clone();

                console.log(times);

                for (var i = 0; i < times.length; i += 1) {
                    times[i] = times[i].toLocaleTimeString();
                }

                // 如果当前时间不处于吃饭时间 (7-9, 11-13, 17-19)
                var eat_locations = ["新食堂", "学综楼", "金工楼", "宿舍10号楼", "宿舍11号楼", "材料楼", "数理楼", "第三教学楼",
                    "第四教学楼", "理科楼", "信息楼", "图书馆",
                    "生命楼", "环能楼", "美食园", "奥运餐厅",
                    "软件楼", "经管楼", "科学楼", "城建楼",
                    "实训楼", "人文楼", "奥林匹克体育馆"];
                var cannot_go = [];
                for (var i = 0; i < display.length; i += 1) {
                    if (eat_locations.indexOf(display[seq[i] - 1]['name']) !== -1) {
                        var t = parseInt(times[i * 2][0]);
                        var apm = times[i * 2].slice(8, 9);
                        if ((apm === "A" && (t < 8)) || (apm === 'P') && (t > 8)) {
                            cannot_go.push({name:display[seq[i] - 1]['name']});
                        }
                    }
                }

                if (cannot_go.length > 0) {
                    $('#cannotArrange').modal('show');

                    var tableColumns2 = [
                        {field: 'name', title: '地点名称'},
                    ];

                    $('#tableL02').bootstrapTable('destroy');
                    $('#tableL02').bootstrapTable({
                        theadClasses: "thead-light",
                        columns: tableColumns2,
                        data: cannot_go,
                    });

                }

                for (var i = 0; i < display.length; i += 1) {
                    if (i === 0) {
                        time_text.push("出发：" + times[i * 2] + " 结束：" + times[i * 2 + 1]);
                        markers[display[seq[i] - 1]['id']].setLabel({
                            content: "<div class='labelContent'>" + "出发：" + times[i * 2] + " 结束：" + times[i * 2 + 1] + "</div>",
                            offset: new AMap.Pixel(-50,-28)})
                    } else {
                        time_text.push("停留：" + times[i * 2] + " ~ " + times[i * 2 + 1]);
                        markers[display[seq[i] - 1]['id']].setLabel({
                            content: "<div class='labelContent'>" + "停留：" + times[i * 2] + " ~ " + times[i * 2 + 1] + "</div>",
                            offset: new AMap.Pixel(-50,-28)})
                    }
                }

            }
        })
    }, 5000);
}

$(function () {
    $('#searchbutton').click(function (event) {
        search();
    });
});

$(function () {
    $('#bookbutton').click(function (event) {
        search();
    });
});

var time_text = [];
var routes_text = [];
var names_text = [];
$(function () {
    $('#sendbutton').click(function (event) {
        routes_text = [];
        names_text = [];
        // console.log(routes);
        for (var i = 0; i < seq.length - 1; i++) {
            var r = routes[(seq[i] - 1) * display.length + (seq[i + 1] - 1)]["routes"]["0"]["steps"];
            var temp = [];
            var j = 0;
            while (j < r.length) {
                temp.push(r[String(j)]["instruction"]);
                j += 1;
            }
            routes_text.push(temp);
        }
        for (var i = 0; i < seq.length; i++) {
            names_text.push(display[seq[i] - 1]["name"]);
        }
        var email = $("#inputemail").val();
        // console.log(email);
        $.ajax({
            cache: false,
            type: "POST",
            dataType: 'json',
            data: {
                "time": JSON.stringify(time_text),
                "routes": JSON.stringify(routes_text),
                "names": JSON.stringify(names_text),
                "email": email
            },
            url: "http://127.0.0.1:5000/mail",
            async: false,
            crossDomain: true,
            traditional: true,
        });
    })
});

var routes = [];
var renders = [];
var seq = [];
var selected_route = 0;
var infoWindow = null;

$(function () {
    $('#clearbutton').click(function (event) {
        for (var i = 0; i < seq.length - 1; i ++) {
            renders[i].clear();
        }
        renders = [];
        routes = [];
        seq = [];
        selected_route = 0;
        display = [];
        times = [];
        time_text = [];
        routes_text = [];
        names_text = [];
        $('#tableL01').bootstrapTable('destroy');
        map.remove(markers);
        markers = [];
        for (var i = 0; i < coordinates.length; i += 1) {
            var marker;
            marker = new AMap.Marker({
                position: coordinates[i],
                title: i,
                icon: normalIcon,
                map: map,
            });
            content = [];
            content.push("电话：6739 3456");
            if (special.indexOf(titles[i]) !== -1) {
                content.push("<a href='http://www.bjut.edu.cn/'>点击此处访问网址</a>");
            }
            marker.content = content;
            infoWindow = new AMap.InfoWindow({
                isCustom: true,
                content: null,
                offset: new AMap.Pixel(16, -45)
            });
            marker.on('mouseover', infoOpen);
            marker.on('click', showInfoM);
            markers.push(marker);
        }
    });
});

$(function () {
    $('#allroute').click(function (event) {
        for (var i = 0; i < seq.length - 1; i ++) {
            renders[i].clear();
        }
        for (var i = 0; i < seq.length - 1; i ++) {
            renders[i].autoRender({
                data: routes[(seq[i] - 1) * display.length + (seq[i + 1] - 1)],
                map: map,
            });
        }
    });
});

$(function () {
    $('#leftroute').click(function (event) {
        for (var i = 0; i < seq.length - 1; i ++) {
            renders[i].clear();
        }
        if (selected_route > 0) {
            selected_route -= 1;
        }
        renders[selected_route].autoRender({
            data: routes[(seq[selected_route] - 1) * display.length + (seq[selected_route + 1] - 1)],
            map: map,
            panel: "panel"
        });
    });
});

$(function () {
    $('#rightroute').click(function (event) {
        for (var i = 0; i < seq.length - 1; i ++) {
            renders[i].clear();
        }
        if (selected_route < seq.length - 2) {
            selected_route += 1;
        }
        renders[selected_route].autoRender({
            data: routes[(seq[selected_route] - 1) * display.length + (seq[selected_route + 1] - 1)],
            map: map,
            panel: "panel"
        });
    });
});

var tableColumns = [
    {field: 'name', title: '地点名称'},
    {field: 'time', title: '持续时间（分钟）'},
];

var display = [];

function rowStyle(row, index) {
    var style = {};
    style={css:{
        'color':'#ffffff'
    }};
    return style;
}

var map = new AMap.Map('container', {
    resizeEnable: true, //是否监控地图容器尺寸变化
    zoom:16, //初始化地图层级
    center: [116.4817881, 39.874614] //初始化地图中心点
});
var markers = [];
var coordinates = [
    [116.479052,39.879193], [116.479,39.878798], [116.480147, 39.878666], [116.480438,39.878741],
    [116.481396,39.879144], [116.481385,39.878749], [116.482108,39.879071], [116.482893,39.87864],
    [116.479001,39.877897], [116.48254,39.878314], [116.482868,39.878179], [116.482834,39.877431],
    [116.478197,39.8774], [116.478847,39.876839], [116.480636,39.876831], [116.481644,39.876783],
    [116.484162,39.876356], [116.481247,39.875476], [116.482858,39.875662], [116.484244,39.875509],
    [116.48633,39.875504], [116.478165,39.875181], [116.479744,39.875077], [116.483666,39.874172],
    [116.486228,39.874934], [116.486149,39.87441], [116.480367,39.873818], [116.481916,39.873816],
    [116.486781,39.873617], [116.478246,39.873424], [116.479657,39.872994], [116.486186,39.873208],
    [116.485965,39.872764], [116.481501,39.872114], [116.48388,39.872445],
];
var titles = [
    "宿舍1号楼", "宿舍2号楼", "新食堂", "学综楼",
    "宿舍3号楼", "宿舍4号楼", "校医院", "金工楼",
    "实验楼", "宿舍10号楼", "宿舍11号楼", "北田径场",
    "第二教学楼", "材料楼", "数理楼", "游泳馆",
    "能源楼", "第三教学楼", "网球场", "第四教学楼",
    "理科楼", "信息楼", "图书馆", "南田径场",
    "生命楼", "环能楼", "美食园", "奥运餐厅",
    "软件楼", "经管楼", "科学楼", "城建楼",
    "实训楼", "人文楼", "奥林匹克体育馆"
];

var lastTime = [];
for (var i = 0; i < coordinates.length; i += 1) {
    lastTime.push(30);
}

var normalIcon = new AMap.Icon({
    size: new AMap.Size(25, 34),
    image: "http://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png",
});

var selectedIcon = new AMap.Icon({
    size: new AMap.Size(25, 34),
    image: "http://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png",
});


function createInfoWindow(title, content) {
    var info = document.createElement("div");
    info.className = "custom-info input-card content-window-card";

    //可以通过下面的方式修改自定义窗体的宽高
    //info.style.width = "400px";
    // 定义顶部标题
    var top = document.createElement("div");
    var titleD = document.createElement("div");
    var closeX = document.createElement("img");
    top.className = "info-top";
    titleD.innerHTML = title;
    closeX.src = "https://webapi.amap.com/images/close2.gif";
    closeX.onclick = infoClose;

    top.appendChild(titleD);
    top.appendChild(closeX);
    info.appendChild(top);

    // 定义中部内容
    var middle = document.createElement("div");
    middle.className = "info-middle";
    middle.style.backgroundColor = 'white';
    middle.innerHTML = content;
    info.appendChild(middle);

    // 定义底部内容
    var bottom = document.createElement("div");
    bottom.className = "info-bottom";
    bottom.style.position = 'relative';
    bottom.style.top = '0px';
    bottom.style.margin = '0 auto';
    var sharp = document.createElement("img");
    sharp.src = "https://webapi.amap.com/images/sharp.png";
    bottom.appendChild(sharp);
    info.appendChild(bottom);
    return info;
}
var special = ["校医院", "游泳馆", "南田径场", "奥林匹克体育馆"];

for (var i = 0; i < coordinates.length; i += 1) {
    var marker;
    marker = new AMap.Marker({
        position: coordinates[i],
        title: i,
        icon: normalIcon,
        map: map,
    });
    content = [];
    content.push("简介：" + titles[i]);
    content.push("电话：6739 3456");
    if (special.indexOf(titles[i]) !== -1) {
        content.push("<a href='http://www.bjut.edu.cn/' class='custom-link'>点击此处访问网址</a>");
        content.push("<button type='button' class='btn btn-success' data-toggle='modal' data-target='#myModal'>立即订票</button>");
    }
    marker.content = content;
    infoWindow = new AMap.InfoWindow({
        isCustom: true,
        content: null,
        offset: new AMap.Pixel(16, -45)
    });
    marker.on('mouseover', infoOpen);
    marker.on('click', showInfoM);
    markers.push(marker);
}

function showInfoM(e){
    // console.log(e);
    var t = e.target.getTitle();
    var flg = 0;
    for (var j = 0; j < display.length; j ++) {
        if (display[j]['id'] === t) {
            display.splice(j, 1);
            flg = 1;
            markers[t].setIcon(normalIcon);
            $('#tableL01').bootstrapTable('destroy');
            $('#tableL01').bootstrapTable({
                theadClasses: "thead-light",
                rowStyle: rowStyle,
                columns: tableColumns,
                data: display,
                clickEdit: true,
                onClickCell: function(field, value, row, $element) {
                    if (field === 'time') {
                        $element.attr('contenteditable', true);
                        $element.blur(function() {
                            let index = $element.parent().data('index');
                            let tdValue = parseInt($element.html());
                            saveData(index, field, tdValue);
                        })
                    }
                }
            });
        }
        if (display.length === 0) {
            $('#tableL01').bootstrapTable('destroy');
        }
    }

    if (flg === 0 && display.length < 10) {
        markers[t].setIcon(selectedIcon);
        display.push({id: t, name:titles[t], time:lastTime[t]});
        $('#tableL01').bootstrapTable('destroy');
        $('#tableL01').bootstrapTable({
            theadClasses: "thead-light",
            rowStyle: rowStyle,
            columns: tableColumns,
            data: display,
            clickEdit: true,
            onClickCell: function(field, value, row, $element) {
                if (field === 'time') {
                    $element.attr('contenteditable', true);
                    $element.blur(function() {
                        let index = $element.parent().data('index');
                        let tdValue = parseInt($element.html());
                        saveData(index, field, tdValue);
                    })
                }
            }
        });
    }
}

function saveData(index, field, value) {
    $('#tableL01').bootstrapTable('updateCell', {
        index: index,       //行索引
        field: field,       //列名
        value: value        //cell值
    });
}

function infoClose() {
    map.clearInfoWindow();
}
function infoOpen(e) {
    infoWindow.setContent(createInfoWindow(titles[e.target.getTitle()], e.target.content.join("<br/>")));
    infoWindow.open(map, e.target.getPosition());
}

map.setFitView();
