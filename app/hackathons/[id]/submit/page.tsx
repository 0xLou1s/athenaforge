"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import ProjectForm from "@/components/forms/project-form";
import { useHackathonStore, type Hackathon } from "@/stores/hackathon-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function SubmitProjectToHackathonPage() {
  const params = useParams();
  const hackathonId = params.id as string;
  const { hackathons, fetchHackathonsFromIPFS } = useHackathonStore();
  const { user, authenticated } = usePrivy();
  const [isLoading, setIsLoading] = useState(true);
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  const [checkingRegistration, setCheckingRegistration] = useState(false);

  const hackathon = hackathons.find((h) => h.id === hackathonId);

  // Check if user is registered for this hackathon
  const checkUserRegistration = async () => {
    if (!hackathonId || !user?.id || !authenticated) {
      setIsUserRegistered(false);
      return;
    }

    setCheckingRegistration(true);

    try {
      const response = await fetch(
        `/api/hackathons/${hackathonId}/check-registration`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
          }),
        }
      );

      const result = await response.json();
      setIsUserRegistered(result.isRegistered || false);
    } catch (error) {
      setIsUserRegistered(false);
    } finally {
      setCheckingRegistration(false);
    }
  };

  useEffect(() => {
    const loadHackathons = async () => {
      if (hackathons.length === 0) {
        await fetchHackathonsFromIPFS();
      }
      setIsLoading(false);
    };

    loadHackathons();
  }, [hackathons.length, fetchHackathonsFromIPFS]);

  useEffect(() => {
    if (hackathon && authenticated && user?.id) {
      checkUserRegistration();
    }
  }, [hackathon, authenticated, user?.id]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <p>Loading hackathon...</p>
        </div>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Hackathon Not Found</h2>
              <p className="text-gray-600 mb-4">
                The hackathon you're looking for doesn't exist or hasn't loaded
                yet.
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild variant="outline">
                  <Link href="/hackathons">Back to Hackathons</Link>
                </Button>
                <Button asChild>
                  <Link href="/submit-project">Submit to Any Hackathon</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Hackathon Info Header */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-lg font-semibold text-blue-900 mb-1">
          Submitting to: {hackathon.title}
        </h2>
        <p className="text-blue-700 text-sm">{hackathon.description}</p>
        <div className="mt-2">
          <Link
            href={`/hackathons/${hackathonId}`}
            className="text-blue-600 hover:text-blue-800 text-sm underline"
          >
            View Hackathon Details →
          </Link>
        </div>
      </div>

      {/* Authentication Check */}
      {!authenticated && (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You need to log in to submit a project to this hackathon.
          </AlertDescription>
        </Alert>
      )}

      {/* Registration Check */}
      {authenticated && !checkingRegistration && !isUserRegistered && (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              You must register for this hackathon before submitting a project.
            </span>
            <Button asChild size="sm">
              <Link href={`/hackathons/${hackathonId}`}>Register Now</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Registration Checking */}
      {authenticated && checkingRegistration && (
        <Alert className="mb-6">
          <AlertDescription>
            Checking your registration status...
          </AlertDescription>
        </Alert>
      )}

      {/* Project Form - Only show if user is registered */}
      {authenticated && !checkingRegistration && isUserRegistered && (
        <ProjectForm
          hackathonId={hackathonId}
          onSuccess={(project) => {
            // Redirect to hackathon detail page after successful submission
            window.location.href = `/hackathons/${hackathonId}`;
          }}
        />
      )}

      {/* Alternative: Submit to any hackathon if not registered */}
      {authenticated && !checkingRegistration && !isUserRegistered && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Alternative Option</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              You can also submit your project to any active hackathon without
              pre-registration.
            </p>
            <Button asChild>
              <Link href="/submit-project">Submit to Any Hackathon</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
