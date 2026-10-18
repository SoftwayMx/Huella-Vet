import { LoginForm } from "@/components/login-form";

export const metadata = { title: "Iniciar sesión — Huella Vet" };

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-bold text-primary">Panel de personal</h1>
      <p className="mt-1 text-sm text-slate-600">Inicia sesión con tu cuenta del personal.</p>
      <div className="mt-6 rounded-lg border border-slate-200 p-6">
        <LoginForm />
      </div>
    </main>
  );
}
