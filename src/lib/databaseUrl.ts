const databaseUrlEnvNames = [
  'DATABASE_URL',
  'POSTGRES_URL',
  'POSTGRES_PRISMA_URL',
  'POSTGRES_URL_NON_POOLING',
] as const

export const getDatabaseUrl = () => {
  const databaseUrl = databaseUrlEnvNames
    .map((name) => process.env[name])
    .find((value): value is string => Boolean(value?.trim()))

  return databaseUrl?.trim() || ''
}

export const requireDatabaseUrl = () => {
  const databaseUrl = getDatabaseUrl()

  if (!databaseUrl) {
    throw new Error(
      `A Postgres connection string is required. Set one of: ${databaseUrlEnvNames.join(', ')}.`,
    )
  }

  return databaseUrl
}
