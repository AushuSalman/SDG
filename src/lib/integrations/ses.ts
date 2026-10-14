import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

let client: SESClient | null = null

/** Transactional email through Amazon SES. Live when SES_FROM is set and AWS credentials resolve. */
export async function sendEmail(opts: { to: string | string[]; subject: string; text: string; html?: string }): Promise<{ mock: boolean }> {
  const from = process.env.SES_FROM
  const to = Array.isArray(opts.to) ? opts.to : [opts.to]
  if (!from) {
    console.info(`[email:mock] to ${to.join(', ')}: ${opts.subject}`)
    return { mock: true }
  }
  client = client || new SESClient({ region: process.env.AWS_REGION || 'ap-south-1' })
  await client.send(
    new SendEmailCommand({
      Source: from,
      Destination: { ToAddresses: to },
      Message: {
        Subject: { Data: opts.subject, Charset: 'UTF-8' },
        Body: {
          Text: { Data: opts.text, Charset: 'UTF-8' },
          ...(opts.html ? { Html: { Data: opts.html, Charset: 'UTF-8' } } : {}),
        },
      },
    }),
  )
  return { mock: false }
}
