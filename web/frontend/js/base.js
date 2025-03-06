import "vite/modulepreload-polyfill";
import jQuery from "jquery";
window.$ = window.jQuery = jQuery;
import * as bootstrap from "bootstrap";

import "../scss/base.scss";
import "~fontawesome/js/all.js"


var currentView = null

async function switchToView(view, render = true) {
    if (currentView != null)
        currentView.clean()
    currentView = view
    if (render)
        await currentView.render()
    setTimeout(async () => {
        await currentView.init()
    }, 0);
}

window.switchToView = switchToView

import IndexView from "./views/IndexView"
import LoginModal from "./modals/LoginModal"
import SignupModal from "./modals/SignupModal";

function getViewFromPathname(pathname) {
    switch(pathname) {
        case "/pong/":
        case "/pong":
            return new IndexView()
        case "/pong/login/":
        case "/pong/login":
            return new IndexView(new LoginModal())
        case "/pong/signup/":
        case "/pong/signup":
            return new IndexView(new SignupModal())
        default:
            return null
    }
}

$(window).on("popstate", (_) => {
    const view = getViewFromPathname(location.pathname)
    if (view)
        window.switchToView(view)
})

$(async function () {
    $(this.body).on("click", async (event) => {
        if (event.target.pathname) {
            event.preventDefault()
            const view = getViewFromPathname(event.target.pathname)
            if (view) {
                await window.switchToView(view)
                history.pushState(null, null, event.target.pathname)
            }
        }
    });
    const view = getViewFromPathname(this.location.pathname)
    if (view) {
        await window.switchToView(view, false)
        history.pushState(null, null, this.location.pathname)
    }
});
