/**
 * WhatsApp Business Cloud API. Only approved templates can start a conversation (questionnaire Q9).
 * Live when WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID are set.
 */
export type TemplateParam = { type: 'text'; text: string }

export async function sendTemplate(opts: {
  to: string
  template: string
  language?: string
  bodyParams?: TemplateParam[]
}): Promise<{ mock: boolean; messageId?: string }> {
  const token = process.env.WHATSAPP_TOKEN
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID
  if (!token || !phoneId) {
    console.info(`[whatsapp:mock] ${opts.to} template ${opts.template}`, opts.bodyParams?.map((p) => p.text))
    return { mock: true }
  }
  const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: opts.to.replace('+', ''),
      type: 'template',
      template: {
        name: opts.template,
        language: { code: opts.language || 'en' },
        components: opts.bodyParams?.length ? [{ type: 'body', parameters: opts.bodyParams }] : undefined,
      },
    }),
  })
  const json = (await res.json().catch(() => ({}))) as { messages?: { id: string }[]; error?: { message: string } }
  if (!res.ok) throw new Error(`WhatsApp ${res.status}: ${json.error?.message || 'unknown error'}`)
  return { mock: false, messageId: json.messages?.[0]?.id }
}
