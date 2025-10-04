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
import { useHackathonStore } from "@/stores/hackathon-store";
import type { 
  Hackathon, 
  Prize, 
  Judge, 
  Track 
} from "@/types/hackathon";
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Hackathon, Prize } from "@/stores";

// Form schemas
const prizeSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Prize title is required"),
  description: z.string().min(1, "Prize description is required"),
  amount: z.number().min(0, "Amount must be positive"),
  currency: z.string().min(1, "Currency is required"),
  position: z.number().min(1, "Position must be at least 1"),
});

const judgeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Judge name is required"),
  title: z.string().min(1, "Judge title is required"),
  company: z.string().min(1, "Company is required"),
  bio: z.string().min(1, "Bio is required"),
  avatar: z.string().optional(),
  twitter: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
});

const trackSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Track name is required"),
  description: z.string().min(1, "Track description is required"),
  criteria: z.array(z.string()).min(1, "At least one criteria is required"),
});

const hackathonSchema = z.object({
  title: z.string().min(1, "Hackathon title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  image: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  registrationDeadline: z.date(),
  maxParticipants: z.number().optional(),
  requirements: z.array(z.string()).optional(),
  rules: z.array(z.string()).optional(),
  prizes: z.array(prizeSchema).min(1, "At least one prize is required"),
  judges: z.array(judgeSchema).optional(),
  tracks: z.array(trackSchema).optional(),
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
    <Card className="shadow-none border border-dashed">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Basic Information</CardTitle>
        <CardDescription className="text-base">
          Provide the essential details about your hackathon
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
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

        <div className="space-y-4">
          <label className="text-sm font-medium">
            Hackathon Image (Optional)
          </label>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
            />
            {imagePreview ? (
              <div className="space-y-4">
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg mx-auto"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview("");
                    }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                <label
                  htmlFor="image-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer transition-colors"
                >
                  <ImageIcon size={16} />
                  Change Image
                </label>
              </div>
            ) : (
              <label htmlFor="image-upload" className="cursor-pointer block">
                <div className="mx-auto w-12 h-12 text-muted-foreground mb-4">
                  <ImageIcon size={48} />
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  Click to upload hackathon image
                </div>
                <div className="text-xs text-muted-foreground">
                  PNG, JPG, GIF up to 10MB
                </div>
              </label>
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
  const [prizes, setPrizes] = useState<Prize[]>(
    (data.prizes || []).map((prize, index) => ({
      ...prize,
      id: prize.id || `prize-${index}`,
    }))
  );
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
    <Card className="shadow-none border-0">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Prizes</CardTitle>
        <CardDescription className="text-base">
          Define the prizes for your hackathon
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
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

// Step 3: Tracks
function TracksStep({ data, onNext, onPrev, isFirst, isLast }: StepProps) {
  const [tracks, setTracks] = useState<Track[]>(
    (data.tracks || []).map((track, index) => ({
      ...track,
      id: track.id || `track-${index}`,
    }))
  );
  const [newTrack, setNewTrack] = useState<Partial<Track>>({
    name: "",
    description: "",
    criteria: [],
  });
  const [newCriteria, setNewCriteria] = useState("");

  const addCriteria = () => {
    if (newCriteria.trim()) {
      setNewTrack({
        ...newTrack,
        criteria: [...(newTrack.criteria || []), newCriteria.trim()],
      });
      setNewCriteria("");
    }
  };

  const removeCriteria = (index: number) => {
    setNewTrack({
      ...newTrack,
      criteria: (newTrack.criteria || []).filter((_, i) => i !== index),
    });
  };

  const addTrack = () => {
    if (
      newTrack.name &&
      newTrack.description &&
      newTrack.criteria &&
      newTrack.criteria.length > 0
    ) {
      const track: Track = {
        id: Date.now().toString(),
        name: newTrack.name,
        description: newTrack.description,
        criteria: newTrack.criteria,
      };
      setTracks([...tracks, track]);
      setNewTrack({
        name: "",
        description: "",
        criteria: [],
      });
    }
  };

  const removeTrack = (id: string) => {
    setTracks(tracks.filter((track) => track.id !== id));
  };

  const handleNext = () => {
    onNext({ ...data, tracks });
  };

  return (
    <Card className="shadow-none border-0">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Tracks</CardTitle>
        <CardDescription className="text-base">
          Define competition tracks for your hackathon (optional)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
          {tracks.map((track) => (
            <div key={track.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium">{track.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{track.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {track.criteria.map((criteria, index) => (
                      <Badge key={index} variant="outline">
                        {criteria}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTrack(track.id)}
                >
                  <X size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4 p-4 border border-dashed rounded-lg">
          <h4 className="font-medium">Add New Track</h4>
          <div className="space-y-4">
            <Input
              placeholder="Track name (e.g., Web3, AI/ML, Mobile)"
              value={newTrack.name}
              onChange={(e) =>
                setNewTrack({ ...newTrack, name: e.target.value })
              }
            />
            <Textarea
              placeholder="Track description"
              value={newTrack.description}
              onChange={(e) =>
                setNewTrack({ ...newTrack, description: e.target.value })
              }
            />
            
            {/* Criteria Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Judging Criteria</label>
              <div className="space-y-2">
                {(newTrack.criteria || []).map((criteria, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 border rounded"
                  >
                    <span className="flex-1">{criteria}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCriteria(index)}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add judging criteria (e.g., Innovation, Technical Implementation)"
                  value={newCriteria}
                  onChange={(e) => setNewCriteria(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addCriteria()}
                />
                <Button onClick={addCriteria}>
                  <Plus size={16} />
                </Button>
              </div>
            </div>
          </div>
          <Button 
            onClick={addTrack} 
            className="w-full"
            disabled={!newTrack.name || !newTrack.description || (newTrack.criteria || []).length === 0}
          >
            <Plus size={16} className="mr-2" />
            Add Track
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

// Interface for new judge form
interface NewJudgeForm {
  name: string;
  title: string;
  company: string;
  bio: string;
  avatar: string;
  twitter: string;
  linkedin: string;
  github: string;
}

// Step 4: Judges
function JudgesStep({ data, onNext, onPrev, isFirst, isLast }: StepProps) {
  const [judges, setJudges] = useState<Judge[]>(
    (data.judges || []).map((judge, index) => {
      const judgeData = judge as any; // Cast to any to access potential socialLinks
      return {
        id: judge.id || `judge-${index}`,
        name: judge.name || "",
        title: judge.title || "",
        company: judge.company || "",
        bio: judge.bio || "",
        avatar: judge.avatar || "",
        socialLinks: {
          twitter: judgeData.socialLinks?.twitter || "",
          linkedin: judgeData.socialLinks?.linkedin || "",
          github: judgeData.socialLinks?.github || "",
        },
      };
    })
  );
  const [newJudge, setNewJudge] = useState<NewJudgeForm>({
    name: "",
    title: "",
    company: "",
    bio: "",
    avatar: "",
    twitter: "",
    linkedin: "",
    github: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const { uploadFile, isLoading: isUploading } = useIPFS();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addJudge = async () => {
    if (
      newJudge.name &&
      newJudge.title &&
      newJudge.company &&
      newJudge.bio
    ) {
      let avatarUrl = "";

      if (avatarFile) {
        try {
          const uploadResult = await uploadFile(avatarFile, {
            name: `judge-avatar-${Date.now()}`,
            keyvalues: {
              type: "judge-avatar",
            },
          });
          avatarUrl = uploadResult.url;
        } catch (error) {
          toast.error("Failed to upload avatar");
          return;
        }
      }

      const judge: Judge = {
        id: Date.now().toString(),
        name: newJudge.name,
        title: newJudge.title,
        company: newJudge.company,
        bio: newJudge.bio,
        avatar: avatarUrl,
        socialLinks: {
          twitter: newJudge.twitter || "",
          linkedin: newJudge.linkedin || "",
          github: newJudge.github || "",
        },
      };
      setJudges([...judges, judge]);
      setNewJudge({
        name: "",
        title: "",
        company: "",
        bio: "",
        avatar: "",
        twitter: "",
        linkedin: "",
        github: "",
      });
      setAvatarFile(null);
      setAvatarPreview("");
    }
  };

  const removeJudge = (id: string) => {
    setJudges(judges.filter((judge) => judge.id !== id));
  };

  const handleNext = () => {
    onNext({ ...data, judges });
  };

  return (
    <Card className="shadow-none border-0">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Judges</CardTitle>
        <CardDescription className="text-base">
          Add judges for your hackathon (optional)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
          {judges.map((judge) => (
            <div key={judge.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex gap-4 flex-1">
                  {judge.avatar && (
                    <img
                      src={judge.avatar}
                      alt={judge.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium">{judge.name}</h4>
                    <p className="text-sm text-gray-600">
                      {judge.title} at {judge.company}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{judge.bio}</p>
                    <div className="flex gap-2 mt-2">
                      {judge.socialLinks.twitter && (
                        <Badge variant="outline">Twitter</Badge>
                      )}
                      {judge.socialLinks.linkedin && (
                        <Badge variant="outline">LinkedIn</Badge>
                      )}
                      {judge.socialLinks.github && (
                        <Badge variant="outline">GitHub</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeJudge(judge.id)}
                >
                  <X size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4 p-4 border border-dashed rounded-lg">
          <h4 className="font-medium">Add New Judge</h4>
          <div className="space-y-4">
            {/* Avatar Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Avatar (Optional)</label>
              <div className="flex items-center gap-4">
                {avatarPreview && (
                  <img
                    src={avatarPreview}
                    alt="Preview"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Judge name"
                value={newJudge.name}
                onChange={(e) =>
                  setNewJudge({ ...newJudge, name: e.target.value })
                }
              />
              <Input
                placeholder="Title"
                value={newJudge.title}
                onChange={(e) =>
                  setNewJudge({ ...newJudge, title: e.target.value })
                }
              />
              <Input
                placeholder="Company"
                value={newJudge.company}
                onChange={(e) =>
                  setNewJudge({ ...newJudge, company: e.target.value })
                }
              />
            </div>
            
            <Textarea
              placeholder="Bio"
              value={newJudge.bio}
              onChange={(e) =>
                setNewJudge({ ...newJudge, bio: e.target.value })
              }
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Twitter handle"
                value={newJudge.twitter}
                onChange={(e) =>
                  setNewJudge({ ...newJudge, twitter: e.target.value })
                }
              />
              <Input
                placeholder="LinkedIn profile"
                value={newJudge.linkedin}
                onChange={(e) =>
                  setNewJudge({ ...newJudge, linkedin: e.target.value })
                }
              />
              <Input
                placeholder="GitHub username"
                value={newJudge.github}
                onChange={(e) =>
                  setNewJudge({ ...newJudge, github: e.target.value })
                }
              />
            </div>
          </div>
          <Button 
            onClick={addJudge} 
            className="w-full"
            disabled={!newJudge.name || !newJudge.title || !newJudge.company || !newJudge.bio || isUploading}
          >
            <Plus size={16} className="mr-2" />
            {isUploading ? "Uploading..." : "Add Judge"}
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

// Step 5: Requirements & Rules
function RequirementsStep({
  data,
  onNext,
  onPrev,
  isFirst,
  isLast,
  isSubmitting,
}: StepProps & { isSubmitting?: boolean }) {
  const [requirements, setRequirements] = useState<string[]>(
    data.requirements || []
  );
  const [rules, setRules] = useState<string[]>(data.rules || []);
  const [newRequirement, setNewRequirement] = useState("");
  const [newRule, setNewRule] = useState("");

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setRequirements([...requirements, newRequirement.trim()]);
      setNewRequirement("");
    }
  };

  const removeRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const addRule = () => {
    if (newRule.trim()) {
      setRules([...rules, newRule.trim()]);
      setNewRule("");
    }
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    onNext({ ...data, requirements, rules });
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Requirements & Rules</CardTitle>
        <CardDescription className="text-base">
          Define the requirements and rules for your hackathon (optional)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Requirements Section */}
        <div className="space-y-4">
          <h4 className="font-medium">Requirements</h4>
          <div className="space-y-2">
            {requirements.map((requirement, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 border rounded"
              >
                <span className="flex-1">{requirement}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRequirement(index)}
                >
                  <X size={16} />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add a requirement"
              value={newRequirement}
              onChange={(e) => setNewRequirement(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addRequirement()}
            />
            <Button onClick={addRequirement}>
              <Plus size={16} />
            </Button>
          </div>
        </div>

        {/* Rules Section */}
        <div className="space-y-4">
          <h4 className="font-medium">Rules</h4>
          <div className="space-y-2">
            {rules.map((rule, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 border rounded"
              >
                <span className="flex-1">{rule}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRule(index)}
                >
                  <X size={16} />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add a rule"
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addRule()}
            />
            <Button onClick={addRule}>
              <Plus size={16} />
            </Button>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrev}>
            Previous
          </Button>
          <Button onClick={handleNext} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Hackathon"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Hackathon Form Component
export default function HackathonForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<HackathonFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setLoading, fetchHackathonsFromIPFS } = useHackathonStore();
  const { uploadJSON } = useIPFS();
  const { user } = usePrivy();
  const router = useRouter();

  const steps = [
    { title: "Basic Info", component: BasicInfoStep },
    { title: "Prizes", component: PrizesStep },
    { title: "Tracks", component: TracksStep },
    { title: "Judges", component: JudgesStep },
    { title: "Requirements & Rules", component: RequirementsStep },
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

    if (isSubmitting) {
      return; // Prevent multiple submissions
    }

    setIsSubmitting(true);
    setLoading(true);
    try {
      // Prepare hackathon data
      const hackathonData = {
        ...formData,
        organizerId: user.id,
        startDate: formData.startDate?.toISOString(),
        endDate: formData.endDate?.toISOString(),
        registrationDeadline: formData.registrationDeadline?.toISOString(),
      };

      // Call API to create hackathon
      const response = await fetch("/api/hackathons/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(hackathonData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create hackathon");
      }

      const result = await response.json();

      toast.success("Hackathon created successfully!");

      // Refresh hackathons from IPFS
      await fetchHackathonsFromIPFS();

      // Reset form
      setCurrentStep(1);
      setFormData({});

      // Redirect to hackathons page
      router.push("/hackathons");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create hackathon";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const CurrentStepComponent = steps[currentStep - 1]?.component;

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header with Progress */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Hackathon</h1>
        <p className="text-muted-foreground mb-6">
          Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.title}
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2 mb-6">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between mb-8">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  index + 1 < currentStep
                    ? "bg-primary text-primary-foreground"
                    : index + 1 === currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {index + 1}
              </div>
              <span className="text-xs mt-2 text-center">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      {CurrentStepComponent && (
        <CurrentStepComponent
          data={formData}
          onNext={handleNext}
          onPrev={handlePrev}
          isFirst={currentStep === 1}
          isLast={currentStep === steps.length}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}