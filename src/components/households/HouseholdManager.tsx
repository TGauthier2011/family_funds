"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHouseholds } from "./HouseholdsProvider";
import { Clipboard, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter, useSearchParams } from "next/navigation";

const PENDING_JOIN_KEY = "family_funds_pending_join_code";

export function HouseholdManager() {
  const {
    households,
    activeHouseholdId,
    setActiveHousehold,
    createHousehold,
    createInvite,
    joinHousehold,
    leaveHousehold,
    userId,
  } = useHouseholds();
  const [householdName, setHouseholdName] = useState("");
  const [householdCode, setHouseholdCode] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [inviteQrUrl, setInviteQrUrl] = useState("");
  const [hasProcessedJoinCode, setHasProcessedJoinCode] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const scopeOptions = useMemo(
    () => [{ id: "personal", name: "Personal" }, ...households.map((h) => ({ id: h.id, name: h.name }))],
    [households]
  );

  const handleCreate = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      await createHousehold(householdName);
      setHouseholdName("");
      setMessage({ type: "success", text: "Household created and set active." });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to create household.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      await joinHousehold(householdCode);
      setHouseholdCode("");
      setMessage({ type: "success", text: "Joined household and set active." });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to join household.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!searchParams || hasProcessedJoinCode) return;
    const code = searchParams.get("joinCode");
    if (!code) return;
    setHouseholdCode(code);

    if (!userId) {
      window.localStorage.setItem(PENDING_JOIN_KEY, code);
      setMessage({ type: "error", text: "Sign in to join this household." });
      setHasProcessedJoinCode(true);
      return;
    }

    const runJoin = async () => {
      setIsLoading(true);
      setMessage(null);
      try {
        await joinHousehold(code);
        window.localStorage.removeItem(PENDING_JOIN_KEY);
        setMessage({ type: "success", text: "Joined household from invite link." });
        router.replace("/settings");
      } catch (error) {
        setMessage({
          type: "error",
          text: error instanceof Error ? error.message : "Failed to join household.",
        });
      } finally {
        setIsLoading(false);
        setHasProcessedJoinCode(true);
      }
    };

    runJoin();
  }, [searchParams, hasProcessedJoinCode, userId, joinHousehold, router]);

  useEffect(() => {
    if (!userId || hasProcessedJoinCode) return;
    const pendingCode = window.localStorage.getItem(PENDING_JOIN_KEY);
    if (!pendingCode) return;

    const runJoin = async () => {
      setIsLoading(true);
      setMessage(null);
      try {
        await joinHousehold(pendingCode);
        window.localStorage.removeItem(PENDING_JOIN_KEY);
        setMessage({ type: "success", text: "Joined household from invite link." });
      } catch (error) {
        setMessage({
          type: "error",
          text: error instanceof Error ? error.message : "Failed to join household.",
        });
      } finally {
        setIsLoading(false);
        setHasProcessedJoinCode(true);
      }
    };

    runJoin();
  }, [userId, hasProcessedJoinCode, joinHousehold]);

  const handleLeave = async (householdId: string) => {
    setIsLoading(true);
    setMessage(null);
    try {
      await leaveHousehold(householdId);
      setMessage({ type: "success", text: "You left the household." });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to leave household.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async (code: string) => {
    setMessage(null);
    try {
      await navigator.clipboard.writeText(code);
      setMessage({ type: "success", text: "Household code copied to clipboard." });
    } catch (error) {
      setMessage({
        type: "error",
        text: "Unable to copy code. Please copy it manually.",
      });
    }
  };

  const handleInviteMember = async (householdId: string, householdName: string) => {
    setIsLoading(true);
    setMessage(null);
    try {
      const code = await createInvite(householdId);
      const url = `${window.location.origin}/settings?joinCode=${encodeURIComponent(code)}`;
      const qr = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}`;
      setInviteCode(code);
      setInviteUrl(url);
      setInviteQrUrl(qr);
      setIsInviteOpen(true);
      setMessage({ type: "success", text: `Invite created for ${householdName}.` });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to create invite.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Households</CardTitle>
        <CardDescription>
          Create or join a household to share bills, and switch between personal and shared views.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!userId && (
          <Alert variant="destructive">
            <AlertDescription>Sign in to create or join a household.</AlertDescription>
          </Alert>
        )}

        {message && (
          <Alert variant={message.type === "error" ? "destructive" : "default"}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="household-name">Create household</Label>
            <Input
              id="household-name"
              placeholder="e.g. The Smiths"
              value={householdName}
              onChange={(event) => setHouseholdName(event.target.value)}
              disabled={!userId || isLoading}
            />
            <Button type="button" onClick={handleCreate} disabled={!userId || isLoading}>
              Create household
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="household-code">Join household</Label>
            <Input
              id="household-code"
              placeholder="Paste household code"
              value={householdCode}
              onChange={(event) => setHouseholdCode(event.target.value)}
              disabled={!userId || isLoading}
            />
            <Button type="button" variant="outline" onClick={handleJoin} disabled={!userId || isLoading}>
              Join household
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Active billing scope</Label>
          <Select
            value={activeHouseholdId ?? "personal"}
            onValueChange={(value) => setActiveHousehold(value === "personal" ? null : value)}
          >
            <SelectTrigger className="max-w-sm">
              <SelectValue placeholder="Select scope" />
            </SelectTrigger>
            <SelectContent>
              {scopeOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-medium">Your households</div>
          {households.length === 0 ? (
            <p className="text-sm text-muted-foreground">No shared households yet.</p>
          ) : (
            <div className="space-y-2">
              {households.map((household) => (
                <div
                  key={household.id}
                  className="flex flex-col gap-2 rounded-lg border p-3 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{household.name}</span>
                      <Badge variant="outline">{household.role}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">Code: {household.id}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveHousehold(household.id)}
                    >
                      Set active
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleInviteMember(household.id, household.name)}
                      disabled={isLoading}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add member
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyCode(household.id)}
                    >
                      <Clipboard className="mr-2 h-4 w-4" />
                      Copy code
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLeave(household.id)}
                      disabled={isLoading || household.role === "owner"}
                    >
                      Leave
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite a member</DialogTitle>
            <DialogDescription>
              This invite expires in 10 minutes. Share the code or have them scan the QR.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Invite code</Label>
              <div className="flex gap-2">
                <Input value={inviteCode} readOnly />
                <Button type="button" variant="outline" onClick={() => handleCopyCode(inviteCode)}>
                  <Clipboard className="mr-2 h-4 w-4" />
                  Copy
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Invite link</Label>
              <div className="flex gap-2">
                <Input value={inviteUrl} readOnly />
                <Button type="button" variant="outline" onClick={() => handleCopyCode(inviteUrl)}>
                  <Clipboard className="mr-2 h-4 w-4" />
                  Copy link
                </Button>
              </div>
            </div>
            {inviteQrUrl && (
              <div className="flex flex-col items-center gap-2">
                <img src={inviteQrUrl} alt="Household invite QR code" className="h-48 w-48 rounded-md border" />
                <span className="text-xs text-muted-foreground">Scan to join this household</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
