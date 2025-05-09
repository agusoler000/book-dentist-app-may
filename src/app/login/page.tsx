
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MountainIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { loginAction, type LoginInput } from "@/app/auth/actions";
import type { UserType } from "@/lib/types";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState<UserType | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!accountType) {
      toast({ title: "Error", description: "Please select an account type.", variant: "destructive" });
      return;
    }
    setIsLoading(true);

    const credentials: LoginInput = { email, password, accountType };
    const result = await loginAction(credentials);

    setIsLoading(false);
    if (result.success && result.user && result.userType) {
      auth.login(result.user, result.userType);
      toast({
        title: "Login Successful",
        description: result.message,
      });
      if (result.userType === 'patient') {
        router.push('/patient/dashboard');
      } else if (result.userType === 'dentist') {
        router.push('/dentist/dashboard');
      }
    } else {
      toast({
        title: "Login Failed",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] py-12">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 text-center bg-primary/10 p-8 rounded-t-lg">
          <MountainIcon className="h-8 w-8 mx-auto text-primary" />
          <CardTitle className="text-3xl font-bold text-primary-foreground mix-blend-multiply">Welcome Back!</CardTitle>
          <CardDescription className="text-primary-foreground/80 mix-blend-multiply">
            Log in to your DentalFlow account.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountType">Account Type</Label>
              <Select 
                onValueChange={(value) => setAccountType(value as UserType)} 
                value={accountType}
                required
                disabled={isLoading}
              >
                <SelectTrigger id="accountType">
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="dentist">Dentist</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Logging In...' : 'Log In'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2 p-6 border-t">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-accent hover:underline">
              Sign Up
            </Link>
          </p>
           <Link href="#" className="text-xs text-muted-foreground hover:underline">
              Forgot password?
            </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
