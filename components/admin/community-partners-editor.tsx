'use client';

import { useState } from 'react';
import { GripVertical, Plus, Trash2 } from 'lucide-react';

export type CommunityPartnerDraft = {
  name: string;
  logoUrl: string | null;
  logoLightUrl: string | null;
  logoDarkUrl: string | null;
  instagramUrl: string | null;
  linkedinUrl: string | null;
};

type CommunityPartnersEditorProps = {
  items: CommunityPartnerDraft[];
  onChange: (items: CommunityPartnerDraft[]) => void;
  title?: string;
  addLabel?: string;
  emptyLabel?: string;
};

function readImageAsDataUrl(file: File, onDone: (value: string) => void) {
  const reader = new FileReader();
  reader.onload = () => {
    const result = reader.result;
    if (typeof result === 'string') {
      onDone(result);
    }
  };
  reader.readAsDataURL(file);
}

export default function CommunityPartnersEditor({
  items,
  onChange,
  title = 'Community Partners',
  addLabel = 'Add Partner',
  emptyLabel = 'No community partners added yet',
}: CommunityPartnersEditorProps) {
  const [draggedPartnerIndex, setDraggedPartnerIndex] = useState<number | null>(null);

  function updateItem(index: number, updater: (item: CommunityPartnerDraft) => CommunityPartnerDraft) {
    const next = items.map((item, itemIndex) => (itemIndex === index ? updater(item) : item));
    onChange(next);
  }

  function reorderItems(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return;
    const next = [...items];
    const [moved] = next.splice(fromIndex, 1);
    if (!moved) return;
    next.splice(toIndex, 0, moved);
    onChange(next);
  }

  function addItem() {
    onChange([
      ...items,
      {
        name: '',
        logoUrl: null,
        logoLightUrl: null,
        logoDarkUrl: null,
        instagramUrl: null,
        linkedinUrl: null,
      },
    ]);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  }

  function handleLogoFile(file: File | null, index: number, mode: 'light' | 'dark') {
    if (!file) return;

    readImageAsDataUrl(file, (value) => {
      updateItem(index, (item) =>
        mode === 'light'
          ? { ...item, logoLightUrl: value }
          : { ...item, logoDarkUrl: value }
      );
    });
  }

  return (
    <div className="md:col-span-2">
      <div className="mb-2 flex items-center justify-between">
        <label className="text-base font-semibold text-primary">{title}</label>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-1 rounded-lg border border-primary bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition hover:bg-primary/20"
        >
          <Plus size={16} />
          {addLabel}
        </button>
      </div>

      {items.length > 0 ? (
        <div className="space-y-3 rounded-lg border border-border bg-background/50 p-4">
          {items.map((item, index) => (
            <div
              key={index}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (draggedPartnerIndex === null) return;
                reorderItems(draggedPartnerIndex, index);
                setDraggedPartnerIndex(null);
              }}
              className={`space-y-2 rounded-lg border bg-card p-4 shadow-sm ${draggedPartnerIndex === index ? 'border-primary/60' : 'border-border'}`}
            >
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  draggable
                  onDragStart={() => setDraggedPartnerIndex(index)}
                  onDragEnd={() => setDraggedPartnerIndex(null)}
                  className="rounded-md border border-border bg-background p-2 text-foreground/70 hover:text-foreground"
                  aria-label="Drag to reorder partner"
                  title="Drag to reorder partner"
                >
                  <GripVertical size={14} />
                </button>
                <input
                  placeholder="Partner name"
                  value={item.name}
                  onChange={(e) => updateItem(index, (current) => ({ ...current, name: e.target.value }))}
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-700 hover:bg-red-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground/80">Logo Light (Light mode)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleLogoFile(e.target.files?.[0] || null, index, 'light')}
                    className="block w-full cursor-pointer text-xs text-foreground/60 file:mr-3 file:rounded file:border-0 file:bg-primary/20 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary hover:file:bg-primary/30"
                  />
                  {item.logoLightUrl ? (
                    <div className="mt-2 rounded border border-border bg-white p-2">
                      <img
                        src={item.logoLightUrl}
                        alt="Community partner light logo preview"
                        className="max-h-12 max-w-full object-contain"
                      />
                    </div>
                  ) : null}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground/80">Logo Dark (Dark mode)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleLogoFile(e.target.files?.[0] || null, index, 'dark')}
                    className="block w-full cursor-pointer text-xs text-foreground/60 file:mr-3 file:rounded file:border-0 file:bg-primary/20 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary hover:file:bg-primary/30"
                  />
                  {item.logoDarkUrl ? (
                    <div className="mt-2 rounded border border-border bg-gray-900 p-2">
                      <img
                        src={item.logoDarkUrl}
                        alt="Community partner dark logo preview"
                        className="max-h-12 max-w-full object-contain"
                      />
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground/80">Instagram URL</label>
                  <input
                    type="url"
                    placeholder="https://instagram.com/..."
                    value={item.instagramUrl ?? ''}
                    onChange={(e) => updateItem(index, (current) => ({ ...current, instagramUrl: e.target.value || null }))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground/80">LinkedIn URL</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/company/..."
                    value={item.linkedinUrl ?? ''}
                    onChange={(e) => updateItem(index, (current) => ({ ...current, linkedinUrl: e.target.value || null }))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-foreground/50">{emptyLabel}</p>
      )}
    </div>
  );
}