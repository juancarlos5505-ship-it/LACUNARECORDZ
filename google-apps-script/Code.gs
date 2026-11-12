/**
 * LA CUNA RECORDS | LA CASA ABANDONADA II | 28 NOV 2026
 * Backend de Google Apps Script, asociado a la hoja del organizador.
 * La hoja antigua "Registros" se conserva; V4 usa una nueva pestaña para no
 * reinterpretar ni borrar registros previos.
 */
const LACUNA = Object.freeze({
  HOJA: 'Registros_V4',
  EVENTO: 'La Casa Abandonada - Edición II - 28/11/2026',
  CODIGO: 'LCR',
  CUPO_MAXIMO: 0 // 0 = sin límite; configurar solo cuando el cupo esté confirmado.
});

const COLUMNAS_V4 = [
  'Fecha del registro', 'Código', 'Nombre completo', 'Teléfono', 'Hora estimada de llegada',
  'Origen UTM', 'Medio UTM', 'Campaña UTM', 'Contenido UTM',
  'Estado', 'Autorización tratamiento de datos', 'Autorización novedades', 'Evento'
];

function doGet(e) {
  const form = HtmlService.createTemplateFromFile('Formulario');
  const p = (e && e.parameter) || {};
  form.origen = corto_(p.utm_source, 80);
  form.medio = corto_(p.utm_medium, 80);
  form.campana = corto_(p.utm_campaign, 100);
  form.contenido = corto_(p.utm_content, 100);
  return form.evaluate()
    .setTitle('La Casa Abandonada · Registro')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function prepararHoja() {
  const hoja = hoja_();
  hoja.setFrozenRows(1);
  const rango = hoja.getRange(1, 1, 1, COLUMNAS_V4.length);
  rango.setFontWeight('bold').setFontColor('#FFFFFF').setBackground('#2B181C').setWrap(true);
  hoja.setRowHeight(1, 45);
  [185,125,215,155,160,120,120,130,140,125,160,160,270]
    .forEach((ancho, i) => hoja.setColumnWidth(i + 1, ancho));
  hoja.getRange('D:D').setNumberFormat('@');
  hoja.getRange('E:E').setNumberFormat('@');
  hoja.getRange('A:A').setNumberFormat('dd/MM/yyyy HH:mm:ss');
  if (!hoja.getFilter()) {
    hoja.getRange(1, 1, Math.max(2, hoja.getLastRow()), COLUMNAS_V4.length).createFilter();
  }
  return 'Hoja preparada correctamente: ' + hoja.getName();
}

function registrar(data) {
  try {
    if (!data || typeof data !== 'object') return fallo_('Información inválida.');
    if (String(data.sitioWeb || '').trim()) return fallo_('Registro no procesado.');

    const nombre = corto_(data.nombre, 100);
    const telefono = corto_(data.telefono, 25);
    const numero = telefono.replace(/\D/g, '');
    const hora = corto_(data.hora, 5);
    const acepta = data.consentimiento === true;
    const novedades = data.novedades === true;

    if (nombre.length < 3 || !/^[\p{L}\p{M} .'-]{3,100}$/u.test(nombre)) {
      return fallo_('Escribe tu nombre completo sin números ni caracteres especiales.');
    }
    if (numero.length < 10 || numero.length > 15) {
      return fallo_('Revisa el número de teléfono. Usa 10 a 15 dígitos.');
    }
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(hora) || hora < '19:00' || hora > '23:59') {
      return fallo_('Selecciona una hora de llegada entre las 7:00 y las 11:59 p. m.');
    }
    if (!acepta) return fallo_('Necesitamos tu autorización para gestionar esta inscripción.');

    const candado = LockService.getScriptLock();
    if (!candado.tryLock(15000)) return fallo_('Hay muchas solicitudes. Inténtalo otra vez.');
    try {
      const hoja = hoja_();
      const cantidad = Math.max(0, hoja.getLastRow() - 1);
      if (LACUNA.CUPO_MAXIMO > 0 && cantidad >= LACUNA.CUPO_MAXIMO) {
        return fallo_('La lista de registro alcanzó su cupo máximo.');
      }
      if (cantidad > 0) {
        const telefonos = hoja.getRange(2, 4, cantidad, 1).getDisplayValues();
        if (telefonos.some(fila => String(fila[0]).replace(/\D/g, '') === numero)) {
          return fallo_('Este número de teléfono ya figura en la lista. No es necesario registrarte dos veces.');
        }
      }
      const codigo = LACUNA.CODIGO + '-' + Utilities.getUuid().replace(/-/g, '').slice(0, 9).toUpperCase();
      hoja.appendRow([
        new Date(), codigo, seguro_(nombre), seguro_(telefono), seguro_(hora),
        seguro_(corto_(data.origen, 80)), seguro_(corto_(data.medio, 80)),
        seguro_(corto_(data.campana, 100)), seguro_(corto_(data.contenido, 100)),
        'Preinscrito', 'Sí', novedades ? 'Sí' : 'No', LACUNA.EVENTO
      ]);
      SpreadsheetApp.flush();
      return { ok: true, codigo, mensaje: 'Registro guardado correctamente.' };
    } finally { candado.releaseLock(); }
  } catch (e) {
    console.error('Error de inscripción', e && e.stack ? e.stack : String(e));
    return fallo_('No fue posible verificar el guardado. Contacta al organizador antes de repetir el registro.');
  }
}

function hoja_() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  if (!libro) throw new Error('Abre Apps Script desde Extensiones > Apps Script en tu hoja de Google.');
  let hoja = libro.getSheetByName(LACUNA.HOJA);
  if (!hoja) hoja = libro.insertSheet(LACUNA.HOJA);
  const encabezado = hoja.getRange(1, 1, 1, COLUMNAS_V4.length).getValues()[0];
  if (encabezado.every(c => c === '')) hoja.getRange(1, 1, 1, COLUMNAS_V4.length).setValues([COLUMNAS_V4]);
  else if (encabezado.join('|') !== COLUMNAS_V4.join('|')) {
    throw new Error('Registros_V4 tiene un formato diferente; no se sobrescribieron datos.');
  }
  return hoja;
}
function corto_(valor, max) {
  return String(valor == null ? '' : valor).trim().replace(/[\u0000-\u001f\u007f]/g, '').slice(0, max);
}
function seguro_(valor) {
  const texto = String(valor == null ? '' : valor);
  return /^[\s]*[=+@-]/.test(texto) ? "'" + texto : texto;
}
function fallo_(mensaje) { return { ok: false, mensaje }; }