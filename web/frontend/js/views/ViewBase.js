import Cookies from 'js-cookie'
import IndexView from './IndexView'
import LoginModal from '../modals/LoginModal'

export default class {
    constructor(pathname, ssr_endpoint) {
        this.pathname = pathname
        this.#ssr_endpoint = ssr_endpoint
    }

    get modal() {
        return this.#__modal__
    }

    set modal(m) {
        if (this.#__modal__)
            this.#__modal__.clean()
        this.#__modal__ = m
        if (this.#__modal__)
            this.#__modal__.onHide = async () => {
                if (await switchToView(new this.constructor(), null) == 0)
                    window.pushState(this.pathname)
            }
    }

    async render() {
        const promise = await fetch(this.#ssr_endpoint, {
            method: "GET",
            headers: {"X-CSRFToken": Cookies.get("csrftoken")},
            mode: 'same-origin',
            redirect: 'manual'
        });
        if (promise.ok) {
            const data = await promise.json()
            this.#html_content = data.content 
        } else if (promise.status == 401) {
            if (await window.switchToView(new IndexView(), new LoginModal()) == 0)
                window.pushState("/pong/login")
            return 1 // did redirect
        } else {
            throw promise
        }
        console.log("view base rendered")
        return 0 // did render normally
    }

    applyRendered() {
        $("#content").html(this.#html_content)
        console.log("view base rendered applied")
    }

    async init() {
        console.log("view base initialized")
    }

    clean() {
        this.modal = null
    }

// private:
    #html_content = null

    #__modal__ = null

    #ssr_endpoint = null
}
