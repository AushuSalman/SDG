'use client'

import { useDocumentInfo, useFormFields } from '@payloadcms/ui'
import React from 'react'

/**
 * "Connect Outlook calendar" on a consultant: sends the signed-in staff member through Microsoft sign-in for this
 * consultant's mailbox and shows who is connected. The consultant must be saved first so the token has a record.
 */
export function CalendarConnect() {
  const { id } = useDocumentInfo()
  const connectedAs = useFormFields(([fields]) => fields['calendar.connectedAs']?.value as string | undefined)
  const status = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('calendar') : null
  if (!id) return <p className="field-description">Save the consultant first, then connect the calendar.</p>
  const connect = `/api/site/calendar/connect?consultant=${id}`
  const disconnect = async () => {
    const res = await fetch(`/api/site/calendar/disconnect?consultant=${id}`, { method: 'POST', credentials: 'same-origin' })
    // A full reload on purpose: the Payload form keeps its own copy of the fields, and only a fresh document shows the cleared calendar.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = `/admin/collections/consultants/${id}?calendar=${res.ok ? 'disconnected' : 'error:' + encodeURIComponent('could not disconnect')}`
  }
  return (
    <div className="field-type" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={{ margin: 0 }}>
        {connectedAs ? <>Connected as <b>{connectedAs}</b>. Confirmed meeting requests are booked on this calendar.</> : 'Not connected. Bookings are recorded as enquiries only until a calendar is connected.'}
      </p>
      {status === 'connected' && <p style={{ margin: 0, color: 'var(--ta-success-600, #12b76a)' }}>Calendar connected.</p>}
      {status && status.startsWith('error') && <p style={{ margin: 0, color: 'var(--ta-error-600, #d92d20)' }}>Microsoft sign-in failed: {decodeURIComponent(status.slice(6))}</p>}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <a className="btn btn--style-primary btn--size-small" href={connect}>{connectedAs ? 'Reconnect calendar' : 'Connect Outlook calendar'}</a>
        {connectedAs && <button type="button" className="btn btn--style-secondary btn--size-small" onClick={disconnect}>Disconnect</button>}
      </div>
    </div>
  )
}
