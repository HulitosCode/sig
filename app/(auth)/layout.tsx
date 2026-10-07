import Link from "next/link";
import { Truck } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-12">
      <Link href="/" className="mb-8 flex items-center justify-center gap-2 font-bold">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Truck className="size-5" />
        </span>
        FRETA
      </Link>
      {children}
    </div>
  );
}
