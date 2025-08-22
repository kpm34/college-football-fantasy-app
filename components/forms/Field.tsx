import React from 'react'

export default function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="text-gray-700">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  )
}
