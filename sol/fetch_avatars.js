const fetch = require('node-fetch');

async function getAvatars() {
    try {
        const res = await fetch('http://localhost:3000/api/marketing/avatars');
        const data = await res.json();
        const femaleAvatars = data.avatars.filter(a => a.gender === 'female' && a.avatar_name.toLowerCase().includes('standing')).slice(0, 20); // Get top 20 standing female avatars
        console.log(JSON.stringify(femaleAvatars, null, 2));
    } catch (e) {
        console.error(e);
    }
}
getAvatars();
