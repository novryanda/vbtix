// src/lib/api/client.ts
export async function fetcher<T>(url: string): Promise<T> {
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

// Fungsi untuk POST request
export async function postData<T>(url: string, data: any): Promise<T> {
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const error = new Error('An error occurred while posting the data.');
        const info = await res.json();
        (error as any).info = info;
        (error as any).status = res.status;
        throw error;
    }

    return res.json();
}

// Fungsi untuk PUT request
export async function putData<T>(url: string, data: any): Promise<T> {
    const res = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const error = new Error('An error occurred while posting the data.');
        const info = await res.json();
        (error as any).info = info;
        (error as any).status = res.status;
        throw error;
    }

    return res.json();
}

// Fungsi untuk DELETE request
export async function deleteData<T>(url: string): Promise<T> {
    const res = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!res.ok) {
        const error = new Error('An error occurred while deleting the data.');
        const info = await res.json();
        (error as any).info = info;
        (error as any).status = res.status;
        throw error;
    }

    return res.json();
}