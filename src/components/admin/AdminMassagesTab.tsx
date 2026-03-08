"use client";

import { Edit, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEFAULT_MASSAGE_ICON, MASSAGE_ICON_MAP } from "@/lib/massageIconMap";
import type { Massage } from "@/types/catalog";

type AdminMassagesTabProps = {
  massages: Massage[];
  onAddTreatment: () => void;
  onEdit: (massage: Massage) => void;
  onDelete: (id: string) => void;
};

const AdminMassagesTab = ({ massages, onAddTreatment, onEdit, onDelete }: AdminMassagesTabProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-display text-2xl">Massage Treatments</h3>
        <Button variant="outline" size="sm" onClick={onAddTreatment}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Treatment
        </Button>
      </div>
      <div className="grid gap-4">
        {massages.map((m) => (
          <div
            key={m.id}
            className="rounded-xl border border-border bg-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-4 flex-1">
              <div className="w-10 h-10 rounded-full gradient-purple flex items-center justify-center shrink-0">
                {(() => {
                  const Icon = MASSAGE_ICON_MAP[m.iconKey] ?? DEFAULT_MASSAGE_ICON;
                  return <Icon className="w-5 h-5 text-primary-foreground" />;
                })()}
              </div>
              <div>
                <h4 className="font-display text-xl mb-1">{m.name}</h4>
                <p className="text-muted-foreground text-sm font-body mb-2">{m.description}</p>
                <div className="flex gap-4 text-sm font-body">
                  <span>
                    30 min: <span className="text-primary font-semibold">{m.price30}</span>
                  </span>
                  <span>
                    60 min: <span className="text-primary font-semibold">{m.price60}</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(m)}>
                <Edit className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => onDelete(m.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminMassagesTab;
