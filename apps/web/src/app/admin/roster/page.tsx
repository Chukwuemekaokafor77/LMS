import { RosterUploader } from "@/components/roster-uploader";

export default function RosterPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Roster import</h1>
      <p className="text-sm text-muted-foreground">
        Upload a CSV to invite staff in bulk. Required columns:{" "}
        <code>email</code>, <code>roleCode</code>. Optional:{" "}
        <code>firstName</code>, <code>lastName</code>, <code>siteName</code>,{" "}
        <code>employmentType</code> (FT / PT / CASUAL).
      </p>
      <RosterUploader />
    </div>
  );
}
