const HEYGEN_API_KEY = "sk_V2_hgu_kEN3KwiGUt6_CUd4OB4lGSLgUa36QlS1nZ6wnn5kNDSV";

async function getVoices() {
    try {
        const response = await fetch('https://api.heygen.com/v2/voices', {
            method: 'GET',
            headers: { 'X-Api-Key': HEYGEN_API_KEY }
        });
        const data = await response.json();
        
        if(data && data.data && data.data.voices) {
            const spanishVoices = data.data.voices.filter(v => 
                v.language && v.language.toLowerCase().includes('spanish') &&
                v.gender && v.gender.toLowerCase() === 'female'
            );
            
            console.log(JSON.stringify(spanishVoices.map(v => ({
                id: v.voice_id,
                name: v.name,
                language: v.language,
                accent: v.accent,
                preview_audio: v.preview_audio
            })), null, 2));
        } else {
            console.log("No voices found or error", data);
        }
    } catch (error) {
        console.error(error);
    }
}

getVoices();
