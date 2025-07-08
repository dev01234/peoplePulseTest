"use client";

import * as React from "react";
import { ExternalLink, TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";

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
import { Button } from "../ui/button";

const chartConfig = {
  active: {
    label: "Active Resources",
    color: "hsl(var(--chart-1))",
  },
  notActive: {
    label: "Not Active Resources",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function PieChartComponent({
  data,
}: {
  data: {
    activeResourceCount: number;
    inactiveResourceCount: number;
    totalResourceCount: number;
  };
}) {
  const chartData = [
    {
      status: "Active",
      count: data?.activeResourceCount,
      fill: "hsl(var(--chart-1))",
    },
    {
      status: "Not Active",
      count: data?.inactiveResourceCount,
      fill: "hsl(var(--chart-2))",
    },
  ];

  const totalResources = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.count, 0);
  }, []);

  return (
    <Card className="flex flex-col w-96 h-96">
      <CardHeader className="items-center pb-0">
        <CardTitle>Resource Status</CardTitle>
        <CardDescription>Active vs. Not Active</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
              fill="#8884d8"
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalResources.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Resources
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Resource Onboarded up by 3.5% this month{" "}
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Overview of resource status in the organization
        </div>
      </CardFooter>
    </Card>
  );
}
