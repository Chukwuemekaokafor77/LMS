import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="container flex justify-center py-16">
      <SignIn />
    </main>
  );
}
