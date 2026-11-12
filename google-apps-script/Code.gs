/**
 * LA CUNA RECORDS / LA CASA ABANDONADA 2026
 * Pega este archivo en Apps Script ABIERTO DESDE LA HOJA DE GOOGLE.
 * NO publiques la hoja ni la lista de personas.
 */
const AJUSTES = Object.freeze({
  HOJA: 'Registros',
  EVENTO: 'La Casa Abandonada - Edicion 02 - 28/11/2026',
  PREFIJO: 'LCR',
  CUPO_MAXIMO: 0 // 0 = sin limite. Pon un numero si habra cupo real.
});

const COLUMNAS = [
  'Fecha de registro', 'Codigo', 'Nombre completo', 'Correo', 'WhatsApp',
  'Instagram', 'Origen (UTM)', 'Medio (UTM)', 'Campana (UTM)',
  'Contenido (UTM)', 'Estado', 'Consentimiento datos',
  'Permiso novedades', 'Evento'
];

function doGet(e) {
  const pagina = HtmlService.createTemplateFromFile('Formulario');
  const p = (e && e.parameter) || {};
  pagina.origen = textoCorto_(p.utm_source, 80);
  pagina.medio = textoCorto_(p.utm_medium, 80);
  pagina.campana = textoCorto_(p.utm_campaign, 100);
  pagina.contenido = textoCorto_(p.utm_content, 100);
  return pagina.evaluate()
    .setTitle('Registro - La Casa Abandonada')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/** Ejecuta esta funcion UNA VEZ desde el editor para crear encabezados. */
function prepararHoja() {
  const hoja = obtenerHoja_();
  hoja.setFrozenRows(1);
  hoja.getRange(1, 1, 1, COLUMNAS.length)
    .setFontWeight('bold').setFontColor('#f3f2df')
    .setBackground('#1b231e').setWrap(true);
  hoja.setRowHeight(1, 37);
  hoja.setColumnWidth(1, 180);
  hoja.setColumnWidth(2, 118);
  hoja.setColumnWidth(3, 220);
  hoja.setColumnWidth(4, 230);
  hoja.setColumnWidth(5, 160);
  hoja.setColumnWidth(6, 160);
  for (let i = 7; i <= 14; i++) hoja.setColumnWidth(i, 150);
  hoja.getRange('E:E').setNumberFormat('@');
  hoja.getRange('A:A').setNumberFormat('dd/MM/yyyy HH:mm:ss');
  if (!hoja.getFilter()) hoja.getRange(1, 1, Math.max(2, hoja.getLastRow()), COLUMNAS.length).createFilter();
  return 'Hoja lista: ' + hoja.getName();
}

/** Llamada SOLO desde Formulario.html mediante google.script.run. */
function registrar(datos) {
  try {
    if (!datos || typeof datos !== 'object') return error_('Datos no validos.');
    // Campo trampa: si un bot lo llena, no guardar nada.
    if (String(datos.sitioWeb || '').trim()) return error_('No se pudo procesar el registro.');

    const nombre = textoCorto_(datos.nombre, 100);
    const correo = textoCorto_(datos.correo, 160).toLowerCase();
    const whatsapp = textoCorto_(datos.whatsapp, 24);
    const digitos = whatsapp.replace(/\D/g, '');
    const instagram = textoCorto_(datos.instagram, 45);
    const consentimiento = datos.consentimiento === true;
    const novedades = datos.novedades === true;

    if (nombre.length < 3 || !/^[\p{L}\p{M} .'-]{3,100}$/u.test(nombre)) {
      return error_('Escribe tu nombre completo, sin numeros ni simbolos.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)) {
      return error_('Revisa el correo electronico.');
    }
    if (digitos.length < 10 || digitos.length > 15) {
      return error_('Escribe un WhatsApp valido con indicativo si corresponde.');
    }
    if (instagram && !/^@?[\w.]{1,30}$/.test(instagram)) {
      return error_('Revisa el usuario de Instagram o dejalo en blanco.');
    }
    if (!consentimiento) {
      return error_('Necesitamos tu autorizacion para gestionar el registro.');
    }

    const lock = LockService.getScriptLock();
    if (!lock.tryLock(12000)) return error_('Hay muchos registros a la vez. Vuelve a intentarlo.');
    try {
      const hoja = obtenerHoja_();
      const ultima = hoja.getLastRow();
      const cantidad = Math.max(0, ultima - 1);
      if (AJUSTES.CUPO_MAXIMO > 0 && cantidad >= AJUSTES.CUPO_MAXIMO) {
        return error_('La lista de registro ha alcanzado su cupo disponible.');
      }
      if (cantidad > 0) {
        // Correo esta en D, WhatsApp en E. Bloquear duplicados.
        const existentes = hoja.getRange(2, 4, cantidad, 2).getDisplayValues();
        const repetido = existentes.some(fila =>
          String(fila[0]).trim().toLowerCase() === correo ||
          String(fila[1]).replace(/\D/g, '') === digitos
        );
        if (repetido) {
          return error_('Este correo o WhatsApp ya tiene una inscripcion. Si eres tu, no necesitas registrarte otra vez.');
        }
      }
      const codigo = AJUSTES.PREFIJO + '-' + Utilities.getUuid().replace(/-/g, '').substring(0, 8).toUpperCase();
      hoja.appendRow([
        new Date(), seguro_(codigo), seguro_(nombre), seguro_(correo),
        seguro_(whatsapp), seguro_(instagram),
        seguro_(textoCorto_(datos.origen, 80)),
        seguro_(textoCorto_(datos.medio, 80)),
        seguro_(textoCorto_(datos.campana, 100)),
        seguro_(textoCorto_(datos.contenido, 100)),
        'Preinscrito', 'Si', novedades ? 'Si' : 'No', AJUSTES.EVENTO
      ]);
      SpreadsheetApp.flush();
      return { ok: true, codigo: codigo, mensaje: 'Tu registro quedo guardado correctamente.' };
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    console.error('Error de registro:', err && err.stack ? err.stack : String(err));
    return error_('No se pudo verificar el registro. Contacta al organizador antes de intentar varias veces.');
  }
}

function obtenerHoja_() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  if (!libro) throw new Error('Vincula este Apps Script a una hoja de calculo de Google.');
  let hoja = libro.getSheetByName(AJUSTES.HOJA);
  if (!hoja) hoja = libro.insertSheet(AJUSTES.HOJA);
  const primera = hoja.getRange(1, 1, 1, COLUMNAS.length).getValues()[0];
  if (primera.every(v => !v)) hoja.getRange(1, 1, 1, COLUMNAS.length).setValues([COLUMNAS]);
  else if (primera.join('|') !== COLUMNAS.join('|')) {
    throw new Error('La hoja tiene encabezados diferentes. Usa una hoja vacia con nombre ' + AJUSTES.HOJA + '.');
  }
  return hoja;
}

function textoCorto_(v, max) {
  return String(v == null ? '' : v).trim().replace(/[\u0000-\u001f\u007f]/g, '').slice(0, max);
}
// Evita inyeccion de formulas en la hoja, especialmente con +, =, @ o -.
function seguro_(v) {
  const s = String(v == null ? '' : v);
  return /^[\s]*[=+@-]/.test(s) ? "'" + s : s;
}
function error_(mensaje) { return { ok: false, mensaje: mensaje }; }
