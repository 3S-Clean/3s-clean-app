import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    password: z
        .string()
        .min(1, "Password is required")
        .min(8, "Minimum 8 characters"),
});

export const signupSchema = z
    .object({
        email: z.string().min(1, "Email is required").email("Enter a valid email"),
        password: z.string().min(1, "Password is required").min(8, "Minimum 8 characters"),
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export const forgotPasswordSchema = z.object({
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
});

export const resetPasswordSchema = z
    .object({
        password: z.string().min(8, "Minimum 8 characters"),
        confirmPassword: z.string().min(8, "Minimum 8 characters"),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type SignupValues = z.infer<typeof signupSchema>;
export type LoginValues = z.infer<typeof loginSchema>;