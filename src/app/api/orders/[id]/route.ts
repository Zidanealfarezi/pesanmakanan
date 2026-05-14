import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Map camelCase keys to lowercase for PostgreSQL
    const updates: any = {};
    if (body.status !== undefined) updates.status = body.status;
    if (body.paymentStatus !== undefined) updates.paymentstatus = body.paymentStatus;

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, order: data });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 });
  }
}
