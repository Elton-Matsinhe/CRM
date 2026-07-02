const DB_NAME = 'cotacao_draft_attachments';
const DB_VERSION = 1;
const STORE_NAME = 'files';

function getStoreKey(userId, field) {
  return `${userId || 'anon'}_${field}`;
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function runTransaction(mode, fn) {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode);
        const store = tx.objectStore(STORE_NAME);
        let result;

        try {
          result = fn(store);
        } catch (err) {
          reject(err);
          return;
        }

        if (result instanceof IDBRequest) {
          result.onsuccess = () => resolve(result.result);
          result.onerror = () => reject(result.error);
        } else {
          tx.oncomplete = () => resolve(result);
          tx.onerror = () => reject(tx.error);
        }
      })
  );
}

/**
 * Guarda um anexo do rascunho (bi | livrete) no IndexedDB.
 */
export async function saveDraftAttachment(userId, field, file) {
  if (!userId || !field || !file) return;

  const record = {
    id: getStoreKey(userId, field),
    userId,
    field,
    name: file.name,
    type: file.type,
    lastModified: file.lastModified,
    size: file.size,
    blob: file,
  };

  await runTransaction('readwrite', (store) => store.put(record));
}

/**
 * Carrega anexos do rascunho e reconstrói objetos File.
 */
export async function loadDraftAttachments(userId) {
  if (!userId) return { bi: null, livrete: null };

  const db = await openDB();
  const fields = ['bi', 'livrete'];
  const result = { bi: null, livrete: null };

  await Promise.all(
    fields.map(
      (field) =>
        new Promise((resolve) => {
          const request = db
            .transaction(STORE_NAME, 'readonly')
            .objectStore(STORE_NAME)
            .get(getStoreKey(userId, field));

          request.onsuccess = () => {
            const record = request.result;
            if (record?.blob) {
              result[field] = new File([record.blob], record.name, {
                type: record.type,
                lastModified: record.lastModified,
              });
            }
            resolve();
          };
          request.onerror = () => resolve();
        })
    )
  );

  return result;
}

/**
 * Remove um anexo específico do rascunho.
 */
export async function removeDraftAttachment(userId, field) {
  if (!userId || !field) return;
  await runTransaction('readwrite', (store) => store.delete(getStoreKey(userId, field)));
}

/**
 * Remove todos os anexos temporários do utilizador.
 */
export async function clearDraftAttachments(userId) {
  if (!userId) return;

  const db = await openDB();
  const fields = ['bi', 'livrete'];

  await Promise.all(
    fields.map(
      (field) =>
        new Promise((resolve) => {
          const request = db
            .transaction(STORE_NAME, 'readwrite')
            .objectStore(STORE_NAME)
            .delete(getStoreKey(userId, field));
          request.onsuccess = () => resolve();
          request.onerror = () => resolve();
        })
    )
  );
}
