/*
	Circle creator v0.1
*/
(function(root){

	var CLICK_EVT = leaflet.Browser.mobile ? 'touchend' : 'click';
	var ev;

	var PANE_NAME = 'circle';

	var styles = document.createElement('style');
	styles.innerHTML = '.leaflet-circle-pane.inactive {display:none;} .leaflet-circle-pane { width: 100%; position: absolute; top: unset!important; bottom: 0; left: 0; background: rgb(255,255,255); text-align: center; padding: 0.5em 0.3em; z-index: 2000!important; }';
	document.head.prepend(styles);

	function insertAfter(newNode, referenceNode) {
		referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
	}
	function createHelp(map, txt) {
		var pane = map.createPane(PANE_NAME, map.getContainer());
		pane.classList.add("inactive","fading-enabled");

		var handler = function handler(event) {
			if (!isTrustedEvent(event)) {
				return;
			}

			event.stopPropagation();
			map.fire('as:point-add', event);
		};

		pane.addEventListener(CLICK_EVT, handler);

		var panel = leaflet.DomUtil.create('div', 'circle-pane-help');
		panel.setAttribute('id', 'circle-panel-help');
		panel.setAttribute('role', 'tooltip');
		panel.textContent = txt;
		pane.appendChild(panel);

		return pane;
	}

	L.Control.circle = L.Control.extend({        
		options: {
			position: 'topleft',
			circle: false,
			value: 5
		},
		activate: function(){
			this._container.classList.add('open');
			this._inp.style.display = 'block';
			this._inp.value = this.options.value;
			this._inp.focus();
			this._val.style.display = 'block';
			this._ctl.style.display = 'block';
			L.DomUtil.addClass(this._map._container,'crosshair-cursor-enabled');
			this._active = true;
			this._map.on(CLICK_EVT, ev);
			
			var pane = this._map.getPane(PANE_NAME);
			pane.classList.remove('inactive');

			this.fire('activate');
		},
		deactivate: function(keepfocus){
			this._container.classList.remove('open');
			this._circle.removeFrom(this._map);
			this.options.circle = false;
			this._inp.style.display = '';
			if(keepfocus) this._btn.focus();
			this._inp.value = "";
			this._val.style.display = 'none';
			this._ctl.style.display = 'none';
			L.DomUtil.removeClass(this._map._container,'crosshair-cursor-enabled');
			this.options.circle = false;
			this._active = false;
			this._map.off(CLICK_EVT, ev);

			var pane = this._map.getPane(PANE_NAME);
			pane.classList.add('inactive');

			this.fire('deactivate');
		},
		set: function(opt){
			if(!opt || !this._active) return this;
			if(opt.radius) this.setRadius(opt.radius);
			if(typeof opt.latitude==="number" && typeof opt.longitude==="number") this.setPosition({'latlng':{'lat':opt.latitude,'lng':opt.longitude}})

			this.fire('update',this);
		},
		setRadius: function(v){
			if(this._active){
				if(typeof v==="string") v = parseFloat(v);
				v = Math.min(v,this.options.max||10);
				v = Math.max(v,this.options.min||1);
				this._inp.value = v;
				this._val.querySelector('span').innerHTML = v;
				this.options.radius = v;
				this._circle.setRadius(1000*this.options.radius);
			}
		},
		setPosition: function(e){
			if(this._active){
				if(!this.options.circle){
					this._circle.addTo(this._map);
					this.options.circle = true;
				}
				this.options.centre = e.latlng;
				this._circle.setLatLng(this.options.centre);
			}
		},
		onAdd: function(map){

			var _obj = this;
			this._map = map;

			function updateValue(v){
				if(v.target) v = v.target.value;
				_obj.set({'radius':v});
			}
			if(typeof ev!=="function") ev = function(e){ _obj.set({'latitude':e.latlng.lat,'longitude':e.latlng.lng}); }

			this._container = L.DomUtil.create('div', 'leaflet-control leaflet-control-circle');
			this._container.innerHTML = '<div class="leaflet-bar"><form><button class="leaflet-button" title="Create a circle" aria-describedby="circle-panel-help" aria-label="Create a circle"><svg xmlns="http://www.w3.org/2000/svg" overflow="visible" width="16" height="16" fill="currentColor" fill-opacity="0.4" stroke="currentColor" stroke-width="1.5" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7"></circle></svg></button><div class="control" style="display:none;"><input class="radius" id="radius" name="radius" value="'+(this.options.value)+'" type="range" min="'+(this.options.min||1)+'" max="'+(this.options.max||10)+'" /></div><div class="value" style="display:none;"><span></span>km</div></div></form></div>';
			this._btn = this._container.querySelector('button');
			this._inp = this._container.querySelector('input');
			this._ctl = this._container.querySelector('.control');
			this._val = this._container.querySelector('.value');
			this._hlp = L.DomUtil.create('div','');
			this._circle = L.circle([0,0],{'radius':1000});
			this._active = false;
			
			// Stop map dragging on the element
			this._inp.addEventListener('mousedown', function(){ map.dragging.disable(); });
			this._inp.addEventListener('mouseup', function(){ map.dragging.enable(); });
			this._inp.addEventListener('input',updateValue);
			updateValue(this.options.value);

			this._btn.addEventListener(CLICK_EVT,function(event){
				event.preventDefault();
				event.stopPropagation();
				state = !_obj._container.classList.contains('open');
				if(state) _obj.activate();
				else _obj.deactivate(true);
			});
			this._btn.addEventListener('dblclick', function(event){
				event.preventDefault();
				event.stopPropagation();
			});
			this._container.addEventListener(CLICK_EVT, function(event){
				event.preventDefault();
				event.stopPropagation();
			});
			
			var pane = createHelp(map, (leaflet.Browser.mobile ? "Touch" : "Click on")+" the map to define the centre of the circle then use the slider to change the size.");

			return this._container;
		}
	});

	// Add ability to listen to events
	L.extend(L.Control.circle.prototype, L.Evented.prototype);

	L.control.circle = function(opts){ return new L.Control.circle(opts); };

})(window || this);