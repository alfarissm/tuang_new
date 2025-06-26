
"use client"

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
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
  sales: {
    label: "Penjualan (item)",
    color: "hsl(var(--chart-1))",
  },
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

    const dailySales: { [key: string]: number } = {};

    vendorOrders.forEach(order => {
      const date = format(new Date(order.created_at), 'yyyy-MM-dd');
      const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

      if (!dailySales[date]) {
        dailySales[date] = 0;
      }
      dailySales[date] += itemCount;
    });

    return Object.keys(dailySales).map(date => ({
      date,
      sales: dailySales[date],
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [vendorOrders]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 md:pt-6">
      <h2 className="text-3xl font-bold tracking-tight font-headline">Laporan Penjualan</h2>
      <p className="text-muted-foreground">Analisis penjualan dari warung Anda ({vendorName}).</p>
      <Card>
        <CardHeader>
          <CardTitle>Penjualan Harian</CardTitle>
          <CardDescription>Jumlah item terjual per hari.</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
              <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => new Date(value).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}
                />
                <YAxis />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              Belum ada data penjualan untuk ditampilkan.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
