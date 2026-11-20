/* =====================================================
   Red Scout Bajío · Mapa
   Los lugares vienen de lugares.json
   ===================================================== */
(function () {
    'use strict';

    var CENTRO_GENERAL = [21.05, -101.05];
    var ZOOM_GENERAL = 8;

    var buscador = document.getElementById('buscador');
    var clearSearch = document.getElementById('clear-search');
    var mapInfo = document.getElementById('map-info');
    var avisoOffline = document.getElementById('aviso-offline');

    function esc(t) {
        return String(t == null ? '' : t)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    function normaliza(t) {
        return String(t == null ? '' : t)
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .toLowerCase().trim();
    }
    function contador(texto) {
        mapInfo.innerHTML = '<i class="fas fa-map-marker-alt mr-1"></i> ' + esc(texto);
    }

    /* ---------- Aviso sin conexión ---------- */
    function actualizaConexion() {
        avisoOffline.style.display = navigator.onLine ? 'none' : 'block';
    }
    window.addEventListener('online', actualizaConexion);
    window.addEventListener('offline', actualizaConexion);
    actualizaConexion();

    /* ---------- Mapa y capas ---------- */
    var mapa = L.map('map', { zoomControl: true });

    var mapaNormal = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
        maxZoom: 19
    });
    /* maxZoom 17 en satélite y topográfico: más cerca no hay imágenes */
    var mapaSatelital = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Sources: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
        maxZoom: 17
    });
    var mapaTopografico = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors, SRTM | &copy; OpenTopoMap',
        maxZoom: 17
    });

    mapaNormal.addTo(mapa);
    L.control.layers({
        '🗺️ Mapa': mapaNormal,
        '🛰️ Satélite': mapaSatelital,
        '🏔️ Topográfico': mapaTopografico
    }, null, { position: 'bottomright', collapsed: true }).addTo(mapa);

    mapa.setView(CENTRO_GENERAL, ZOOM_GENERAL);

    var scoutIcon = L.divIcon({
        className: '',
        html: '<div class="custom-marker"><i class="fas fa-campground"></i></div>',
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -38]
    });

    /* ---------- Marcadores ---------- */
    var marcadores = [];
    var popupDesdeTarjeta = false;

    function popupHTML(l) {
        var destino = l.lat + ',' + l.lng;
        return '<div>' +
            '<div class="popup-title">' + esc(l.nombre) + '</div>' +
            '<div class="popup-municipio">' + esc(l.municipio) + '</div>' +
            '<a class="popup-link" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=' + destino + '">' +
                '<i class="fas fa-map-marker-alt mr-1"></i> Ver en Google Maps</a>' +
            '<a class="popup-link secundario" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=' + destino + '">' +
                '<i class="fas fa-location-arrow mr-1"></i> Cómo llegar</a>' +
        '</div>';
    }

    function mostrarTodos() {
        marcadores.forEach(function (m) { m.marcador.addTo(mapa); });
        contador(marcadores.length + ' lugares scout');
    }

    function vistaGeneral() {
        mapa.setView(CENTRO_GENERAL, ZOOM_GENERAL);
    }

    function iniciaMapa(lugares) {
        lugares.forEach(function (l) {
            var marcador = L.marker([l.lat, l.lng], { icon: scoutIcon, title: l.nombre, alt: l.nombre });
            marcador.bindPopup(popupHTML(l));
            marcador.on('popupclose', function () {
                /* Si se llegó desde una tarjeta, al cerrar regresa a la vista general */
                if (popupDesdeTarjeta) {
                    popupDesdeTarjeta = false;
                    mapa.setView(CENTRO_GENERAL, ZOOM_GENERAL, { animate: true });
                    contador(marcadores.length + ' lugares scout');
                }
            });
            marcador.addTo(mapa);
            marcadores.push({ marcador: marcador, datos: l });
        });
        contador(marcadores.length + ' lugares scout');

        /* ?lugar=<id> (también acepta el nombre completo) */
        var pedido = new URLSearchParams(window.location.search).get('lugar');
        if (pedido) {
            var buscado = normaliza(pedido);
            var res = marcadores.find(function (m) {
                return m.datos.id === pedido || normaliza(m.datos.nombre) === buscado;
            });
            if (res) {
                popupDesdeTarjeta = true;
                mapa.setView([res.datos.lat, res.datos.lng], 14, { animate: true });
                setTimeout(function () { res.marcador.openPopup(); }, 500);
                contador(res.datos.nombre);
            }
        }
    }

    /* ---------- Buscador ---------- */
    buscador.addEventListener('input', function () {
        var texto = normaliza(buscador.value);
        clearSearch.style.display = texto.length ? 'flex' : 'none';

        if (!texto) { mostrarTodos(); vistaGeneral(); return; }

        var encontrados = [];
        marcadores.forEach(function (m) {
            var d = m.datos;
            if (normaliza(d.nombre).indexOf(texto) !== -1 ||
                normaliza(d.municipio).indexOf(texto) !== -1 ||
                normaliza(d.estado).indexOf(texto) !== -1) {
                m.marcador.addTo(mapa);
                encontrados.push(m);
            } else {
                mapa.removeLayer(m.marcador);
            }
        });

        contador(encontrados.length === 0 ? 'Sin resultados'
            : encontrados.length + (encontrados.length === 1 ? ' lugar' : ' lugares'));

        if (encontrados.length === 1) {
            mapa.setView([encontrados[0].datos.lat, encontrados[0].datos.lng], 12);
            encontrados[0].marcador.openPopup();
        } else if (encontrados.length > 1) {
            var grupo = L.featureGroup(encontrados.map(function (m) { return m.marcador; }));
            mapa.fitBounds(grupo.getBounds(), { padding: [50, 50], maxZoom: 10 });
        }
    });

    clearSearch.addEventListener('click', function () {
        buscador.value = '';
        clearSearch.style.display = 'none';
        mostrarTodos();
        vistaGeneral();
        buscador.blur();
    });

    /* ---------- Carga de datos ---------- */
    fetch('lugares.json')
        .then(function (r) {
            if (!r.ok) { throw new Error('HTTP ' + r.status); }
            return r.json();
        })
        .then(function (datos) { iniciaMapa(datos.lugares || []); })
        .catch(function () { contador('No se pudieron cargar los lugares'); });
})();
