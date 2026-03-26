export const getAdminReport = async (token: string) => {
  const res = await fetch('/api/admin/reports', {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.json()
}

export const getAdminScores = async (
  token: string,
  params?: {
    userId?: string
    limit?: number
    offset?: number
    from?: string
    to?: string
  }
) => {
  const query = new URLSearchParams()
  if (params?.userId) query.set('userId', params.userId)
  if (params?.limit) query.set('limit', String(params.limit))
  if (params?.offset) query.set('offset', String(params.offset))
  if (params?.from) query.set('from', params.from)
  if (params?.to) query.set('to', params.to)

  const res = await fetch(`/api/admin/scores?${query.toString()}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.json()
}

export const getAuditLog = async (token: string) => {
  const res = await fetch('/api/admin/audit-log', {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.json()
}
