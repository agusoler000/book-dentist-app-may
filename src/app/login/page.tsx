// src/app/login/page.tsx
"use client";

import { FormEvent, useState } from "react";
import { signIn }              from "next-auth/react";
import { useRouter }           from "next/navigation";
import { useToast }            from "@/hooks/use-toast";

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
  const [role, setRole]               = useState<"PATIENT"|"DENTIST">("PATIENT");
  const [loading, setLoading]         = useState(false);
  const { toast } = useToast();
  const router    = useRouter();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await signIn("credentials", {
      redirect:      false,
      email,
      password,
      callbackUrl:   role === "PATIENT" ? "/patient/dashboard" : "/dentist/dashboard"
    });

    setLoading(false);
    if (res?.error) {
      toast({ title:"Login Failed", description: res.error, variant:"destructive" });
    } else {
      toast({ title:"Login Successful" });
      router.push(res?.url!);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen py-12">
      <Card className="max-w-md w-full shadow-2xl">
        <CardHeader className="text-center bg-primary/10 p-8 rounded-t-lg">
          <MountainIcon className="h-8 w-8 mx-auto text-primary" />
          <CardTitle>Welcome Back!</CardTitle>
          <CardDescription>Log in to your DentalFlow account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} disabled={loading}/>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} disabled={loading}/>
            </div>
            <div>
              <Label htmlFor="role">Account Type</Label>
              <Select value={role} onValueChange={v=>setRole(v as any)} disabled={loading}>
                <SelectTrigger id="role"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PATIENT">Patient</SelectItem>
                  <SelectItem value="DENTIST">Dentist</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : null}
              {loading ? "Logging In…" : "Log In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-sm">
            Don’t have an account?{" "}
            <a href="/signup" className="text-accent hover:underline">Sign Up</a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
