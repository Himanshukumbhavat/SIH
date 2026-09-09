// Documents — evidence library.
// Uploaders can upload files + register evidence; readers see read-only view.
import { useState, useRef, useEffect } from 'react'
import { DOCUMENTS, getCasesForUser, addActivity, formatDateTime } from '../data/mockData'
import { useAuth } from '../context/AuthContext'
import Badge from '../components/Badge'
import { sha256Hex } from '../lib/hash'

const STATUS_TONE = { Verified: 'success', Pending: 'warning' }
const short = (h) => (h ? `${h.slice(0, 10)}…${h.slice(-6)}` : '—')

function createPdfUrl(text) {
  const escapePdfText = (value) => value.replace(/([\\()])/g, '\\$1')
  const lines = text.split('\n').map((line, index) => `BT /F1 11 Tf 54 ${748 - index * 18} Td (${escapePdfText(line)}) Tj ET`).join('\n')
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${lines.length} >>\nstream\n${lines}\nendstream`,
  ]
  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((object, index) => {
    offsets[index + 1] = pdf.length
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
  })
  const xref = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  offsets.slice(1).forEach((offset) => { pdf += `${String(offset).padStart(10, '0')} 00000 n \n` })
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
  return URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' }))
}

export default function Documents() {
  const { user, canUpload } = useAuth()
  const inputRef = useRef(null)
  const objectUrlsRef = useRef([])
  const [file, setFile] = useState(null)
  const [hash, setHash] = useState('')
  const [hashing, setHashing] = useState(false)
  const [selectedCase, setSelectedCase] = useState('')
  const [uploadedDocs, setUploadedDocs] = useState([])  // newly uploaded docs this session

  useEffect(() => () => {
    objectUrlsRef.current.forEach((objectUrl) => URL.revokeObjectURL(objectUrl))
  }, [])

  // Only show cases belonging to this user's thana
  const thanaCases = getCasesForUser(user)

  async function handleFile(f) {
    if (!f) return
    const objectUrl = URL.createObjectURL(f)
    objectUrlsRef.current.push(objectUrl)
    setFile({
      name: f.name,
      size: f.size,
      sizeLabel: formatSize(f.size),
      objectUrl,
      mimeType: f.type,
    })
    setHash('')
    setHashing(true)
    const digest = await sha256Hex(f)
    setHash(digest)
    setHashing(false)
  }

  function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  function openDocument(document) {
    const openedAt = new Date().toISOString()
    const actor = `${user.thana || user.district} — ${user.roleInfo.name}`
    const url = document.objectUrl || createPdfUrl(document.previewText || `DEMS document ${document.id}`)
    window.open(url, '_blank', 'noopener,noreferrer')
    if (!document.objectUrl) window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
    addActivity({
      actor,
      action: 'accessed',
      target: document.id,
      timestamp: openedAt,
      district: user.district,
    })
  }

  async function handleRegister() {
    if (!file || !hash || !selectedCase) return

    const caseObj = getCasesForUser(user).find(c => c.id === selectedCase)
    if (!caseObj) return

    const newDoc = {
      id: `DOC-${String(DOCUMENTS.length + uploadedDocs.length + 1).padStart(3, '0')}`,
      caseId: selectedCase,
      name: file.name,
      size: file.sizeLabel,
      type: file.name.split('.').pop()?.toUpperCase() || 'File',
      uploaded: 'Just now',
      uploadedAt: new Date().toISOString(),
      status: 'Pending',
      thana: user.thana,
      hash,
      objectUrl: file.objectUrl,
      mimeType: file.mimeType,
    }

    setUploadedDocs(prev => [newDoc, ...prev])
    addActivity({
      actor: `${user.thana} — ${user.roleInfo.name}`,
      action: 'uploaded',
      target: newDoc.id,
      timestamp: newDoc.uploadedAt,
    })

    // Reset the upload form
    setFile(null)
    setHash('')
    setSelectedCase('')
    if (inputRef.current) inputRef.current.value = ''
  }

  // Combine mock + session-uploaded docs
  const visibleCaseIds = new Set(thanaCases.map((item) => item.id))
  const allDocs = [...uploadedDocs, ...DOCUMENTS].filter((doc) =>
    user?.role === 'DISTRICT_DM' ? visibleCaseIds.has(doc.caseId) : doc.thana === user?.thana
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Documents</h1>
          <p className="mt-1 text-sm text-slate-400">
            Evidence library — {allDocs.length} files
            <span className="ml-1 text-slate-500">· {user?.thana || `${user?.district} district`}</span>
          </p>
        </div>
        {/* Role indicator */}
        <Badge tone={canUpload ? 'primary' : 'neutral'}>
          {canUpload ? '🔑 Uploader Access' : '👁 Read-Only Access'}
        </Badge>
      </div>

      <div className={`grid gap-6 ${canUpload ? 'lg:grid-cols-3' : ''}`}>

        {/* ===== Upload panel — ONLY for uploaders ===== */}
        {canUpload && (
          <section className="space-y-4">
            <div className="card">
              <h2 className="font-display text-lg font-semibold text-white">Register Evidence</h2>
              <p className="mt-1 text-sm text-slate-400">Upload a file, link it to a case, and register it.</p>

              {/* Case selector */}
              <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Link to Case
              </label>
              <select
                value={selectedCase}
                onChange={(e) => setSelectedCase(e.target.value)}
                className="field mt-1.5"
              >
                <option value="">— Select a case —</option>
                {thanaCases.map(c => (
                  <option key={c.id} value={c.id}>{c.id} · {c.title}</option>
                ))}
              </select>

              {/* File picker */}
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <button onClick={() => inputRef.current?.click()} className="btn-ghost mt-3 w-full">
                Choose file
              </button>

              {/* File details + hash */}
              {file && (
                <div className="mt-4 rounded-lg border border-surface-600 bg-surface-800 p-3">
                  <p className="text-sm font-medium text-white">{file.name}</p>
                  <p className="text-xs text-slate-500">{file.sizeLabel}</p>
                  <div className="mt-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">SHA-256</p>
                    <p className="break-all font-mono text-xs text-primary-300">
                      {hashing ? 'Computing…' : hash || '—'}
                    </p>
                  </div>
                </div>
              )}

              {/* Register button */}
              <button
                onClick={handleRegister}
                disabled={!file || !hash || hashing || !selectedCase}
                className="btn-primary mt-4 w-full"
              >
                Register Evidence
              </button>
            </div>
          </section>
        )}

        {/* ===== Read-only notice for readers ===== */}
        {!canUpload && (
          <div className="col-span-full">
            <div className="rounded-lg border border-info/20 bg-info/5 px-5 py-4">
              <p className="text-sm text-info">
                <span className="font-semibold">Read-Only Access</span> — You are logged in as a <strong>Reader</strong> for <strong>{user?.thana}</strong>.
                You can view all documents below. To upload evidence, sign in with the uploader credentials for this station.
              </p>
            </div>
          </div>
        )}

        {/* ===== Document library table ===== */}
        <section className={`card !p-0 overflow-hidden ${canUpload ? 'lg:col-span-2' : 'col-span-full'}`}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-surface-700 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3 font-medium">File</th>
                <th className="px-5 py-3 font-medium">Case</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Uploaded</th>
                <th className="px-5 py-3 text-right font-medium">Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-700">
              {allDocs.map((d) => (
                <tr key={d.id} className="transition hover:bg-surface-800/50">
                  <td className="px-5 py-4">
                   <button type="button" onClick={() => openDocument(d)} className="text-left font-medium text-primary-300 underline-offset-2 hover:underline">
                     {d.name}
                   </button>
                   <p className="text-xs text-slate-500">{d.id} · {d.size}</p>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-primary-300">{d.caseId}</td>
                  <td className="px-5 py-4 text-slate-300">{d.type}</td>
                  <td className="px-5 py-4"><Badge tone={STATUS_TONE[d.status]}>{d.status}</Badge></td>
                  <td className="px-5 py-4 text-slate-400">{d.uploadedAt ? formatDateTime(d.uploadedAt) : d.uploaded}</td>
                  <td className="px-5 py-4 text-right font-mono text-xs text-slate-500">
                    {short(d.hash || '')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {allDocs.length === 0 && (
            <p className="px-5 py-10 text-center text-slate-500">No documents yet.</p>
          )}
        </section>
      </div>
    </div>
  )
}