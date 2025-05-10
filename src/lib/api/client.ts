// src/lib/api/client.ts
export async function fetcher<T>(url: string): Promise<T> {
    // Melakukan HTTP request ke API
    const res = await fetch(url);

    if (!res.ok) {
        const error = new Error('An error occurred while fetching the data.');
        const info = await res.json();
        (error as any).info = info;
        (error as any).status = res.status;
        throw error;
    }

    return res.json();
}