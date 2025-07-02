// src/app/login/page.tsx
"use client";

import { FormEvent, useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter }           from "next/navigation";
import { useToast }            from "@/hooks/use-toast";
import { useLanguage } from "@/context/language-context";

import {
   Card, CardContent, CardHeader, CardFooter,
  CardTitle, CardDescription, 
 
} from "@/components/ui/card";
import { Loader2, MountainIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

import { Button } from "@/components/ui/button";



export default function LoginPage() {
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [loading, setLoading]         = useState(false);
  const { toast } = useToast();
  const router    = useRouter();
  const { t } = useLanguage();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);
    if (res?.error) {
      toast({ title:"Login Failed", description: res.error, variant:"destructive" });
    } else {
      toast({ title:"Login Successful" });
      // Obtener la sesión para saber el rol
      const session = await getSession();
      const role = session?.user?.role as string;
      if (role === "PATIENT") {
        router.push("/patient/dashboard");
      } else if (role === "DENTIST") {
        router.push("/dentist/dashboard");
      } else {
        router.push("/");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen py-12">
      <Card className="max-w-md w-full shadow-2xl">
        <CardHeader className="text-center bg-primary/10 p-8 rounded-t-lg">
          <MountainIcon className="h-8 w-8 mx-auto text-primary" />
          <CardTitle>{t('login.title')}</CardTitle>
          <CardDescription>{t('login.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="emailOrDni">{t('login.emailOrDni')}</Label>
              <Input id="emailOrDni" type="text" value={email} onChange={e=>setEmail(e.target.value)} disabled={loading} placeholder={t('login.emailOrDni')} />
            </div>
            <div>
              <Label htmlFor="password">{t('login.password')}</Label>
              <Input id="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} disabled={loading} placeholder={t('login.password')} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : null}
              {loading ? t('login.loggingIn') : t('login.button')}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-sm">
            {t('login.noAccount')} {" "}
            <a href="/signup" className="text-accent hover:underline">{t('login.signup')}</a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
