// login and signup pages
const loginForm = {
    username: document.querySelector(".login-username"),
    password: document.querySelector(".login-password"),
    submit: document.querySelector(".login-button")
};

const signupForm = {
    username: document.querySelector(".signup-username"),
    password: document.querySelector(".signup-password"),
    submit: document.querySelector(".signup-button")
};

async function displayForm(formType) {
    const url = `http://localhost:8000/accounts/${formType}/`;
    await fetch(url, { method: "GET" })
	.then((promise) => promise.text())
	.then((text) => {
	    document.body.innerHTML = text;
	    history.pushState(text, "", url);
	})
	.catch((err) => console.log(err));
}

loginForm.submit.addEventListener("click", () => displayForm("login"));
signupForm.submit.addEventListener("click", () => displayForm("signup"));



// history api
window.addEventListener("popstate", (event) => {
    if (event.state)
	document.body.innerHTML = event.state;
});

const initialState = document.body.innerHTML;
history.replaceState(initialState, "", document.location.href);
