import { Suspense } from "react";
import { LoginClient } from "@/features/auth/login-client";

export default function Login() {
  return <Suspense fallback={null}><LoginClient /></Suspense>;
}
