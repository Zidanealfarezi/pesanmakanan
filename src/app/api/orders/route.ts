import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Calculate total price based on items
    let totalPrice = 0;
    if (body.items && Array.isArray(body.items)) {
      body.items.forEach((item: any) => {
        totalPrice += (item.price || 0) * (item.quantity || 1);
      });
    }

    const orderNumber = Math.floor(1000 + Math.random() * 9000).toString();
    const id = Date.now().toString();

    const newOrder = {
      id,
      orderNumber,
      tableNumber: body.tableNumber || 1,
      items: body.items || [],
      notes: body.notes || "",
      totalPrice: totalPrice,
      status: "Baru Masuk",
      paymentStatus: "Belum Bayar"
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
