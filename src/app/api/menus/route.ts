import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('menus')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error("Supabase menus error:", error);
      return NextResponse.json([]);
    }
    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Error fetching menus:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const newMenu = {
      id: Date.now().toString(),
      name: body.name,
      description: body.description || "",
      price: parseInt(body.price),
      image: body.image || "",
      category: body.category || "Lainnya",
      available: true
    };

    const { data, error } = await supabase
      .from('menus')
      .insert([newMenu])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, menu: data });
  } catch (error) {
    console.error("Error creating menu:", error);
    return NextResponse.json({ success: false, error: 'Failed to add menu' }, { status: 500 });
  }
}
