export const apiRequest = async (url: string, method: string = 'GET', body?: any) => {
    const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    // Log the status and other response details
    // console.log('Response Status:', response.status);
    // console.log('Response:', response);

    if (!response.ok) {
        const errorDetails = await response.text();
        // console.error('Error Details:', errorDetails);
        throw new Error('Network response was not ok');
    }

    return response.json();
};
