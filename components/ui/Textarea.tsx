import { TextareaHTMLAttributes } from 'react'

export default function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={
        (props.className || '') +
        ' block w-full rounded-md border border-gray-300 px-3 py-2 text-sm'
      }
    />
  )
}
