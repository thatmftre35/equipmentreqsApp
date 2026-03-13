import { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Combobox } from "./ui/combobox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { Loader2, Plus, Trash2, Wrench } from "lucide-react";

type EquipmentItem = {
  equipmentType: string;
  model: string;
  requiredByDate: string;
  expectedReturnDate: string;
};

type OwnedEquipmentFormData = {
  name: string;
  project: string;
  equipment: EquipmentItem[];
  recipientEmail: string;
};

type EquipmentData = {
  type: string;
  models: string[];
};

export function OwnedEquipmentForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState<string[]>([]);
  const [equipmentData, setEquipmentData] = useState<EquipmentData[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingEquipment, setIsLoadingEquipment] = useState(true);
  
  const { register, handleSubmit, formState: { errors }, control, reset, watch } = useForm<OwnedEquipmentFormData>({
    defaultValues: {
      equipment: [{ equipmentType: "", model: "", requiredByDate: "", expectedReturnDate: "" }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "equipment"
  });

  const equipmentItems = watch("equipment");

  useEffect(() => {
    loadProjects();
    loadEquipment();
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

  const loadEquipment = async () => {
    setIsLoadingEquipment(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-927e49ee/equipment`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` }
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch equipment");
      }
      
      const data = await response.json();
      setEquipmentData(data.equipment || []);
    } catch (error) {
      console.error("Error loading equipment:", error);
      toast.error("Failed to load equipment");
    } finally {
      setIsLoadingEquipment(false);
    }
  };

  const getModelsForType = (type: string): string[] => {
    const equipment = equipmentData.find(e => e.type === type);
    return equipment ? equipment.models : [];
  };

  const onSubmit = async (data: OwnedEquipmentFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-927e49ee/submit-owned`,
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
        throw new Error(errorData.error || "Failed to submit owned equipment request");
      }

      toast.success("Owned equipment request submitted successfully!");
      // Reset form
      reset();
    } catch (error: any) {
      console.error("Error submitting owned equipment request:", error);
      toast.error(error.message || "Failed to submit owned equipment request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Owned Equipment Request</h2>
      <p className="text-sm text-gray-600 mb-6">
        Request one or more pieces of owned equipment for your project.
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
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Equipment Items</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ equipmentType: "", model: "", requiredByDate: "", expectedReturnDate: "" })}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Equipment
            </Button>
          </div>

          {isLoadingEquipment ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Equipment #{index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`equipment.${index}.equipmentType`}>Equipment Type *</Label>
                      <Controller
                        name={`equipment.${index}.equipmentType` as const}
                        control={control}
                        rules={{ required: "Equipment type is required" }}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value);
                              // Reset model when type changes
                              const currentModel = equipmentItems[index]?.model;
                              if (currentModel) {
                                control._formValues.equipment[index].model = "";
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select equipment type" />
                            </SelectTrigger>
                            <SelectContent>
                              {equipmentData.length === 0 ? (
                                <SelectItem value="none" disabled>
                                  No equipment available. Add equipment in Manage Equipment tab.
                                </SelectItem>
                              ) : (
                                equipmentData.map((equipment) => (
                                  <SelectItem key={equipment.type} value={equipment.type}>
                                    {equipment.type}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.equipment?.[index]?.equipmentType && (
                        <p className="text-sm text-red-600">{errors.equipment[index]?.equipmentType?.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`equipment.${index}.model`}>Model *</Label>
                      <Controller
                        name={`equipment.${index}.model` as const}
                        control={control}
                        rules={{ required: "Model is required" }}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={!equipmentItems[index]?.equipmentType}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select model" />
                            </SelectTrigger>
                            <SelectContent>
                              {getModelsForType(equipmentItems[index]?.equipmentType).length === 0 ? (
                                <SelectItem value="none" disabled>
                                  {equipmentItems[index]?.equipmentType ? "No models available" : "Select equipment type first"}
                                </SelectItem>
                              ) : (
                                getModelsForType(equipmentItems[index]?.equipmentType).map((model) => (
                                  <SelectItem key={model} value={model}>
                                    {model}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.equipment?.[index]?.model && (
                        <p className="text-sm text-red-600">{errors.equipment[index]?.model?.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`equipment.${index}.requiredByDate`}>Required By Date *</Label>
                      <Input
                        id={`equipment.${index}.requiredByDate`}
                        type="date"
                        {...register(`equipment.${index}.requiredByDate`, {
                          required: "Required by date is required"
                        })}
                      />
                      {errors.equipment?.[index]?.requiredByDate && (
                        <p className="text-sm text-red-600">{errors.equipment[index]?.requiredByDate?.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`equipment.${index}.expectedReturnDate`}>Expected Return Date *</Label>
                      <Input
                        id={`equipment.${index}.expectedReturnDate`}
                        type="date"
                        {...register(`equipment.${index}.expectedReturnDate`, {
                          required: "Expected return date is required"
                        })}
                      />
                      {errors.equipment?.[index]?.expectedReturnDate && (
                        <p className="text-sm text-red-600">{errors.equipment[index]?.expectedReturnDate?.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
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

        <div className="pt-4">
          <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Owned Equipment Request"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}