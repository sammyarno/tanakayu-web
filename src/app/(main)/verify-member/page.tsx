'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Scanner } from '@yudiel/react-qr-scanner';
import dayjs from 'dayjs';
import { AlertCircle, CheckCircle2, Cpu, Loader2, QrCode, RefreshCw, Scan } from 'lucide-react';
import { toast } from 'sonner';

interface MemberData {
  full_name: string;
  phone_number: string;
  address: string;
  role: string;
  member_since: string;
}

export default function VerifyMemberPage() {
  const [isScanning, setIsScanning] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [memberData, setMemberData] = useState<MemberData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (detectedCodes: any[]) => {
    if (detectedCodes.length > 0) {
      const rawValue = detectedCodes[0].rawValue;
      if (rawValue) {
        setIsScanning(false);
        verifyMember(rawValue);
      }
    }
  };

  const verifyMember = async (userId: string) => {
    setIsLoading(true);
    setError(null);
    setMemberData(null);

    try {
      const response = await fetch('/api/auth/verify-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify member');
      }

      setMemberData(data.data);
      toast.success('Member verified successfully');
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetScanner = () => {
    setIsScanning(true);
    setMemberData(null);
    setError(null);
  };

  return (
    <div className="container mx-auto flex flex-col items-center justify-center px-4 pt-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Verify Member</h1>
          <p className="text-muted-foreground">Scan the QR code on the member's card to verify their identity.</p>
        </div>

        <Card className="overflow-hidden border-2">
          {isScanning ? (
            <div className="relative aspect-square w-full bg-black">
              <Scanner
                onScan={handleScan}
                onError={error => console.error(error)}
                classNames={{
                  container: 'aspect-square w-full',
                }}
                components={{
                  onOff: false,
                  torch: false,
                  zoom: false,
                  finder: true,
                }}
              />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="relative h-64 w-64 rounded-lg border-2 border-white/50">
                  <div className="absolute top-0 left-0 -mt-1 -ml-1 h-4 w-4 border-t-4 border-l-4 border-green-500"></div>
                  <div className="absolute top-0 right-0 -mt-1 -mr-1 h-4 w-4 border-t-4 border-r-4 border-green-500"></div>
                  <div className="absolute bottom-0 left-0 -mb-1 -ml-1 h-4 w-4 border-b-4 border-l-4 border-green-500"></div>
                  <div className="absolute right-0 bottom-0 -mr-1 -mb-1 h-4 w-4 border-r-4 border-b-4 border-green-500"></div>
                </div>
              </div>
              <div className="absolute right-0 bottom-4 left-0 text-center text-sm font-medium text-white/80">
                Align QR code within the frame
              </div>
            </div>
          ) : (
            <div className="p-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Loader2 className="text-primary mb-4 size-12 animate-spin" />
                  <p className="text-lg font-medium">Verifying member...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-4 rounded-full bg-red-100 p-4 text-red-600">
                    <AlertCircle className="size-12" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-red-700">Verification Failed</h3>
                  <p className="mb-6 text-red-600">{error}</p>
                  <Button onClick={resetScanner} variant="outline" className="w-full">
                    <RefreshCw className="mr-2 size-4" />
                    Scan Again
                  </Button>
                </div>
              ) : memberData ? (
                <div className="space-y-6">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="mb-4 rounded-full bg-green-100 p-4 text-green-600">
                      <CheckCircle2 className="size-12" />
                    </div>
                    <h3 className="text-xl font-bold text-green-700">Verified Member</h3>
                    <p className="text-sm text-green-600">Valid membership detected</p>
                  </div>

                  {/* Digital Card Preview */}
                  <div className="relative mx-auto h-48 w-full max-w-sm overflow-hidden rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 text-white shadow-xl">
                    <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-white/5 blur-3xl" />
                    <div className="bg-tanakayu-accent/10 absolute -bottom-12 -left-12 h-32 w-32 rounded-full blur-3xl" />

                    <div className="relative flex h-full flex-col justify-between p-5">
                      <div className="flex items-start justify-between">
                        <div className="space-y-0.5">
                          <h2 className="text-tanakayu-accent font-serif text-2xl font-bold tracking-wider">
                            TANAKAYU
                          </h2>
                          <p className="text-[0.6rem] tracking-[0.2em] text-neutral-400 uppercase">Membership</p>
                        </div>
                        <div className="rounded-full bg-white/10 px-2 py-0.5 text-[0.6rem] font-medium text-white/80 uppercase backdrop-blur-sm">
                          {memberData.role}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="relative h-7 w-10 rounded bg-yellow-100/10 backdrop-blur-sm">
                          <Cpu className="absolute inset-0 h-full w-full p-1 text-yellow-200/50" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div>
                          <p className="text-[0.5rem] text-neutral-400 uppercase">Member Name</p>
                          <p className="font-mono text-base font-medium tracking-wider text-amber-100/90">
                            {memberData.full_name}
                          </p>
                        </div>
                        {memberData.address && (
                          <div>
                            <p className="text-[0.5rem] text-neutral-400 uppercase">Residence</p>
                            <p className="font-mono text-[0.65rem] text-white/80">{memberData.address.toUpperCase()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between border-b py-2">
                      <span className="text-muted-foreground">Phone</span>
                      <span className="font-medium">{memberData.phone_number || '-'}</span>
                    </div>
                    <div className="flex justify-between border-b py-2">
                      <span className="text-muted-foreground">Member Since</span>
                      <span className="font-medium">{dayjs(memberData.member_since).format('DD MMM YYYY')}</span>
                    </div>
                  </div>

                  <Button onClick={resetScanner} className="w-full">
                    <Scan className="mr-2 size-4" />
                    Scan Another Member
                  </Button>
                </div>
              ) : null}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
