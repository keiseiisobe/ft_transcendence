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

var currentView = null
var currentPathname = null

function getViewFromPathname(pathname) {
    switch(pathname) {
        case "/pong/":
        case "/pong":
            return new IndexView()
        case "/pong/mypage/":
        case "/pong/mypage":
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
        default:
            return null
    }
}

window.switchToView = async (view, modal) => {
    if (view != null && currentView.constructor != view.constructor) {
        var newCurrentView = view
        newCurrentView.modal = modal
        if (await newCurrentView.render() == 0) {
            newCurrentView.init()
            if (currentView != null)
                currentView.clean()
            currentView = newCurrentView
            return 0
        }
    }
    else if (currentView.modal == null || modal == null || (modal != null && currentView.modal.constructor != modal.constructor)) {
        var newCurrentViewModal = modal
        if (newCurrentViewModal != null && await newCurrentViewModal.render() == 0) {
            newCurrentViewModal.init()
            currentView.modal = newCurrentViewModal
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
        if (event.target.pathname) {
            event.preventDefault()
            const pathname = await onUrlAction(event.target.pathname)
            const view = getViewFromPathname(pathname)
            const modal = getModalFromPathname(pathname)
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
        if (await switchToView(view, modal) == 0)
            currentPathname = pathname
    }
    catch (error)
    {
        console.error(error) 
        history.pushState(null, null, currentPathname)
    }
}
