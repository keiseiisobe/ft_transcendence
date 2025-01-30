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



// gameover
function gameOverEventHandler() {
    if (document.querySelector("#win-button")) {
	const winButton = document.querySelector("#win-button");
	const loseButton = document.querySelector("#lose-button");

	async function gameover(opponent, score_user, score_opponent, result) {
	    const url = "http://localhost:8000/pong/gameover/";
	    const csrftoken = getCookie('csrftoken');
	    const formData = new FormData();
	    formData.append("opponent", opponent);
	    formData.append("score_user", score_user);
	    formData.append("score_opponent", score_opponent);
	    formData.append("result", result);
	    await fetch(url, {
		method: "POST",
		headers: {
		    "X-CSRFToken": csrftoken,
		},
		body: formData
	    })
		.then((promise) => promise.text())
		.then((text) => {
		    document.body.innerHTML = text;
		    setLoginEventHandler();
		    setSignupEventHandler();
		    setMypageEventHandler();
		    setLogoutEventHandler();
		    gameOverEventHandler();
		})
		.catch((err) => console.log(err));
	}

	winButton.addEventListener("click", () => {
	    gameover("peer", 10, 0, 1);
	});
	
	loseButton.addEventListener("click", () => {
	    gameover("computer", 3, 10, 0);
	});
    }
}

gameOverEventHandler();



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
	    try {
		const promise = await fetch(url, {
		    method: "POST",
		    headers: {
			"X-CSRFToken": csrftoken,
		    },
		    body: formData
		});
		if (promise.ok) {
		    signupForm.username.value = "";
		    signupForm.password.value = "";
		    document.querySelector("#signup-close").click();
		    document.querySelector("#login-modal-button").click();
		}
		else // (promise.status == 403)
		{
		    const text = await promise.text();
		    let message = document.querySelector(".signup-error-message");
		    message.textContent = text;
		}
	    }
	    catch (err) {
		console.log(err);
	    }
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
	    const formData = new FormData();
	    formData.append("username", loginForm.username.value);
	    formData.append("password", loginForm.password.value);
	    try {
		const promise = await fetch(url, {
		    method: "POST",
		    headers: {
			"X-CSRFToken": csrftoken,
		    },
		    body: formData
		});
		const text = await promise.text();
		if (promise.ok) {
		    loginForm.username.value = "";
		    loginForm.password.value = "";
		    document.querySelector("#login-close").click();
		    document.querySelector(".modal-backdrop").remove();
		    let navbar = document.querySelector("#loaded-header");
		    navbar.innerHTML = text;
		    setLogoutEventHandler();
		    setMypageEventHandler();
		    gameOverEventHandler();
		    history.replaceState(document.body.innerHTML, "", "");
		}
		else // (promise.status == 404)
		{ 
		    let message = document.querySelector(".login-error-message");
		    message.textContent = text;
		}
	    }
	    catch (err) {
		console.log(err);
	    }
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
		    setSignupEventHandler();
		    gameOverEventHandler();
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
	    await fetch(url, { cache: "no-store" })
		.then((promise) => {
		    if (!promise.ok)
			throw new Error();
		    return promise.text();
		})
		.then((text) => {
		    document.body.innerHTML = text;
		    setCloseMypageEventHandler();
		    editUsernameEventHandler();
		    editPasswordEventHandler();
		    editAvatarEventHandler();
		    addFriendEventHandler();
		    history.pushState(text, "", "");
		})
		.catch((err) => console.log(err));
	}
	
	mypageButton.addEventListener("click", mypage);
    }
}

setMypageEventHandler();

    

// close mypage
function setCloseMypageEventHandler() {
    if (document.querySelector("#mypage-close")) {
	button = document.querySelector("#mypage-close");

	
	async function closeMypage() {
	    const url = "http://localhost:8000/accounts/mypage/close/";
	    await fetch(url)
		.then((promise) => promise.text())
		.then((text) => {
		    document.body.innerHTML = text;
		    setLogoutEventHandler();
		    setMypageEventHandler();
		    gameOverEventHandler();
		    history.pushState(text, "", "");
		})
		.catch((err) => console.log(err));
	}
	
	button.addEventListener("click", closeMypage);
    }
}



// edit username
function editUsernameEventHandler() {
    if (document.querySelector("#editUsernameModal")) {
	const editUsernameForm = {
	    username: document.querySelector("#edit-username"),
	    button: document.querySelector("#edit-username-button"),
	    message: document.querySelector(".edit-username-error-message")
	};

	async function editUsername() {
	    const url = "http://localhost:8000/accounts/edit/username/";
	    const csrftoken = getCookie('csrftoken');
	    const formData = new FormData();
	    formData.append("username", editUsernameForm.username.value);
	    try {
		const promise = await fetch(url, {
		    method: "POST",
		    headers: {
			"X-CSRFToken": csrftoken,
		    },
		    body: formData
		});
		if (promise.ok) {
		    document.querySelector("#edit-username-close").click();
		    username = document.querySelector("#username");
		    username.textContent = editUsernameForm.username.value;
		    editUsernameForm.username.value = "";
		    editUsernameForm.message.textContent = "";
		    history.replaceState(document.body.innerHTML, "", "");
		}
		else // (promise.status == 403)
		{
		    const text = await promise.text();
		    editUsernameForm.message.textContent = text;
		}
	    }
	    catch (err) {
		console.log(err);
	    }
	}
	editUsernameForm.button.addEventListener("click", editUsername);
    }
}



// edit password
function editPasswordEventHandler() {
    if (document.querySelector("#editPasswordModal")) {
	const editPasswordForm = {
	    password: document.querySelector("#edit-password"),
	    button: document.querySelector("#edit-password-button"),
	    message: document.querySelector(".edit-password-error-message")
	};

	async function editPassword() {
	    const url = "http://localhost:8000/accounts/edit/password/";
	    const csrftoken = getCookie('csrftoken');
	    const formData = new FormData();
	    formData.append("password", editPasswordForm.password.value);
	    try {
		const promise = await fetch(url, {
		    method: "POST",
		    headers: {
			"X-CSRFToken": csrftoken,
		    },
		    body: formData
		});
		const text = await promise.text();
		if (promise.ok) {
		    document.body.innerHTML = text;
		    setLoginEventHandler();
		    setSignupEventHandler();
		    gameOverEventHandler();
		    editPasswordForm.password.value = "";
		    editPasswordForm.message.textContent = "";
		    document.querySelector("#login-modal-button").click();
		    history.replaceState(document.body.innerHTML, "", "");
		}
		else // (promise.status == 403)
		{
		    editPasswordForm.message.textContent = text;
		}
	    }
	    catch (err) {
		console.log(err);
	    }
	}
	editPasswordForm.button.addEventListener("click", editPassword);
    }
}



// edit avatar
function editAvatarEventHandler() {
    if (document.querySelector("#editAvatarModal")) {
	const editAvatarForm = {
	    avatar: document.querySelector("#edit-avatar"),
	    button: document.querySelector("#edit-avatar-button"),
	    message: document.querySelector(".edit-avatar-error-message")
	};

	async function editAvatar() {
	    const url = "http://localhost:8000/accounts/edit/avatar/";
	    const csrftoken = getCookie('csrftoken');
	    const formData = new FormData();
	    formData.append("avatar", editAvatarForm.avatar.files[0]);
	    try {
		const promise = await fetch(url, {
		    method: "POST",
		    headers: {
			"X-CSRFToken": csrftoken,
		    },
		    body: formData
		});
		if (promise.ok) {
		    const json = await promise.json();
		    document.querySelector("#edit-avatar-close").click();
		    let image = document.querySelector("#avatar");
		    image.src = json["url"];
		    editAvatarForm.avatar.value = "";
		    editAvatarForm.message.textContent = "";
		    history.replaceState(document.body.innerHTML, "", "");
		}
		else // (promise.status == 403)
		{
		    const text = await promise.text();
		    editAvatarForm.message.textContent = text;
		}
	    }
	    catch (err) {
		console.log(err);
	    }
	}
	editAvatarForm.button.addEventListener("click", editAvatar);
    }
}



// add friends
function addFriendEventHandler() {
    if (document.querySelector("#addFriendModal")) {
	const addFriendForm = {
	    friendname: document.querySelector("#requested-friend"),
	    button: document.querySelector("#add-friend-button"),
	    message: document.querySelector(".add-friend-error-message")
	};

	async function addFriend() {
	    const url = "http://localhost:8000/accounts/friend/add/";
	    const csrftoken = getCookie('csrftoken');
	    const formData = new FormData();
	    formData.append("friendname", addFriendForm.friendname.value);
	    try {
		const promise = await fetch(url, {
		    method: "POST",
		    headers: {
			"X-CSRFToken": csrftoken,
		    },
		    body: formData
		});
		const text = await promise.text();
		if (promise.ok) {
		    document.querySelector("#add-friend-close").click();
		    friendList = document.querySelector("#friend-list");
		    friendList.innerHTML = text;
		    addFriendForm.friendname.value = "";
		    addFriendForm.message.textContent = "";
		    history.replaceState(document.body.innerHTML, "", "");
		}
		else // ( promise.status == (403 || 404) )
		{
		    addFriendForm.message.textContent = text;
		}
	    }
	    catch (err) {
		console.log(err);
	    }
	}
	addFriendForm.button.addEventListener("click", addFriend);
    }
}



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
