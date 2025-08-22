'use client'
import Dialog from '@components/ui/Dialog'
import { Form, Field } from '@components/forms'
import Input from '@components/ui/Input'

export default function CreateLeagueDialog() {
  return (
    <Dialog>
      <Form onSubmit={(e)=>{e.preventDefault();}}>
        <Field label="League Name">
          <Input name="name" placeholder="My League" />
        </Field>
        <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Create</button>
      </Form>
    </Dialog>
  )
}
