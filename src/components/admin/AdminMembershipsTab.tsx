"use client";

import { Crown, Edit, Trash2, Plus, User, Mail, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Membership } from "@/types/catalog";
import type { AdminUserMembershipRow } from "@/components/admin/types";

type AdminMembershipsTabProps = {
  membershipPlans: Membership[];
  userMemberships: AdminUserMembershipRow[];
  onAddPlan: () => void;
  onDelete: (id: string) => void;
  onUpdateMembershipStatus: (
    userMembershipId: string,
    status: "PENDING" | "SUCCESSFUL" | "REJECTED"
  ) => void;
};

const AdminMembershipsTab = ({
  membershipPlans,
  userMemberships,
  onAddPlan,
  onDelete,
  onUpdateMembershipStatus,
}: AdminMembershipsTabProps) => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-primary/10 p-1 rounded-lg border border-primary/20">
          <TabsTrigger
            value="plans"
            className="font-body data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
          >
            Plans
          </TabsTrigger>
          <TabsTrigger
            value="memberships"
            className="font-body data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
          >
            Memberships
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-display text-2xl text-foreground">Membership Plans</h3>
            <Button variant="default" size="sm" onClick={onAddPlan} className="bg-primary hover:bg-primary/90">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Plan
            </Button>
          </div>
          <div className="grid gap-4">
            {membershipPlans.map((plan) => (
              <div
                key={plan.id}
                className="rounded-xl border-2 border-primary/20 bg-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:border-primary/40 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      plan.highlighted
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "gradient-purple text-primary-foreground"
                    }`}
                  >
                    <Crown className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-display text-xl text-foreground">{plan.name}</h4>
                      {plan.badge && (
                        <Badge className="text-xs bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30">
                          {plan.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-primary font-display text-lg font-semibold mb-2">
                      {plan.price}{" "}
                      <span className="text-muted-foreground text-sm font-body font-normal">
                        / {plan.period}
                      </span>
                    </p>
                    <ul className="text-muted-foreground text-sm font-body space-y-1">
                      {plan.features.slice(0, 3).map((f) => (
                        <li key={f} className="flex items-center gap-1.5">
                          <span className="text-primary text-xs">•</span> {f}
                        </li>
                      ))}
                      {plan.features.length > 3 && (
                        <li className="text-xs text-primary/80">+{plan.features.length - 3} more features</li>
                      )}
                    </ul>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10">
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => onDelete(plan.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="memberships" className="space-y-6">
          <h3 className="font-display text-2xl text-foreground">Users with memberships</h3>
          {userMemberships.length === 0 ? (
            <p className="text-muted-foreground text-sm font-body py-8 text-center">
              No membership records
            </p>
          ) : (
            <div className="rounded-xl border-2 border-primary/20 overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary/10 border-b-2 border-primary/20 hover:bg-primary/10">
                    <TableHead className="font-body text-foreground font-semibold">User / Guest</TableHead>
                    <TableHead className="font-body text-foreground font-semibold">Plan</TableHead>
                    <TableHead className="font-body text-foreground font-semibold">Status</TableHead>
                    <TableHead className="font-body text-foreground font-semibold">Payment</TableHead>
                    <TableHead className="font-body text-foreground font-semibold">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userMemberships.map((row, i) => (
                    <TableRow
                      key={row.id}
                      className={`border-border ${
                        i % 2 === 0 ? "bg-card" : "bg-primary/[0.04]"
                      } hover:bg-primary/5`}
                    >
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium flex items-center gap-1.5 text-foreground">
                            <User className="w-3.5 h-3.5 text-primary shrink-0" />
                            {row.userName ?? row.guestName ?? "—"}
                          </span>
                          {(row.userEmail ?? row.guestEmail) && (
                            <span className="text-muted-foreground text-xs flex items-center gap-1">
                              <Mail className="w-3 h-3 text-primary/70 shrink-0" />
                              {row.userEmail ?? row.guestEmail}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-display text-foreground">{row.membershipName}</span>
                        <span className="text-primary font-body text-sm font-medium block">
                          {row.membershipPrice} / {row.membershipPeriod}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={row.status}
                          onValueChange={(value) =>
                            onUpdateMembershipStatus(
                              row.id,
                              value as "PENDING" | "SUCCESSFUL" | "REJECTED"
                            )
                          }
                        >
                          <SelectTrigger
                            className={`w-[130px] h-9 font-medium border-2 ${
                              row.status === "SUCCESSFUL"
                                ? "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400"
                                : row.status === "REJECTED"
                                  ? "border-destructive/50 bg-destructive/10 text-destructive"
                                  : "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                            }`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              value="PENDING"
                              className="focus:bg-amber-500/15 focus:text-amber-800 dark:focus:text-amber-300"
                            >
                              <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-amber-500" /> Pending
                              </span>
                            </SelectItem>
                            <SelectItem
                              value="SUCCESSFUL"
                              className="focus:bg-green-500/15 focus:text-green-800 dark:focus:text-green-300"
                            >
                              <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-green-500" /> Successful
                              </span>
                            </SelectItem>
                            <SelectItem
                              value="REJECTED"
                              className="focus:bg-destructive/15 focus:text-destructive"
                            >
                              <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-destructive" /> Rejected
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-body text-xs capitalize bg-primary/15 text-primary border border-primary/25">
                          {row.paymentMethod?.toLowerCase() ?? "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm font-body flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                        {new Date(row.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminMembershipsTab;
