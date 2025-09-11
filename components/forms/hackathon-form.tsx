"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  Plus,
  X,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useIPFS } from "@/hooks/use-ipfs";
import {
  useHackathonStore,
  type Hackathon,
  type Prize,
  type Judge,
  type Track,
} from "@/stores/hackathon-store";
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";

// Form schemas
const prizeSchema = z.object({
  title: z.string().min(1, "Prize title is required"),
  description: z.string().min(1, "Prize description is required"),
  amount: z.number().min(0, "Amount must be positive"),
  currency: z.string().min(1, "Currency is required"),
  position: z.number().min(1, "Position must be at least 1"),
});

const judgeSchema = z.object({
  name: z.string().min(1, "Judge name is required"),
  title: z.string().min(1, "Judge title is required"),
  company: z.string().min(1, "Company is required"),
  bio: z.string().min(1, "Bio is required"),
  twitter: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
});

const trackSchema = z.object({
  name: z.string().min(1, "Track name is required"),
  description: z.string().min(1, "Track description is required"),
  criteria: z.array(z.string()).min(1, "At least one criteria is required"),
});

const hackathonSchema = z.object({
  title: z.string().min(1, "Hackathon title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  startDate: z.date(),
  endDate: z.date(),
  registrationDeadline: z.date(),
  maxParticipants: z.number().optional(),
  requirements: z
    .array(z.string())
    .min(1, "At least one requirement is required"),
  rules: z.array(z.string()).min(1, "At least one rule is required"),
  prizes: z.array(prizeSchema).min(1, "At least one prize is required"),
  judges: z.array(judgeSchema).min(1, "At least one judge is required"),
  tracks: z.array(trackSchema).min(1, "At least one track is required"),
});

type HackathonFormData = z.infer<typeof hackathonSchema>;

interface StepProps {
  data: Partial<HackathonFormData>;
  onNext: (data: Partial<HackathonFormData>) => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
}

// Step 1: Basic Information
function BasicInfoStep({ data, onNext, isFirst, isLast }: StepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Partial<HackathonFormData>>({
    defaultValues: data,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const { uploadFile, isLoading: isUploading } = useIPFS();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (formData: Partial<HackathonFormData>) => {
    let imageUrl = "";

    if (imageFile) {
      try {
        const uploadResult = await uploadFile(imageFile, {
          name: `hackathon-${Date.now()}`,
          keyvalues: {
            type: "hackathon-image",
          },
        });
        imageUrl = uploadResult.url;
      } catch (error) {
        toast.error("Failed to upload image");
        return;
      }
    }

    onNext({
      ...formData,
      image: imageUrl,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>
          Provide the essential details about your hackathon
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Hackathon Title</label>
          <Input
            {...register("title")}
            placeholder="Enter hackathon title"
            className={cn(errors.title && "border-red-500")}
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <Textarea
            {...register("description")}
            placeholder="Describe your hackathon..."
            rows={4}
            className={cn(errors.description && "border-red-500")}
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Hackathon Image</label>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
              >
                <Upload size={16} />
                <span>Upload Image</span>
              </label>
            </div>
            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview("");
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Start Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !watch("startDate") && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {watch("startDate")
                    ? format(watch("startDate")!, "PPP")
                    : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={watch("startDate")}
                  onSelect={(date) => setValue("startDate", date!)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">End Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !watch("endDate") && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {watch("endDate")
                    ? format(watch("endDate")!, "PPP")
                    : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={watch("endDate")}
                  onSelect={(date) => setValue("endDate", date!)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Registration Deadline</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !watch("registrationDeadline") && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {watch("registrationDeadline")
                  ? format(watch("registrationDeadline")!, "PPP")
                  : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={watch("registrationDeadline")}
                onSelect={(date) => setValue("registrationDeadline", date!)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Max Participants (Optional)
          </label>
          <Input
            type="number"
            {...register("maxParticipants", { valueAsNumber: true })}
            placeholder="Leave empty for unlimited"
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Next"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Step 2: Prizes
function PrizesStep({ data, onNext, onPrev, isFirst, isLast }: StepProps) {
  const [prizes, setPrizes] = useState<Prize[]>(data.prizes || []);
  const [newPrize, setNewPrize] = useState<Partial<Prize>>({
    title: "",
    description: "",
    amount: 0,
    currency: "USD",
    position: 1,
  });

  const addPrize = () => {
    if (
      newPrize.title &&
      newPrize.description &&
      newPrize.amount &&
      newPrize.position
    ) {
      const prize: Prize = {
        id: Date.now().toString(),
        title: newPrize.title,
        description: newPrize.description,
        amount: newPrize.amount,
        currency: newPrize.currency || "USD",
        position: newPrize.position,
      };
      setPrizes([...prizes, prize]);
      setNewPrize({
        title: "",
        description: "",
        amount: 0,
        currency: "USD",
        position: prizes.length + 2,
      });
    }
  };

  const removePrize = (id: string) => {
    setPrizes(prizes.filter((prize) => prize.id !== id));
  };

  const handleNext = () => {
    if (prizes.length === 0) {
      toast.error("Please add at least one prize");
      return;
    }
    onNext({ ...data, prizes });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prizes</CardTitle>
        <CardDescription>Define the prizes for your hackathon</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {prizes.map((prize) => (
            <div key={prize.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium">{prize.title}</h4>
                  <p className="text-sm text-gray-600">{prize.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">Position {prize.position}</Badge>
                    <Badge variant="outline">
                      {prize.amount} {prize.currency}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePrize(prize.id)}
                >
                  <X size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4 p-4 border border-dashed rounded-lg">
          <h4 className="font-medium">Add New Prize</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Prize title"
              value={newPrize.title}
              onChange={(e) =>
                setNewPrize({ ...newPrize, title: e.target.value })
              }
            />
            <Input
              placeholder="Position"
              type="number"
              value={newPrize.position}
              onChange={(e) =>
                setNewPrize({
                  ...newPrize,
                  position: parseInt(e.target.value) || 1,
                })
              }
            />
            <Input
              placeholder="Amount"
              type="number"
              value={newPrize.amount}
              onChange={(e) =>
                setNewPrize({
                  ...newPrize,
                  amount: parseFloat(e.target.value) || 0,
                })
              }
            />
            <Input
              placeholder="Currency"
              value={newPrize.currency}
              onChange={(e) =>
                setNewPrize({ ...newPrize, currency: e.target.value })
              }
            />
          </div>
          <Textarea
            placeholder="Prize description"
            value={newPrize.description}
            onChange={(e) =>
              setNewPrize({ ...newPrize, description: e.target.value })
            }
          />
          <Button onClick={addPrize} className="w-full">
            <Plus size={16} className="mr-2" />
            Add Prize
          </Button>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrev}>
            Previous
          </Button>
          <Button onClick={handleNext}>Next</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Hackathon Form Component
export default function HackathonForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<HackathonFormData>>({});
  const { addHackathon, setLoading } = useHackathonStore();
  const { uploadJSON } = useIPFS();
  const { user } = usePrivy();

  const steps = [
    { title: "Basic Info", component: BasicInfoStep },
    { title: "Prizes", component: PrizesStep },
    // Add more steps here for judges, tracks, etc.
  ];

  const handleNext = (data: Partial<HackathonFormData>) => {
    setFormData({ ...formData, ...data });
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please connect your wallet first");
      return;
    }

    setLoading(true);
    try {
      // Upload hackathon data to IPFS
      const hackathonData = {
        ...formData,
        organizerId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const uploadResult = await uploadJSON(hackathonData, {
        name: `hackathon-${Date.now()}`,
        keyvalues: {
          type: "hackathon",
          organizer: user.id,
        },
      });

      // Create hackathon object
      const hackathon: Hackathon = {
        id: Date.now().toString(),
        title: formData.title!,
        description: formData.description!,
        image: formData.image || "",
        startDate: formData.startDate!.toISOString(),
        endDate: formData.endDate!.toISOString(),
        registrationDeadline: formData.registrationDeadline!.toISOString(),
        status: "upcoming",
        participants: 0,
        maxParticipants: formData.maxParticipants,
        prizes: formData.prizes!,
        judges: formData.judges || [],
        tracks: formData.tracks || [],
        requirements: formData.requirements!,
        rules: formData.rules!,
        ipfsHash: uploadResult.cid,
        organizerId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addHackathon(hackathon);
      toast.success("Hackathon created successfully!");

      // Reset form
      setCurrentStep(1);
      setFormData({});
    } catch (error) {
      toast.error("Failed to create hackathon");
    } finally {
      setLoading(false);
    }
  };

  const CurrentStepComponent = steps[currentStep - 1]?.component;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Hackathon</h1>
        <p className="text-gray-600">
          Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.title}
        </p>
      </div>

      {CurrentStepComponent && (
        <CurrentStepComponent
          data={formData}
          onNext={handleNext}
          onPrev={handlePrev}
          isFirst={currentStep === 1}
          isLast={currentStep === steps.length}
        />
      )}
    </div>
  );
}
