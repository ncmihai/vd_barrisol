type LeadNotificationInput = {
  city?: string
  email?: string
  estimateEurMax?: number
  estimateEurMin?: number
  estimateRonMax?: number
  estimateRonMin?: number
  message?: string
  name: string
  phone: string
}

export const sendLeadNotification = async (lead: LeadNotificationInput) => {
  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.CONTACT_TO_EMAIL
  const from = process.env.CONTACT_FROM_EMAIL || 'VD BARRISOL <onboarding@resend.dev>'

  if (!apiKey || !to) {
    return {
      skipped: true,
    }
  }

  const response = await fetch('https://api.resend.com/emails', {
    body: JSON.stringify({
      from,
      html: `
        <h1>New VD BARRISOL estimate lead</h1>
        <p><strong>Name:</strong> ${escapeHtml(lead.name)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(lead.phone)}</p>
        <p><strong>Email:</strong> ${escapeHtml(lead.email || '-')}</p>
        <p><strong>City:</strong> ${escapeHtml(lead.city || '-')}</p>
        <p><strong>Estimate:</strong> ${lead.estimateRonMin || 0} - ${lead.estimateRonMax || 0} RON / ${lead.estimateEurMin || 0} - ${lead.estimateEurMax || 0} EUR</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(lead.message || '-')}</p>
      `,
      subject: `VD BARRISOL lead: ${lead.name}`,
      to,
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })

  if (!response.ok) {
    const details = await response.text().catch(() => '')

    throw new Error(`Lead email failed (${response.status})${details ? `: ${details.slice(0, 300)}` : ''}`)
  }

  return {
    skipped: false,
  }
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
