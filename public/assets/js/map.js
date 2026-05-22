let map
const markers = {} 

const DEFAULT_CENTER = [20.5073163, -101.193337];
const INITIAL_ZOOM = 16 

const createBusIcon = () => {
    return L.icon({
        iconUrl: 'https://img.icons8.com/color/96/bus.png',
        iconSize: [40, 40],   
        iconAnchor: [20, 20]  
    })
}

export function initMap() {
    map = L.map('mapa').setView(DEFAULT_CENTER, INITIAL_ZOOM);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    map.on('zoomstart', ()=>{
        Object.values(markers).forEach(m =>{
            if (m.getElement()) m.getElement().classList.remove('uber-motion');
        
        })
    })

    map.on('zoomend',()=>{
        Object.values(markers).forEach(m =>{
            if (m.getElement()) {
                setTimeout(() => m.getElement().classList.add('uber-motion'), 100);
            }
        });
    });

    setTimeout(() =>map.invalidateSize(), 500);

    // llamada de prueba!!
    updateMarker('camion_prueba', DEFAULT_CENTER[0], DEFAULT_CENTER[1]);
}

export function updateMarker(uid, lat, lng) {
    const newLatLng = new L.LatLng(lat, lng);

    if (!markers[uid]) {
        markers[uid]=L.marker(newLatLng, { icon: createBusIcon() }).addTo(map);

        map.setView(newLatLng, INITIAL_ZOOM);
        
        setTimeout(() =>{
            if (markers[uid].getElement()) {
                markers[uid].getElement().classList.add('uber-motion');
            }
        }, 100);

    } else {
        markers[uid].setLatLng(newLatLng);
        map.panTo(newLatLng, { animate: true, duration: 4.5, easeLinearity: 1 });
    }
}