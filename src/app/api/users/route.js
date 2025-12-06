import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const q = searchParams.get('q');
        const role = searchParams.get('role');

        const params = new URLSearchParams();
        if (q) params.set('q', q);
        if (role) params.set('role', role);

        const res = await fetch(`${BACKEND_URL}/users?${params.toString()}`);
        const data = await res.json();

        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Get users error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
