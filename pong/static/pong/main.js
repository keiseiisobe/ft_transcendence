// csrftoken
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
const csrftoken = getCookie('csrftoken');


// signup



// login

if (document.querySelector("#loginModal")) {
    const loginForm = {
	username: document.querySelector("#login-username"),
	password: document.querySelector("#login-password"),
	button: document.querySelector("#login-button")
    };

    async function login() {
	const url = "http://localhost:8000/accounts/login/";
	await fetch(url, {
	    method: "POST",
	    headers: {
		"X-CSRFToken": csrftoken,
		"Content-Type": "application/json"
	    },
	    body: JSON.stringify({
		username: loginForm.username.value,
		password: loginForm.password.value
	    }
				)
	})
	    .then((promise) => {
		if (promise.status == 404) {
		    let message = document.querySelector(".login-error-message");
		    message.textContent = "Username or password is incorrect";
		    throw new Error('404');
		}
		else {
		    loginForm.username.value = "";
		    loginForm.password.value = "";
		    return promise.text();
		}
	    })
	    .then((text) => {
		document.querySelector("#login-close").click();
		let navbar = document.querySelector("#loaded-header");
		navbar.innerHTML = text;
	    })
	    .catch((err) => console.log(err));
    }

    loginForm.button.addEventListener("click", login);
}



// logout
if (document.querySelector("#logout-button")) {
    const logoutButton = document.querySelector("#logout-button");

    async function logout() {
	const url = "http://localhost:8000/accounts/logout/";
	await fetch(url)
	    .then((promise) => {
		if (!promise.ok)
		    throw new Error();
		return promise.text();
	    })
	    .then((text) => {
		let navbar = document.querySelector("#loaded-header");
		navbar.innerHTML = text;
	    })
	    .catch((err) => console.log(err));
    }

    logoutButton.addEventListener("click", logout);
}



// history api
window.addEventListener("popstate", (event) => {
    if (event.state)
	document.body.innerHTML = event.state;
});

const initialState = document.body.innerHTML;
history.replaceState(initialState, "", document.location.href);
