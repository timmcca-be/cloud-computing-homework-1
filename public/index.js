const matches = document.cookie.match(/( |^)token=([^;]+)/)
if (!matches || matches.length < 3) {
    window.location.href = 'login.html';
}
const token = matches[2];
document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
fetch('/account', {
    headers: {
        'Authorization': token,
        'Accept': 'application/json',
    }
}).then(async res => {
    if (res.status === 200) {
        const json = await res.json();
        document.getElementById('firstName').innerHTML = json.firstName;
        document.getElementById('lastName').innerHTML = json.lastName;
        document.getElementById('email').innerHTML = json.email;
    } else {
        window.location.href = 'login.html';
    }
});