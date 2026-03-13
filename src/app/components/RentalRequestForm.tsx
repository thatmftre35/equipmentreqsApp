import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Combobox } from "./ui/combobox";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { Loader2, Package } from "lucide-react";

type RentalRequestFormData = {
  name: string;
  project: string;
  equipmentType: string;
  model: string;
  requiredByDate: string;
  expectedReturnDate: string;
  recipientEmail: string;
};

export function RentalRequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState<string[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const { register, handleSubmit, formState: { errors }, control, reset } = useForm<RentalRequestFormData>();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-927e49ee/projects`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` }
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error("Error loading projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const onSubmit = async (data: RentalRequestFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-927e49ee/submit-rental`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit rental request");
      }

      toast.success("Rental request submitted successfully!");
      // Reset form
      reset();
    } catch (error: any) {
      console.error("Error submitting rental request:", error);
      toast.error(error.message || "Failed to submit rental request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Rental Equipment Request</h2>
      <p className="text-sm text-gray-600 mb-6">
        Request new rental equipment for your project.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...register("name", { required: "Name is required" })}
              placeholder="Enter your name"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="project">Project *</Label>
            {isLoadingProjects ? (
              <div className="flex items-center justify-center h-10 border rounded-md">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            ) : (
              <Controller
                name="project"
                control={control}
                defaultValue=""
                rules={{ required: "Project is required" }}
                render={({ field }) => (
                  <Combobox
                    value={field.value}
                    onValueChange={field.onChange}
                    options={projects}
                    placeholder="Select a project"
                    emptyMessage="No projects available. Add projects in Projects management."
                  />
                )}
              />
            )}
            {errors.project && (
              <p className="text-sm text-red-600">{errors.project.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipmentType">Equipment Type *</Label>
            <Input
              id="equipmentType"
              {...register("equipmentType", { required: "Equipment type is required" })}
              placeholder="e.g., Excavator, Crane"
            />
            {errors.equipmentType && (
              <p className="text-sm text-red-600">{errors.equipmentType.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model *</Label>
            <Input
              id="model"
              {...register("model", { required: "Model is required" })}
              placeholder="e.g., CAT 320, JCB 3CX"
            />
            {errors.model && (
              <p className="text-sm text-red-600">{errors.model.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="requiredByDate">Required By Date *</Label>
            <Input
              id="requiredByDate"
              type="date"
              {...register("requiredByDate", { required: "Required by date is required" })}
            />
            {errors.requiredByDate && (
              <p className="text-sm text-red-600">{errors.requiredByDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="expectedReturnDate">Expected Return Date *</Label>
            <Input
              id="expectedReturnDate"
              type="date"
              {...register("expectedReturnDate", { required: "Expected return date is required" })}
            />
            {errors.expectedReturnDate && (
              <p className="text-sm text-red-600">{errors.expectedReturnDate.message}</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="recipientEmail">Recipient Email *</Label>
            <Input
              id="recipientEmail"
              type="email"
              {...register("recipientEmail", {
                required: "Recipient email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })}
              placeholder="recipient@example.com"
            />
            {errors.recipientEmail && (
              <p className="text-sm text-red-600">{errors.recipientEmail.message}</p>
            )}
          </div>
        </div>

        <div className="pt-4">
          <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Rental Request"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}