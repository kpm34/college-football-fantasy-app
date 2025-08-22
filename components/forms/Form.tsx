'use client'
import { type PropsWithChildren } from 'react'

export default function Form({ children, ...props }: PropsWithChildren<React.FormHTMLAttributes<HTMLFormElement>>) {
  return <form {...props} className={(props.className||'')+" space-y-3"}>{children}</form>
}
