const DB_NAME = 'ReceiptImageDB';
const STORE_NAME = 'receiptImages';
const DB_VERSION = 1;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(new Error(`IndexedDB error: ${request.error?.message}`));
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const saveImage = async (id: string, data: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({ id, data });
    
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(new Error(`Transaction error: ${transaction.error?.message}`));
    request.onerror = () => reject(new Error(`Request error: ${request.error?.message}`));
  });
};

export const getImage = async (id: string): Promise<string | undefined> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onerror = () => reject(new Error(`Request error: ${request.error?.message}`));
    request.onsuccess = () => {
      resolve(request.result?.data);
    };
  });
};

export const deleteImage = async (id: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(new Error(`Transaction error: ${transaction.error?.message}`));
    request.onerror = () => reject(new Error(`Request error: ${request.error?.message}`));
  });
};

export const getAllImages = async (): Promise<Record<string, string>> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onerror = () => reject(new Error(`Request error: ${request.error?.message}`));
        request.onsuccess = () => {
            const result: { id: string; data: string }[] = request.result;
            const images = result.reduce((acc, item) => {
                acc[item.id] = item.data;
                return acc;
            }, {} as Record<string, string>);
            resolve(images);
        };
    });
};

export const clearAllImages = async (): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(new Error(`Transaction error: ${transaction.error?.message}`));
        request.onerror = () => reject(new Error(`Request error: ${request.error?.message}`));
    });
};