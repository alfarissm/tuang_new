
"use client"

import { useMemo } from 'react';
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useOrders } from '@/context/OrderContext';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

const chartConfig = {
  revenue: {
    label: "Pendapatan",
    color: "hsl(var(--chart-1))",
  },
}

// Helper to format currency for axis ticks and tooltips
const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `Rp${(value / 1000000).toFixed(1)}jt`;
  }
  if (value >= 1000) {
    return `Rp${Math.round(value / 1000)}rb`;
  }
  return `Rp${value}`;
};

const formatFullCurrency = (value: number) => {
    return `Rp${value.toLocaleString('id-ID')}`;
}

export default function VendorReportsPage() {
  const { auth } = useAuth();
  const vendorName = auth.vendorName || "";
  const { getVendorOrders } = useOrders();
  const vendorOrders = getVendorOrders(vendorName);

  const chartData = useMemo(() => {
     if (vendorOrders.length === 0) {
      return [];
    }

    const dailyRevenue: { [key: string]: number } = {};

    vendorOrders.forEach(order => {
      const date = format(new Date(order.created_at), 'yyyy-MM-dd');
      // getVendorOrders already calculates vendor-specific total_amount
      const revenueForOrder = order.total_amount; 

      if (!dailyRevenue[date]) {
        dailyRevenue[date] = 0;
      }
      dailyRevenue[date] += revenueForOrder;
    });

    return Object.keys(dailyRevenue).map(date => ({
      date,
      revenue: dailyRevenue[date],
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [vendorOrders]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 md:pt-6">
      <h2 className="text-3xl font-bold tracking-tight font-headline">Laporan Pendapatan</h2>
      <p className="text-muted-foreground">Analisis pendapatan dari warung Anda ({vendorName}).</p>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Grafik Pendapatan Harian</CardTitle>
          <CardDescription>Total pendapatan (Rp) yang diterima per hari.</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 1 ? (
            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
              <LineChart
                accessibilityLayer
                data={chartData}
                margin={{
                  top: 20,
                  right: 20,
                  bottom: 20,
                  left: 20,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => new Date(value).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => formatCurrency(Number(value))}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent
                    labelFormatter={(label) => new Date(label).toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long' })}
                    formatter={(value) => formatFullCurrency(Number(value))}
                    indicator="dot"
                  />}
                />
                <Line
                  dataKey="revenue"
                  type="monotone"
                  stroke="var(--color-revenue)"
                  strokeWidth={2}
                  dot={{
                    fill: "var(--color-revenue)",
                  }}
                  activeDot={{
                    r: 6,
                  }}
                />
              </LineChart>
            </ChartContainer>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              {chartData.length > 0 ? 'Dibutuhkan setidaknya data dari dua hari berbeda untuk menampilkan grafik.' : 'Belum ada data pendapatan untuk ditampilkan.'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
