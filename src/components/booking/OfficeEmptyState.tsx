"use client";

type OfficeEmptyStateProps = {
  title: string;
  body: string;
};

export function OfficeEmptyState({ title, body }: OfficeEmptyStateProps) {
  return (
    <div className="office-dc-card mx-auto max-w-lg p-6">
      <h2 className="font-display text-2xl">{title}</h2>
      <p className="office-muted mt-2 text-sm">{body}</p>
    </div>
  );
}
