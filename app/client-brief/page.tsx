'use client'

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
} from '@components/ui'
import { useEffect, useRef } from 'react'

export default function ClientBriefForm() {
  const formRef = useRef<HTMLFormElement | null>(null)

  function serializeForm(): Record<string, any> {
    const data: Record<string, any> = {}
    if (!formRef.current) return data
    const fd = new FormData(formRef.current)
    fd.forEach((value, key) => {
      data[key] = value
    })
    // Checkboxes: include true/false
    const checkboxKeys = [
      'context.devices.mobile',
      'context.devices.tablet',
      'context.devices.desktop',
      'context.devices.tv',
    ]
    checkboxKeys.forEach(k => {
      const el = formRef.current!.querySelector<HTMLInputElement>(`input[name="${k}"]`)
      if (el) data[k] = !!el.checked
    })
    return data
  }

  function toMarkdownFromForm(): string {
    const d = serializeForm()
    const md: string[] = []
    md.push('# Client Brief')
    md.push('')
    md.push('## About')
    md.push(`- Who: ${d['about.who'] || ''}`)
    md.push(`- Business: ${d['about.business'] || ''}`)
    md.push(`- Product/Service: ${d['about.productService'] || ''}`)
    md.push('')
    md.push('## Context')
    const devices: string[] = []
    if (d['context.devices.mobile']) devices.push('mobile')
    if (d['context.devices.tablet']) devices.push('tablet')
    if (d['context.devices.desktop']) devices.push('desktop')
    if (d['context.devices.tv']) devices.push('tv')
    md.push(`- Discovery: ${d['context.discovery'] || ''}`)
    md.push(
      `- Devices: ${devices.join(', ')}${d['context.devices.other'] ? `; Other: ${d['context.devices.other']}` : ''}`
    )
    md.push(`- Audience: ${d['context.audience'] || ''}`)
    md.push(`- User Needs: ${d['context.userNeeds'] || ''}`)
    md.push(`- Competitors: ${d['context.competitors'] || ''}`)
    md.push('')
    md.push('## Goals')
    md.push(`- Expectations: ${d['goals.expectations'] || ''}`)
    md.push(`- UX: ${d['goals.userExperience'] || ''}`)
    md.push(`- CTA Triggers: ${d['goals.ctaTriggers'] || ''}`)
    md.push(`- Look & Feel: ${d['goals.lookFeel'] || ''}`)
    md.push('')
    md.push('## Deliverables')
    md.push(`- Essential Pages: ${d['deliverables.essentialPages'] || ''}`)
    md.push(`- Competition Look: ${d['deliverables.competitionLook'] || ''}`)
    md.push(`- Key Differentiators: ${d['deliverables.keyDifferentiators'] || ''}`)
    md.push(`- Works / Not: ${d['deliverables.currentlyWorks'] || ''}`)
    md.push('')
    md.push('## Info')
    md.push(`- Contact: ${d['info.contactName'] || ''}`)
    md.push(`- Email: ${d['info.email'] || ''}`)
    md.push(`- Phone: ${d['info.phone'] || ''}`)
    md.push(`- Budget: ${d['info.budget'] || ''}`)
    md.push(`- Timeline: ${d['info.timeline'] || ''}`)
    md.push(`- Assets: ${d['info.assets'] || ''}`)
    md.push(`- Notes: ${d['info.notes'] || ''}`)
    return md.join('\n')
  }

  function handleClear() {
    if (!formRef.current) return
    formRef.current.reset()
    try {
      localStorage.removeItem('clientBriefDraft')
    } catch {}
  }

  function handleSaveDraft() {
    const data = serializeForm()
    try {
      localStorage.setItem('clientBriefDraft', JSON.stringify(data))
      alert('Draft saved locally')
    } catch {
      alert('Failed to save draft')
    }
  }

  function handleDownloadMarkdown() {
    const blob = new Blob([toMarkdownFromForm()], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'client-brief.md'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  async function handleDownloadPDF() {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const text = toMarkdownFromForm()
    const margin = 48
    const maxWidth = 595.28 - margin * 2
    const lines = doc.splitTextToSize(text, maxWidth)
    let y = margin
    lines.forEach(line => {
      if (y > 842 - margin) {
        doc.addPage()
        y = margin
      }
      doc.text(line, margin, y)
      y += 16
    })
    doc.save('client-brief.pdf')
  }

  useEffect(() => {
    // Rehydrate saved draft values into the form fields
    try {
      const savedRaw = localStorage.getItem('clientBriefDraft')
      if (!savedRaw || !formRef.current) return
      const saved = JSON.parse(savedRaw) as Record<string, any>
      Object.entries(saved).forEach(([name, val]) => {
        const input = formRef.current!.querySelector(`[name="${name}"]`) as
          | HTMLInputElement
          | HTMLTextAreaElement
          | null
        if (!input) return
        if (input instanceof HTMLInputElement && input.type === 'checkbox') {
          ;(input as HTMLInputElement).checked = !!val
        } else {
          input.value = String(val ?? '')
        }
      })
    } catch {}
  }, [])
  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Client Brief</h1>
        <p className="text-sm text-white/70">Project: College Football Fantasy App</p>
      </header>

      <form ref={formRef} className="space-y-6" onSubmit={e => e.preventDefault()}>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="about-who">Who are you?</Label>
              <Input
                id="about-who"
                name="about.who"
                placeholder="e.g., Your name, role, and organization"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="about-business">What is your business?</Label>
              <Input
                id="about-business"
                name="about.business"
                placeholder="Brief description of the business"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="about-product">What is your product and service?</Label>
              <Textarea
                id="about-product"
                name="about.productService"
                placeholder="Summarize your product(s) and service(s)"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Context</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="context-find">How did they find you?</Label>
              <Textarea
                id="context-find"
                name="context.discovery"
                placeholder="e.g., Search, social, referral, ads, community"
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="context-devices">What devices does your target consumer use?</Label>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="h-4 w-4" name="context.devices.mobile" /> Mobile
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="h-4 w-4" name="context.devices.tablet" /> Tablet
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="h-4 w-4" name="context.devices.desktop" />{' '}
                  Desktop
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="h-4 w-4" name="context.devices.tv" /> TV
                </label>
                <div className="col-span-2 md:col-span-4">
                  <Input
                    name="context.devices.other"
                    placeholder="Other (wearables, consoles, etc.)"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="context-audience">Who is your target audience?</Label>
              <Textarea
                id="context-audience"
                name="context.audience"
                placeholder="Describe segments, demographics, psychographics"
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="context-needs">What are the needs of the user?</Label>
              <Textarea
                id="context-needs"
                name="context.userNeeds"
                placeholder="Jobs to be done, pains, desired gains"
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="context-competitors">Who are the competitors?</Label>
              <Textarea
                id="context-competitors"
                name="context.competitors"
                placeholder="List competitors and any quick notes"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Goals</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="goals-expectations">Expectations</Label>
              <Textarea
                id="goals-expectations"
                name="goals.expectations"
                placeholder="What outcomes are you expecting from this project?"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="goals-ux">User experience</Label>
              <Textarea
                id="goals-ux"
                name="goals.userExperience"
                placeholder="Flows, speed, accessibility, onboarding, etc."
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="goals-cta">Call to action triggers</Label>
              <Textarea
                id="goals-cta"
                name="goals.ctaTriggers"
                placeholder="Primary CTAs, secondary CTAs, events that should prompt action"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="goals-lookfeel">Look & feel</Label>
              <Textarea
                id="goals-lookfeel"
                name="goals.lookFeel"
                placeholder="Visual direction, adjectives, references, tone while navigating"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Deliverables</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="deliv-pages">What are the essential pages needed?</Label>
              <Textarea
                id="deliv-pages"
                name="deliverables.essentialPages"
                placeholder="e.g., Home, Teams, Rankings, Draft, Live Scoring, FAQ, Pricing"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="deliv-competition">What does the competition look like?</Label>
              <Textarea
                id="deliv-competition"
                name="deliverables.competitionLook"
                placeholder="Notable features, layout patterns, strengths/weaknesses"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="deliv-diffs">What are your key differentiators?</Label>
              <Textarea
                id="deliv-diffs"
                name="deliverables.keyDifferentiators"
                placeholder="What makes you unique?"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="deliv-works">What currently works and what doesn't work?</Label>
              <Textarea
                id="deliv-works"
                name="deliverables.currentlyWorks"
                placeholder="What should we keep, improve, or remove?"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Info</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="info-contact-name">Primary contact name</Label>
              <Input id="info-contact-name" name="info.contactName" placeholder="Full name" />
            </div>
            <div className="grid gap-2 md:grid-cols-2 md:gap-4">
              <div className="grid gap-2">
                <Label htmlFor="info-email">Email</Label>
                <Input
                  id="info-email"
                  type="email"
                  name="info.email"
                  placeholder="name@company.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="info-phone">Phone</Label>
                <Input id="info-phone" type="tel" name="info.phone" placeholder="(555) 123-4567" />
              </div>
            </div>
            <div className="grid gap-2 md:grid-cols-2 md:gap-4">
              <div className="grid gap-2">
                <Label htmlFor="info-budget">Budget (range)</Label>
                <Input
                  id="info-budget"
                  name="info.budget"
                  placeholder="$—$$$ (range or estimate)"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="info-timeline">Timeline / target launch</Label>
                <Input
                  id="info-timeline"
                  name="info.timeline"
                  placeholder="e.g., Nov 2025 or 8–10 weeks"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="info-assets">Links to assets</Label>
              <Textarea
                id="info-assets"
                name="info.assets"
                placeholder="Brand guide, logos, copy docs, wireframes, etc."
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="info-notes">Additional notes</Label>
              <Textarea
                id="info-notes"
                name="info.notes"
                placeholder="Anything else we should know?"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="secondary" onClick={handleClear}>
            Clear
          </Button>
          <Button type="button" onClick={handleSaveDraft}>
            Save draft
          </Button>
          <Button type="button" variant="periwinkle" onClick={handleDownloadMarkdown}>
            Download .md
          </Button>
          <Button type="button" onClick={handleDownloadPDF}>
            Download PDF
          </Button>
        </div>
      </form>
    </div>
  )
}
