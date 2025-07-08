"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface ReportCardProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}

export function ReportCard({ title, action, children }: ReportCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}