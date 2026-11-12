# LA CUNA RECORDS · LA CASA ABANDONADA / EDICIÓN II

**Versión 2 — Identidad visual oficial proporcionada por el organizador.** Landing animada para GitHub Pages + inscripción guardada en Google Sheets mediante Google Apps Script. Diseño adaptable a escritorio y móvil; fotografías, logotipo, personaje y video entregados por La Cuna Records.

## 0. Datos de la edición incluidos

- Evento: La Casa Abandonada — segunda edición.
- Fecha: sábado 28 de noviembre de 2026.
- Hora de inicio: 8:00 p. m.
- Cover informado: $10.000 COP.
- Ubicación: por anunciar. **No afirmar una ubicación no confirmada.**
- Instagram: https://www.instagram.com/lacunarecordz/
- **El registro no es una compra ni garantiza el ingreso.**

## 1. Publicar la página en GitHub

1. Ve a `https://github.com/new`. En propietario elige tu cuenta. Nombre del repositorio: `LACUNARECORDZ`. Descripción sugerida: `Sitio oficial de La Cuna Records para La Casa Abandonada. Experiencia web inmersiva, registro de asistentes e integración con Google Sheets.`
2. Marca **Public**. Deja **Add README** desactivado, **No .gitignore** y **No license**. Pulsa **Create repository**.
3. Descarga el ZIP adjunto de esta versión y **descomprímelo** en tu computador. Dentro verás `index.html`, `styles.css`, `main.js`, `config.js`, la carpeta `assets` y otros archivos.
4. En la página de tu repositorio vacío, selecciona **uploading an existing file**. Si GitHub ya muestra archivos, usa **Add file → Upload files**.
5. Arrastra **el contenido de la carpeta descomprimida**, no la carpeta externa ni el ZIP. `index.html` tiene que quedar directamente en la raíz del repositorio. Conserva `assets/` y `google-apps-script/` con sus nombres.
6. Abajo pulsa **Commit changes** (o **Commit changes...** y confirma).
7. Entra a **Settings → Pages** (barra lateral). En **Build and deployment** selecciona **Deploy from a branch**, `main`, `/(root)`. Pulsa **Save**.
8. Después, desde **Settings → Pages → Visit site**, abre la web. En esta cuenta, con ese repositorio, la dirección **esperada una vez publicado** será: `https://juancarlos5505-ship-it.github.io/LACUNARECORDZ/`. No funcionará hasta terminar la publicación.
9. Si se ve texto sin fotos, revisa que `assets/` esté en el repositorio con todos los archivos. En móvil, el video se reproduce silenciado; el sitio usa la imagen de portada si el navegador restringe el video.

## 2. Crear Google Sheets (NO publica la lista)

1. En tu propia cuenta, abre `https://sheets.google.com` y crea una hoja en blanco llamada `Registros La Casa Abandonada`.
2. Abre **Extensiones → Apps Script**.
3. En `Code.gs`, borra el contenido de ejemplo y pega TODO el código del archivo descargado `google-apps-script/Code.gs`.
4. A la izquierda, en **Archivos**, haz clic en **+ → HTML**. Escribe `Formulario` (sin `.html` porque Google lo agrega). Pega el contenido de `google-apps-script/Formulario.html`.
5. Guarda. En el menú de funciones selecciona `prepararHoja` y pulsa **Ejecutar**. Autoriza los permisos para que tu propio script pueda editar tu hoja. Esto crea/estiliza la pestaña `Registros`.
6. Revisa que estén las columnas: fecha, código, nombre, correo, WhatsApp, Instagram, UTM, estado, consentimientos y evento. **No compartas la hoja públicamente.**

## 3. Publicar el formulario de Google Apps Script

1. En el editor, esquina superior derecha, selecciona **Implementar → Nueva implementación**.
2. En **Seleccionar tipo** elige **Aplicación web**.
3. En **Ejecutar como** selecciona **Yo** para que el visitante no necesite acceso a tu Google Sheets.
4. En **Quién tiene acceso** selecciona **Cualquier usuario**, si tu tipo de cuenta lo permite. Si tu organización lo bloquea, tendrás que gestionar esa restricción con el administrador.
5. Pulsa **Implementar**. Copia la URL de **Aplicación web**, que termina en `/exec`.
6. Abre la URL en una ventana de incógnito y comprueba que muestra el formulario. No copies el enlace del editor `/edit` ni el enlace `/dev`.

## 4. Conectar Google Sheets a GitHub Pages

1. En tu repositorio abre `config.js`.
2. Usa el icono del lápiz (`Edit this file`) y cambia SOLO esta línea:

   `appScriptUrl: ""`

   por algo como (reemplaza el enlace de ejemplo por el tuyo):

   `appScriptUrl: "https://script.google.com/macros/s/TU_ID_REAL/exec"`

3. Pulsa **Commit changes**. Recarga la web publicada cuando termine la nueva versión.
4. Verifica que desaparezca el aviso **VERSIÓN DE DEMOSTRACIÓN**. El iframe debe mostrar el formulario real.
5. Prueba un registro con datos de ensayo, confirma el código de éxito y abre la pestaña `Registros` de Google Sheets para verificar una fila.
6. Prueba registrar de nuevo el **mismo correo o WhatsApp**: debe mostrar advertencia de duplicado, sin crear una fila adicional. Borra datos de prueba antes de lanzar.
7. Prueba desde un celular y desde una ventana de incógnito. Comprueba que el formulario funciona sin iniciar sesión en Google. Si el iframe no abre en algún navegador, el enlace **ABRIR EN OTRA PESTAÑA** ofrece una alternativa.

**ATENCIÓN:** cuando edites `Code.gs` o `Formulario.html`, en Apps Script debes ir a **Implementar → Gestionar implementaciones → Editar → Versión nueva → Implementar**. Guardar cambios no actualiza una implementación ya publicada.

## 5. Ejemplos para medir los registros por canal

- Biografía de Instagram: `https://juancarlos5505-ship-it.github.io/LACUNARECORDZ/?utm_source=instagram&utm_medium=bio&utm_campaign=casa_abandonada_02`
- Historia orgánica: `?utm_source=instagram&utm_medium=story&utm_campaign=casa_abandonada_02`
- Anuncio: `?utm_source=instagram&utm_medium=paid_social&utm_campaign=casa_abandonada_02`

En Google Sheets podrás segmentar la procedencia de los registros por UTM.

## 6. Personalización y animaciones

- Color verde neon `#65FF91`, color rojo `#F1463C`, fondo `#080A09`. Cambios en `styles.css` dentro de `:root`.
- Diseño editorial y video real del organizador: `assets/entrada-cinematica.mp4` es versión de carga rápida (silenciada) del video entregado.
- Logotipo entregado: `assets/logo-lacuna-original.svg`, variante visible sobre fondo negro `assets/logo-lacuna-claro.svg` (sin cambiar contornos ni geometría); mascota entregada en `assets/mascota-cuna.webp` (optimizada sin alterar su dibujo).
- Animaciones ligeras: video con fallback, texto de entrada, cinta horizontal, mascota flotante, barras de progreso, scroll reveal y microinteracciones. Se respeta `prefers-reduced-motion`.
- Para actualizar evento (fecha, hora, cover, ubicación), edita `index.html`, `privacidad.html`, `Code.gs` (si cambias EVENTO) y, de ser necesario, los textos de `Formulario.html`.

## 7. Si realmente compraste un dominio propio

Si ya compraste algo como `tuevento.com`, es **opcional**. Primero verifica que GitHub Pages funcione con el dominio gratuito. Después, en **Settings → Pages → Custom domain**, agrega el dominio verdadero (no el nombre del repositorio). Configura DNS desde la empresa donde lo compraste. Para subdominio `www`, el CNAME suele apuntar a `juancarlos5505-ship-it.github.io` (sin `/LACUNARECORDZ`). Usa HTTPS. La configuración de dominio raíz requiere registros diferentes. Consulta la documentación oficial de GitHub.

## 8. Antes de recibir datos reales

- Abre y completa `privacidad.html` con identidad jurídica de quien recoge los datos, contacto válido para solicitudes y política de tratamiento. Es un borrador, NO equivale a asesoría legal.
- Google Sheets debe quedar privado, compartido solo con el equipo autorizado; jamás subir listas a GitHub.
- La inscripción no es ticket ni comprobante de pago. No prometas ingreso asegurado.
- Apps Script está accesible públicamente y puede recibir spam; valida el volumen durante el lanzamiento. `CUPO_MAXIMO` en `Code.gs` admite un número de inscripciones, si el organizador fija un cupo.
- El iframe con `.setXFrameOptionsMode(ALLOWALL)` permite incrustación desde otros sitios (riesgo de clickjacking). Para mayor seguridad antiabuso o aforos grandes, conviene utilizar un backend dedicado con verificación de origen, captcha y tasa de solicitudes.
- Si Google impide embeber el formulario, el enlace alternativo abre la página oficial de registro.
- La captura del código de inscripción solo ocurre cuando Google confirma que guardó la fila.

Fuentes oficiales: [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site) · [Apps Script Web Apps](https://developers.google.com/apps-script/guides/web) · [XFrameOptionsMode](https://developers.google.com/apps-script/reference/html/x-frame-options-mode)
