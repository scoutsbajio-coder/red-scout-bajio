/* =====================================================
   Red Scout Bajío · Página principal
   Las tarjetas se generan desde lugares.json
   ===================================================== */
(function () {
    'use strict';

    var BADGE = {
        green: 'bg-green-100 text-green-800',
        blue: 'bg-blue-100 text-blue-800'
    };
    var PLACEHOLDER = 'placeholder.svg';

    var grid = document.getElementById('grid-lugares');
    var buscador = document.getElementById('buscador');
    var sinResultados = document.getElementById('sin-resultados');
    var contador = document.getElementById('contador');
    var lugares = [];

    /* Escapa texto antes de meterlo en HTML */
    function esc(texto) {
        return String(texto == null ? '' : texto)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    /* Minúsculas y sin acentos: "canon" encuentra "Cañón" */
    function normaliza(texto) {
        return String(texto == null ? '' : texto)
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .toLowerCase().trim();
    }

    function tarjeta(l) {
        var etiquetas = (l.etiquetas || []).map(function (e) {
            return '<span><i class="fas ' + esc(e.icono) + '"></i> ' + esc(e.texto) + '</span>';
        }).join('');

        return '' +
        '<article class="bg-white rounded-2xl shadow-md overflow-hidden card-hover border border-gray-100">' +
            '<div class="h-48 bg-gray-200">' +
                '<img src="' + esc(l.foto || PLACEHOLDER) + '" alt="' + esc(l.nombre) + '"' +
                ' loading="lazy" decoding="async" referrerpolicy="no-referrer"' +
                ' class="w-full h-full object-cover">' +
            '</div>' +
            '<div class="p-6">' +
                '<span class="' + (BADGE[l.color] || BADGE.green) + ' text-xs font-bold px-2 py-1 rounded uppercase">' + esc(l.municipio) + '</span>' +
                '<h4 class="text-xl font-extrabold mt-2 text-gray-800">' + esc(l.nombre) + '</h4>' +
                '<p class="text-gray-600 text-sm mt-3 leading-relaxed">' + esc(l.descripcion) + '</p>' +
                '<div class="mt-4 flex flex-wrap gap-3 text-gray-500 text-xs font-bold">' + etiquetas + '</div>' +
                '<a href="mapa.html?lugar=' + encodeURIComponent(l.id) + '"' +
                ' class="mt-6 block text-center scout-blue text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition shadow-lg shadow-blue-200">Ver ubicación</a>' +
            '</div>' +
        '</article>';
    }

    function pinta(lista) {
        grid.innerHTML = lista.map(tarjeta).join('');
        sinResultados.classList.toggle('hidden', lista.length > 0);
        contador.textContent = lista.length + (lista.length === 1 ? ' lugar' : ' lugares');
    }

    function filtra() {
        var q = normaliza(buscador.value);
        if (!q) { pinta(lugares); return; }
        pinta(lugares.filter(function (l) {
            var texto = [l.nombre, l.municipio, l.estado].concat(
                (l.etiquetas || []).map(function (e) { return e.texto; })
            ).join(' ');
            return normaliza(texto).indexOf(q) !== -1;
        }));
    }

    /* Si una foto falla (enlace roto), mostramos el placeholder */
    grid.addEventListener('error', function (e) {
        var img = e.target;
        if (img.tagName === 'IMG' && img.getAttribute('src') !== PLACEHOLDER) {
            img.src = PLACEHOLDER;
        }
    }, true);

    buscador.addEventListener('input', filtra);

    /* Menú del celular */
    var btn = document.getElementById('menu-btn');
    var menu = document.getElementById('mobile-menu');
    btn.addEventListener('click', function () {
        var abierto = menu.classList.toggle('hidden') === false;
        btn.setAttribute('aria-expanded', String(abierto));
        btn.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    });
    menu.addEventListener('click', function (e) {
        if (e.target.closest('a')) {
            menu.classList.add('hidden');
            btn.setAttribute('aria-expanded', 'false');
        }
    });

    /* Carga de datos */
    fetch('lugares.json')
        .then(function (r) {
            if (!r.ok) { throw new Error('HTTP ' + r.status); }
            return r.json();
        })
        .then(function (datos) {
            lugares = datos.lugares || [];
            pinta(lugares);
        })
        .catch(function () {
            grid.innerHTML = '<p class="text-red-600 col-span-full">No se pudieron cargar los lugares. Revisa tu conexión e intenta de nuevo.</p>';
        });
})();
