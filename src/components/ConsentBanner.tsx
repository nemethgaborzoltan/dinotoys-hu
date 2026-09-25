import { useEffect, useState } from 'react'
import { getConsent, saveConsent } from '../lib/analytics'

export function ConsentBanner() {
  const [open, setOpen] = useState(false)
  const [settings, setSettings] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)

  useEffect(() => { setOpen(!getConsent()) }, [])
  if (!open) return null

  const save = (a: boolean, m: boolean) => { saveConsent({ analytics: a, marketing: m }); setOpen(false) }
  return <div className="consent-panel" role="dialog" aria-label="Cookie beállítások" aria-modal="false">
    <div className="consent-copy"><b>Te döntöd el, mi mérhető.</b><p>A szükséges sütik a webshop működéséhez kellenek. Analytics és marketing csak a hozzájárulásod után indulhat.</p></div>
    {settings && <div className="consent-options">
      <label><span><b>Szükséges</b><small>Kosár, biztonság, alapműködés</small></span><input type="checkbox" checked disabled /></label>
      <label><span><b>Analitika</b><small>Anonimizált teljesítmény- és konverziómérés</small></span><input type="checkbox" checked={analytics} onChange={e=>setAnalytics(e.target.checked)} /></label>
      <label><span><b>Marketing</b><small>Hirdetési és remarketing technológiák</small></span><input type="checkbox" checked={marketing} onChange={e=>setMarketing(e.target.checked)} /></label>
    </div>}
    <div className="consent-actions">
      <button className="btn btn-ghost" onClick={() => save(false, false)}>Csak szükséges</button>
      <button className="btn btn-ghost" onClick={() => setSettings(v => !v)}>{settings ? 'Bezárás' : 'Beállítások'}</button>
      {settings ? <button className="btn btn-primary" onClick={() => save(analytics, marketing)}>Kiválasztottak mentése</button> : <button className="btn btn-primary" onClick={() => save(true, true)}>Összes elfogadása</button>}
    </div>
  </div>
}
