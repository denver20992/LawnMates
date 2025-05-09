import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Job } from "@shared/schema";
import { CreditCard } from "lucide-react";

type PayButtonProps = {
  job: Job;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
};

export function PayButton({ job, className, variant = "default", size = "default" }: PayButtonProps) {
  const [, navigate] = useLocation();

  const handlePayment = () => {
    navigate(`/checkout?jobId=${job.id}`);
  };

  // Only show pay button for property owners and if job is in "accepted" or "in_progress" state
  const shouldShowPayButton = 
    job.status === "accepted" || 
    job.status === "in_progress";

  if (!shouldShowPayButton) {
    return null;
  }

  return (
    <Button 
      onClick={handlePayment} 
      className={className}
      variant={variant}
      size={size}
    >
      <CreditCard className="mr-2 h-4 w-4" />
      Pay Now
    </Button>
  );
}