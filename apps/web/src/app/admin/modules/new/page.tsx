import { ModuleCreateForm } from "@/components/authoring/module-create-form";

export default function NewModulePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">New module</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Created as a draft — staff won&apos;t see it until you publish.
      </p>
      <div className="mt-6 max-w-2xl">
        <ModuleCreateForm />
      </div>
    </div>
  );
}
