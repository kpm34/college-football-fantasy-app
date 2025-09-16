import { LabelHTMLAttributes } from 'react'

export default function Label(props: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label {...props} className={(props.className || '') + ' text-sm font-medium'} />
}
