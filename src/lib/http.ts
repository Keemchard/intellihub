import { NextResponse } from "next/server";

export const unauthorized = () => NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
export const badRequest = (error: unknown) => NextResponse.json({ error }, { status: 400 });
export const notFound = () => NextResponse.json({ error: "Not found" }, { status: 404 });
export const ok = <T,>(data: T, meta?: Record<string, unknown>) => NextResponse.json({ data, meta });
