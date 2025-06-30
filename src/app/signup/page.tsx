"use client";

import { FormEvent, useState } from "react";
import { useToast }            from "@/hooks/use-toast";
import { useRouter }           from "next/navigation";


import { Loader2, MountainIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signupAction, SignupInput } from "../actions/auth/auth";

export default function SignupPage() {
  const [fullName, setFullName]       = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [confirmPassword, setConfirm] = useState("");
  const [accountType, setAccountType] = useState<"patient"|"dentist">("patient");
  const [phone, setPhone]             = useState("");
  const [dob, setDob]                 = useState("");
  const [specialty, setSpecialty]     = useState("");
  const [bio, setBio]                 = useState("");
  const [loading, setLoading]         = useState(false);

  const { toast } = useToast();
  const router    = useRouter();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    setLoading(true);

  const data: SignupInput = {
  fullName,
  email,
  password,
  accountType,
  phone:     phone || undefined,
  dob:       accountType === "patient" ? dob : undefined,
  specialty: accountType === "dentist" ? specialty : undefined,
  bio:       accountType === "dentist" ? bio : undefined,
};

    try {
      const result = await signupAction(data);
      if (result?.success === false) {
        toast({ title: "Signup Failed", description: result.message, variant: "destructive" });
        setLoading(false);
      }
      // on success, redirect happens in the Server Action
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen py-12">
      <Card className="max-w-lg w-full shadow-2xl">
        <CardHeader className="text-center bg-primary/10 p-8 rounded-t-lg">
          <MountainIcon className="h-8 w-8 mx-auto text-primary" />
          <CardTitle>Create Your Account</CardTitle>
          <CardDescription>Join DentalFlow today—it&apos;s quick and easy!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirm(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountType">I am a…</Label>
              <Select value={accountType} onValueChange={v => setAccountType(v as any)} disabled={loading}>
                <SelectTrigger id="accountType"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="dentist">Dentist</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {accountType === "patient" && (
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}

            {accountType === "dentist" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="specialty">Specialty</Label>
                  <Input
                    id="specialty"
                    value={specialty}
                    onChange={e => setSpecialty(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input
                    id="bio"
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
              {loading ? "Signing Up…" : "Sign Up"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-sm">
            Already have an account?{" "}
            <a href="/login" className="text-accent hover:underline">Log In</a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
