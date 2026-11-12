# La Cuna Records — La Casa Abandonada / Edición II — V4

Sitio estático para GitHub Pages, con registro en ventana emergente (modal) conectado opcionalmente a Google Apps Script y Google Sheets.

## Cambios incluidos en esta versión

- Rediseño editorial cinematográfico basado en la **composición** de la referencia AgentAI: navegación en pastilla, video central, tarjetas flotantes y mosaicos redondeados.
- Logotipo oficial, video de la iglesia e imágenes aportadas por el organizador, sin distorsiones ni deformaciones.
- Identidad negro/rojo/verde con elementos techno y destellos glitch discretos. Respeta `prefers-reduced-motion`.
- Botones que abren un **modal accesible de registro**.
- Datos de registro: **nombre completo, teléfono y hora estimada de asistencia**, con selección libre de 19:00 a 23:59.
- Fecha: **sábado 28/11/2026**; entrada desde **7:00 p. m.**; cover **$10.000 COP**.
- Ubicación: enlace oficial de Google Maps: https://maps.app.goo.gl/cdfcQjii66rNjWSN6
- Código de confirmación y control de duplicados por número de teléfono cuando se active el backend.

### Sobre las tipografías

Los archivos de fuente de prueba aportados para Angel Wish / Cocogoose **no se distribuyen en el repositorio público**; el diseño usa temporalmente `Pirata One`, `DM Sans` y `Space Mono` vía Google Fonts. Cuando se confirme una licencia con derechos de alojamiento web/distribución, se podrán incorporar las tipografías exactas sin alterar la estructura.

## Publicar la web

- Subir a la rama `main` los archivos de la raíz y mantener la carpeta `assets/`.
- Configurar `Settings > Pages > Deploy from a branch > main > /(root)`.
- La dirección del sitio es `https://juancarlos5505-ship-it.github.io/LACUNARECORDZ/`.
- Si `config.js` no tiene la URL del Apps Script, el modal funciona como demostración y **NO guarda registros**.

## Activar Google Sheets (tarea manual del organizador)

1. Crear una hoja de cálculo privada en Google Sheets.
2. Abrir **Extensiones > Apps Script** en esa misma hoja.
3. Copiar `google-apps-script/Code.gs` al archivo `Code.gs` del proyecto Apps Script.
4. Crear un archivo HTML **Formulario** y pegar `google-apps-script/Formulario.html`.
5. Guardar y ejecutar `prepararHoja` desde el editor; autorizar permisos de la cuenta responsable. Se crea una pestaña **Registros_V4**. Los registros antiguos de una pestaña `Registros` no se borran ni se reinterpretan.
6. En **Implementar > Nueva implementación > Aplicación web**, seleccionar `Ejecutar como: Yo` y `Acceso: Cualquier usuario` (si la cuenta lo permite). Copiar la URL pública que termina en `/exec`.
7. En `config.js`, pegar esa URL en la propiedad `appScriptUrl`.
8. Guardar y publicar los cambios en GitHub. Los botones abrirán el modal con el formulario real de Apps Script.
9. **Probar** un registro, verificar la fila en `Registros_V4`, probar un teléfono duplicado, comprobar la hora de asistencia y que el código se muestre después de un guardado real.

**IMPORTANTE:** Si un Apps Script anterior está desplegado, modificar los archivos en GitHub **no** actualiza la versión publicada de Apps Script. Hay que reemplazar `Code.gs` y `Formulario.html` también en Apps Script y crear una nueva versión de la implementación. Hasta completar esa actualización no cambiar el enlace de un formulario antiguo: los esquemas ya no coinciden.

## Seguridad y privacidad

- Nunca publicar la hoja de cálculo ni enlaces privados de Google Sheets en el repositorio.
- Evitar compartir documentos con asistentes que contengan información personal.
- `Code.gs` valida hora, teléfono, consentimiento, control de duplicados, límite de registros opcional y sanitiza celdas para evitar fórmulas maliciosas.
- **Antes de recoger información real**, completar el aviso legal con identidad y contacto del responsable, derechos del titular, tiempo de conservación y canal de solicitudes. El archivo `privacidad.html` contiene un borrador señalado como tal.
- El registro no equivale al pago del cover.

## Estructura

```
index.html
styles.css
main.js
config.js
privacidad.html
formulario-preview.html
assets/
  logo-lacuna-claro.svg
  logo-lacuna-original.svg
  entrada-cinematica.mp4
  video-portada.jpg
  capilla-nocturna.webp
  escena-cromada.webp
  mascota-cuna.webp
google-apps-script/
  Code.gs
  Formulario.html
```

**Próximo paso:** conectar y probar el backend. La nueva UI se puede publicar y revisar independientemente.