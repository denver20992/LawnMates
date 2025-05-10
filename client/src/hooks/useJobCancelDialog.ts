import { useState, useCallback } from "react";

export const useJobCancelDialog = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [jobToCancel, setJobToCancel] = useState<number | null>(null);
  
  const openCancelDialog = useCallback((jobId: number) => {
    setJobToCancel(jobId);
    setIsDialogOpen(true);
  }, []);
  
  const closeCancelDialog = useCallback(() => {
    setIsDialogOpen(false);
  }, []);
  
  return {
    isDialogOpen,
    jobToCancel,
    openCancelDialog,
    closeCancelDialog,
  };
};