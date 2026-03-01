"use client";

import { useEffect, useState, useCallback } from "react";
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
import { Pencil } from "lucide-react";

export interface UserRow {
  email: string;
  name: string;
  role: string;
  provider?: string;
}

export function UsersTab() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<"user" | "admin">("user");
  const [editPassword, setEditPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openEdit = (u: UserRow) => {
    setEditUser(u);
    setEditName(u.name);
    setEditRole(u.role as "user" | "admin");
    setEditPassword("");
  };

  const saveUser = async () => {
    if (!editUser) return;
    setSaving(true);
    const body: { name?: string; role?: string; password?: string } = { name: editName, role: editRole };
    if (editPassword.trim()) body.password = editPassword;
    const res = await fetch(`/api/admin/users/${encodeURIComponent(editUser.email)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.ok) {
      await load();
      setEditUser(null);
    }
  };

  if (loading) return <p className="text-charcoal-light">Loading users…</p>;

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Login type</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.email}>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.name}</TableCell>
              <TableCell>{u.role}</TableCell>
              <TableCell className="capitalize">{u.provider ?? "credentials"}</TableCell>
              <TableCell>
                <Button size="sm" variant="ghost" onClick={() => openEdit(u)}><Pencil className="w-4 h-4" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Email</Label>
              <Input value={editUser?.email ?? ""} disabled />
            </div>
            <div>
              <Label>Name</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div>
              <Label>Role</Label>
              <select className="w-full h-10 rounded-md border px-3" value={editRole} onChange={(e) => setEditRole(e.target.value as "user" | "admin")}>
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </div>
            <div>
              <Label>New password (leave blank to keep)</Label>
              <Input type="password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} placeholder="Optional" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button onClick={saveUser} disabled={saving}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
