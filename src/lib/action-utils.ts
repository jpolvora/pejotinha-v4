'use server'

export type ActionResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
}

function serializeValue(obj: any): any {
  if (obj === null || obj === undefined) return obj
  
  // Handle Date
  if (obj instanceof Date) return obj

  // Handle Arrays
  if (Array.isArray(obj)) {
    return obj.map(serializeValue)
  }

  // Handle Objects
  if (typeof obj === 'object') {
    // Check if it's a Decimal (Prisma/Decimal.js)
    if (obj.constructor?.name === 'Decimal' || (obj.s !== undefined && obj.e !== undefined && obj.d !== undefined)) {
      return Number(obj.toString())
    }

    const serialized: any = {}
    for (const key in obj) {
      serialized[key] = serializeValue(obj[key])
    }
    return serialized
  }

  return obj
}

export async function actionWrapper<T>(
  action: (user: any, formData?: FormData) => Promise<T>
): Promise<ActionResponse<T> | any> {
  try {
    // Dynamic import to prevent client-side bundling of server-only modules
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    const result = await action(user)
    return { success: true, data: serializeValue(result) } as any
  } catch (err: any) {
    console.error("Action Error:", err)
    return { success: false, error: err.message || 'Internal server error' } as any
  }
}
