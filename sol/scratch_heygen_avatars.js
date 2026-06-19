const HEYGEN_API_KEY = "sk_V2_hgu_kEN3KwiGUt6_CUd4OB4lGSLgUa36QlS1nZ6wnn5kNDSV";

async function getAvatars() {
    try {
        const response = await fetch('https://api.heygen.com/v2/avatars', {
            method: 'GET',
            headers: { 'X-Api-Key': HEYGEN_API_KEY }
        });
        const data = await response.json();
        
        if(data && data.data && data.data.avatars) {
            // Find female avatars
            const femaleAvatars = data.data.avatars.filter(a => a.gender === 'female');
            console.log("Found", femaleAvatars.length, "female avatars.");
            console.log(JSON.stringify(femaleAvatars.slice(0, 5), null, 2));
        } else {
            console.log("No avatars found or error", data);
        }
    } catch (error) {
        console.error(error);
    }
}

getAvatars();
