'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MountainIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login logic
    console.log("Login attempt with:", { email, password });
    toast({
      title: "Login Submitted (Mock)",
      description: "In a real app, this would attempt to log you in.",
    });
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
              />
            </div>
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              Log In
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
