const USERS_STORAGE_KEY = 'madre-argilla-users'
const SESSION_STORAGE_KEY = 'madre-argilla-session'

function isBrowser() {
  return typeof window !== 'undefined'
}

function normalizeEmail(email) {
  return email.trim().toLowerCase()
}

function sanitizeUser(user) {
  if (!user) {
    return null
  }

  const { passwordHash, ...safeUser } = user
  return safeUser
}

function readStorage(key) {
  if (!isBrowser()) {
    return null
  }

  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorage(key, value) {
  if (!isBrowser()) {
    return
  }

  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Ignora falhas de armazenamento para manter a UI funcional.
  }
}

function removeStorage(key) {
  if (!isBrowser()) {
    return
  }

  try {
    window.localStorage.removeItem(key)
  } catch {
    // Ignora falhas de armazenamento para manter a UI funcional.
  }
}

function loadSession() {
  const rawSession = readStorage(SESSION_STORAGE_KEY)

  if (!rawSession) {
    return null
  }

  try {
    return JSON.parse(rawSession)
  } catch {
    return null
  }
}

export function loadUsers() {
  const rawUsers = readStorage(USERS_STORAGE_KEY)

  if (!rawUsers) {
    return []
  }

  try {
    const parsedUsers = JSON.parse(rawUsers)
    return Array.isArray(parsedUsers) ? parsedUsers : []
  } catch {
    return []
  }
}

async function hashPassword(password) {
  if (!globalThis.crypto?.subtle) {
    return password
  }

  const encoded = new TextEncoder().encode(password)
  const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', encoded)

  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export function getStoredSessionUser() {
  const session = loadSession()

  if (!session?.email) {
    return null
  }

  const currentUser = loadUsers().find((user) => user.email === session.email)
  return sanitizeUser(currentUser)
}

export async function registerUser({ name, email, password }) {
  const users = loadUsers()
  const normalizedEmail = normalizeEmail(email)

  if (users.some((user) => user.email === normalizedEmail)) {
    throw new Error('Já existe uma conta cadastrada com este e-mail.')
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString()
  }

  writeStorage(USERS_STORAGE_KEY, JSON.stringify([...users, newUser]))
  writeStorage(SESSION_STORAGE_KEY, JSON.stringify({ email: newUser.email }))

  return sanitizeUser(newUser)
}

export async function loginUser({ email, password }) {
  const users = loadUsers()
  const normalizedEmail = normalizeEmail(email)
  const currentUser = users.find((user) => user.email === normalizedEmail)

  if (!currentUser) {
    throw new Error('Não encontramos uma conta com este e-mail.')
  }

  const passwordHash = await hashPassword(password)

  if (currentUser.passwordHash !== passwordHash) {
    throw new Error('Senha incorreta. Tente novamente.')
  }

  writeStorage(SESSION_STORAGE_KEY, JSON.stringify({ email: currentUser.email }))

  return sanitizeUser(currentUser)
}

export function clearSession() {
  removeStorage(SESSION_STORAGE_KEY)
}
