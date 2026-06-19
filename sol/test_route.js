fetch('http://localhost:3000/api/marketing/avatars')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
