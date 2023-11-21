/*
	Circle creator v0.1
*/
L.Control.circle = L.Control.extend({        
	options: {
		position: 'topleft',
		circle: false
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
			if(typeof state!=="boolean") state = !container.classList.contains('open'); 
			if(state){
				container.classList.add('open');
				inp.style.display = 'block';
				inp.focus();
				val.style.display = 'block';
				ctl.style.display = 'block';
				map.on('click', setCirclePosition);
				L.DomUtil.addClass(map._container,'crosshair-cursor-enabled');
			}else{
				container.classList.remove('open');
				circle.removeFrom(map);
				_obj.options.circle = false;
				inp.style.display = '';
				btn.focus();
				inp.value = "";
				val.style.display = 'none';
				ctl.style.display = 'none';
				map.off('click', setCirclePosition);
				L.DomUtil.removeClass(map._container,'crosshair-cursor-enabled');
				_obj.options.circle = false;
			}
		}
		function updateValue(v){
			if(v.target) v = v.target.value;
			val.querySelector('span').innerHTML = v;

			_obj.options.radius = parseFloat(v);

			circle.setRadius(1000*_obj.options.radius);
		}
		function setCirclePosition(e) {

			_obj.options.centre = e.latlng;

			if(!_obj.options.circle){
				circle.addTo(map);
				_obj.options.circle = true;
			}
			circle.setLatLng(_obj.options.centre);
			map.fitBounds(circle.getBounds());
		}

		var container = L.DomUtil.create('div', 'leaflet-control leaflet-control-circle');
		container.innerHTML = '<div class="leaflet-bar"><form><button class="leaflet-button"><svg xmlns="http://www.w3.org/2000/svg" overflow="visible" width="16" height="16" fill="currentColor" fill-opacity="0.4" stroke="currentColor" stroke-width="1.5" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7"></circle></svg></button><div class="control" style="display:none;"><input class="radius" id="radius" name="radius" value="'+(this.options.value||1)+'" type="range" min="1" max="100" /></div><div class="value" style="display:none;"><span></span>km</div></div></form></div>';
		var btn = container.querySelector('button');
		var inp = container.querySelector('input');
		var ctl = container.querySelector('.control');
		var val = container.querySelector('.value');
		var circle = L.circle([0,0],{'radius':1000});
		
		// Stop map dragging on the element
		inp.addEventListener('mousedown', function(){ map.dragging.disable(); });
		inp.addEventListener('mouseup', function(){ map.dragging.enable(); });
		inp.addEventListener('input',updateValue);
		updateValue(1);

		btn.addEventListener('click',function(event){
			event.preventDefault();
			event.stopPropagation();
			setState();
		});
		btn.addEventListener('dblclick', function(event){
			event.preventDefault();
			event.stopPropagation();
		});
		container.addEventListener('click', function(event){
			event.preventDefault();
			event.stopPropagation();
		});

		return container;
	}
});
L.control.circle = function(opts){ return new L.Control.circle(opts); };