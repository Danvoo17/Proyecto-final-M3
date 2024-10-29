document.getElementById('loginButton').addEventListener('click', async function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:5100/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.message);
            return;
        }
        
        const data = await response.json();
        localStorage.setItem('token', data.token);
        window.location.href = 'http://localhost:5100/main';
    } catch (error) {
        showError('Error de conexión. Por favor, inténtalo de nuevo.');
    }
});

function showError(message) {
    alert(message);
}