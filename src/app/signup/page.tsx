
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
import { signupAction, type SignupInput } from "@/app/auth/actions";
import type { UserType } from "@/lib/types";

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountType, setAccountType] = useState<UserType | ''>('');
  const [specialty, setSpecialty] = useState(''); // For dentists
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    if (!accountType) {
      toast({ title: "Error", description: "Please select an account type.", variant: "destructive" });
      return;
    }
    if (accountType === 'dentist' && !specialty) {
      toast({ title: "Error", description: "Specialty is required for dentist accounts.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    const signupData: SignupInput = { 
      fullName, 
      email, 
      password, 
      accountType,
      ...(accountType === 'dentist' && { specialty }),
    };
    
    const result = await signupAction(signupData);
    setIsLoading(false);

    if (result.success && result.user && result.userType) {
      auth.login(result.user, result.userType); // Auto-login on successful signup
      toast({
        title: "Signup Successful",
        description: result.message,
      });
      if (result.userType === 'patient') {
        router.push('/patient/dashboard');
      } else if (result.userType === 'dentist') {
        router.push('/dentist/dashboard');
      }
    } else {
      toast({
        title: "Signup Failed",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] py-12">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="space-y-1 text-center bg-primary/10 p-8 rounded-t-lg">
          <MountainIcon className="h-8 w-8 mx-auto text-primary" />
          <CardTitle className="text-3xl font-bold text-primary-foreground mix-blend-multiply">Create Your Account</CardTitle>
          <CardDescription className="text-primary-foreground/80 mix-blend-multiply">
            Join DentalFlow today. It&apos;s quick and easy!
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input 
                id="fullName" 
                type="text" 
                placeholder="John Doe" 
                required 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading}
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="john.doe@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  required 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountType">I am a...</Label>
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
            {accountType === 'dentist' && (
              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty</Label>
                <Input 
                  id="specialty" 
                  type="text" 
                  placeholder="e.g., General Dentistry, Orthodontics" 
                  required 
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            )}
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Signing Up...' : 'Sign Up'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center p-6 border-t">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-accent hover:underline">
              Log In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
