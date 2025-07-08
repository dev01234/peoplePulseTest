"use client";

import { TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  LabelList,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type ClientDetail = {
  name: string;
  totalResourceCount: number;
  activeResourceCount: number;
  inactiveResourceCount: number;
  // For client usage: projects count.
  projectsCount?: number;
};

const chartConfig = {
  projects: {
    label: "Projects Count",
    color: "hsl(var(--chart-1))",
  },
  active: {
    label: "Active Resources",
    color: "hsl(var(--chart-2))",
  },
  inactive: {
    label: "Inactive Resources",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

/* 
  ResourcesPerProjectsChart displays a stacked bar chart where:
  - The "active" and "inactive" resource counts are stacked.
  - A label showing the total (active + inactive) is attached.
*/
export function ResourcesPerProjectsChart({ data }: { data: ClientDetail[] }) {
  // Map the data for the projects chart.
  const chartData = data.map((item) => ({
    name: item.name,
    active: item.activeResourceCount,
    inactive: item.inactiveResourceCount,
    total: item.totalResourceCount,
  }));

  const maxTotal = Math.max(
    ...data.map((item) => item.activeResourceCount + item.inactiveResourceCount)
  );

  return (
    <Card className="w-96 h-96">
      <CardHeader>
        <CardTitle>Resources Per Projects</CardTitle>
        <CardDescription>Overview of project counts</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart width={400} height={300} data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tickLine={false} />
            <YAxis domain={[0, maxTotal + 1]} />
            <Legend />
            <ChartTooltip
              cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
              content={<ChartTooltipContent />}
            />
            <Bar
              dataKey="active"
              name="Active Resources"
              fill="hsl(var(--chart-2))"
              stackId="a"
            >
              <LabelList dataKey="total" position="top" />
            </Bar>
            <Bar
              dataKey="inactive"
              name="Inactive Resources"
              fill="hsl(var(--chart-3))"
              stackId="a"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Clear breakdown of projects{" "}
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing the total number of resources
        </div>
      </CardFooter>
    </Card>
  );
}

/* 
  ProjectsPerClientChart displays a simple bar chart where:
  - Each bar represents the number of projects per client.
*/
export function ProjectsPerClientChart({ data }: { data: ClientDetail[] }) {
  // Map the data for the client chart.
  const chartData = data.map((client) => ({
    name: client.name,
    projectsCount: client.projectsCount ?? 0,
  }));

  const maxTotal = Math.max(
    ...data.map((client) => client.projectsCount ?? 0)
  );

  return (
    <Card className="w-96 h-96">
      <CardHeader>
        <CardTitle>Projects Per Client</CardTitle>
        <CardDescription>Overview of project distribution</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart width={400} height={300} data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tickLine={false} />
            <YAxis domain={[0, maxTotal + 1]} />
            <Legend />
            <ChartTooltip
              cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
              content={<ChartTooltipContent />}
            />
            <Bar
              dataKey="projectsCount"
              name="Projects Count"
              fill="hsl(var(--chart-1))"
            >
              <LabelList dataKey="projectsCount" position="top" />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Clear breakdown of projects by Client{" "}
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing the total number of projects per client
        </div>
      </CardFooter>
    </Card>
  );
}
