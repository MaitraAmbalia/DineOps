import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ProductAnalytics from "@/models/ProductAnalytics";
import { PROCESSED_MENU, REVENUE_HISTORY } from "@/lib/data-store";

/**
 * GET /api/analytics/menu
 * Returns pre-computed ProductAnalytics data (fast, no aggregation)
 * Gracefully falls back to mock/demo data if MongoDB is unreachable.
 */
export async function GET() {
    try {
        await connectDB();

        const analytics = await ProductAnalytics.find()
            .sort({ popularityScore: -1 })
            .lean();

        if (analytics && analytics.length > 0) {
            return NextResponse.json({ success: true, data: analytics });
        }
    } catch (error: any) {
        console.warn("MongoDB query failed in /api/analytics/menu, using fallback demo data:", error?.message || error);
    }

    // Fallback demo data so dashboard functions offline/without local DB
    const fallbackData = PROCESSED_MENU.map((item: any, idx: number) => {
        const dailyHistory = REVENUE_HISTORY.map(day => ({
            date: day.date,
            orders: Math.max(1, Math.round((day.orders * (item.popularityScore || 100)) / 10000)),
            qty: Math.max(1, Math.round((day.orders * (item.popularityScore || 100)) / 8000)),
            revenue: Math.round(((day.revenue * (item.popularityScore || 100)) / 10000) * 100) / 100,
        }));

        return {
            foodId: item.foodId,
            name: item.name,
            category: item.category,
            currentPrice: item.price,
            cost: item.cost,
            margin: item.margin,
            marginPct: Math.round((item.margin / (item.price || 1)) * 100),
            popularityScore: item.popularityScore || (100 - idx * 3),
            classification: item.classification || "Volume Driver",
            profitabilityTier: idx < 5 ? "A" : idx < 12 ? "B" : "C",
            dailyHistory,
        };
    });

    return NextResponse.json({ success: true, data: fallbackData, fallback: true });
}
