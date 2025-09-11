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
import { Plus, X, Upload, Github, ExternalLink, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIPFS } from "@/hooks/use-ipfs";
import {
  useHackathonStore,
  type Project,
  type TeamMember,
} from "@/stores/hackathon-store";
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";

// Form schemas
const teamMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  email: z.string().email("Valid email is required"),
});

const projectSchema = z.object({
  title: z.string().min(1, "Project title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  hackathonId: z.string().min(1, "Please select a hackathon"),
  trackId: z.string().min(1, "Please select a track"),
  repositoryUrl: z
    .string()
    .url("Valid repository URL is required")
    .optional()
    .or(z.literal("")),
  demoUrl: z
    .string()
    .url("Valid demo URL is required")
    .optional()
    .or(z.literal("")),
  videoUrl: z
    .string()
    .url("Valid video URL is required")
    .optional()
    .or(z.literal("")),
  team: z
    .array(teamMemberSchema)
    .min(1, "At least one team member is required"),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  hackathonId?: string;
  onSuccess?: (project: Project) => void;
}

export default function ProjectForm({
  hackathonId,
  onSuccess,
}: ProjectFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<ProjectFormData>>({});
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newMember, setNewMember] = useState<Partial<TeamMember>>({
    name: "",
    role: "",
    email: "",
  });

  const { setLoading, hackathons, fetchHackathonsFromIPFS } =
    useHackathonStore();
  const { uploadJSON } = useIPFS();
  const { user } = usePrivy();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      hackathonId: hackathonId || "",
      ...formData,
    },
  });

  const selectedHackathon = hackathons.find(
    (h) => h.id === watch("hackathonId")
  );

  const addTeamMember = () => {
    if (newMember.name && newMember.role && newMember.email) {
      const member: TeamMember = {
        id: Date.now().toString(),
        userId: user?.id || "",
        name: newMember.name,
        role: newMember.role,
        email: newMember.email,
      };
      setTeamMembers([...teamMembers, member]);
      setNewMember({ name: "", role: "", email: "" });
    }
  };

  const removeTeamMember = (id: string) => {
    setTeamMembers(teamMembers.filter((member) => member.id !== id));
  };

  const onSubmit = async (data: ProjectFormData) => {
    if (!user) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (teamMembers.length === 0) {
      toast.error("Please add at least one team member");
      return;
    }

    setLoading(true);
    try {
      // Upload project data to IPFS
      const projectData = {
        ...data,
        team: teamMembers,
        submittedAt: new Date().toISOString(),
        submittedBy: user.id,
      };

      const uploadResult = await uploadJSON(projectData, {
        name: `project-${Date.now()}`,
        keyvalues: {
          type: "project",
          hackathon: data.hackathonId,
          submitter: user.id,
        },
      });

      // Create project object
      const project: Project = {
        id: Date.now().toString(),
        title: data.title,
        description: data.description,
        team: teamMembers,
        hackathonId: data.hackathonId,
        trackId: data.trackId,
        repositoryUrl: data.repositoryUrl,
        demoUrl: data.demoUrl,
        videoUrl: data.videoUrl,
        ipfsHash: uploadResult.cid,
        submittedAt: new Date().toISOString(),
      };

      toast.success("Project submitted successfully!");

      // Refresh hackathons from IPFS to get updated project data
      await fetchHackathonsFromIPFS();

      if (onSuccess) {
        onSuccess(project);
      }
    } catch (error) {
      toast.error("Failed to submit project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Submit Project</h1>
        <p className="text-gray-600">
          Share your hackathon project with the community
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
            <CardDescription>
              Provide details about your project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Title</label>
              <Input
                {...register("title")}
                placeholder="Enter project title"
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
                placeholder="Describe your project..."
                rows={4}
                className={cn(errors.description && "border-red-500")}
              />
              {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Hackathon</label>
                <Select
                  value={watch("hackathonId")}
                  onValueChange={(value) => setValue("hackathonId", value)}
                >
                  <SelectTrigger
                    className={cn(errors.hackathonId && "border-red-500")}
                  >
                    <SelectValue placeholder="Select hackathon" />
                  </SelectTrigger>
                  <SelectContent>
                    {hackathons.map((hackathon) => (
                      <SelectItem key={hackathon.id} value={hackathon.id}>
                        {hackathon.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.hackathonId && (
                  <p className="text-sm text-red-500">
                    {errors.hackathonId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Track</label>
                <Select
                  value={watch("trackId")}
                  onValueChange={(value) => setValue("trackId", value)}
                  disabled={!selectedHackathon}
                >
                  <SelectTrigger
                    className={cn(errors.trackId && "border-red-500")}
                  >
                    <SelectValue placeholder="Select track" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedHackathon?.tracks.map((track) => (
                      <SelectItem key={track.id} value={track.id}>
                        {track.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.trackId && (
                  <p className="text-sm text-red-500">
                    {errors.trackId.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Project Links</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Github size={16} />
                    Repository URL
                  </label>
                  <Input
                    {...register("repositoryUrl")}
                    placeholder="https://github.com/..."
                    className={cn(errors.repositoryUrl && "border-red-500")}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <ExternalLink size={16} />
                    Demo URL
                  </label>
                  <Input
                    {...register("demoUrl")}
                    placeholder="https://demo.example.com"
                    className={cn(errors.demoUrl && "border-red-500")}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Video size={16} />
                    Video URL
                  </label>
                  <Input
                    {...register("videoUrl")}
                    placeholder="https://youtube.com/watch?v=..."
                    className={cn(errors.videoUrl && "border-red-500")}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Add your team members</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium">{member.name}</h4>
                      <p className="text-sm text-gray-600">{member.role}</p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTeamMember(member.id)}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 p-4 border border-dashed rounded-lg">
              <h4 className="font-medium">Add Team Member</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Name"
                  value={newMember.name}
                  onChange={(e) =>
                    setNewMember({ ...newMember, name: e.target.value })
                  }
                />
                <Input
                  placeholder="Role"
                  value={newMember.role}
                  onChange={(e) =>
                    setNewMember({ ...newMember, role: e.target.value })
                  }
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={newMember.email}
                  onChange={(e) =>
                    setNewMember({ ...newMember, email: e.target.value })
                  }
                />
              </div>
              <Button type="button" onClick={addTeamMember} className="w-full">
                <Plus size={16} className="mr-2" />
                Add Team Member
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={teamMembers.length === 0}>
            Submit Project
          </Button>
        </div>
      </form>
    </div>
  );
}
