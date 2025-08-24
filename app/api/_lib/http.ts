import { ZodError } from "zod";

export function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    ...init,
  });
}

export const ok = (data: unknown) => json({ ok: true, data }, { status: 200 });
export const created = (data: unknown) => json({ ok: true, data }, { status: 201 });
export const badRequest = (err: unknown) => json({ ok: false, error: serializeErr(err) }, { status: 400 });
export const unauthorized = () => json({ ok: false, error: "unauthorized" }, { status: 401 });
export const forbidden = () => json({ ok: false, error: "forbidden" }, { status: 403 });
export const notFound = (msg = "not found") => json({ ok: false, error: msg }, { status: 404 });
export const badGateway = (msg = "upstream error") => json({ ok: false, error: msg }, { status: 502 });
export const error = (err: unknown, status = 500) => json({ ok: false, error: serializeErr(err) }, { status });

function serializeErr(err: unknown) {
  if (!err) return "unknown";
  if (err instanceof ZodError) return err.flatten();
  if (err instanceof Error) return { name: err.name, message: err.message };
  if (typeof err === "string") return err;
  return "unknown";
}
