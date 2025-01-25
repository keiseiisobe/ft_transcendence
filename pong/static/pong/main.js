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



// signup
function setSignupEventHandler() {
    if (document.querySelector("#signupModal")) {
	const signupForm = {
	    username: document.querySelector("#signup-username"),
	    password: document.querySelector("#signup-password"),
	    button: document.querySelector("#signup-button")
	};

	async function signup() {
	    const url = "http://localhost:8000/accounts/signup/";
	    const csrftoken = getCookie('csrftoken');
	    await fetch(url, {
		method: "POST",
		headers: {
		    "X-CSRFToken": csrftoken,
		    "Content-Type": "application/json"
		},
		body: JSON.stringify({
		    username: signupForm.username.value,
		    password: signupForm.password.value
		}
				    )
	    })
		.then((promise) => {
		    if (promise.status == 403) {
			let message = document.querySelector(".signup-error-message");
			message.textContent = "Username already exist. Try another username.";
			throw new Error('403');
		    }
		    else {
			signupForm.username.value = "";
			signupForm.password.value = "";
			document.querySelector("#signup-close").click();
			document.querySelector("#login-modal-button").click();
		    }
		})
		.catch((err) => console.log(err));
	}

	signupForm.button.addEventListener("click", signup);
    }
}

setSignupEventHandler();



// login

function setLoginEventHandler() {
    if (document.querySelector("#loginModal")) {
	const loginForm = {
	    username: document.querySelector("#login-username"),
	    password: document.querySelector("#login-password"),
	    button: document.querySelector("#login-button")
	};
	
	async function login() {
	    const url = "http://localhost:8000/accounts/login/";
	    const csrftoken = getCookie('csrftoken');
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
		    setLogoutEventHandler();
		})
		.catch((err) => console.log(err));
	}

	loginForm.button.addEventListener("click", login);
    }
}

setLoginEventHandler();

// logout

function setLogoutEventHandler() {
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
		    setLoginEventHandler();
		})
		.catch((err) => console.log(err));
	}
	
	logoutButton.addEventListener("click", logout);
    }
}

setLogoutEventHandler();


// history api
window.addEventListener("popstate", (event) => {
    if (event.state)
	document.body.innerHTML = event.state;
});

const initialState = document.body.innerHTML;
history.replaceState(initialState, "", document.location.href);
