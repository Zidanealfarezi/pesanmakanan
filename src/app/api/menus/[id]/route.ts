import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const { data, error } = await supabase
      .from('menus')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, menu: data });
  } catch (error) {
    console.error("Error updating menu:", error);
    return NextResponse.json({ success: false, error: 'Failed to update menu' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    const { error } = await supabase
      .from('menus')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting menu:", error);
    return NextResponse.json({ success: false, error: 'Failed to delete menu' }, { status: 500 });
  }
}
