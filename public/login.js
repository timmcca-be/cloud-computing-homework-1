async function login() {
    const res = await fetch('/login', {
        body: JSON.stringify({
            username: document.getElementById('login-username').value,
            password: document.getElementById('login-password').value,
        }),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        method: 'POST',
    });
    switch (res.status) {
        case 200:
            const json = await res.json();
            document.cookie = `token=${json.token}`;
            window.location.href = 'index.html';
            break;
        case 400:
            document.getElementById('login-error').innerHTML = 'Missing username or password';
            break;
        case 401:
            document.getElementById('login-error').innerHTML = 'Invalid username or password';
            break;
        default:
            document.getElementById('login-error').innerHTML = 'Unexpected error';
            break;
    }
}

async function signUp() {
    const res = await fetch('/account', {
        body: JSON.stringify({
            username: document.getElementById('signup-username').value,
            password: document.getElementById('signup-password').value,
            firstName: document.getElementById('signup-firstName').value,
            lastName: document.getElementById('signup-lastName').value,
            email: document.getElementById('signup-email').value,
        }),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        method: 'POST',
    });
    switch (res.status) {
        case 200:
            const json = await res.json();
            document.cookie = `token=${json.token}`;
            window.location.href = 'index.html';
            break;
        case 400:
            document.getElementById('signup-error').innerHTML = 'Missing a field';
            break;
        case 409:
            document.getElementById('signup-error').innerHTML = 'Email or username in use';
            break;
        default:
            document.getElementById('signup-error').innerHTML = 'Unexpected error';
            break;
    }
}
