/**
	Open Innovations Population Calculator
	Version 2.0
 */
(function(root){

	var OI = root.OI || {};
	if(!OI.ready){
		OI.ready = function(fn){
			// Version 1.1
			if(document.readyState != 'loading') fn();
			else document.addEventListener('DOMContentLoaded', fn);
		};
	}
	if(!OI.logger){
		// Version 1.2
		OI.logger = function(title){
			this.title = title||"OI Logger";
			this.logging = (location.search.indexOf('debug=true') >= 0);
			this.log = function(){
				var a,ext;
				if(this.logging || arguments[0]=="ERROR" || arguments[0]=="WARNING"){
					a = Array.prototype.slice.call(arguments, 0);
					// Build basic result
					ext = ['%c'+this.title+'%c: '+a[1],'font-weight:bold;',''];
					// If there are extra parameters passed we add them
					if(a.length > 2) ext = ext.concat(a.splice(2));
					if(console && typeof console.log==="function"){
						if(arguments[0] == "ERROR") console.error.apply(null,ext);
						else if(arguments[0] == "WARNING") console.warn.apply(null,ext);
						else if(arguments[0] == "INFO") console.info.apply(null,ext);
						else console.log.apply(null,ext);
					}
				}
				return this;
			};
			return this;
		};
	}

	function Application(){

		if(!this.logSetup) this.logSetup = { 'el': document.getElementById('message') };
		this.title = "Population Calculator";
		this.version = "2.0";
		this.logger = new OI.logger(this.title+' '+this.version);
		this.message = function(msg,attr){
			if(!attr) attr = {};
			if(!attr.type) attr.type = 'message';
			
			// Update the console
			var txt = msg;
			if(typeof txt==="string"){
				txt = txt.replace(/<[^>]+>/g,'');
			}
			if(txt) this.logger.log(attr.type,txt,attr.extra||'');

			var css = "b5-bg";
			if(attr.type=="ERROR") css = "c12-bg";
			if(attr.type=="WARNING") css = "c14-bg";

			if(!this.logSetup.el){
				this.logSetup.el = document.createElement('div');
				document.body.appendChild(this.logSetup.el);
			}

			this.logSetup.el.innerHTML = '<div class="'+css+'">'+msg+'</div>';
			this.logSetup.el.style.display = (msg ? 'block' : 'none');

			return this;
		};
		this.logger.log('INFO','Initialising');

		var type = "parking";

		var frm = document.createElement('form');

		var div = document.getElementById('place-search');
		div.appendChild(frm);
		div.classList.add('padded');

		var lbl = document.createElement('label');
		lbl.setAttribute('for','typeahead');
		lbl.innerHTML = "Move the map to:";
		frm.appendChild(lbl);
		
		var inp = document.createElement('input');
		inp.setAttribute('type','text');
		inp.setAttribute('placeholder','e.g. Leeds, UK');
		frm.appendChild(inp);

		var calculate = document.getElementById('calculate');

		this.setGeo = function(lat,lon,city,duration){
			this.map.flyTo([lat,lon],14,{animate:true,duration:duration||0});
			return this;
		};





		// Define a function for scoring how well a string matches
		function getScore(str1,str2,v1,v2,v3){
			var r = 0;
			str1 = str1.toUpperCase();
			str2 = str2.toUpperCase();
			if(str1.indexOf(str2)==0) r += (v1||3);
			if(str1.indexOf(str2)>0) r += (v2||1);
			if(str1==str2) r += (v3||4);
			return r;
		}

		// ISO 3166 country code conversion
		var cc = {'AD':'Andorra','AE':'United Arab Emirates','AF':'Afghanistan','AG':'Antigua and Barbuda','AI':'Anguilla','AL':'Albania','AM':'Armenia','AO':'Angola','AQ':'Antarctica','AR':'Argentina','AS':'American Samoa','AT':'Austria','AU':'Australia','AW':'Aruba','AX':'Åland Islands','AZ':'Azerbaijan','BA':'Bosnia and Herzegovina','BB':'Barbados','BD':'Bangladesh','BE':'Belgium','BF':'Burkina Faso','BG':'Bulgaria','BH':'Bahrain','BI':'Burundi','BJ':'Benin','BL':'Saint Barthélemy','BM':'Bermuda','BN':'Brunei Darussalam','BO':'Bolivia','BQ':'Bonaire, Sint Eustatius and Saba','BR':'Brazil','BS':'Bahamas','BT':'Bhutan','BV':'Bouvet Island','BW':'Botswana','BY':'Belarus','BZ':'Belize','CA':'Canada','CC':'Cocos (Keeling) Islands','CD':'Congo, the Democratic Republic of the','CF':'Central African Republic','CG':'Congo','CH':'Switzerland','CI':'Côte d\'Ivoire','CK':'Cook Islands','CL':'Chile','CM':'Cameroon','CN':'China','CO':'Colombia','CR':'Costa Rica','CU':'Cuba','CV':'Cabo Verde','CW':'Curaçao','CX':'Christmas Island','CY':'Cyprus','CZ':'Czech Republic','DE':'Germany','DJ':'Djibouti','DK':'Denmark','DM':'Dominica','DO':'Dominican Republic','DZ':'Algeria','EC':'Ecuador','EE':'Estonia','EG':'Egypt','EH':'Western Sahara','ER':'Eritrea','ES':'Spain','ET':'Ethiopia','FI':'Finland','FJ':'Fiji','FK':'Falkland Islands (Malvinas)','FM':'Micronesia, Federated States of','FO':'Faroe Islands','FR':'France','GA':'Gabon','GB':'UK','GD':'Grenada','GE':'Georgia','GF':'French Guiana','GG':'Guernsey','GH':'Ghana','GI':'Gibraltar','GL':'Greenland','GM':'Gambia','GN':'Guinea','GP':'Guadeloupe','GQ':'Equatorial Guinea','GR':'Greece','GS':'South Georgia and the South Sandwich Islands','GT':'Guatemala','GU':'Guam','GW':'Guinea-Bissau','GY':'Guyana','HK':'Hong Kong','HM':'Heard Island and McDonald Islands','HN':'Honduras','HR':'Croatia','HT':'Haiti','HU':'Hungary','ID':'Indonesia','IE':'Ireland','IL':'Israel','IM':'Isle of Man','IN':'India','IO':'British Indian Ocean Territory','IQ':'Iraq','IR':'Iran, Islamic Republic of','IS':'Iceland','IT':'Italy','JE':'Jersey','JM':'Jamaica','JO':'Jordan','JP':'Japan','KE':'Kenya','KG':'Kyrgyzstan','KH':'Cambodia','KI':'Kiribati','KM':'Comoros','KN':'Saint Kitts and Nevis','KP':'Korea, Democratic People\'s Republic of','KR':'Korea, Republic of','KW':'Kuwait','KY':'Cayman Islands','KZ':'Kazakhstan','LA':'Lao People\'s Democratic Republic','LB':'Lebanon','LC':'Saint Lucia','LI':'Liechtenstein','LK':'Sri Lanka','LR':'Liberia','LS':'Lesotho','LT':'Lithuania','LU':'Luxembourg','LV':'Latvia','LY':'Libya','MA':'Morocco','MC':'Monaco','MD':'Moldova, Republic of','ME':'Montenegro','MF':'Saint Martin (French part)','MG':'Madagascar','MH':'Marshall Islands','MK':'Macedonia, the former Yugoslav Republic of','ML':'Mali','MM':'Myanmar','MN':'Mongolia','MO':'Macao','MP':'Northern Mariana Islands','MQ':'Martinique','MR':'Mauritania','MS':'Montserrat','MT':'Malta','MU':'Mauritius','MV':'Maldives','MW':'Malawi','MX':'Mexico','MY':'Malaysia','MZ':'Mozambique','NA':'Namibia','NC':'New Caledonia','NE':'Niger','NF':'Norfolk Island','NG':'Nigeria','NI':'Nicaragua','NL':'Netherlands','NO':'Norway','NP':'Nepal','NR':'Nauru','NU':'Niue','NZ':'New Zealand','OM':'Oman','PA':'Panama','PE':'Peru','PF':'French Polynesia','PG':'Papua New Guinea','PH':'Philippines','PK':'Pakistan','PL':'Poland','PM':'Saint Pierre and Miquelon','PN':'Pitcairn','PR':'Puerto Rico','PS':'Palestine, State of','PT':'Portugal','PW':'Palau','PY':'Paraguay','QA':'Qatar','RE':'Réunion','RO':'Romania','RS':'Serbia','RU':'Russian Federation','RW':'Rwanda','SA':'Saudi Arabia','SB':'Solomon Islands','SC':'Seychelles','SD':'Sudan','SE':'Sweden','SG':'Singapore','SH':'Saint Helena, Ascension and Tristan da Cunha','SI':'Slovenia','SJ':'Svalbard and Jan Mayen','SK':'Slovakia','SL':'Sierra Leone','SM':'San Marino','SN':'Senegal','SO':'Somalia','SR':'Suriname','SS':'South Sudan','ST':'Sao Tome and Principe','SV':'El Salvador','SX':'Sint Maarten','SY':'Syrian Arab Republic','SZ':'Swaziland','TC':'Turks and Caicos Islands','TD':'Chad','TF':'French Southern Territories','TG':'Togo','TH':'Thailand','TJ':'Tajikistan','TK':'Tokelau','TL':'Timor-Leste','TM':'Turkmenistan','TN':'Tunisia','TO':'Tonga','TR':'Turkey','TT':'Trinidad and Tobago','TV':'Tuvalu','TW':'Taiwan, Province of China','TZ':'Tanzania','UA':'Ukraine','UG':'Uganda','UM':'US Minor Outlying Islands','US':'USA','UY':'Uruguay','UZ':'Uzbekistan','VA':'Holy See','VC':'Saint Vincent and the Grenadines','VE':'Venezuela','VG':'British Virgin Islands','VI':'Virgin Islands, U.S.','VN':'Viet Nam','VU':'Vanuatu','WF':'Wallis and Futuna','WS':'Samoa','YE':'Yemen','YT':'Mayotte','ZA':'South Africa','ZM':'Zambia','ZW':'Zimbabwe'};

		var _obj = this;

		// Build the main search for places
		this.typeahead = TypeAhead.init(inp,{
			'items': [],
			'max': 8,	// Set a maximum number to list
			'render': function(d){
				// Construct the label shown in the drop down list
				return d.displayname;
			},
			'process': function(city){
				// A city has been selected
				_obj.message('Process city',{'extra':city});
				// Get the data
				fetch(city.file,{'method':'GET'})
				.then(response => { return response.text(); })
				.then(d => {
					var lat,lon,i,line,pop,tz;
					d = d.replace(/\r/,'').split(/[\n]/);
					for(i = 0; i < d.length; i++){
						line = d[i].split(/\t/);
						if(line[0] == city.i){
							lat = parseFloat(line[1]);
							lon = parseFloat(line[2]);
							tz = line[3];
							pop = parseFloat(line[4])*15000;
							i = d.length;	// Leave loop
						}
					}
					_obj.message('');
					_obj.setGeo(lat,lon,city,1);
					inp.value = city.displayname;
				}).catch(error => {
					_obj.message('Error getting data from '+city.file,{'type':'ERROR','extra':city});
				});
			},
			'rank': function(d,str){
				// Calculate the weight to add to this place
				var r = 0;
				var words,w;
				if(d){
					words = str.split(/[\s\,]/);
					if(typeof d.name==="string") r += getScore(d.name,str);
					if(typeof d.truename==="string") r += getScore(d.truename,str);
					for(w = 0; w < words.length; w++){
						if(words[w]){
							if(typeof d.name==="string") r += getScore(d.name,words[w]);
							if(typeof d.truename==="string") r += getScore(d.truename,words[w]);
							if(typeof d.country==="string") r += getScore(d.country,words[w]);
						}
					}
					r *= d.n;
				}
				return r;
			}
		});

		inp.addEventListener('focus',function(e){ e.currentTarget.value = ""; });

		calculate.addEventListener('click',function(e){
			// Blur the button
			e.target.blur();
			_obj.calculate();
		});

		var loading = {};

		// Attach a callback to the 'change' event. This gets called each time the user enters/deletes a character.
		this.typeahead.on('change',{'me':this.typeahead,'parent':this},function(e){
			var name = (e.target.value.toLowerCase());
			var fl = name[0];
			if(fl && fl.match(/[a-zA-Z\'\`]/i)){
				if(!loading[fl]){
					var file = 'geo/ranked-'+fl+'.tsv';
					var _obj = e.data.me;

					fetch(file,{})
					.then(response => { return response.text(); })
					.then(d => {
						var data,l,c,header,cols,datum;
						d = d.replace(/\r/g,'').split(/[\n]/);
						data = new Array(d.length);
						header = ["truename","name","cc","admin1","n"];
						for(l = 0; l < d.length; l++){
							cols = d[l].split(/\t/);
							datum = {};
							for(c = 0; c < cols.length; c++){
								datum[header[c]] = cols[c].replace(/(^\"|\"$)/g,"");
								// Convert numbers
								if(parseFloat(datum[header[c]])+"" == datum[header[c]]) datum[header[c]] = parseFloat(datum[header[c]]);
								datum.id = fl+'-'+l;
								datum.i = l;
								datum.file = 'geo/cities/'+fl+'-'+(Math.floor(l/100))+'.tsv';
								datum.country = (datum.cc && cc[datum.cc] ? cc[datum.cc]:'');
								datum.displayname = datum.truename+(datum.cc=="US" ? ', '+datum.admin1+'':'')+(datum.country ? ', '+datum.country : '');
							}
							data[l] = datum;
						}
						_obj.addItems(data);
					}).catch(error => {
						e.data.parent.message('Unable to load file '+file,{'type':'ERROR','extra':{}});
					});
					loading[fl] = true;
				}
			}
		});


		// Set drag/drop events
		function dropOver(evt){
			evt.stopPropagation();
			evt.preventDefault();
			this.classList.add('drop');
			this.classList.remove('loaded');
		}
		function dragOff(){
			this.classList.remove('drop');
		}
		function dropHandler(ev) {
			var item,blob,reader,i,source;
			this.classList.remove('drop');
			// Prevent default behavior (Prevent file from being opened)
			ev.preventDefault();

			if(ev.dataTransfer.items){
				for(i = 0; i < ev.dataTransfer.items.length; i++){
					item = ev.dataTransfer.items[i];
					blob = item.getAsFile();
					reader = new FileReader();
					reader.onload = function(event){
						var geojson = JSON.parse(event.target.result);
						// If the result seems to be GeoJSON then set the boundary
						if(geojson.type == "FeatureCollection" && geojson.features.length > 0) _obj.setBoundary(geojson);
						else if(geojson.type == "GeometryCollection" && geojson.geometries.length > 0) _obj.setBoundary(geojson);
						else if(geojson.type == "Feature" && geojson.geometry.type=="Polygon"){
							geojson = {'type':'FeatureCollection','features':[geojson]};
							_obj.setBoundary(geojson);
						}
					};
					source = reader.readAsBinaryString(blob);
				}
			}
		}
		// Setup the dnd listeners.
		var dropZone = document.getElementById('map');
		dropZone.addEventListener('dragover', dropOver, false);
		dropZone.addEventListener('dragout', dragOff, false);
		dropZone.addEventListener('drop', dropHandler, false);

		this.simplifyFeature = function(feature,tolerance){
			var i,points;
			if(feature.geometry.type === "MultiPolygon"){
				feature.geometry.type = "Polygon";
				feature.geometry.coordinates[0] = feature.geometry.coordinates[0][0];
			}
			if(feature.geometry.coordinates[0].length > 300){
				// Build the points
				points = new Array(feature.geometry.coordinates[0].length);
				for(i = 0; i < feature.geometry.coordinates[0].length; i++){
					points[i] = {'x':feature.geometry.coordinates[0][i][0],'y':feature.geometry.coordinates[0][i][1]};
				}
				points = simplify(points, tolerance, true);
				_obj.logger.log('INFO','Simplified feature from %c'+feature.geometry.coordinates[0].length+'%c to %c'+points.length+'%c points.','font-weight:bold','','font-weight:bold','');
				feature.geometry.coordinates[0] = new Array(points.length);
				for(i = 0; i < points.length; i++){
					feature.geometry.coordinates[0][i] = [points[i].x,points[i].y];
				}
			}
			return feature;
		}

		// Add a simple Polygon in a GeoJSON structure as a boundary
		this.setBoundary = function(geojson){
			var coord,i,geo,feature,f,m,polygon;

			this._geojson = geojson;
			// Cope with different types of GeoJSON (e.g. those from http://polygons.openstreetmap.fr/get_geojson.py?id=118362&params=0 use GeometryCollection rather than FeatureCollection)
			if(geojson.type == "GeometryCollection"){
				var features = [];
				for(i = 0; i < geojson.geometries.length; i++) features.push({'geometry':geojson.geometries[i]});
				geojson = {"type":"FeatureCollection","features":features};
			}

			// Take the first feature and simplify it
			feature = this.simplifyFeature(geojson.features[0],0.002);

			coord = feature.geometry.coordinates[0];		

			// Zoom to bounds first then draw points (otherwise the pixel positions end up quantised)
			geo = L.geoJson(feature, {});
			this.map.fitBounds(geo.getBounds());
		
			this.areaSelection.startPolygon();
			for(i = 0; i < coord.length; i++){
				this.areaSelection.addPoint({'latitude':coord[i][1],'longitude':coord[i][0]});
			}
			this.areaSelection.endPolygon();

			return this;
		};
		
		// e.g. https://open-innovations.github.io/geography-bits/data/LAD23CD/E08000035.geojsonl
		this.loadArea = function(url){
			fetch(url,{})
			.then(response => { return response.json(); })
			.then(feature => {
				_obj.setBoundary({'type':'FeatureCollection','features':[feature]});
			}).catch(error => {
				_obj.message('Unable to load URL '+url,{'type':'ERROR','extra':{}});
			});
			return this;
		};

		this.processResults = function(json,type){
			// Remove message
			this.message('');

			// Build output
			var output = '<p>Estimated population within '+(type=='circle' ? 'the circle':'the area')+' in 2025:</p>';
			output += '<p><span id="populationcounter">'+json[0].people.toLocaleString()+'</span></p>';
			output += '<p id="publictransportcounter">The circle also contains <span id="busstops">'+json[0].busStops.toLocaleString()+'</span> bus stops, <span id="tramstops">'+json[0].tramStops.toLocaleString()+'</span> tram stops, and <span id="railstops">'+json[0].railStops.toLocaleString()+'</span> metro and train stops.</p>';
			document.getElementById('output').innerHTML = output;

			return this;
		};

		this.calculate = function(){
			this.logger.log('INFO','calculate',this.areaSelection.polygon,this.circleControl.options.circle);
			if(this.areaSelection.polygon || this.circleControl.options.circle){

			
				this.message('Loading data... please wait<br /><svg version="1.1" width="64" height="64" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(.11601 0 0 .11601 -49.537 -39.959)"><path d="m610.92 896.12m183.9-106.17-183.9-106.17-183.9 106.17v212.35l183.9 106.17 183.9-106.17z" fill="black"><animate attributeName="opacity" values="1;0;0" keyTimes="0;0.7;1" dur="1s" begin="-0.83333s" repeatCount="indefinite" /></path><path d="m794.82 577.6m183.9-106.17-183.9-106.17-183.9 106.17v212.35l183.9 106.17 183.9-106.17z" fill="black"><animate attributeName="opacity" values="1;0;0" keyTimes="0;0.7;1" dur="1s" begin="-0.6666s" repeatCount="indefinite" /></path><path d="m1162.6 577.6m183.9-106.17-183.9-106.17-183.9 106.17v212.35l183.9 106.17 183.9-106.17z" fill="black"><animate attributeName="opacity" values="1;0;0" keyTimes="0;0.7;1" dur="1s" begin="-0.5s" repeatCount="indefinite" /></path><path d="m1346.5 896.12m183.9-106.17-183.9-106.17-183.9 106.17v212.35l183.9 106.17 183.9-106.17z" fill="black"><animate attributeName="opacity" values="1;0;0" keyTimes="0;0.7;1" dur="1s" begin="-0.3333s" repeatCount="indefinite" /></path><path d="m1162.6 1214.6m183.9-106.17-183.9-106.17-183.9 106.17v212.35l183.9 106.17 183.9-106.17z" fill="black"><animate attributeName="opacity" values="1;0;0" keyTimes="0;0.7;1" dur="1s" begin="-0.1666s" repeatCount="indefinite" /></path><path d="m794.82 1214.6m183.9-106.17-183.9-106.17-183.9 106.17v212.35l183.9 106.17 183.9-106.17z" fill="black"><animate attributeName="opacity" values="1;0;0" keyTimes="0;0.7;1" dur="1s" begin="0s" repeatCount="indefinite" /></path></g></svg>',{'type':'INFO'});
				var file = "./";

				if(this.circleControl.options.circle){

					return fetch("https://ringpopulationsapi.azurewebsites.net/api/globalringpopulations?latitude="+this.circleControl.options.centre.lat.toFixed(4)+"&longitude="+this.circleControl.options.centre.lng.toFixed(4)+"&distance_km="+this.circleControl.options.radius,{'method':'GET'})
					.then(response => { return response.json(); })
					.then(json => {
						this.processResults(json,'circle');
					}).catch(error => {
						this.message('Error getting data',{'type':'ERROR','extra':error});
					});

				}else if(this.areaSelection.polygon){

					return fetch("https://ringpopulationsapi.azurewebsites.net/api/globalboundarypopulations",{'method':'POST','body': JSON.stringify(this._geojson), 'headers': {"Content-type": "application/json; charset=UTF-8"}})
					.then(response => { return response.json(); })
					.then(json => {
						this.processResults(json,'area');
					}).catch(error => {
						this.message('Error getting data',{'type':'ERROR','extra':error});
					});

				}

			}else{
				this.message('No area has been selected on the map. Please use the <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" vector-effect="non-scaling-stroke" class="bi bi-bounding-box" viewBox="0 0 16 16"><path d="M5 2V0H0v5h2v6H0v5h5v-2h6v2h5v-5h-2V5h2V0h-5v2H5zm6 1v2h2v6h-2v2H5v-2H3V5h2V3h6zm1-2h3v3h-3V1zm3 11v3h-3v-3h3zM4 15H1v-3h3v3zM1 4V1h3v3H1z"/></svg> tool to draw an area or <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-globe" viewBox="0 0 16 16"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm7.5-6.923c-.67.204-1.335.82-1.887 1.855A7.97 7.97 0 0 0 5.145 4H7.5V1.077zM4.09 4a9.267 9.267 0 0 1 .64-1.539 6.7 6.7 0 0 1 .597-.933A7.025 7.025 0 0 0 2.255 4H4.09zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a6.958 6.958 0 0 0-.656 2.5h2.49zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5H4.847zM8.5 5v2.5h2.99a12.495 12.495 0 0 0-.337-2.5H8.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5H4.51zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5H8.5zM5.145 12c.138.386.295.744.468 1.068.552 1.035 1.218 1.65 1.887 1.855V12H5.145zm.182 2.472a6.696 6.696 0 0 1-.597-.933A9.268 9.268 0 0 1 4.09 12H2.255a7.024 7.024 0 0 0 3.072 2.472zM3.82 11a13.652 13.652 0 0 1-.312-2.5h-2.49c.062.89.291 1.733.656 2.5H3.82zm6.853 3.472A7.024 7.024 0 0 0 13.745 12H11.91a9.27 9.27 0 0 1-.64 1.539 6.688 6.688 0 0 1-.597.933zM8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855.173-.324.33-.682.468-1.068H8.5zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.65 13.65 0 0 1-.312 2.5zm2.802-3.5a6.959 6.959 0 0 0-.656-2.5H12.18c.174.782.282 1.623.312 2.5h2.49zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7.024 7.024 0 0 0-3.072-2.472c.218.284.418.598.597.933zM10.855 4a7.966 7.966 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4h2.355z"/></svg> to search for administrative areas.',{'type':'WARNING'});
			}
		};

		this.setupMap = function(){
			
			// Clear loader
			document.getElementById('map').innerHTML = "";
			// Set up map
			this.map = L.map('map').setView([0, 0], 2);

			this.map.createPane('labels');
			this.map.getPane('labels').style.zIndex = 650;
			this.map.getPane('labels').style.pointerEvents = 'none';
			// Add tile layers
/*
			L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png', {
				attribution: '',
				pane: 'labels'
			}).addTo(this.map);
			L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
				attribution: 'Tiles: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
				subdomains: 'abcd',
				maxZoom: 19
			}).addTo(this.map);
*/

			// Satellite imagery
			L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
				attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
			}).addTo(this.map);

			// Our own, efficient, text-based label layer
			var labels = L.LayerGroup.placeNameLayer("https://open-innovations.org/projects/leaflet-place-name-layer/tileset/{z}/{x}/{y}.tsv",{
				zooms: [2,6,8],
				attribution: 'Labels &copy; <a href="http://www.geonames.org/">GeoNames</a>/<a href="https://open-innovatons.org/">OI</a>',
				padding: 3
			}).addTo(this.map);



			// Add circle drawer
			this.circleControl = L.control.circle({
				'position': 'topleft'
			});
			this.circleControl.addTo(this.map);
			this.circleControl.on('update',function(e){
				console.log('update',e.options.circle,_obj.areaSelection.polygon);
				if(e.options.circle){
					// Remove any existing polygons
					if(_obj.areaSelection.polygon) _obj.areaSelection.deactivate();
				}
			}).on('activate',function(e){
				// Remove any existing polygons
				if(_obj.areaSelection.polygon) _obj.areaSelection.deactivate();
				// Deactivate the area loading tool
				_obj.loadarea.deactivate();
			});

			// Add area selection
			this.areaSelection = new window.leafletAreaSelection.DrawAreaSelection({
				'position': 'topleft',
				'onPolygonReady':function(a){
					_obj.logger.log('INFO','onPolygonReady',a);
					if(!_obj._geojson){
						// Need to build the GeoJSON version
						var feature = {'type':'Feature','properties':{},'geometry':{'type':'Polygon','coordinates':[[]]}};
						if(_obj.areaSelection.markers.length > 1){
							for(var i = 0; i < _obj.areaSelection.markers.length; i++){
								feature.geometry.coordinates[0].push([parseFloat(_obj.areaSelection.markers[i].marker._latlng.lng.toFixed(5)), parseFloat(_obj.areaSelection.markers[i].marker._latlng.lat.toFixed(5))]);
							}
							// Complete ring
							feature.geometry.coordinates[0].push([parseFloat(_obj.areaSelection.markers[0].marker._latlng.lng.toFixed(5)), parseFloat(_obj.areaSelection.markers[0].marker._latlng.lat.toFixed(5))]);
						}
						_obj._geojson = {'type':'FeatureCollection','features':[feature]};
					}
				},
				'onPolygonDblClick':function(a){
					_obj.logger.log('INFO','onPolygonDblClick',a);
				},
				'onButtonActivate':function(e){
					// Deactivate the circle control
					_obj.circleControl.deactivate();
					// Deactivate the area loading tool
					_obj.loadarea.deactivate();
					// Remove any existing GeoJSON
					_obj._geojson = null;
				}
			});
			this.map.addControl(this.areaSelection);


			// Add control for loading areas
			this.loadarea = L.control.loadarea({
				'position': 'topleft',
				'process': function(d){
					if(d.url){
						_obj.loadArea(d.url);
					}
				}
			});
			this.loadarea.on('activate',function(e){
				// Deactivate the circle control
				_obj.circleControl.deactivate();
				// Deactivate the area drawing tool
				if(_obj.areaSelection.polygon) _obj.areaSelection.deactivate();
				// Remove any existing GeoJSON
				_obj._geojson = null;
			})
			this.loadarea.addTo(this.map);
			

			if(location.search.indexOf('area=')>0){
				var qs = location.search.replace(/^\?/,"");
				var bits = qs.split("&");
				qs = {};
				for(var b = 0; b < bits.length; b++){
					bit = bits[b].split(/=/);
					qs[bit[0]] = bit[1];
				}
				if(qs.area){
					var url = "https://open-innovations.github.io/geography-bits/data/"+qs.area+".geojsonl";
					this.loadArea(url);
				}
			}
		};
		
		this.setupMap();

		return this;
	}

	OI.Application = Application;

	root.OI = OI||root.OI||{};
	
})(window || this);

OI.ready(function(){
	
	app = new OI.Application({});
	//app.setGeo(53.7965, -1.5478,{"displayname":"Leeds, UK","n":30});

});

/*!
	Typeahead search v0.1.9
*/
(function(root){

	function Builder(){
		this.version = "0.1.9";
		this.init = function(el,opt){ return new TA(el,opt); };
		return this;
	}
	/**
	 * @desc Create a new TypeAhead object
	 * @param {DOM|string} el - the DOM element
	 * @param {object} opt - configuration options
	 */
	function TA(el,opt){
		if(!opt) opt = {};
		if(typeof el==="string") el = document.querySelector(el);
		if(!el){
			console.warn('No valid element provided');
			return this;
		}
		var _obj = this;
		var evs = {};
		var items = opt.items||[];
		var results,frm;
		var inline = (typeof opt.inline==="boolean" ? opt.inline : false);

		function search(s,e,t){

			var n,i,tmp,str,html,datum,ev;
			str = s.toUpperCase();

			// Rank the results
			tmp = [];
			if(str){
				for(i = 0 ; i < items.length; i++){
					datum = {'rank':0,'key':i,'value':items[i]};
					if(typeof opt.rank==="function") datum.rank = opt.rank(items[i],s);
					else{
						if(items[i].toUpperCase().indexOf(str) == 0) datum.rank += 3;
						if(items[i].toUpperCase().indexOf(str) > 0) datum.rank += 1;
					}
					tmp.push(datum);
				}
				tmp = sortBy(tmp,'rank');
			}

			// Add results to DOM
			if(!results){
				el.parentElement.style.position = "relative";
				results = document.createElement('div');
				results.classList.add('typeahead-results');
				results.style.top = (el.offsetTop + el.offsetHeight)+'px';
				results.style.left = el.offsetLeft+'px';
				results.style.position = "absolute";
				results.addEventListener('scroll',function(e){ e.preventDefault(); e.stopPropagation(); });
				results.addEventListener('wheel',function(e){ e.stopPropagation(); });
				frm.style.position = "relative";
				el.insertAdjacentElement('afterend',results);
			}

			html = "";
			if(tmp.length > 0){
				n = (typeof opt.max==="number") ? Math.min(tmp.length,opt.max) : tmp.length;
				html = "<ol>";
				for(i = 0; i < n; i++){
					if(tmp[i].rank > 0) html += '<li data-id="'+tmp[i].key+'" '+(i==0 ? ' class="selected"':'')+'><a tabindex="0" href="#" class="name item">'+(typeof opt.render==="function" ? opt.render(items[tmp[i].key]) : items[tmp[i].key])+"</a></li>";
				}
				html += "</ol>";
			}
			results.innerHTML = html;
			if(inline) el.style.marginBottom = results.offsetHeight+'px';

			// Add click events
			var li = getLi();
			for(i = 0 ; i < li.length ; i++){
				li[i].addEventListener('click',function(ev){
					ev.preventDefault();
					ev.stopPropagation();
					selectLI(this.getAttribute('data-id'));
				});
			}
			
			if(evs[t]){
				e._typeahead = _obj;
				// Process each of the events attached to this event
				for(i = 0; i < evs[t].length; i++){
					ev = evs[t][i];
					e.data = ev.data||{};
					if(typeof ev.fn==="function") ev.fn.call(ev.data['this']||this,e);
				}
			}

			return this;
		}

		function getLi(){ return (results ? results.querySelectorAll('li') : []); }
		
		function selectLI(i){
			if(i){
				_obj.input = el;
				if(typeof opt.process==="function") opt.process.call(_obj,items[i]);
				else console.log(items[i]);
			}
			if(results) results.innerHTML = "";
			if(inline) el.style.marginBottom = "0px";
			return;
		}

		function submit(){
			var li = getLi();
			for(var i = 0; i < li.length; i++){
				if(li[i].classList.contains('selected')) return selectLI(li[i].getAttribute('data-id'));
			}
			return;
		}

		function highlight(keyCode){
			var li = getLi();
			var s = -1;
			var sel;
			for(var i = 0; i < li.length; i++){
				if(li[i].classList.contains('selected')) s = i;
			}
			sel = s;
			if(keyCode==40) s++;
			else s--;
			if(s < 0) s = li.length-1;
			if(s >= li.length) s = 0;
			if(sel >= 0) li[sel].classList.remove('selected');
			li[s].classList.add('selected');
		}
		this.update = function(){
			var ev = document.createEvent('HTMLEvents');
			ev.initEvent('keyup', false, true);
			el.dispatchEvent(ev);
			return this;
		}
		this.on = function(event,data,fn){
			if(!el){
				console.warn('Unable to attach event '+event);
				return this;
			}
			if(event=="change"){
				if(!evs[event]){
					evs[event] = [];
					el.addEventListener('keyup',function(e){
						e.preventDefault();
						e.stopPropagation();
						if(e.keyCode==40 || e.keyCode==38){
							highlight(e.keyCode);
						}else if(e.keyCode==13){
							submit();
						}else{
							// Match here
							search(this.value,e,event);
							if(typeof opt.endsearch==="function") opt.endsearch(this.value);
						}
					});
					el.addEventListener('blur',function(e){
						if(typeof opt.blur==="function") opt.blur();
					});
				}
				evs[event].push({'fn':fn,'data':data});
			}else if(event=="blur"){
				console.logger.log('blur');
			}else console.warn('No event of type '+event);
			return this;
		};
		this.off = function(e,fn){
			// Remove any existing event from our list
			if(evs[e]){
				for(var i = 0; i < evs[e].length; i++){
					if(evs[e][i].fn==fn) evs[e].splice(i,1);
				}
			}
		};
		if(el.form){
			frm = el.form;
			frm.addEventListener('submit',function(e){
				e.preventDefault();
				e.stopPropagation();
				submit();
			},false);
		}
		if(el){
			el.setAttribute('autocomplete','off');
		}
		this.addItems = function(d){
			if(!items) items = [];
			items = items.concat(d);
		};
		this.clearItems = function(){ items = []; }
		this.listItems = function(){ return items; }
		this.on('change',{},function(e){ });

		return this;
	}

	if(typeof root.TypeAhead==="undefined") root.TypeAhead = new Builder();

	// Sort the data
	function sortBy(arr,i){
		return arr.sort(function (a, b) {
			return a[i] < b[i] ? 1 : -1;
		});
	}
	/* End Typeahead */

})(window || this);