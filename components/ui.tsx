"use client";

import {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

const focus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1";

export function Button({
  variant = "primary",
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-base font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 " +
    focus;
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-dark",
    secondary: "border border-primary bg-white text-primary hover:bg-surface",
    ghost: "text-primary hover:bg-surface",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...rest} />;
}

export function Field({
  label,
  htmlFor,
  error,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-ink">
        {label}
        {required && (
          <span className="ml-0.5 text-red-700" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p id={`${htmlFor}-error`} role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextInput({
  id,
  error,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { id: string; error?: string }) {
  return (
    <input
      id={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${id}-error` : undefined}
      className={`w-full rounded-lg border px-3 py-2 text-base ${focus} ${
        error ? "border-red-500" : "border-slate-300"
      }`}
      {...rest}
    />
  );
}

export function TextArea({
  id,
  error,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { id: string; error?: string }) {
  return (
    <textarea
      id={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${id}-error` : undefined}
      className={`w-full rounded-lg border px-3 py-2 text-base ${focus} ${
        error ? "border-red-500" : "border-slate-300"
      }`}
      {...rest}
    />
  );
}

export function Alert({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800"
    >
      {children}
    </div>
  );
}

export function Success({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-primary/30 bg-teal-50 p-3 text-sm text-primary-dark">
      {children}
    </div>
  );
}

export function Spinner({ label = "Cargando…" }: { label?: string }) {
  return (
    <div role="status" className="flex items-center gap-2 text-sm text-slate-600">
      <svg
        className="h-4 w-4 animate-spin text-primary"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
      </svg>
      <span>{label}</span>
    </div>
  );
}
