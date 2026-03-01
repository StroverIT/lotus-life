"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { PricingTierData } from "@/lib/pricing";
import type { UserRow } from "./UsersTab";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface AssignmentRow {
  userId: string;
  tierId: string;
  userEmail?: string;
  userName?: string;
  tierName?: string;
  validFrom?: string;
  validTo?: string;
}

function TiersSubTab() {
  const [tiers, setTiers] = useState<PricingTierData[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<PricingTierData>>({
    name: "",
    price: 0,
    features: [],
    highlighted: false,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [featuresText, setFeaturesText] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/tiers");
    if (res.ok) {
      const data = await res.json();
      setTiers(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveTier = async () => {
    if (!form.name || typeof form.price !== "number") return;
    const features = featuresText.split("\n").map((f) => f.trim()).filter(Boolean);
    const url = editingId ? `/api/admin/tiers/${editingId}` : "/api/admin/tiers";
    const method = editingId ? "PUT" : "POST";
    const body = editingId ? { ...form, features } : { ...form, id: form.id, features };
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      await load();
      setOpen(false);
      setEditingId(null);
      setForm({ name: "", price: 0, features: [], highlighted: false });
      setFeaturesText("");
    }
  };

  const doDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/admin/tiers/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      await load();
      setDeleteId(null);
    }
  };

  const openEdit = (t: PricingTierData) => {
    setForm(t);
    setFeaturesText(t.features.join("\n"));
    setEditingId(t.id);
    setOpen(true);
  };

  if (loading) return <p className="text-charcoal-light">Loading tiers…</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setEditingId(null); setForm({ name: "", price: 0, features: [], highlighted: false }); setFeaturesText(""); setOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add tier
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Features</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tiers.map((t) => (
            <TableRow key={t.id}>
              <TableCell>{t.id}</TableCell>
              <TableCell>{t.name}</TableCell>
              <TableCell>€{t.price}</TableCell>
              <TableCell className="max-w-[200px] truncate">{t.features.join(", ")}</TableCell>
              <TableCell>
                <Button size="sm" variant="ghost" onClick={() => openEdit(t)}><Pencil className="w-4 h-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => setDeleteId(t.id)}><Trash2 className="w-4 h-4" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit tier" : "Add tier"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {!editingId && (
              <div>
                <Label>ID (optional)</Label>
                <Input value={form.id ?? ""} onChange={(e) => setForm({ ...form, id: e.target.value || undefined })} placeholder="e.g. essence" />
              </div>
            )}
            <div>
              <Label>Name</Label>
              <Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Price</Label>
              <Input type="number" value={form.price ?? 0} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Features (one per line)</Label>
              <textarea className="w-full min-h-[80px] rounded-md border px-3 py-2 text-sm" value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="highlighted" checked={form.highlighted ?? false} onChange={(e) => setForm({ ...form, highlighted: e.target.checked })} />
              <Label htmlFor="highlighted">Highlighted</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={saveTier}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete tier?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function UserAssignmentsSubTab() {
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [tiers, setTiers] = useState<PricingTierData[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignUserId, setAssignUserId] = useState("");
  const [assignTierId, setAssignTierId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [aRes, uRes, tRes] = await Promise.all([
      fetch("/api/admin/user-memberships"),
      fetch("/api/admin/users"),
      fetch("/api/admin/tiers"),
    ]);
    if (aRes.ok) setAssignments(await aRes.json());
    if (uRes.ok) setUsers(await uRes.json());
    if (tRes.ok) setTiers(await tRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const assign = async () => {
    if (!assignUserId || !assignTierId) return;
    setSubmitting(true);
    const res = await fetch("/api/admin/user-memberships", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: assignUserId, tierId: assignTierId }),
    });
    setSubmitting(false);
    if (res.ok) {
      await load();
      setAssignUserId("");
      setAssignTierId("");
    }
  };

  const doRemove = async () => {
    if (!deleteUserId) return;
    const res = await fetch(`/api/admin/user-memberships?userId=${encodeURIComponent(deleteUserId)}`, { method: "DELETE" });
    if (res.ok) {
      await load();
      setDeleteUserId(null);
    }
  };

  if (loading) return <p className="text-charcoal-light">Loading…</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2 p-4 border rounded-lg bg-cream">
        <div>
          <Label className="text-xs">User</Label>
          <select className="h-10 rounded-md border px-3 ml-2" value={assignUserId} onChange={(e) => setAssignUserId(e.target.value)}>
            <option value="">Select user</option>
            {users.map((u) => (
              <option key={u.email} value={u.email}>{u.email}</option>
            ))}
          </select>
        </div>
        <div>
          <Label className="text-xs">Tier</Label>
          <select className="h-10 rounded-md border px-3 ml-2" value={assignTierId} onChange={(e) => setAssignTierId(e.target.value)}>
            <option value="">Select tier</option>
            {tiers.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <Button onClick={assign} disabled={submitting || !assignUserId || !assignTierId}>Assign</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Tier</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.map((a) => (
            <TableRow key={a.userId}>
              <TableCell>{a.userEmail ?? a.userName ?? a.userId}</TableCell>
              <TableCell>{a.tierName ?? a.tierId}</TableCell>
              <TableCell>
                <Button size="sm" variant="ghost" onClick={() => setDeleteUserId(a.userId)}><Trash2 className="w-4 h-4" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove membership?</AlertDialogTitle>
            <AlertDialogDescription>This will remove the tier assignment for this user.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doRemove}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function MembershipsTab() {
  const [subTab, setSubTab] = useState<"tiers" | "assignments">("tiers");
  return (
    <div className="space-y-4">
      <Tabs value={subTab} onValueChange={(v) => setSubTab(v as "tiers" | "assignments")}>
        <TabsList>
          <TabsTrigger value="tiers">Pricing tiers</TabsTrigger>
          <TabsTrigger value="assignments">User assignments</TabsTrigger>
        </TabsList>
        <TabsContent value="tiers">
          <TiersSubTab />
        </TabsContent>
        <TabsContent value="assignments">
          <UserAssignmentsSubTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
