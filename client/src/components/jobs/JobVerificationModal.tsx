import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload, X } from 'lucide-react';

interface JobVerificationModalProps {
  jobId: number;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
}

const JobVerificationModal: React.FC<JobVerificationModalProps> = ({
  jobId,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [beforePhoto, setBeforePhoto] = useState<File | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<File | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [beforePhotoPreview, setBeforePhotoPreview] = useState<string | null>(null);
  const [afterPhotoPreview, setAfterPhotoPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const handleBeforePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBeforePhoto(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setBeforePhotoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAfterPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAfterPhoto(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setAfterPhotoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearBeforePhoto = () => {
    setBeforePhoto(null);
    setBeforePhotoPreview(null);
  };

  const clearAfterPhoto = () => {
    setAfterPhoto(null);
    setAfterPhotoPreview(null);
  };

  const handleSubmit = async () => {
    if (!beforePhoto || !afterPhoto) {
      toast({
        title: "Missing photos",
        description: "Please upload both before and after photos",
        variant: "destructive",
      });
      return;
    }

    if (!isVerified) {
      toast({
        title: "Verification required",
        description: "Please confirm that the job has been completed",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('jobId', jobId.toString());
      formData.append('beforePhoto', beforePhoto);
      formData.append('afterPhoto', afterPhoto);
      
      await onSubmit(formData);
      
      toast({
        title: "Verification submitted",
        description: "Your photos have been submitted for verification",
      });
      
      // Reset form
      setBeforePhoto(null);
      setAfterPhoto(null);
      setIsVerified(false);
      setBeforePhotoPreview(null);
      setAfterPhotoPreview(null);
      
      onClose();
    } catch (error) {
      console.error(error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your verification",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Upload Verification Photos</AlertDialogTitle>
          <AlertDialogDescription>
            Please upload before and after photos to verify job completion. This helps maintain trust with property owners.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label className="block text-sm font-medium text-neutral-700">Before Photo</Label>
            {beforePhotoPreview ? (
              <div className="relative mt-1 h-48 border rounded-md overflow-hidden">
                <img 
                  src={beforePhotoPreview} 
                  alt="Before" 
                  className="w-full h-full object-cover"
                />
                <button 
                  type="button"
                  onClick={clearBeforePhoto}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-neutral-100"
                >
                  <X className="h-4 w-4 text-neutral-500" />
                </button>
              </div>
            ) : (
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-neutral-300 border-dashed rounded-md h-48">
                <div className="space-y-1 text-center">
                  <Camera className="mx-auto h-12 w-12 text-neutral-400" />
                  <div className="flex text-sm text-neutral-600">
                    <label htmlFor="file-upload-before" className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                      <span>Upload a file</span>
                      <Input 
                        id="file-upload-before" 
                        name="file-upload-before" 
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleBeforePhotoChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-neutral-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            )}
          </div>

          <div>
            <Label className="block text-sm font-medium text-neutral-700">After Photo</Label>
            {afterPhotoPreview ? (
              <div className="relative mt-1 h-48 border rounded-md overflow-hidden">
                <img 
                  src={afterPhotoPreview} 
                  alt="After" 
                  className="w-full h-full object-cover"
                />
                <button 
                  type="button"
                  onClick={clearAfterPhoto}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-neutral-100"
                >
                  <X className="h-4 w-4 text-neutral-500" />
                </button>
              </div>
            ) : (
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-neutral-300 border-dashed rounded-md h-48">
                <div className="space-y-1 text-center">
                  <Camera className="mx-auto h-12 w-12 text-neutral-400" />
                  <div className="flex text-sm text-neutral-600">
                    <label htmlFor="file-upload-after" className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                      <span>Upload a file</span>
                      <Input 
                        id="file-upload-after" 
                        name="file-upload-after" 
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleAfterPhotoChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-neutral-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4 flex items-start">
          <Checkbox
            id="verify-checkbox"
            checked={isVerified}
            onCheckedChange={(checked) => setIsVerified(checked === true)}
            className="mt-1"
          />
          <div className="ml-3 text-sm">
            <Label
              htmlFor="verify-checkbox"
              className="font-medium text-neutral-700"
            >
              Verification
            </Label>
            <p className="text-neutral-500">
              I confirm the job has been completed as described and these photos are accurate.
            </p>
          </div>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
          <Button 
            onClick={handleSubmit}
            disabled={!beforePhoto || !afterPhoto || !isVerified || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="mr-2">Submitting...</span>
                <Upload className="h-4 w-4 animate-spin" />
              </>
            ) : (
              'Submit For Payment'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default JobVerificationModal;
