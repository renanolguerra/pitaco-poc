import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "@/components/forms/LoginForm";

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Pitaco</h1>
          <p className="text-muted-foreground mt-2">Entre na sua conta</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
