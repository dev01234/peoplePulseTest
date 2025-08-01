import { Suspense } from "react";
import ResetPasswordForm from "@/components/reset-password/reset-password-form";
import { Loader2 } from "lucide-react";

function ResetPasswordFallback() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-900">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
            </div>
        </div>
    );
}

export default function ResetPassword() {
    return (
        <Suspense fallback={<ResetPasswordFallback />}>
            <ResetPasswordForm />
        </Suspense>
    );
}