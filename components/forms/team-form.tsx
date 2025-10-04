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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, X, Users, Code, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTeams } from "@/hooks/use-teams";
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Team } from "@/types/hackathon";

// Form schema
const teamSchema = z.object({
  name: z
    .string()
    .min(1, "Team name is required")
    .max(50, "Team name too long"),
  description: z.string().max(500, "Description too long").optional(),
  maxMembers: z.number().min(2, "At least 2 members").max(10, "Max 10 members"),
  isPublic: z.boolean(),
  skills: z.array(z.string()).optional(),
  lookingFor: z.array(z.string()).optional(),
});

type TeamFormData = z.infer<typeof teamSchema>;

interface TeamFormProps {
  hackathonId: string;
  onSuccess?: (team: Team) => void;
  onCancel?: () => void;
}

const COMMON_SKILLS = [
  "Frontend Development",
  "Backend Development",
  "UI/UX Design",
  "Mobile Development",
  "Blockchain",
  "Smart Contracts",
  "DevOps",
  "Data Science",
  "Machine Learning",
  "Product Management",
  "Marketing",
  "Business Development",
];

const COMMON_LOOKING_FOR = [
  "Frontend Developer",
  "Backend Developer",
  "UI/UX Designer",
  "Mobile Developer",
  "Blockchain Developer",
  "Data Scientist",
  "Product Manager",
  "Marketing Specialist",
  "Business Analyst",
  "DevOps Engineer",
];

export default function TeamForm({
  hackathonId,
  onSuccess,
  onCancel,
}: TeamFormProps) {
  const [skills, setSkills] = useState<string[]>([]);
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [newLookingFor, setNewLookingFor] = useState("");

  const { createTeam, isLoading } = useTeams();
  const { user } = usePrivy();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      maxMembers: 4,
      isPublic: true,
    },
  });

  const addSkill = (skill: string) => {
    if (skill && !skills.includes(skill)) {
      const updatedSkills = [...skills, skill];
      setSkills(updatedSkills);
      setValue("skills", updatedSkills);
    }
    setNewSkill("");
  };

  const removeSkill = (skillToRemove: string) => {
    const updatedSkills = skills.filter((skill) => skill !== skillToRemove);
    setSkills(updatedSkills);
    setValue("skills", updatedSkills);
  };

  const addLookingFor = (role: string) => {
    if (role && !lookingFor.includes(role)) {
      const updatedLookingFor = [...lookingFor, role];
      setLookingFor(updatedLookingFor);
      setValue("lookingFor", updatedLookingFor);
    }
    setNewLookingFor("");
  };

  const removeLookingFor = (roleToRemove: string) => {
    const updatedLookingFor = lookingFor.filter(
      (role) => role !== roleToRemove
    );
    setLookingFor(updatedLookingFor);
    setValue("lookingFor", updatedLookingFor);
  };

  const onSubmit = async (data: TeamFormData) => {
    if (!user) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      const teamData = {
        ...data,
        description: data.description || "",
        hackathonId,
        leaderId: user.id,
        members: [
          {
            id: Date.now().toString(),
            userId: user.id,
            name: String(user.email) || "Team Leader",
            role: "Leader",
            joinedAt: new Date().toISOString(),
            skills: skills,
          }
        ],
        inviteCode: Math.random().toString(36).substr(2, 8).toUpperCase(),
        skills,
        lookingFor,
      };

      const newTeam = await createTeam(teamData);

      toast.success("Team created successfully!");

      if (onSuccess) {
        onSuccess(newTeam);
      } else {
        router.push(`/hackathons/${hackathonId}`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create team";
      toast.error(errorMessage);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl flex items-center gap-2">
          <Users className="h-6 w-6" />
          Create Team
        </CardTitle>
        <CardDescription>
          Form a team to participate in this hackathon together
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Team Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Team Name *</label>
            <Input
              {...register("name")}
              placeholder="Enter your team name"
              className={cn(errors.name && "border-red-500")}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              {...register("description")}
              placeholder="Describe your team's vision and goals..."
              rows={3}
              className={cn(errors.description && "border-red-500")}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Team Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Max Members</label>
              <Select
                value={watch("maxMembers")?.toString()}
                onValueChange={(value) =>
                  setValue("maxMembers", parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select max members" />
                </SelectTrigger>
                <SelectContent>
                  {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} members
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Team Visibility</label>
              <div className="flex items-center space-x-2 p-3 border rounded-md">
                <Switch
                  checked={watch("isPublic")}
                  onCheckedChange={(checked) => setValue("isPublic", checked)}
                />
                <span className="text-sm">
                  {watch("isPublic") ? "Public" : "Private"}
                </span>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-4">
            <label className="text-sm font-medium flex items-center gap-2">
              <Code className="h-4 w-4" />
              Team Skills
            </label>

            {/* Current Skills */}
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X size={12} />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Add Skills */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), addSkill(newSkill))
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addSkill(newSkill)}
                  disabled={!newSkill}
                >
                  <Plus size={16} />
                </Button>
              </div>

              {/* Common Skills */}
              <div className="flex flex-wrap gap-1">
                {COMMON_SKILLS.filter((skill) => !skills.includes(skill))
                  .slice(0, 6)
                  .map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => addSkill(skill)}
                      className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      + {skill}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Looking For */}
          <div className="space-y-4">
            <label className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Looking For
            </label>

            {/* Current Looking For */}
            {lookingFor.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {lookingFor.map((role) => (
                  <Badge
                    key={role}
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    {role}
                    <button
                      type="button"
                      onClick={() => removeLookingFor(role)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X size={12} />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Add Looking For */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Looking for..."
                  value={newLookingFor}
                  onChange={(e) => setNewLookingFor(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), addLookingFor(newLookingFor))
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addLookingFor(newLookingFor)}
                  disabled={!newLookingFor}
                >
                  <Plus size={16} />
                </Button>
              </div>

              {/* Common Roles */}
              <div className="flex flex-wrap gap-1">
                {COMMON_LOOKING_FOR.filter((role) => !lookingFor.includes(role))
                  .slice(0, 6)
                  .map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => addLookingFor(role)}
                      className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      + {role}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Team"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
