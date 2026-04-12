"use client";

import { useState } from "react";
import { toast } from "sonner";
import { UploadCloud, CheckCircle2, User, Users } from "lucide-react";

export default function PaymentConfirmationPage() {
  const [email, setEmail] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [team, setTeam] = useState<any>(null);

  const [transactionId, setTransactionId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsVerifying(true);
    try {
      const res = await fetch("/api/algolympia/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to verify email");
        setTeam(null);
      } else {
        setTeam(data.team);
        toast.success("Team found successfully!");
      }
    } catch (error) {
      toast.error("An error occurred while verifying.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId) {
      toast.error("Please enter the transaction/reference ID");
      return;
    }
    if (!file) {
      toast.error("Please upload the payment screenshot");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("id", team.id.toString());
      formData.append("transactionId", transactionId);
      formData.append("screenshot", file);

      const res = await fetch("/api/algolympia/payment/confirm", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to upload payment details");
      } else {
        setSuccess(true);
        toast.success("Payment details uploaded successfully!");
      }
    } catch (error) {
      toast.error("An error occurred while uploading. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (success) {
    return (
      <section className="relative min-h-[calc(100vh-100px)] overflow-hidden pb-10 pt-16 md:pt-24 lg:pt-28">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-10">
          <div className="max-w-2xl animate-fade-in-up">
            <div className="mb-8 flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.36em] text-primary/90">
              <span className="h-px w-10 bg-primary" />
              Success
              <span className="h-px w-10 bg-primary" />
            </div>

            <h1 className="text-[3rem] font-semibold uppercase leading-[0.92] tracking-[0.02em] text-primary sm:text-[4rem] md:text-[5rem]">
              Payment
              <br />
              <span className="text-foreground">Recorded</span>
            </h1>

            <p className="mt-8 font-mono text-lg uppercase tracking-[0.24em] text-foreground/80 sm:text-xl">
              Upload Successful.
            </p>
            <p className="mt-5 text-base leading-relaxed text-foreground/52 sm:text-lg">
              Your payment screenshot and transaction ID have been successfully recorded. Our team will verify the payment shortly.
            </p>

            <div className="mt-11 flex flex-col gap-4 sm:flex-row sm:items-center py-8 border-t border-border">
              <button
                onClick={() => {
                  setSuccess(false);
                  setTeam(null);
                  setEmail("");
                  setTransactionId("");
                  setFile(null);
                }}
                className="inline-flex items-center justify-center border border-primary bg-transparent px-7 py-3 font-mono text-sm font-semibold uppercase tracking-[0.14em] text-primary transition-colors hover:bg-primary/10 w-fit"
              >
                Confirm Another
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden pb-20 pt-16 md:pt-24 lg:pt-28 min-h-screen">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-10">
        <div className="max-w-4xl animate-fade-in-up">
          <div className="mb-8 flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.36em] text-primary/90">
            <span className="h-px w-10 bg-primary" />
            C Square Presents
            <span className="h-px w-10 bg-primary" />
          </div>

          <h1 className="text-[3.2rem] font-semibold uppercase leading-[0.92] tracking-[0.02em] text-foreground sm:text-[4.7rem] md:text-[6.2rem]">
            Payment
            <br />
            <span className="text-primary">Confirm</span>
          </h1>

          <p className="mt-5 font-mono text-lg uppercase tracking-[0.24em] text-foreground/80 sm:text-2xl">
            AlgOlympia Registration Checkout
          </p>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground/52 sm:text-xl">
            Complete your AlgOlympia registration by safely submitting your team's payment screenshot and unique transaction reference.
          </p>

          <div className="mt-14 border-y border-border py-12 max-w-2xl">
            {!team ? (
              <form onSubmit={handleVerify} className="space-y-8">
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-[0.36em] text-foreground/80 mb-4">
                    Team Locator Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="ENTER REGISTERED EMAIL"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-transparent border-b-2 border-foreground/20 py-4 text-xl font-mono focus:outline-none focus:border-primary placeholder:text-foreground/30 transition-colors uppercase tracking-widest"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full inline-flex items-center justify-center border border-primary bg-primary px-7 py-4 font-mono text-sm font-semibold uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {isVerifying ? "Verifying..." : "Find Team"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleConfirm} className="space-y-10">
                <div className="border border-foreground/10 bg-foreground/5 p-6 rounded-none">
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-foreground/10">
                    <div className="p-3 border border-primary/30 text-primary">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-mono text-xl uppercase tracking-wider">{team.teamName}</h3>
                      <p className="text-xs uppercase tracking-[0.15em] text-foreground/60 mt-1 flex items-center gap-2">
                        <User className="h-3 w-3" /> {team.leaderName} [Leader]
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {team.member2Name && (
                      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.1em] text-foreground/70 border border-foreground/10 p-3">
                        <User className="h-4 w-4" /> {team.member2Name}
                      </div>
                    )}
                    {team.member3Name && (
                      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.1em] text-foreground/70 border border-foreground/10 p-3">
                        <User className="h-4 w-4" /> {team.member3Name}
                      </div>
                    )}
                  </div>
                </div>

                {team.paymentStatus === 'submitted' && (
                  <div className="border border-primary text-primary p-4 text-xs font-mono uppercase tracking-widest">
                    [WARNING: Payment already submitted. New upload will overwrite original]
                  </div>
                )}

                <div className="space-y-10">
                  <div>
                    <label htmlFor="transactionId" className="block text-xs font-semibold uppercase tracking-[0.36em] text-foreground/80 mb-4">
                      Transaction / Reference ID
                    </label>
                    <input
                      id="transactionId"
                      type="text"
                      placeholder="ENTER TXN REF"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      required
                      className="w-full bg-transparent border-b-2 border-foreground/20 py-4 text-xl font-mono focus:outline-none focus:border-primary placeholder:text-foreground/30 transition-colors uppercase tracking-widest"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.36em] text-foreground/80 mb-4">
                      Payment Screenshot
                    </label>
                    <div className="border-2 border-dashed border-foreground/20 hover:border-primary/50 transition-colors relative h-40 flex items-center justify-center bg-foreground/[0.02]">
                      <input
                        id="screenshot"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        required
                      />
                      <div className="flex flex-col items-center justify-center gap-3 font-mono text-center px-4">
                        <UploadCloud className="h-8 w-8 text-primary mb-2" />
                        <span className="text-sm uppercase tracking-widest">
                          {file ? file.name : "Select or drag file"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setTeam(null);
                      setFile(null);
                      setTransactionId("");
                    }}
                    disabled={isUploading}
                    className="flex-1 inline-flex items-center justify-center border border-foreground/20 bg-transparent px-7 py-4 font-mono text-sm font-semibold uppercase tracking-[0.14em] text-foreground/80 transition-colors hover:bg-foreground/5 disabled:opacity-50"
                  >
                    Select Another Team
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="flex-1 inline-flex items-center justify-center border border-primary bg-primary px-7 py-4 font-mono text-sm font-semibold uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isUploading ? "Transmitting..." : "Submit Payment"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
