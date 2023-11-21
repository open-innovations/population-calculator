/*	Area search
	This uses:
		* OSM areas: osm_meta.db and osm_full.db
		* ONS geographies: bits_meta.db and bits_full.db
*/
L.Control.loadArea = L.Control.extend({        
	options: {
		position: 'topleft'
	},
	activate: function(){
		this._container.classList.add('open');
		this._inp.style.display = 'block';
		console.log(this._inp);
		this._inp.focus();
		this.fire('activate');
		
	},
	deactivate: function(){
		this._container.classList.remove('open');
		this._inp.style.display = '';
		this._btn.focus();
		this._inp.value = "";
		this.fire('dectivate');
		
	},
	onAdd: function(map){

		var _obj = this;
		function trigger(el, eventType) {
			if(typeof eventType === 'string' && typeof el[eventType] === 'function') {
				el[eventType]();
			}else{
				const event = eventType === 'string' ? new Event(eventType, {bubbles: true}) : eventType;
				el.dispatchEvent(event);
			}
		}
		function setState(state){
			if(typeof state!=="boolean") state = !_obj._container.classList.contains('open'); 
			if(state) _obj.activate();
			else _obj.deactivate();
		}

		this._container = L.DomUtil.create('div', 'leaflet-control leaflet-control-search');
		this._container.innerHTML = '<div class="leaflet-bar"><form><button class="leaflet-button"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-globe" viewBox="0 0 16 16"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm7.5-6.923c-.67.204-1.335.82-1.887 1.855A7.97 7.97 0 0 0 5.145 4H7.5V1.077zM4.09 4a9.267 9.267 0 0 1 .64-1.539 6.7 6.7 0 0 1 .597-.933A7.025 7.025 0 0 0 2.255 4H4.09zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a6.958 6.958 0 0 0-.656 2.5h2.49zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5H4.847zM8.5 5v2.5h2.99a12.495 12.495 0 0 0-.337-2.5H8.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5H4.51zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5H8.5zM5.145 12c.138.386.295.744.468 1.068.552 1.035 1.218 1.65 1.887 1.855V12H5.145zm.182 2.472a6.696 6.696 0 0 1-.597-.933A9.268 9.268 0 0 1 4.09 12H2.255a7.024 7.024 0 0 0 3.072 2.472zM3.82 11a13.652 13.652 0 0 1-.312-2.5h-2.49c.062.89.291 1.733.656 2.5H3.82zm6.853 3.472A7.024 7.024 0 0 0 13.745 12H11.91a9.27 9.27 0 0 1-.64 1.539 6.688 6.688 0 0 1-.597.933zM8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855.173-.324.33-.682.468-1.068H8.5zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.65 13.65 0 0 1-.312 2.5zm2.802-3.5a6.959 6.959 0 0 0-.656-2.5H12.18c.174.782.282 1.623.312 2.5h2.49zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7.024 7.024 0 0 0-3.072-2.472c.218.284.418.598.597.933zM10.855 4a7.966 7.966 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4h2.355z"/></svg></button><div class="control"><input class="place" id="search" name="place" value="" placeholder="Search for an area..." type="text" /></div></div></form></div>';
		this._btn = this._container.querySelector('button');
		this._inp = this._container.querySelector('input');
		
		// Stop map dragging on the element
		this._inp.addEventListener('mousedown', function(){ map.dragging.disable(); });
		this._inp.addEventListener('mouseup', function(){ map.dragging.enable(); });
		
		this._btn.addEventListener('click',setState);
		this._btn.addEventListener('dblclick', function(event){
			event.stopPropagation();
		});

		var opts = this.options;
		var db = {
			'bits': {
				'meta': 'areas/bits_meta.db',
				'full': 'areas/bits_full.db'
			}
		};
		OI.SearchDB.add('bits',{
			'meta':'areas/bits_meta.db',
			'full':'areas/bits_full.db',
			'processRow': function(cols){
				var code,name,type;
				if(cols.length==2){
					name = cols[0];
					code = cols[1];
					year = code.replace(/^.*?([0-9]{2})CD.*$/g,function(m,p1){ return p1; });
					if(code.indexOf("MSOA")==0){
						type = "MSOA";
					}else if(code.indexOf("LAD")==0){
						type = "Local Authority";
					}else if(code.indexOf("WD")==0){
						type = "Ward";
					}else if(code.indexOf("PCON")==0){
						type = "Constituency";
					}
					return {
						'name':name,
						'code':code,
						'url':'https://open-innovations.github.io/geography-bits/data/'+code+'.geojsonl',
						'type':type||"",
						'display':''+name+(type ? ' ('+type+(year ? " 20"+year:"")+')' : '')+'<span class="source ONS">UK: ONS</span>'
					};
				}else{
					return {};
				}
			}
		});
		OI.SearchDB.add('osm',{
			'meta':'areas/osm_meta.db',
			'full':'areas/osm_full.db',
			'processRow': function(cols){
				var code,name,type,dir,pop,lvl;
				// Columns are:
				//	0: name (e.g. Leeds)
				//	1: qualifier (e.g. City and Borough of Leeds, England)
				//	2: code (e.g. 118362)
				//	3: level (e.g. 8)
				//	4: population (e.g. 455123)
				//	5: latitude
				//	6: longitude
				// e.g. Leeds	City and Borough of Leeds, England	118362	8	455123	53.79648	-1.54785
				if(cols.length==7){
					dir = Math.floor(parseInt(cols[2])/1e5)*100000;
					name = cols[0]+(cols[1] ? ", "+cols[1] : "");
					code = cols[2];
					pop = parseInt(cols[4]);
					lvl = parseInt(cols[3]);

					return {
						'code':code,
						'url':'https://raw.githubusercontent.com/open-innovations/geography-bits-osm/main/data/OSM/'+dir+'/'+cols[2]+'.geojson',
						'name':name,
						'population':pop,
						'level':lvl,
						'display':''+name+'<span class="source OSM">OSM</span>'
					};
				}else{
					return {};
				}
			}
		});

		this.areaSearch = TypeAhead.init(this._inp,{
			'items': [],
			'rank': function(d,str){
				// Calculate a weighting
				var r = 0;
				if(d.name){
					// If the name starts with the string add 3
					if(d.name.toUpperCase().indexOf(str.toUpperCase())==0) r += 3;
					// If the name includes the string add 1
					if(d.name.toUpperCase().indexOf(str.toUpperCase())>0) r += 1;
					// If the name matches the start of the string we add more to the score if the remaining letters are few
					if(d.name.toUpperCase().indexOf(str.toUpperCase())==0){
						restofstr = d.name.toUpperCase().replace(new RegExp("^"+str.toUpperCase()),"");
						r += Math.max(0,6-restofstr.length);
					}
					if(d.name.toUpperCase().indexOf(str.toUpperCase())>=0){
						// Add based on the level
						if(typeof d.level==="number") r += (10-d.level)/5;
						// Scale based on population
						if(typeof d.population==="number") r += (d.population)/1e5
					}
				}
				return r;
			},
			'render': function(d){
				return d.display||d.name+(d.type ? ' ('+d.type+')' : '');
			},
			'process': function(d){
				if(typeof opts.process==="function") opts.process.call(this,d);
				setState(false);
			}
		});

		this.areaSearch.on('change',{this:this},function(e){
			var txt = e.target.value.toLowerCase();
			var _obj = this;
			if(txt && txt.length>1){
				OI.SearchDB.search(txt,function(a){
					_obj.areaSearch.addItems(a.items);
					OI.logger('Leaflet.load-areas').log('INFO','There are '+_obj.areaSearch.listItems().length+' items');
					_obj.areaSearch.update();
				});
			}
		});

		return this._container;
	}
});

// Add ability to listen to events
L.extend(L.Control.loadArea.prototype, L.Evented.prototype)

L.control.loadarea = function(opts){ return new L.Control.loadArea(opts); };
(function(root){
	var OI = root.OI || {};

	if(!OI.fetch){
		function FetchExtract(){
			// version 1.0
			var full = {};
			this.full = function(){ return full; };
			this.get = function(url,cb,opts){
				if(!opts) opts = {};

				if(!url){
					OI.logger('Leaflet.load-areas').log('ERROR','No URL provided.');
					return this;
				}
				if(typeof cb!=="function"){
					OI.logger('Leaflet.load-areas').log('ERROR','No callback function provided so not bothering.');
					return this;
				}

				// If we set cache:false we will delete what we already have
				if(typeof opts.cache==="boolean" && !opts.cache) delete full[url];

				// If we have the full file contents (which will be because there was an error extracting), just take a slice of that
				if(full[url]){

					txt = full[url];
					if(typeof opts.start==="number" && typeof opts.end==="number") txt = txt.slice(opts.start,opts.end);
					cb.call(this,txt,{'url':url});

				}else{

					var headers = {};
					if(typeof opts.start==="number" && typeof opts.end==="number") headers['Range'] = "bytes="+opts.start+"-"+opts.end;

					fetch(url,{"headers": headers})
					.then(response => { return response.text(); })
					.then(txt => {
						var elength = opts.end-opts.start;
						var ok = false;
						if(txt.length >= elength-1 && txt.length <= elength+1) ok = true;
						if(typeof opts.start==="number" && typeof opts.end==="number" && !ok){
							OI.logger('Leaflet.load-areas').log('ERROR','Getting '+url+' expected length is '+elength+' but got '+txt.length,ok);
							throw new Error('Wrong length returned.');
						}
						cb.call(this,txt,{'url':url});
					})
					.catch(error => {
						OI.logger('Leaflet.load-areas').log('ERROR','Failed to extract range so asking for entire response.',error);
						fetch(url).then(response => { return response.text(); })
						.then(txt => {
							full[url] = txt;
							if(typeof opts.start==="number" && typeof opts.end==="number") txt = txt.slice(opts.start,opts.end);
							cb.call(this,txt,{'url':url});
						});
					});
				}
				return this;
			}
			return this;
		}
		OI.fetch = FetchExtract();
	}
	if(!OI.SearchDB){
		function SearchDB(){
			var dbs = {};
			this.add = function(name,opts){
				if(!dbs[name]){
					dbs[name] = opts;
					// Get the meta data
					OI.fetch.get(opts.meta,function(txt,attr){
						rows = txt.split(/\n/);
						orows = []
						for(var r = 0; r < rows.length; r++){
							cols = rows[r].split(/\t/);
							if(cols.length == 4) orows.push({'a':cols[0],'b':cols[1],'start':parseInt(cols[2]),'end':parseInt(cols[3])});
						}
						dbs[name].data = orows;
					});
				}
				return this;
			};
			this.list = function(){ return dbs; }
			this.search = function(input,cb){
				var name,d,r,cols,rows,found,toload,loaded,items;
				items = [];
				toload = [];
				loaded = 0;
				function done(){
					cb.call(this,{'search':input,'items':items});
				}
				for(name in dbs){
					found = -1;
					for(var d = 0; d < dbs[name].data.length; d++){
						if(input >= dbs[name].data[d].a && input <= dbs[name].data[d].b){
							found = d;
							continue;
						}
					}
					if(found > 0 && !dbs[name].data[found].rows) toload.push({'name':name,'found':found});
				}
				if(toload.length>0){
					items = [];
					for(d = 0; d < toload.length; d++){
						name = toload[d].name;
						found = toload[d].found;
						OI.logger('Leaflet.load-areas').log('INFO','Get '+dbs[name].full+' ('+dbs[name].data[found].start+'-'+dbs[name].data[found].end+') '+(dbs[name].data[found].end-dbs[name].data[found].start)+' bytes');
						OI.fetch.get(dbs[name].full,function(txt,attr){
							var rows,cols,r;
							dbs[name].data[found].rows = txt.split(/\n/);
							for(r = 0; r < dbs[name].data[found].rows.length; r++){
								cols = dbs[name].data[found].rows[r].split(/\t/);
								dbs[name].data[found].rows[r] = null;
								if(typeof dbs[name].processRow==="function"){
									dbs[name].data[found].rows[r] = dbs[name].processRow.call(this,cols);
									dbs[name].data[found].rows[r]['_source'] = name;
									dbs[name].data[found].rows[r]['_found'] = found;
									if(dbs[name].data[found].rows[r].name) items.push(dbs[name].data[found].rows[r]);
								}
							}
							loaded++;
							if(loaded == toload.length) done();
						},{'start':dbs[name].data[found].start,'end':dbs[name].data[found].end});
					}
				}
				return this;
			};
			return this;
		};
		OI.SearchDB = SearchDB();
	}
	root.OI = OI||root.OI||{};

	if(!root.OI.logger){
		// Version 1.2
		root.OI.logger = function(title){
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

})(window || this);