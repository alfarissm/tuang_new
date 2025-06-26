
"use client"

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useOrders } from "@/context/OrderContext";

const chartConfig = {
  revenue: {
    label: "Pendapatan (juta Rp)",
    color: "hsl(var(--chart-1))",
  },
};

export default function AdminReportsPage() {
  const { orders } = useOrders();

  const chartData = useMemo(() => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthlyRevenue: { [key: string]: number } = {};
    
    months.forEach(month => {
      monthlyRevenue[month] = 0;
    });

    orders.forEach(order => {
      const month = new Date(order.created_at).toLocaleString('default', { month: 'long' });
      if (monthlyRevenue.hasOwnProperty(month)) {
        monthlyRevenue[month] += order.total_amount;
      }
    });

    return Object.keys(monthlyRevenue).map(month => ({
      month,
      revenue: monthlyRevenue[month] / 1000000, // in millions
    }));
  }, [orders]);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight font-headline">Laporan Keuangan</h2>
      <p className="text-muted-foreground">Analisis pendapatan dan penjualan Tuang.</p>
      <Card>
        <CardHeader>
          <CardTitle>Pendapatan Bulanan</CardTitle>
          <CardDescription>Pendapatan dalam jutaan Rupiah.</CardDescription>
        </CardHeader>
        <CardContent>
           <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis unit="jt" />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
