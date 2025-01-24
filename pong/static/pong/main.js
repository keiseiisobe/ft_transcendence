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



// login and signup
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
	.then((promise) => promise.json())
	.then((json) => console.log(json))
	.catch((err) => console.log(err));
    document.querySelector("#login-close").click();
}

loginForm.button.addEventListener("click", login);



// history api
window.addEventListener("popstate", (event) => {
    if (event.state)
	document.body.innerHTML = event.state;
});

const initialState = document.body.innerHTML;
history.replaceState(initialState, "", document.location.href);
