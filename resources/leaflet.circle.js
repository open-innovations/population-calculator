/*
	Circle creator v0.1
*/
L.Control.circle = L.Control.extend({        
	options: {
		position: 'topleft',
		circle: false
	},
	activate: function(){
		this._container.classList.add('open');
		this._inp.style.display = 'block';
		this._inp.focus();
		this._val.style.display = 'block';
		this._ctl.style.display = 'block';
		L.DomUtil.addClass(this._map._container,'crosshair-cursor-enabled');
		this._active = true;
		this.fire('activate');
	},
	deactivate: function(){
		this._container.classList.remove('open');
		this._circle.removeFrom(this._map);
		this.options.circle = false;
		this._inp.style.display = '';
		this._btn.focus();
		this._inp.value = "";
		this._val.style.display = 'none';
		this._ctl.style.display = 'none';
		L.DomUtil.removeClass(this._map._container,'crosshair-cursor-enabled');
		this.options.circle = false;
		this._active = false;
		this.fire('deactivate');
	},
	setCirclePosition: function(e){
		if(this._active){
			if(!this.options.circle){
				this._circle.addTo(this._map);
				this.options.circle = true;
			}
			this.options.centre = e.latlng;
			this._circle.setLatLng(this.options.centre);
			this._map.fitBounds(this._circle.getBounds());
			this.fire('update',this);
		}
	},
	onAdd: function(map){

		var _obj = this;
		var CLICK_EVT = leaflet.Browser.mobile ? 'touchend' : 'click';
		this._map = map;

		function updateValue(v){
			if(v.target) v = v.target.value;
			_obj._val.querySelector('span').innerHTML = v;

			_obj.options.radius = parseFloat(v);

			_obj._circle.setRadius(1000*_obj.options.radius);
			_obj.fire('update',_obj);
		}
		this._setCirclePosition = function(e){
			console.log('_setCirclePosition',this,e);
		};
		function setCirclePosition(e){ _obj.setCirclePosition(e); }

		this._container = L.DomUtil.create('div', 'leaflet-control leaflet-control-circle');
		this._container.innerHTML = '<div class="leaflet-bar"><form><button class="leaflet-button"><svg xmlns="http://www.w3.org/2000/svg" overflow="visible" width="16" height="16" fill="currentColor" fill-opacity="0.4" stroke="currentColor" stroke-width="1.5" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7"></circle></svg></button><div class="control" style="display:none;"><input class="radius" id="radius" name="radius" value="'+(this.options.value||1)+'" type="range" min="1" max="100" /></div><div class="value" style="display:none;"><span></span>km</div></div></form></div>';
		this._btn = this._container.querySelector('button');
		this._inp = this._container.querySelector('input');
		this._ctl = this._container.querySelector('.control');
		this._val = this._container.querySelector('.value');
		this._circle = L.circle([0,0],{'radius':1000});
		this._active = false;
		
		// Stop map dragging on the element
		this._inp.addEventListener('mousedown', function(){ map.dragging.disable(); });
		this._inp.addEventListener('mouseup', function(){ map.dragging.enable(); });
		this._inp.addEventListener('input',updateValue);
		updateValue(1);

		this._btn.addEventListener(CLICK_EVT,function(event){
			event.preventDefault();
			event.stopPropagation();
			state = !_obj._container.classList.contains('open');
			if(state){
				_obj._map.on(CLICK_EVT, setCirclePosition);
				_obj.activate();
			}else{
				_obj._map.off(CLICK_EVT, setCirclePosition);
				_obj.deactivate();
			}
		});
		this._btn.addEventListener('dblclick', function(event){
			event.preventDefault();
			event.stopPropagation();
		});
		this._container.addEventListener(CLICK_EVT, function(event){
			event.preventDefault();
			event.stopPropagation();
		});

		return this._container;
	}
});

// Add ability to listen to events
L.extend(L.Control.circle.prototype, L.Evented.prototype);

L.control.circle = function(opts){ return new L.Control.circle(opts); };