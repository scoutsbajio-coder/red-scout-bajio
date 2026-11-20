# Red Scout Bajío

Zonas de camping y hiking, mapa interactivo y biblioteca de recursos para la comunidad scout del Bajío.

Sitio: https://scoutsbajio-coder.github.io/red-scout-bajio/

## Cómo subirlo a GitHub

1. Descomprime el zip.
2. En el repositorio `red-scout-bajio`, borra los archivos viejos y sube **todo el contenido de la carpeta** (incluida `.nojekyll`).
   Desde la web: *Add file → Upload files*, arrastra los archivos y las carpetas `js`, `icons` e `img`.
3. Espera 1–2 minutos a que GitHub Pages publique.
4. Abre el sitio en el celular para probar la instalación.

> El sitio debe abrirse por `https://` (GitHub Pages ya lo hace). Si abres `index.html` con doble clic no cargará
> `lugares.json`: para probar en la computadora usa `python3 -m http.server` y entra a `http://localhost:8000`.

## Estructura

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Página principal |
| `mapa.html` | Mapa interactivo |
| `lugares.json` | **Todos los lugares.** Es el único archivo que editas para agregar o cambiar un lugar |
| `js/index.js`, `js/mapa.js` | Generan las tarjetas y el mapa a partir de `lugares.json` |
| `js/pwa.js` | Registra la app y muestra el botón "Instalar app" |
| `manifest.webmanifest` | Nombre, colores e íconos de la app |
| `service-worker.js` | Guarda archivos para que la app abra sin internet |
| `icons/`, `favicon-64.png`, `favicon.ico` | Íconos |
| `og-image.jpg` | Imagen que aparece al compartir el enlace (WhatsApp, Facebook) |
| `img/placeholder.svg` | Se muestra cuando un lugar no tiene foto o su enlace se rompió |

## Agregar un lugar

Abre `lugares.json` y copia un bloque dentro de `"lugares"`:

```json
{
  "id": "nombre-sin-acentos-ni-espacios",
  "nombre": "Nombre del lugar",
  "municipio": "Municipio",
  "estado": "Guanajuato",
  "lat": 21.0,
  "lng": -101.0,
  "descripcion": "Texto corto de la tarjeta.",
  "etiquetas": [
    { "icono": "fa-tree", "texto": "BOSQUE" },
    { "icono": "fa-snowflake", "texto": "FRÍO" }
  ],
  "color": "green",
  "foto": "img/nombre-sin-acentos-ni-espacios.webp"
}
```

- `id`: único, en minúsculas y con guiones. Se usa en el enlace `mapa.html?lugar=<id>`.
- `color`: `green` o `blue` (color de la etiqueta del municipio).
- `icono`: cualquier icono gratuito de [Font Awesome 6](https://fontawesome.com/search?o=r&m=free) (`fa-...`).
- `foto`: ruta a una imagen en `img/` o `null` si aún no tiene. Las coordenadas se copian de Google Maps (clic derecho → primer renglón).
- Cuida las comas entre bloques y que el archivo siga siendo JSON válido (puedes revisarlo en jsonlint.com).

## Publicar cambios (importante)

Cuando cambies cualquier archivo, **sube el número `VERSION` en `service-worker.js`** (`'v1'` → `'v2'`, etc.).
Así los celulares que ya tienen la app instalada descargan la versión nueva.

## Instalar como app

- **Android (Chrome):** botón **Instalar app** del menú, o menú ⋮ → *Instalar app*.
- **iPhone / iPad (Safari):** Compartir → **Agregar a inicio**.
- **Computadora (Chrome/Edge):** ícono de instalar en la barra de direcciones.

Para publicarla en Google Play o App Store puedes empaquetarla con [PWABuilder](https://www.pwabuilder.com) o Capacitor.

## Pendientes recomendados

- **Foto de Cerro de La Bufa:** la anterior era de la Bufa de Zacatecas, por eso quedó en `null`. Sube una foto propia.
- **Fotos propias:** casi todas las fotos de los lugares son enlaces a otros sitios (Google, Expedia, etc.), que pueden dejar de funcionar
  y no se guardan para uso sin internet. Descárgalas, conviértelas a WebP (~800 px de ancho), ponlas en `img/` y cambia `foto` en `lugares.json`.
  Después agrega esas rutas a `PRECACHE` en `service-worker.js` para verlas sin internet.
- **Tailwind:** se carga desde `cdn.tailwindcss.com`, que su autor no recomienda para producción. Funciona, pero lo ideal es compilarlo:
  `npx tailwindcss -i ./entrada.css -o ./estilos.css --minify` (incluyendo `index.html`, `mapa.html` y `js/*.js` en `content`).
- **Mapa sin internet:** los mosaicos del mapa necesitan conexión. Descargar OpenStreetMap en masa para uso offline no está permitido por su política.
- **Datos de contacto:** tu WhatsApp y correo son públicos. Si prefieres privacidad, cambia el botón por un Google Forms.

## Créditos

Clan Centzon Huitznahuac | Jonathan Alexander · Mapas © OpenStreetMap, Esri, OpenTopoMap · [Leaflet](https://leafletjs.com) · [Font Awesome](https://fontawesome.com) · [Tailwind CSS](https://tailwindcss.com)
