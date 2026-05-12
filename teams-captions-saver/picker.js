function openHandlesDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open('LiveCaptionsSaverHandles', 1);
        req.onupgradeneeded = e => e.target.result.createObjectStore('handles');
        req.onsuccess = e => resolve(e.target.result);
        req.onerror = () => reject(req.error);
    });
}

document.getElementById('pickBtn').addEventListener('click', async () => {
    const status = document.getElementById('status');
    try {
        const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });

        const db = await openHandlesDB();
        await new Promise((resolve, reject) => {
            const tx = db.transaction('handles', 'readwrite');
            tx.objectStore('handles').put(dirHandle, 'saveFolder');
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });

        chrome.runtime.sendMessage({ message: 'save_folder_updated' });
        status.textContent = `✓ Folder selected: "${dirHandle.name}". Closing...`;
        status.style.color = '#28a745';
        setTimeout(() => window.close(), 1200);
    } catch (e) {
        if (e.name !== 'AbortError') {
            status.textContent = 'Error: ' + e.message;
            status.style.color = '#dc3545';
        }
    }
});
