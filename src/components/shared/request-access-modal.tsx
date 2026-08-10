"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";
import { useCreateAccessRequest } from "@/features/access/use-access";
import { allowedTiers } from "@/lib/auth/roles";
import { CreateAccessRequestInput, type Product } from "@/types";
import { cn } from "@/lib/utils";

export function RequestAccessModal({ product, open, onOpenChange }: { product: Product; open: boolean; onOpenChange: (v: boolean) => void }) {
  const tiers = allowedTiers(product.family);
  const mutation = useCreateAccessRequest(product.id);

  const form = useForm<CreateAccessRequestInput>({
    resolver: zodResolver(CreateAccessRequestInput),
    defaultValues: { productId: product.id, roleTier: "Viewer", justification: "" },
    mode: "onBlur",
  });
  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = form;
  const tier = watch("roleTier");
  const justification = watch("justification") ?? "";

  useEffect(() => { if (!open) { reset(); mutation.reset(); } /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [open]);

  const onSubmit = handleSubmit(async (values) => {
    await mutation.mutateAsync(values);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="mb-5 flex items-center gap-3">
          <div className="grad-brand grid h-11 w-11 place-items-center rounded-xl text-white"><Icon name="shield-check" size={20} /></div>
          <div className="min-w-0">
            <DialogTitle className="text-base font-bold">Request access</DialogTitle>
            <DialogDescription className="truncate text-sm text-muted-foreground">{product.name}</DialogDescription>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm font-semibold">Access tier</label>
          <div className="mt-2 grid gap-2">
            {(["Viewer", "CYOD", "Self-Serve"] as const).map((t) => {
              const disabled = !tiers.includes(t);
              return (
                <button type="button" key={t} disabled={disabled} onClick={() => setValue("roleTier", t, { shouldValidate: true })}
                  className={cn("flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-sm transition ring-focus",
                    tier === t ? "border-primary bg-accent" : "border-border hover:bg-muted",
                    disabled && "cursor-not-allowed opacity-45 hover:bg-transparent")}>
                  <span className="font-semibold">{t}</span>
                  <span className="text-xs text-muted-foreground">{disabled ? "Eagle Eye only" : t === "Viewer" ? "Read-only" : "Elevated"}</span>
                </button>
              );
            })}
          </div>
          {errors.roleTier && <p className="mt-1 text-xs font-medium text-destructive">{errors.roleTier.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="justification" className="text-sm font-semibold">Business justification</label>
            <span className={cn("text-xs", justification.length < 20 ? "text-muted-foreground" : "text-emerald-600")}>{justification.length}/1000</span>
          </div>
          <textarea id="justification" rows={3} {...register("justification")}
            placeholder="Describe how you'll use this product and why access is needed…"
            className="mt-1.5 w-full resize-none rounded-xl border border-input bg-card p-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          {errors.justification && <p className="mt-1 text-xs font-medium text-destructive">{errors.justification.message}</p>}
        </div>

        {mutation.isError && (
          <p className="mt-3 rounded-xl bg-destructive/10 p-3 text-xs font-medium text-destructive">{(mutation.error as Error).message}</p>
        )}

        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Your request is recorded in IntelliHub and routed to the approval workflow. Track it under <span className="font-semibold text-foreground">Access &amp; Enablement</span>.
        </p>

        <div className="mt-4 flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" className="flex-1" onClick={onSubmit} disabled={isSubmitting || mutation.isPending}>
            {mutation.isPending ? "Submitting…" : "Submit request"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
