import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('createdat', { ascending: false });

    if (error) {
      console.error("Supabase orders error:", error);
      return NextResponse.json([]);
    }
    
    // Map column names from snake_case DB to camelCase for frontend
    const mapped = (data || []).map((o: any) => ({
      ...o,
      orderNumber: o.ordernumber || o.orderNumber,
      tableNumber: o.tablenumber || o.tableNumber,
      totalPrice: o.totalprice || o.totalPrice,
      paymentStatus: o.paymentstatus || o.paymentStatus,
      createdAt: o.createdat || o.createdAt,
    }));
    
    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    let totalPrice = 0;
    if (body.items && Array.isArray(body.items)) {
      body.items.forEach((item: any) => {
        totalPrice += (item.price || 0) * (item.quantity || 1);
      });
    }

    const orderNumber = Math.floor(1000 + Math.random() * 9000).toString();
    const id = Date.now().toString();

    // Use lowercase column names to match Supabase/PostgreSQL convention
    const newOrder = {
      id,
      ordernumber: orderNumber,
      tablenumber: body.tableNumber || 1,
      items: body.items || [],
      notes: body.notes || "",
      totalprice: totalPrice,
      status: "Baru Masuk",
      paymentstatus: "Belum Bayar"
    };

    const { data, error } = await supabase
      .from('orders')
      .insert([newOrder])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, order: data });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ success: false, error: 'Failed to add order' }, { status: 500 });
  }
}
