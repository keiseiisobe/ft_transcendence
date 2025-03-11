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
import AddFriendModal from "./modals/AddFriendModal";

var currentView = null
var currentPathname = null

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

async function logoutAction() {
    const promise = await fetch("/accounts/logout/", {
        method: "POST",
        headers: { "X-CSRFToken": Cookies.get("csrftoken") },
        mode: 'same-origin',
    });
    if (!promise.ok)
        throw promise.statusText
    $("#navbar-btns").html(`
        <a class="nav-item btn btn-dark" href="/pong/login">Login</a>
        <a class="nav-item btn btn-dark" href="/pong/signup">Signup</a>
    `)
}

async function onUrlAction(pathname) {
    switch(pathname) {
        case "/accounts/logout":
        case "/accounts/logout/":
            await logoutAction()
            return "/pong"
        default:
            return pathname
    }
}




$(function () {
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
            const pathname = await onUrlAction(link.pathname)
            const view = getViewFromPathname(pathname)
            const modal = getModalFromPathname(pathname)
            if (view == null && modal == null)
                return
            if (await switchToView(view, modal) == 0)
                window.pushState(pathname)
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
        const pathname = await onUrlAction(location.pathname)
        const view = getViewFromPathname(pathname)
        const modal = getModalFromPathname(pathname)
        if (view == null && modal == null)
            return
        if (await switchToView(view, modal) == 0)
            currentPathname = pathname
    }
    catch (error)
    {
        console.error(error) 
        history.pushState(null, null, currentPathname)
    }
}
