/* Script for OAS visualisation
 *
 * @author Cornelius Leidinger <cornelius.leidinger@googlemail.com> + Robert Kolatzek <r.koaltzek+github@sulb.uni-saarland.de>,
           Saarlaendische Universitaets- und Landesbibliothek, Saarbruecken
 * Copyright (C) 2013 Saarland University, Saarbruecken, Germany
 *
 * @license MIT
 * The MIT License (MIT)
 * 
 * Copyright (c) 2013 SULB
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * 
 */

sprintf = function() {
    var str = arguments[0];
    var args = arguments[1];
    for (var i = 0; i < args.length; i++) {
        var re = new RegExp("\\{"+i+"\\}", "gm");
        str = str.replace(re, args[i]);
    }
    return str;
};

(function($){
	var settings = {
    CSS: {},
    CSS_TAB:{"border-style" : "solid","border-width" : "1px", "border-radius": "10px", "border-color":"#DDDDDD", "padding":"5px"},
    CSS_CLICKED:{"border":"solid 1px #DDDDDD", "border-bottom":"solid 1px #FFFFFF", "background-color":"#FFFFFF", "margin-left":"15px", "margin-bottom":"-1px", "padding":"7px", "border-top-left-radius": "10px","border-top-right-radius": "10px"},
    CSS_NOTCLICKED:{"border":"solid 1px #EEEEEE", "border-bottom":"none", "background-color":"#EEEEEE", "margin-left":"15px", "margin-bottom":"-1px", "padding":"7px", "border-top-left-radius": "10px","border-top-right-radius": "10px"},
    CSS_NOTCLICKED_HOVER:{"border":"solid 1px #DDDDDD", "border-bottom":"none", "background-color":"#EEEEEE", "margin-left":"15px", "margin-bottom":"-1px", "padding":"7px", "border-top-left-radius": "10px","border-top-right-radius": "10px"},
    WRAP_INTO: '<div />',
    INSERT_TYPE: 'before', //Parameter: into/after/before
    LANG: 'de',
    PATH: '',
    PIC_TREND:{
          'up':'<div class="oas_tendenz_pfeil sprite-gt">',
          'right':'<div class="oas_tendenz_pfeil sprite-eq">',
          'down':'<div class="oas_tendenz_pfeil sprite-lt">'},
    ID:'',
    REFID:'',
    OAS_BEGIN_DATE: new Date(),
    LIMIT_RELEVANT_ENTRYS: 15,
    TENDENZ_ROW_CONTROL:{
          '7days':1,
          '30days':1,
          '4month':1,
          '1year':1},
    TAB_CONTROL:{
          'trend':1,
          'chart':1,
          'relevance':1},
    CHART_MONTH_CONTROL: 5,
    DOCUMENT_URL:'/frontdoor.php?source_opus={0}&la={1}',
    TENDENCE_URL:'/sulb/getTendenz.php?id={0}{1}&u={2}&n={3}',
    RELEVANCE_URL:'/sulb/getRelevantEntrys.php?id={0}&limit={1}',
	CSS_URL:'/sulb/trend.css',
	CHART_OPTIONS:''
  };
  var dict = {
    "de":{"t":"Tendenz",
        "ti":"Zeitabschnitt",
        "v":"Veränderung",
        "w":"7 Tage",
        "m":"30 Tage",
        "fm":"4 Monate",
        "y":"1 Jahr",
        
        "title":"Titel",
        "rv":"relative Abrufhäufigkeit*",
		"rvs":"*Durchschnittliche Zugriffe pro Tag multipliziert mit 100",
		"sms":"Summe der Zugriffe pro Monat",
        "tc1":"Tendenz",
        "tc2":"Diagramm",
        "tc3":"Relevante Dokumente",
		"footer":"Zugriffszahlen erhoben nach COUNTER-Standard"},
    "en":{"t":"Trend",
        "ti":"Time interval",
        "v":"Value",
        "w":"7 Days",
        "m":"30 Days",
        "fm":"4 Month",
        "y":"1 Year",
        
        "title":"Title",
        "rv":"Score",
		"rvs":"*Durchschnittliche Zugriffe pro Tag multipliziert mit 100",
		"sms":"Summe der Zugriffe pro Monat",
        "tc1":"Trend",
        "tc2":"Chart",
        "tc3":"Relevant documents",
		"footer":"Zugriffszahlen erhoben nach COUNTER-Standard"}
  };
  var months = {
    "de":["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
    "en":["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  };
	var tabLoadControl = { "#tab1" : 0, "#tab2" : 0, "#tab3" : 0};
	var debug = 0;
	var methods = {
		init: function(options){
			if(debug)console.log('Debug-Konsolenausgaben aktiviert');
			var opt = $.extend({}, settings, options);
				//var path = location.href;	
				//var path = location.protocol + '//' + location.host + location.pathname;
				//var params = methods.parseQueryString();
				//var la = params["la"];
				//var id = params["source_opus"];
				//if(la != undefined)
				//	opt.LANG = la;
				//opt.ID = id;
				$('head').append('<link rel="stylesheet" href="'+opt.CSS_URL+'" type="text/css" />');
				
				//container der alles beinhaltet
				var container = $('<div />').attr({
					class:"tab_container"
				});
				
				switch(opt.INSERT_TYPE)
				{
				case 'into':
					container.appendTo(this);
					break;
				case 'before':
					container.insertBefore(this);
					break;
				case 'after':
					container.insertAfter(this);
					break;
				};
				
				
				//tab punkte
				if(opt.TAB_CONTROL['trend']){
					var tabcap1 = $('<input type="button">').attr({
						id:"tab1cap",
						value:dict[opt.LANG].tc1
					});
					tabcap1.css(opt.CSS_NOTCLICKED);
					tabcap1.appendTo(container);
				}
					
				if(opt.TAB_CONTROL['chart']){
					var tabcap2 = $('<input type="button">').attr({
						id:"tab2cap",
						value:dict[opt.LANG].tc2
					});
					tabcap2.css(opt.CSS_NOTCLICKED);
					tabcap2.appendTo(container);
				}
					
				if(opt.TAB_CONTROL['relevance']){
					var tabcap3 = $('<input type="button">').attr({
						id:"tab3cap",
						value:dict[opt.LANG].tc3
					});
					tabcap3.css(opt.CSS_NOTCLICKED);
					tabcap3.appendTo(container);
				}
				
				//elemlist
				//var list = ["tab1","tab2","tab3"];

				//Neue Tabs erzeugen
				if(opt.TAB_CONTROL['trend']){
					var tab1 = $('<div />').attr({
						id:"tab1",
						class:"oas_tendenz_tab_content"
					});
					tab1.appendTo(container);
					tab1.css(opt.CSS_TAB);
					tabcap1.hover(function(){if(!$("#tab1").is(":visible")){$(this).css(opt.CSS_NOTCLICKED_HOVER);}},function(){if(!$("#tab1").is(":visible")){$(this).css(opt.CSS_NOTCLICKED);}});
					//methods.createTrendTable(tab1,opt);
				}
				
				
				if(opt.TAB_CONTROL['chart']){				
					var tab2 = $('<div />').attr({
						id:"tab2",
						class:"oas_tendenz_tab_content"
					});
					tab2.appendTo(container);
					tab2.css(opt.CSS_TAB);
					tabcap2.hover(function(){if(!$("#tab2").is(":visible")){$(this).css(opt.CSS_NOTCLICKED_HOVER);}},function(){if(!$("#tab2").is(":visible")){$(this).css(opt.CSS_NOTCLICKED);}});
				}
				
				if(opt.TAB_CONTROL['relevance']){	
					var tab3 = $('<div />').attr({
						id:"tab3",
						class:"oas_tendenz_tab_content"
					});
					tab3.appendTo(container);
					tab3.css(opt.CSS_TAB);
					tabcap3.hover(function(){if(!$("#tab3").is(":visible")){$(this).css(opt.CSS_NOTCLICKED_HOVER);}},function(){if(!$("#tab3").is(":visible")){$(this).css(opt.CSS_NOTCLICKED);}});
					//methods.createRelevanceTab(tab3,opt);
				}
				
				//onclick für tab punkte
				if(opt.TAB_CONTROL['trend'])
					tabcap1.click(function() {if(opt.TAB_CONTROL['chart']){$("#tab2").hide();$("#tab2cap").css(opt.CSS_NOTCLICKED);};
												if(opt.TAB_CONTROL['relevance']){$("#tab3").hide();$("#tab3cap").css(opt.CSS_NOTCLICKED);};
												$("#tab1").show();$("#tab1cap").css(opt.CSS_CLICKED);methods.createTrendTable('#tab1',opt);});
				//tabcap1.bind('click', methods.click("tab1",list,opt));
				if(opt.TAB_CONTROL['chart'])
					tabcap2.click(function() {if(opt.TAB_CONTROL['trend']){$("#tab1").hide();$("#tab1cap").css(opt.CSS_NOTCLICKED);};
												if(opt.TAB_CONTROL['relevance']){$("#tab3").hide();$("#tab3cap").css(opt.CSS_NOTCLICKED);};
												$("#tab2").show();$("#tab2cap").css(opt.CSS_CLICKED);methods.createChart('#tab2',opt);});
				if(opt.TAB_CONTROL['relevance'])							
					tabcap3.click(function() {if(opt.TAB_CONTROL['trend']){$("#tab1").hide();$("#tab1cap").css(opt.CSS_NOTCLICKED);};
												if(opt.TAB_CONTROL['chart']){$("#tab2").hide();$("#tab2cap").css(opt.CSS_NOTCLICKED);};
												$("#tab3").show();$("#tab3cap").css(opt.CSS_CLICKED);methods.createRelevanceTab('#tab3',opt);});

				if(opt.TAB_CONTROL['trend']){
					$('#tab1cap').click();
				}else{
				if(opt.TAB_CONTROL['chart']){
					$('#tab2cap').click();
				}else{
				if(opt.TAB_CONTROL['relevance']){
					$('#tab3cap').click();
				}}}
					
				
				//Dem gewrappten Container CSS-Code hinzufügen
				var div = $(opt.WRAP_INTO);
				if(opt.CSS) {
					div.css(opt.CSS);
				}
				container.wrap(div);
				
		},
		/*diese Funktion wird für den ersten automatischen klick von tab1cap genutzt und sollte eigentlich auch mit hilfe von bind für die click events genutzt werden. Funktioniert aber nicht.
		click: function(elem,list,opt){
			$("#"+elem).show();
			$("#"+elem+"cap").css(opt.CSS_CLICKED);
			$.each(list,function(index,value){
				if(value != elem){
					$("#"+value).hide();
					$("#"+value+"cap").css(opt.CSS_NOTCLICKED);
				}
			});
		},*/
		
		parseQueryString: function() {

			var str = window.location.search;
			var objURL = {};

			str.replace(
				new RegExp( "([^?=&]+)(=([^&]*))?", "g" ),
				function( $0, $1, $2, $3 ){
					objURL[ $1 ] = $3;
				}
			);
			return objURL;
		},
		
		//erzeugt im Element elem ein canvas mit einem Beispiel Diagram
		createChart: function(elem,opt){
			//für reload bei jedem klick, zeile unten drunter einkommentieren und das if darunter auskommentieren
			//$('.chart_container').remove(); 
			if(tabLoadControl[elem] == 0){
				tabLoadControl[elem] = 1;
			}
			else{
				return;
			}
			
			if(opt.CHART_MONTH_CONTROL<2)
				opt.CHART_MONTH_CONTROL = 2;
			if(opt.CHART_MONTH_CONTROL>12)
				opt.CHART_MONTH_CONTROL = 12;
			
			//label erstellen
			var date = new Date();
			var m = date.getMonth();
			var values = new Array();
			var refvalues = new Array();
			var label =[];
			/*Ohne aktuellen Monat*
			for(var i=0;i<7;i++){
				if(m-i<1){
					label[6-i] = months[12+m-i-1];
				}
				else{
					label[6-i] = months[m-i-1];
				}
			}*/
			
			/*Mit aktuellem Monat*/
			for(var i=0;i<opt.CHART_MONTH_CONTROL;i++){
				if(m-i<0){
					label[opt.CHART_MONTH_CONTROL-1-i] = months[opt.LANG][12+m-i];
				}
				else{
					label[opt.CHART_MONTH_CONTROL-1-i] = months[opt.LANG][m-i];
				}
			}
			//daten auslesen, verarbeiten
			for(var i=0;i<opt.CHART_MONTH_CONTROL;i++){
				values[i] = 0;
			}
			$.ajaxSetup({'async': false});
			$.getJSON(methods.getTendenceUrl('month',opt.ID_PREFIX,opt.ID,opt.CHART_MONTH_CONTROL,opt), function(data){//mit aktuellem Monat
				$.each(data.data, function(key, value){
					var month = parseInt(key.substr(5,7),10);
					/*ohne aktuellen Monat
					if(month == (m+1)){} //der aktuelle Monat soll nicht angezeigt werden
					else if(month<=m){
						values[6-m+month] = values[6-m+month]+parseInt(value.counter);
						values[6-m+month] = values[6-m+month]+parseInt(value.counter_abstract);
					}
					else{
						values[6-m+month-12] = values[6-m+month-12]+parseInt(value.counter,10);
						values[6-m+month-12] = values[6-m+month-12]+parseInt(value.counter_abstract,10);
					}*/
					
					if(month<=(m+1)){//mit aktuellem Monat
						values[opt.CHART_MONTH_CONTROL-1-m+month-1] = values[opt.CHART_MONTH_CONTROL-1-m+month-1]+parseInt(value.counter);
						//values[opt.CHART_MONTH_CONTROL-1-m+month-1] = values[opt.CHART_MONTH_CONTROL-1-m+month-1]+parseInt(value.counter_abstract);
					}
					else{
						values[opt.CHART_MONTH_CONTROL-1-m+month-12-1] = values[opt.CHART_MONTH_CONTROL-1-m+month-12-1]+parseInt(value.counter,10);
						//values[opt.CHART_MONTH_CONTROL-1-m+month-12-1] = values[opt.CHART_MONTH_CONTROL-1-m+month-12-1]+parseInt(value.counter_abstract,10);
					}
				});	
				if(debug)console.log(values);
			});
		
			
			var container = $('<div />').attr({
					class:"oas_tendenz_chart_container"
			});
			
			container.appendTo($(elem));
			
			var canvas = $('<canvas />').attr({
					id:"myChart",
					width:"500",
					height:"200",
			});
			
			canvas.appendTo(container);
			
			var ctx = canvas[0].getContext("2d");
			var data = {
				labels : label,
				datasets : [
					{
						fillColor : "rgba(220,220,220,0.5)",
						strokeColor : "rgba(220,220,220,1)",
						pointColor : "rgba(220,220,220,1)",
						pointStrokeColor : "#fff",
						data : refvalues
					},
					{
						fillColor : "rgba(151,187,205,0.5)",
						strokeColor : "rgba(151,187,205,1)",
						pointColor : "rgba(151,187,205,1)",
						pointStrokeColor : "#fff",
						data : values
					}
				]
			}
			
			var max = Math.max.apply(Math, values);
			var options = {};
			if(debug) console.log(max);
			
			if(max <= 10){
				options = {"scaleOverride":true, "scaleSteps":10, "scaleStepWidth":1};
			}
			else
			if(max <= 20){
				options = {"scaleOverride":true, "scaleSteps":10, "scaleStepWidth":2};
			}
			else{
				options = {"scaleLabel" : "<%=Math.round(value,0)%>"};
			}
			
			if(opt.CHART_OPTIONS != ""){
				if(opt.CHART_OPTIONS != "NONE")
					var myNewChart = new Chart(ctx).Line(data);
				else
					var myNewChart = new Chart(ctx).Line(data,opt.CHART_OPTIONS);
			}
			else
				var myNewChart = new Chart(ctx).Line(data,options);
			
			//footer
			var footer = $('<div />').attr({
				class:"oas_tendenz_footer"
			});
			footer.append(dict[opt.LANG].sms+"<br>"+dict[opt.LANG].footer);
			footer.appendTo(container);
		},
		
		createTrendTable: function(elem,opt){
			if(tabLoadControl[elem] == 0){
				tabLoadControl[elem] = 1;
			}
			else{
				return;
			}
			
			var container = $('<div />').attr({
					class:"oas_tendenz_trend_table_container"
			});
			
			container.appendTo($(elem));
			
			var table = $('<table id="trend_table" class="oas_tendenz_trend_table"/>');
			//table.css(opt.CSS_TRENDTABLE);
			table.appendTo(container);
			var head = $('<thead>' + 
					'<tr>' + 
						'<th>' + dict[opt.LANG].t + '</th><th>' + dict[opt.LANG].ti + '</th><th>' + dict[opt.LANG].v + '</th>' +
					'</tr>' +
				'</thead>');
			head.appendTo(table);
			//head.css(opt.CSS_TRENDTABLE);
			//$("#trend_table thead tr th").css(opt.CSS_TRENDTABLE);
			
			var date = new Date();
			var m = date.getMonth();
			var d = date.getDate();
			var y = date.getFullYear();
			var valuesD = new Array();
			var valuesM = new Array();
			var values4M = new Array();
			var valuesY = new Array();
			var trend = {"week":0, "month":0, "year":0};
		
		if(opt.TENDENZ_ROW_CONTROL["7days"]){
		//Wochen Tendenz:   sieben Tage, heute nicht dabei; Wert1: mittelwert der 7 Tage; Wert2: mittelwert der letzten 3 Tage; Tendenz: relativer Unterschied wert1 und wert2 in Prozent
			for(var i=0;i<7;i++){
				valuesD[i] = 0;
			}
			$.ajaxSetup({'async': false});
			$.getJSON(methods.getTendenceUrl('day',opt.ID_PREFIX,opt.ID,7,opt), function(data){
				//value enthält das aktuellste Datum ganz vorne[0]
				$.each(data.data, function(key, value){
					//var month = parseInt(key.substr(0,4),10);
					var month = parseInt(key.substr(5,7),10);
					var day = parseInt(key.substr(8,10),10);
					if(day != d && month ==(m+1)){
						valuesD[d-day-1] = valuesD[d-day-1]+parseInt(value.counter);
						//valuesD[d-day-1] = valuesD[d-day-1]+parseInt(value.counter_abstract);
					}
					else if(month==m){
						if(month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12){
							valuesD[31+d-day-1] = valuesD[31+d-day-1]+parseInt(value.counter);
							//valuesD[31+d-day-1] = valuesD[31+d-day-1]+parseInt(value.counter_abstract);
						}
						else if(month == 4 || month == 6 ||month == 9 ||month == 11){
							valuesD[30+d-day-1] = valuesD[30+d-day-1]+parseInt(value.counter);
							//valuesD[30+d-day-1] = valuesD[30+d-day-1]+parseInt(value.counter_abstract);
						}
						else if(month == 2){
							if((Jahr % 4 == 0)&&(Jahr % 100 != 0)||(Jahr % 400 == 0)){
								valuesD[29+d-day-1] = valuesD[29+d-day-1]+parseInt(value.counter);
								//valuesD[29+d-day-1] = valuesD[29+d-day-1]+parseInt(value.counter_abstract);
							}
							else{
								valuesD[28+d-day-1] = valuesD[28+d-day-1]+parseInt(value.counter);
								//valuesD[28+d-day-1] = valuesD[28+d-day-1]+parseInt(value.counter_abstract);
							}
						}
					}
					
				});	
				if(debug)console.log(valuesD);
			});
			//valuesD=[3,4,2,7,9,12,11];
			trend["week"] = methods.getTendenz(methods.getAverage(valuesD),methods.getAverage(valuesD.splice(0,4)));
		}
		
		if(opt.TENDENZ_ROW_CONTROL["30days"]){		
		//Monats Tendenz:
			for(var i=0;i<30;i++){
				valuesM[i] = 0;
			}
			$.ajaxSetup({'async': false});
			$.getJSON(methods.getTendenceUrl('day',opt.ID_PREFIX,opt.ID,30,opt), function(data){
				//value enthält das aktuellste Datum ganz vorne[0]
				$.each(data.data, function(key, value){
					var Jahr = parseInt(key.substr(0,4),10);
					var month = parseInt(key.substr(5,7),10);
					var day = parseInt(key.substr(8,10),10);
					if(day != d && month ==(m+1)){
						valuesM[d-day-1] = valuesM[d-day-1]+parseInt(value.counter);
						//valuesM[d-day-1] = valuesM[d-day-1]+parseInt(value.counter_abstract);
					}
					else if(month==m){
						if(month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12){
							valuesM[31+d-day-1] = valuesM[31+d-day-1]+parseInt(value.counter);
							//valuesM[31+d-day-1] = valuesM[31+d-day-1]+parseInt(value.counter_abstract);
						}
						else if(month == 4 || month == 6 ||month == 9 ||month == 11){
							valuesM[30+d-day-1] = valuesM[30+d-day-1]+parseInt(value.counter);
							//valuesM[30+d-day-1] = valuesM[30+d-day-1]+parseInt(value.counter_abstract);
						}
						else if(month == 2){
							if((Jahr % 4 == 0)&&(Jahr % 100 != 0)||(Jahr % 400 == 0)){
								valuesM[29+d-day-1] = valuesM[29+d-day-1]+parseInt(value.counter);
								//valuesM[29+d-day-1] = valuesM[29+d-day-1]+parseInt(value.counter_abstract);
								//hier muss noch irgendwas hin für den fall 1.3-3.3 da dann werte ausm januar genommen werden müssen ... siehe stat_plug_infos.txt ganz unten
								//[31+29+d-day-1]
								//gelöst unten else if month == m-1
							}
							else{
								valuesM[28+d-day-1] = valuesM[28+d-day-1]+parseInt(value.counter);
								//valuesM[28+d-day-1] = valuesM[28+d-day-1]+parseInt(value.counter_abstract);
							}
						}
					}else if((month == 1)&&(month ==(m-1))){
						if((Jahr % 4 == 0)&&(Jahr % 100 != 0)||(Jahr % 400 == 0)){
							valuesM[31+29+d-day-1] = valuesM[31+29+d-day-1]+parseInt(value.counter);
							//valuesM[31+29+d-day-1] = valuesM[31+29+d-day-1]+parseInt(value.counter_abstract);
						}
						else{
							valuesM[31+28+d-day-1] = valuesM[31+28+d-day-1]+parseInt(value.counter);
							//valuesM[31+28+d-day-1] = valuesM[31+28+d-day-1]+parseInt(value.counter_abstract);
						}
					}
					
				});	
				if(debug)console.log(valuesM);
			});
			//valuesM=[3,4,2,7,9,12,11];
			trend["month"] = methods.getTendenz(methods.getAverage(valuesM),methods.getAverage(valuesM.splice(0,15)));
		}

		if(opt.TENDENZ_ROW_CONTROL["4month"]){
		//4Monate Tendenz
			for(var i=0;i<4;i++){
				values4M[i] = 0;
			}
			$.ajaxSetup({'async': false});
			$.getJSON(methods.getTendenceUrl('month',opt.ID_PREFIX,opt.ID,4,opt), function(data){//mit aktuellem Monat
				$.each(data.data, function(key, value){
					var month = parseInt(key.substr(5,7),10);
					//ohne aktuellen Monat
					if(month == (m+1)){} //der aktuelle Monat soll nicht angezeigt werden
					else if(month<=m){
						values4M[m-month] = values4M[m-month]+parseInt(value.counter);
						//values4M[m-month] = values4M[m-month]+parseInt(value.counter_abstract);
					}
					else{
						values4M[12-month+m] = values4M[12-month+m]+parseInt(value.counter,10);
						//values4M[12-month+m] = values4M[12-month+m]+parseInt(value.counter_abstract,10);
					}
				});	
				if(debug)console.log(values4M);
			});
			trend["4month"] = methods.getTendenz(methods.getAverage(values4M),methods.getAverage(values4M.splice(0,2)));
		}
		
		if(opt.TENDENZ_ROW_CONTROL["1year"]){
		//Jahres Tendenz
			for(var i=0;i<12;i++){
				valuesY[i] = 0;
			}
			$.ajaxSetup({'async': false});
			$.getJSON(methods.getTendenceUrl('month',opt.ID_PREFIX,opt.ID,13,opt), function(data){//mit aktuellem Monat
				$.each(data.data, function(key, value){
					var month = parseInt(key.substr(5,7),10);
					//ohne aktuellen Monat
					if(month == (m+1)){} //der aktuelle Monat soll nicht angezeigt werden
					else if(month<=m){
						valuesY[m-month] = valuesY[m-month]+parseInt(value.counter);
						//valuesY[m-month] = valuesY[m-month]+parseInt(value.counter_abstract);
					}
					else{
						valuesY[12-month+m] = valuesY[12-month+m]+parseInt(value.counter,10);
						//valuesY[12-month+m] = valuesY[12-month+m]+parseInt(value.counter_abstract,10);
					}
				});	
				if(debug)console.log(valuesY);
			});
			trend["year"] = methods.getTendenz(methods.getAverage(valuesY),methods.getAverage(valuesY.splice(0,6)));
		}
		
		var evenVSodd = "oas_tendenz_even";
		if(opt.TENDENZ_ROW_CONTROL["7days"]){
			var img = (trend["week"]>1.0?opt.PIC_TREND["up"]:(trend["week"] < -1.0?opt.PIC_TREND["down"]:opt.PIC_TREND["right"]))
			var week = $('<tr class="'+evenVSodd+'">' +
							'<td>' + img + '</td><td>' + dict[opt.LANG].w + '</td><td>' + trend["week"].toFixed(0) + "%" + '</td>' +
						'</tr>');
			week.appendTo(table);
			if(evenVSodd == "oas_tendenz_even") evenVSodd = "oas_tendenz_odd"; else evenVSodd = "oas_tendenz_even";
		}
		if(opt.TENDENZ_ROW_CONTROL["30days"]){
			img = (trend["month"]>1.0?opt.PIC_TREND["up"]:(trend["month"] < -1.0?opt.PIC_TREND["down"]:opt.PIC_TREND["right"]))
			var month = $('<tr class="'+evenVSodd+'">' +
							'<td>' + img + '</td><td>' + dict[opt.LANG].m + '</td><td>' + trend["month"].toFixed(0) + "%" + '</td>' +
						'</tr>');
			month.appendTo(table);
			if(evenVSodd == "oas_tendenz_even") evenVSodd = "oas_tendenz_odd"; else evenVSodd = "oas_tendenz_even";
		}
		if(opt.TENDENZ_ROW_CONTROL["4month"]){		
			img = (trend["4month"]>1.0?opt.PIC_TREND["up"]:(trend["4month"] < -1.0?opt.PIC_TREND["down"]:opt.PIC_TREND["right"]))
			var fourMonth = $('<tr class="'+evenVSodd+'">' +
							'<td>' + img + '</td><td>' + dict[opt.LANG].fm + '</td><td>' + trend["4month"].toFixed(0) + "%" + '</td>' +
						'</tr>');
			fourMonth.appendTo(table);
			if(evenVSodd == "oas_tendenz_even") evenVSodd = "oas_tendenz_odd"; else evenVSodd = "oas_tendenz_even";
		}
		if(opt.TENDENZ_ROW_CONTROL["1year"]){
			img = (trend["year"]>1.0?opt.PIC_TREND["up"]:(trend["year"] < -1.0?opt.PIC_TREND["down"]:opt.PIC_TREND["right"]))
			var year = $('<tr class="'+evenVSodd+'">' +
							'<td>' + img + '</td><td>' + dict[opt.LANG].y + '</td><td>' + trend["year"].toFixed(0) + "%" + '</td>' +
						'</tr>');
			year.appendTo(table);
			if(evenVSodd == "oas_tendenz_even") evenVSodd = "oas_tendenz_odd"; else evenVSodd = "oas_tendenz_even";
		}	
			//$("#trend_table tbody tr td").css(opt.CSS_TRENDTABLE);
			
		//footer
			var footer = $('<div />').attr({
				class:"oas_tendenz_footer"
			});
			footer.append(dict[opt.LANG].footer);
			footer.appendTo(container);
	
		},
		
		createRelevanceTab: function(elem, opt){
			if(tabLoadControl[elem] == 0){
				tabLoadControl[elem] = 1;
			}
			else{
				return;
			}
			
			var container = $('<div />').attr({
					id:"showdata",
					class:"oas_tendenz_relevance_container"
			});
			
			container.appendTo($(elem));
			
			var table = $('<table id="trend_table" class="oas_tendenz_trend_table"/>');
			//table.css(opt.CSS_TRENDTABLE);
			table.appendTo(container);
			var head = $('<thead>' + 
					'<tr>' + 
						'<th>' + dict[opt.LANG].title + '</th><th>' + dict[opt.LANG].rv + '</th>' +
					'</tr>' +
				'</thead>');
			head.appendTo(table);
			
			$.ajaxSetup({'async': false});
			$.getJSON(sprintf(opt.RELEVANCE_URL,[opt.ID,opt.LIMIT_RELEVANT_ENTRYS]), function(data){
				if(debug)console.log(data.initiator.title);
				var odd =0;
				var classtype = "oas_tendenz_even";
				$.each(data.data, function(key, value){
					if(odd){
						classtype = "oas_tendenz_odd";
						odd=0;
					}else{
						classtype = "oas_tendenz_even";
						odd=1;
					}
					var d = new Date(value.date*1000);
					var diff = methods.deltaDays(d,new Date(),opt);
					if(debug)console.log(diff);
					
					var request_counter = 0;
					$.getJSON(methods.getTendenceUrl('day',opt.ID_PREFIX,value.id,diff,opt), function(data){//mit aktuellem Monat
						$.each(data.data, function(key, value2){
							//request_counter += parseInt(value2.counter_abstract,10);
							request_counter += parseInt(value2.counter,10);
						});	
					});
					if(debug)console.log(request_counter);
					var scoreraw = (request_counter/diff)*100;
					var scorerawmodulo = (scoreraw*100) % 100;
					var score = (((scoreraw*100)-scorerawmodulo)/100) + "," + scorerawmodulo.toFixed(0);
					$('<tr class='+classtype+'>' +
							'<td><a href="'+sprintf(opt.DOCUMENT_URL,[value.id,opt.LANG])+'">' +value.title + '</a></td><td>' + score + '</td>' +
						'</tr>').appendTo(table);
				});	
			});
			
			//container.append("testtest");
			var annotation = $('<div />').attr({
				class:"oas_tendenz_footer"
			})
			annotation.append(dict[opt.LANG].rvs);
			//footer
			var footer = $('<div />').attr({
				class:"oas_tendenz_footer"
			});
			footer.append(dict[opt.LANG].rvs+"<br>"+dict[opt.LANG].footer);
			footer.appendTo(container);
		},
		
		getAverage: function(arr){
			var count=0;
			var value=0;
			$.each(arr,function(k,v){
				count++;
				value = value + v;
			});
			//console.log("average: "+value/count);
			return value/count;
		},
		
		getTendenz: function(vGesamt,vHalb){
			if(vGesamt ==0){
				//console.log("Tendenz: 0");
				return 0
			}
			else{
				//console.log("Tendenz: "+vHalb*100/vGesamt);
				//return vHalb*100/vGesamt;
				return ((vHalb-vGesamt)/vGesamt)*100;
			}
		},
		
		deltaDays: function(date1, date2,opt){
			if(date1.getTime() < opt.OAS_BEGIN_DATE.getTime()) date1 = opt.OAS_BEGIN_DATE;
			if(debug)console.log(date1);
			if(!date1 || !date2) return null;
			var check1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
			var check2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
			return Math.round(Math.abs(check1 - check2) / (1000 * 60 * 60 * 24 ));
		},
                 
                getTendenceUrl: function(type,prefix,id,count,opt){
                    return sprintf(opt.TENDENCE_URL,[prefix,id,type,count]);
                }
	};
	
	
	
	$.fn.oas_visual = function(method){
		if(methods[method]){
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		}else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else{
			$.error('Method' + method + ' not found'); 
		}
	}
})( jQuery );
