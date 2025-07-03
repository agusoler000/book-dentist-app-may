"use client";

import { FormEvent, useState } from "react";
import { useToast }            from "@/hooks/use-toast";
import { useRouter }           from "next/navigation";
import { useLanguage } from '@/context/language-context';
import { signIn } from "next-auth/react";

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
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [specialty, setSpecialty]     = useState("");
  const [bio, setBio]                 = useState("");
  const [dni, setDni]                 = useState("");
  const [loading, setLoading]         = useState(false);

  const { toast } = useToast();
  const router    = useRouter();
  const { t } = useLanguage();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: t('signup.error'), description: t('signup.passwords_no_match'), variant: 'destructive' });
      return;
    }
    setLoading(true);

    const data: SignupInput = {
      fullName,
      email,
      password,
      accountType,
      phone:     phone || undefined,
      dni:       accountType === "patient" ? dni : undefined,
      dateOfBirth: accountType === "patient" ? dateOfBirth : undefined,
      specialty: accountType === "dentist" ? specialty : undefined,
      bio:       accountType === "dentist" ? bio : undefined,
    };

    try {
      const result = await signupAction(data);
      if (result?.success === false) {
        toast({ title: t('signup.failed'), description: result.message, variant: 'destructive' });
        setLoading(false);
      } else {
        // Login automático tras registro exitoso
        const loginResult = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });
        setLoading(false);
        if (loginResult?.ok) {
          // Redirigir según el rol
          if (accountType === "dentist") {
            router.push("/dentist/dashboard");
          } else {
            router.push("/patient/dashboard");
          }
        } else {
          toast({ title: t('signup.error'), description: t('signup.auto_login_failed'), variant: 'destructive' });
        }
      }
    } catch (err: any) {
      toast({ title: t('signup.error'), description: err.message, variant: 'destructive' });
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen py-12">
      <Card className="max-w-lg w-full shadow-2xl">
        <CardHeader className="text-center bg-primary/10 p-8 rounded-t-lg">
          <MountainIcon className="h-8 w-8 mx-auto text-primary" />
          <CardTitle>{t('signup.title')}</CardTitle>
          <CardDescription>{t('signup.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">{t('signup.full_name')}</Label>
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
              <Label htmlFor="email">{t('signup.email')}</Label>
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
                <Label htmlFor="password">{t('signup.password')}</Label>
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
                <Label htmlFor="confirmPassword">{t('signup.confirm_password')}</Label>
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
              <Label htmlFor="phone">{t('signup.phone')}</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountType">{t('signup.account_type')}</Label>
              <Select value={accountType} onValueChange={v => setAccountType(v as any)} disabled={loading}>
                <SelectTrigger id="accountType"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">{t('signup.patient')}</SelectItem>
                  <SelectItem value="dentist">{t('signup.dentist')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {accountType === "patient" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="dni">{t('signup.dni')}</Label>
                  <Input
                    id="dni"
                    type="text"
                    required
                    value={dni}
                    onChange={e => setDni(e.target.value)}
                    disabled={loading}
                    placeholder={t('signup.dni_placeholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">{t('signup.date_of_birth')}</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={dateOfBirth}
                    onChange={e => setDateOfBirth(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </>
            )}

            {accountType === "dentist" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="specialty">{t('signup.specialty')}</Label>
                  <Input
                    id="specialty"
                    value={specialty}
                    onChange={e => setSpecialty(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">{t('signup.bio')}</Label>
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
              {loading ? t('signup.signing_up') : t('signup.sign_up')}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-sm">
            {t('signup.already_have_account')}{' '}
            <a href="/login" className="text-primary underline">{t('signup.login')}</a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
