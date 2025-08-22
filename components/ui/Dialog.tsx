"use client"
import { useState, type PropsWithChildren } from 'react'

export default function Dialog({ children }: PropsWithChildren<{}>) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button onClick={()=>setOpen(true)} className="px-3 py-1 border rounded">Open</button>
      {open && (
        <div className="fixed inset-0 bg-black/50 grid place-items-center" onClick={()=>setOpen(false)}>
          <div className="bg-white p-4 rounded shadow" onClick={(e)=>e.stopPropagation()}>
            {children}
          </div>
        </div>
      )}
    </div>
  )
}
