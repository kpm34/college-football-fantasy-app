export default function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={(props.className||'')+" block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"} />
}
