// Браузер имеет право стереть данные сайта, когда на устройстве кончается
// место. persist() просит пометить хранилище как постоянное — тогда данные
// удалятся только если пользователь сам почистит браузер. Установленным
// на домашний экран приложениям такую пометку обычно дают.

export async function requestPersistentStorage(): Promise<boolean> {
  if (!navigator.storage?.persist) return false
  try {
    return await navigator.storage.persist()
  } catch {
    return false
  }
}

export async function isStoragePersistent(): Promise<boolean> {
  if (!navigator.storage?.persisted) return false
  try {
    return await navigator.storage.persisted()
  } catch {
    return false
  }
}
