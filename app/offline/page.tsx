"use client";

import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function OfflinePage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md text-center">
        <CardContent className="flex flex-col items-center gap-4 p-8">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            <WifiOff className="size-7 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Sem ligação à internet</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Verifique a sua conexão e tente novamente.
            </p>
          </div>
          <Button onClick={() => window.location.reload()} className="gap-2">
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
