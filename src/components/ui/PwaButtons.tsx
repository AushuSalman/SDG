'use client'

import React, { useEffect, useState } from 'react'

import { useUi } from './UiProvider'

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }

/** "Install the SDG app" shows only when the browser offers an install prompt; launch alerts use browser notifications. */
export function PwaButtons() {
  const ui = useUi()
  const [install, setInstall] = useState<InstallEvent | null>(null)
  useEffect(() => {
    const onPrompt = (e: Event) => { e.preventDefault(); setInstall(e as InstallEvent) }
    window.addEventListener('beforeinstallprompt', onPrompt)
    const off = () => ui.toast('You are offline. Pages you have visited still work.', 5000)
    const on = () => ui.toast('Back online')
    window.addEventListener('offline', off)
    window.addEventListener('online', on)
    return () => { window.removeEventListener('beforeinstallprompt', onPrompt); window.removeEventListener('offline', off); window.removeEventListener('online', on) }
  }, [ui])

  const doInstall = async () => {
    if (!install) { ui.toast(/iPhone|iPad/.test(navigator.userAgent) ? 'In Safari: Share → Add to Home Screen' : 'Use your browser menu → Install app'); return }
    await install.prompt()
    const r = await install.userChoice
    ui.toast(r.outcome === 'accepted' ? 'SDG app installed' : 'Install dismissed')
    setInstall(null)
  }
  const alerts = async () => {
    if (!('Notification' in window)) { ui.toast('Notifications are not supported in this browser'); return }
    const perm = await Notification.requestPermission()
    if (perm !== 'granted') { ui.toast('Notifications stayed off'); return }
    new Notification('SDG Group', { body: 'You will hear first about launches and offers.', icon: '/img/icon-192.png' })
    ui.toast('Launch alerts on')
  }
  return (
    <div className="fbtns">
      <button type="button" className="btn outline sm" onClick={doInstall}>Install the SDG app</button>
      <button type="button" className="btn outline sm" onClick={alerts}>Get launch alerts</button>
    </div>
  )
}
