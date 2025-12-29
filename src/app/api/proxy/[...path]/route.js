export async function GET(request, { params }) {
    try {
        const { path } = await params;
        const pathStr = path.join('/');
        const url = new URL(request.url);
        const queryString = url.search;
        
        const backendUrl = `http://khoakomlem-internal.ddns.net:3001/${pathStr}${queryString}`;
        
        const res = await fetch(backendUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await res.json();
        
        return new Response(JSON.stringify(data), {
            status: res.status,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Proxy error:', error);
        return new Response(JSON.stringify({ error: 'Proxy failed' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}

export async function POST(request, { params }) {
    try {
        const { path } = await params;
        const pathStr = path.join('/');
        const body = await request.json();
        
        const backendUrl = `http://khoakomlem-internal.ddns.net:3001/${pathStr}`;
        
        const res = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await res.json();
        
        return new Response(JSON.stringify(data), {
            status: res.status,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Proxy error:', error);
        return new Response(JSON.stringify({ error: 'Proxy failed' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}

export async function PUT(request, { params }) {
    try {
        const { path } = await params;
        const pathStr = path.join('/');
        const body = await request.json();
        
        const backendUrl = `http://khoakomlem-internal.ddns.net:3001/${pathStr}`;
        
        const res = await fetch(backendUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await res.json();
        
        return new Response(JSON.stringify(data), {
            status: res.status,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Proxy error:', error);
        return new Response(JSON.stringify({ error: 'Proxy failed' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { path } = await params;
        const pathStr = path.join('/');
        
        const backendUrl = `http://khoakomlem-internal.ddns.net:3001/${pathStr}`;
        
        const res = await fetch(backendUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await res.json();
        
        return new Response(JSON.stringify(data), {
            status: res.status,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Proxy error:', error);
        return new Response(JSON.stringify({ error: 'Proxy failed' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}
