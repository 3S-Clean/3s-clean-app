"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginValues } from "@/lib/validators";

export default function LoginPage() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
        mode: "onSubmit",
    });

    const onSubmit = async (values: LoginValues) => {
        // пока без Supabase — просто проверяем, что валидируется
        console.log("login values:", values);
    };

    return (
        <main className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md rounded-2xl border bg-white/80 backdrop-blur p-8 shadow-sm">
                <h1 className="text-3xl font-semibold tracking-tight">Log in</h1>
                <p className="mt-2 text-sm text-neutral-600">
                    Use your email and password to continue.
                </p>

                <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
                    {/* Email */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <input
                            type="email"
                            placeholder="name@domain.com"
                            className={[
                                "w-full rounded-xl border px-4 py-3 outline-none transition",
                                "focus:ring-2 focus:ring-black/10 focus:border-black/30",
                                errors.email ? "border-red-400 focus:border-red-400" : "border-black/15",
                            ].join(" ")}
                            {...register("email")}
                        />
                        {errors.email && (
                            <p className="text-sm text-red-600">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className={[
                                "w-full rounded-xl border px-4 py-3 outline-none transition",
                                "focus:ring-2 focus:ring-black/10 focus:border-black/30",
                                errors.password ? "border-red-400 focus:border-red-400" : "border-black/15",
                            ].join(" ")}
                            {...register("password")}
                        />
                        {errors.password && (
                            <p className="text-sm text-red-600">{errors.password.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-xl bg-black px-4 py-3 text-white transition hover:bg-neutral-900 disabled:opacity-50"
                    >
                        {isSubmitting ? "Checking..." : "Continue"}
                    </button>

                    <div className="flex items-center justify-between text-sm text-neutral-600">
                        <a className="hover:text-black transition" href="/signup">
                            Create account
                        </a>
                        <a className="hover:text-black transition" href="/forgot-password">
                            Forgot password?
                        </a>
                    </div>
                </form>
            </div>
        </main>
    );
}