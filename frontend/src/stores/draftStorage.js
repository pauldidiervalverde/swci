// src/stores/draftStorage.js
/**
 * Guarda un borrador en localStorage.
 * @param {string} key Clave del borrador.
 * @param {object} data Datos a guardar.
 */
export function saveDraft(key, data) {
  try {
    const draft = {
      ...data,
      fechaGuardado: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(draft));
    return true;
  } catch (error) {
    console.error("Error al guardar borrador:", error);
    return false;
  }
}
/**
 * Obtiene un borrador desde localStorage.
 * @param {string} key
 * @returns {object|null}
 */
export function getDraft(key) {
  try {
    const json = localStorage.getItem(key);
    if (!json) return null;
    return JSON.parse(json);
  } catch (error) {
    console.error("Error al leer borrador:", error);
    return null;
  }
}
/**
 * Elimina un borrador.
 * @param {string} key
 */
export function removeDraft(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error("Error al eliminar borrador:", error);
    return false;
  }
}
/**
 * Verifica si existe un borrador.
 * @param {string} key
 * @returns {boolean}
 */
export function existsDraft(key) {
  return localStorage.getItem(key) !== null;
}
/**
 * Actualiza parcialmente un borrador existente.
 * Conserva los datos anteriores y reemplaza sólo los enviados.
 * @param {string} key
 * @param {object} partialData
 */
export function updateDraft(key, partialData) {
  try {
    const current = getDraft(key) || {};
    const updated = {
      ...current,
      ...partialData,
      fechaGuardado: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error("Error al actualizar borrador:", error);
    return false;
  }
}
/**
 * Devuelve la fecha del último guardado.
 * @param {string} key
 * @returns {Date|null}
 */
export function getDraftDate(key) {
  const draft = getDraft(key);
  if (!draft?.fechaGuardado) return null;
  return new Date(draft.fechaGuardado);
}
