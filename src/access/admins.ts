import type { Access } from 'payload'

type RoleUser = {
  id?: number | string
  role?: string | null
}

export const isAdmin = (user?: RoleUser | null) => user?.role === 'admin'

export const isEditor = (user?: RoleUser | null) => user?.role === 'editor'

export const isAdminOrEditor = (user?: RoleUser | null) => isAdmin(user) || isEditor(user)

export const admins: Access = ({ req: { user } }) => isAdmin(user)

export const adminOrEditor: Access = ({ req: { user } }) => isAdminOrEditor(user)

export const authenticated: Access = ({ req: { user } }) => isAdminOrEditor(user)

export const adminsOrSelf: Access = ({ req: { user } }) => {
  if (isAdmin(user)) {
    return true
  }

  if (user?.id) {
    return {
      id: {
        equals: user.id,
      },
    }
  }

  return false
}
