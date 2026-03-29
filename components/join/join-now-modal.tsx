"use client";

import { useEffect, useState } from "react";

const CU_JOIN_URL = "https://cuintranet.in/join-now";

type JoinFormState = {
  fullName: string;
  instituteName: string;
  rollNumber: string;
  personalEmail: string;
  collegeEmail: string;
  campusAmbassador: "Yes" | "No";
};

const initialForm: JoinFormState = {
  fullName: "",
  instituteName: "",
  rollNumber: "",
  personalEmail: "",
  collegeEmail: "",
  campusAmbassador: "No",
};

type JoinNowModalProps = {
  className?: string;
  children: React.ReactNode;
};

type Step = "choose" | "form" | "success" | "already-registered-cu";

export default function JoinNowModal({ className, children }: JoinNowModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>("choose");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [form, setForm] = useState<JoinFormState>(initialForm);
  const [cuRegistered, setCuRegistered] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    
    // Check if user already registered for CUSoC
    const cuRegFlag = localStorage.getItem("cusoc-registered");
    if (cuRegFlag === "true") {
      setCuRegistered(true);
      setStep("already-registered-cu");
    }
    
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || step !== "form") return;

    const rollNumber = form.rollNumber.trim();
    const personalEmail = form.personalEmail.trim().toLowerCase();
    const collegeEmail = form.collegeEmail.trim().toLowerCase();

    if (!rollNumber && !personalEmail && !collegeEmail) {
      setDuplicateError(null);
      setCheckingDuplicate(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setCheckingDuplicate(true);

        const query = new URLSearchParams({
          rollNumber,
          personalEmail,
          collegeEmail,
        });

        const response = await fetch(`/api/join/outside?${query.toString()}`, {
          method: "GET",
          signal: controller.signal,
        });

        if (!response.ok) {
          setDuplicateError(null);
          return;
        }

        const payload = await response.json();
        if (payload?.duplicate) {
          setDuplicateError(
            payload?.error || "You have already submitted the form. Check your registered email for updates."
          );
        } else {
          setDuplicateError(null);
        }
      } catch {
        if (!controller.signal.aborted) {
          setDuplicateError(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setCheckingDuplicate(false);
        }
      }
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [isOpen, step, form.rollNumber, form.personalEmail, form.collegeEmail]);

  function closeModal() {
    setIsOpen(false);
    setTimeout(() => {
      setStep("choose");
      setSubmitting(false);
      setError(null);
      setDuplicateError(null);
      setCheckingDuplicate(false);
      setForm(initialForm);
      setCuRegistered(false);
    }, 180);
  }

  function handleCuStudentClick() {
    // Mark that user has registered for CUSoC in this browser
    localStorage.setItem("cusoc-registered", "true");
    window.open(CU_JOIN_URL, "_blank", "noopener,noreferrer");
    closeModal();
  }

  async function submitOutsideCuForm(e: React.FormEvent) {
    e.preventDefault();
    if (duplicateError) {
      setError(duplicateError);
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      fullName: form.fullName,
      instituteName: form.instituteName,
      rollNumber: form.rollNumber,
      personalEmail: form.personalEmail,
      collegeEmail: form.collegeEmail,
      campusAmbassador: form.campusAmbassador,
    };

    try {
      const response = await fetch("/api/join/outside", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload?.error || "Failed to submit the form");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed. Please try again.");
      setSubmitting(false);
      return;
    }

    setStep("success");
    setSubmitting(false);
  }

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className={className}>
        {children}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close modal"
            onClick={closeModal}
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px] transition-opacity duration-200"
          />

          <div className="relative z-10 w-full max-w-xl rounded-2xl border border-border bg-background p-6 shadow-2xl transition-all duration-300 animate-fade-in-up sm:p-7">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Join C Square</p>
                <h3 className="mt-1 text-2xl font-bold text-foreground">Get Started</h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-md border border-border px-2.5 py-1 text-sm text-foreground/70 hover:bg-card"
              >
                Close
              </button>
            </div>

            {step === "choose" && (
              <div className="space-y-3">
                <p className="text-sm text-foreground/65">Select your category to continue.</p>
                <button
                  type="button"
                  onClick={handleCuStudentClick}
                  className="w-full rounded-xl border border-border bg-card px-4 py-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/10"
                >
                  <p className="font-semibold text-foreground">Chandigarh University Student</p>
                  <p className="mt-1 text-xs text-foreground/60">Continue to CU intranet registration.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="w-full rounded-xl border border-border bg-card px-4 py-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/10"
                >
                  <p className="font-semibold text-foreground">Other College / Outside CU</p>
                  <p className="mt-1 text-xs text-foreground/60">Fill a quick form and join the community group.</p>
                </button>
              </div>
            )}

            {step === "form" && (
              <form className="space-y-3" onSubmit={submitOutsideCuForm}>
                <p className="text-sm text-foreground/65">Fill your details for external registration.</p>

                <input
                  required
                  placeholder="Full Name"
                  value={form.fullName}
                  onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm"
                />
                <input
                  required
                  placeholder="Institute Name"
                  value={form.instituteName}
                  onChange={(e) => setForm((prev) => ({ ...prev, instituteName: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm"
                />
                <input
                  required
                  placeholder="Roll Number"
                  value={form.rollNumber}
                  onChange={(e) => setForm((prev) => ({ ...prev, rollNumber: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm"
                />
                <input
                  required
                  type="email"
                  placeholder="Personal Email"
                  value={form.personalEmail}
                  onChange={(e) => setForm((prev) => ({ ...prev, personalEmail: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm"
                />
                <input
                  required
                  type="email"
                  placeholder="College Email ID"
                  value={form.collegeEmail}
                  onChange={(e) => setForm((prev) => ({ ...prev, collegeEmail: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm"
                />

                <div className="rounded-lg border border-border bg-card p-3">
                  <p className="mb-2 text-sm font-medium text-foreground">Campus Ambassador</p>
                  <label className="mr-4 inline-flex items-center gap-2 text-sm text-foreground/80">
                    <input
                      type="radio"
                      name="campusAmbassador"
                      checked={form.campusAmbassador === "Yes"}
                      onChange={() => setForm((prev) => ({ ...prev, campusAmbassador: "Yes" }))}
                    />
                    Yes
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-foreground/80">
                    <input
                      type="radio"
                      name="campusAmbassador"
                      checked={form.campusAmbassador === "No"}
                      onChange={() => setForm((prev) => ({ ...prev, campusAmbassador: "No" }))}
                    />
                    No
                  </label>
                </div>

                {checkingDuplicate && !duplicateError && (
                  <p className="text-xs text-foreground/60">Checking your registration...</p>
                )}
                {duplicateError && <p className="text-sm text-red-500">{duplicateError}</p>}
                {error && !duplicateError && <p className="text-sm text-red-500">{error}</p>}

                <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setStep("choose")}
                    className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground/80 hover:bg-card"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || Boolean(duplicateError)}
                    className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
                  >
                    {submitting ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </form>
            )}

            {step === "success" && (
              <div className="rounded-xl border border-emerald-300/40 bg-emerald-500/10 p-4 text-center">
                <p className="text-sm font-semibold text-emerald-400">Submitted Successfully</p>
                <p className="mt-1 text-xs text-foreground/70">You will receive an email shortly.</p>
                <button
                  type="button"
                  onClick={closeModal}
                  className="mt-3 rounded-md border border-border px-3 py-1.5 text-xs text-foreground/80 hover:bg-card"
                >
                  Close
                </button>
              </div>
            )}

            {step === "already-registered-cu" && (
              <div className="rounded-xl border border-blue-300/40 bg-blue-500/10 p-4 text-center">
                <p className="text-sm font-semibold text-blue-400">Already Registered</p>
                <p className="mt-1 text-xs text-foreground/70">You have already signed up for CUSoC. Check your registered email for updates.</p>
                <button
                  type="button"
                  onClick={closeModal}
                  className="mt-3 rounded-md border border-border px-3 py-1.5 text-xs text-foreground/80 hover:bg-card"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
