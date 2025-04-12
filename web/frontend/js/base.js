import "vite/modulepreload-polyfill";
import jQuery from "jquery";
window.$ = window.jQuery = jQuery;
import * as bootstrap from "bootstrap";

import "../scss/base.scss";
import "~fontawesome/js/all.js"

import IndexView from "./views/IndexView"
import LoginModal from "./modals/LoginModal"
import SignupModal from "./modals/SignupModal";
import MyPageView from "./views/MyPageView";
import Cookies from 'js-cookie'
import EditAvatarModal from "./modals/EditAvatarModal";
import EditUsernameModal from "./modals/EditUsernameModal";
import EditPasswordModal from "./modals/EditPasswordModal";
import EditTotpModal from "./modals/EditTotpModal";
import TOTPcodeModal from "./modals/TOTPcodeModal";
import AddFriendModal from "./modals/AddFriendModal";

var currentView = null
var currentPathname = null

window.user = null

window.loginUser = async (username, password) => {
    const url = window.location.origin + "/accounts/login/";
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    const promise = await fetch(url, {
        method: "POST",
        headers: {"X-CSRFToken": Cookies.get("csrftoken")},
        mode: 'same-origin',
        body: formData
    });
    const text = await promise.text();
    if (promise.ok && text.includes('use_totp_login')) {
        const modal = new TOTPcodeModal(username);
        modal.onHide = () => {
            console.log("TOTPcode modal hide");
        };
        if (await modal.render() === 0) {
            modal.applyRendered();
            modal.init();
            $('#totp-code-modal').one('hidden.bs.modal', () => {
                modal.clean();
            });
        }
        return
    }
    if (!promise.ok)
        throw promise
    window.updateNavbarAfterLogin(username);
}

window.updateNavbarAfterLogin = (username) => {
    $("#navbar-btns").html(`
        <a class="nav-item btn btn-dark" href="/pong/mypage">My Page</a>
        <button class="nav-item btn btn-dark" onclick="window.logoutUser()">Logout</button>
    `);
    window.user = { username: username };
    currentView.refresh();
}

window.logoutUser = async () => {
    const promise = await fetch("/accounts/logout/", {
        method: "POST",
        headers: { "X-CSRFToken": Cookies.get("csrftoken") },
        mode: 'same-origin',
    });
    if (!promise.ok)
        throw promise
    $("#navbar-btns").html(`
        <a class="nav-item btn btn-dark" href="/pong/login">Login</a>
        <a class="nav-item btn btn-dark" href="/pong/signup">Signup</a>
    `)
    window.user = null
    if (await switchToView(new IndexView(), null) == 0)
        window.pushState("/pong")
    currentView.refresh()
}


function getViewFromPathname(pathname) {
    switch(pathname) {
        case "/pong/":
        case "/pong":
            return new IndexView()
        case "/pong/mypage/":
        case "/pong/mypage":
        case "/pong/mypage/edit-avatar/":
        case "/pong/mypage/edit-avatar":
        case "/pong/mypage/edit-username/":
        case "/pong/mypage/edit-username":
        case "/pong/mypage/edit-password/":
        case "/pong/mypage/edit-password":
        case "/pong/mypage/edit-totp/":
        case "/pong/mypage/edit-totp":
        case "/pong/mypage/add-friend/":
        case "/pong/mypage/add-friend":
            return new MyPageView()
        default:
            return null
    }
}

function getModalFromPathname(pathname) {
    switch(pathname) {
        case "/pong/login/":
        case "/pong/login":
            return new LoginModal()
        case "/pong/signup/":
        case "/pong/signup":
            return new SignupModal()
        case "/pong/mypage/edit-avatar/":
        case "/pong/mypage/edit-avatar":
            return new EditAvatarModal()
        case "/pong/mypage/edit-username/":
        case "/pong/mypage/edit-username":
            return new EditUsernameModal()
        case "/pong/mypage/edit-password/":
        case "/pong/mypage/edit-password":
            return new EditPasswordModal()
        case "/pong/mypage/edit-totp/":
        case "/pong/mypage/edit-totp":
            return new EditTotpModal()
        case "/pong/mypage/add-friend/":
        case "/pong/mypage/add-friend":
            return new AddFriendModal()
        default:
            return null
    }
}

window.switchToView = async (view, modal) => {
    if (view != null && currentView.constructor != view.constructor) {
        view.modal = modal
        if (await view.render() == 0) {
            if (currentView != null)
                currentView.clean()
            currentView = view
            currentView.applyRendered()
            currentView.init()
            return 0
        }
    }
    else if (modal == null || currentView.modal == null || currentView.modal.constructor != modal.constructor) {
        if (modal != null && await modal.render() == 0) {
            currentView.modal = modal
            currentView.modal.applyRendered()
            currentView.modal.init()
            return 0
        } else {
            currentView.modal = null
            return 0
        }
    }
    return 1
}

window.pushState = (pathname) => {
    currentPathname = pathname
    history.pushState(null, null, pathname)
}


$(async function () {
    const promise = await fetch("/accounts/user/", {
        method: "GET",
        headers: {"X-CSRFToken": Cookies.get("csrftoken")},
        mode: 'same-origin',
    });
    if (promise.ok)
        window.user = await promise.json()

    $(this.body).on("click", onClick);
    $(window).on("popstate", onPopstate);
    
    try
    {
        currentView = getViewFromPathname(this.location.pathname) || new IndexView()
        currentView.modal = getModalFromPathname(this.location.pathname)
        currentView.init()
    }
    catch (error)
    {
        console.error(error) 
    }
});

const onClick = async (event) => {
    try
    {
        const link = event.target.closest("a");
        if (link && link.pathname) {
            event.preventDefault()
            const view = getViewFromPathname(link.pathname)
            const modal = getModalFromPathname(link.pathname)
            if (view == null && modal == null)
                return
            if (await switchToView(view, modal) == 0)
                window.pushState(link.pathname)
        }
    }
    catch (error)
    {
        console.error(error)
    }
}

const onPopstate = async (_) => {
    try
    {
        const view = getViewFromPathname(location.pathname)
        const modal = getModalFromPathname(location.pathname)
        if (view == null && modal == null)
            return
        if (await switchToView(view, modal) == 0)
            currentPathname = location.pathname
    }
    catch (error)
    {
        console.error(error) 
        history.pushState(null, null, currentPathname)
    }
}
