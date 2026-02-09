import { z } from "zod";

// LOGIN
export const loginSchema = z.object({
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    password: z
        .string()
        .min(8, "Minimum 8 characters")
        .regex(/[A-Z]/, "Must contain at least one uppercase letter")
        .regex(/[0-9]/, "Must contain at least one number")
});

export type LoginValues = z.infer<typeof loginSchema>;

// SIGNUP (OTP, email-only)
export const signupEmailSchema = z.object({
    email: z.string().min(1, "Email is required").email("Please enter a valid email"),
});

export type SignupEmailValues = z.infer<typeof signupEmailSchema>;

// FORGOT PASSWORD
export const forgotPasswordSchema = z.object({
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

// RESET PASSWORD
// RESET PASSWORD
export const resetPasswordSchema = z
    .object({
        password: z
            .string()
            .min(8, "Minimum 8 characters")
            .regex(/[A-Z]/, "Must contain at least one uppercase letter")
            .regex(/[0-9]/, "Must contain at least one number"),
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((v) => v.password === v.confirmPassword, {
        message: "Passwords do not match.",
        path: ["confirmPassword"],
    });


export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;