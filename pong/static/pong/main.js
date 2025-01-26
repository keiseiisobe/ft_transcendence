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
	    avatar: document.querySelector("#avatar"),
	    username: document.querySelector("#signup-username"),
	    password: document.querySelector("#signup-password"),
	    button: document.querySelector("#signup-button")
	};

	async function signup() {
	    const url = "http://localhost:8000/accounts/signup/";
	    const csrftoken = getCookie('csrftoken');
	    const formData = new FormData();
	    formData.append("username", signupForm.username.value);
	    formData.append("password", signupForm.password.value);
	    formData.append("avatar", signupForm.avatar.files[0]);
	    await fetch(url, {
		method: "POST",
		headers: {
		    "X-CSRFToken": csrftoken,
		},
		body: formData
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
	
	function login() {
	    const url = "http://localhost:8000/accounts/login/";
	    const csrftoken = getCookie('csrftoken');
	    const formData = new FormData();
	    formData.append("username", loginForm.username.value);
	    formData.append("password", loginForm.password.value);
	    fetch(url, {
		method: "POST",
		headers: {
		    "X-CSRFToken": csrftoken,
		},
		body: formData
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
		    document.querySelector(".modal-backdrop").remove();
		    let navbar = document.querySelector("#loaded-header");
		    navbar.innerHTML = text;
		    setLogoutEventHandler();
		    setMypageEventHandler();
		    history.replaceState(document.body.innerHTML, "", "");
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
		    history.replaceState(document.body.innerHTML, "", "");
		})
		.catch((err) => console.log(err));
	}
	
	logoutButton.addEventListener("click", logout);
    }
}

setLogoutEventHandler();



// mypage
function setMypageEventHandler() {
    if (document.querySelector("#mypage-button")) {
	const mypageButton = document.querySelector("#mypage-button");

	async function mypage() {
	    const url = "http://localhost:8000/accounts/mypage/";
	    await fetch(url)
		.then((promise) => {
		    if (!promise.ok)
			throw new Error();
		    return promise.text();
		})
		.then((text) => {
		    document.body.innerHTML = text;
		    history.pushState(text, "", "");
		})
		.catch((err) => console.log(err));
	}
	
	mypageButton.addEventListener("click", mypage);
    }
}

setMypageEventHandler();



// history api
window.addEventListener("popstate", (event) => {
    if (event.state)
    {
	document.body.innerHTML = event.state;
	setLogoutEventHandler();
	setMypageEventHandler();
    }
});

const initialState = document.body.innerHTML;
history.replaceState(initialState, "", document.location.href);



