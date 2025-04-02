import ViewBase from "./ViewBase"
import PongGame from "../pongGame/PongGame"
import Cookies from 'js-cookie'

class InputError extends Error {
    constructor(description) {
        super(JSON.stringify(description));
        this.description = description
    }
}

async function getMatch(id) {
    const response = await fetch(`/matches/${id}`, {
        method: "GET",
        headers: { "X-CSRFToken": Cookies.get("csrftoken") }
    })
    if (response.ok) {
        return await response.json()
    }
    else if (response.status === 404) {
        return null
    }
    else {
        throw new Error(`error while fetching match ${id}`)
    }
}

async function getNextMatch(tournament_id) {
    const response = await fetch(`/matches/tournaments/${tournament_id}/next-match`, {
        method: "GET",
        headers: { "X-CSRFToken": Cookies.get("csrftoken") }
    })
    if (response.ok) {
        return await response.json()
    }
    else if (response.status === 404) {
        return null
    }
    else {
        throw new Error(`error while fetching next match for tournament ${this.id}`)
    }
}

async function getTournamentResults(tournament_id) {
    const response = await fetch(`/matches/tournaments/${tournament_id}/results`, {
        method: "GET",
        headers: { "X-CSRFToken": Cookies.get("csrftoken") }
    })
    if (response.ok) {
        return await response.json()
    }
    else {
        throw new Error(`error while fetching results for tournament ${this.id}`)
    }
}

async function getTournament(id) {
    const tournamentResponse = await fetch(`/matches/tournaments/${id}`, {
        method: "GET",
        headers: { "X-CSRFToken": Cookies.get("csrftoken") }
    })
    if (tournamentResponse.ok) {
        const tournament = await tournamentResponse.json()
        tournament.nextMatch = async function () { return await getNextMatch(this.id) }
        tournament.results = async function () { return await getTournamentResults(this.id) }
        return tournament
    }
    else if (tournamentResponse.status === 404) {
        return null
    }
    else {
        throw new Error(`error while fetching tournament ${id}`)
    }
}

async function patchMatch(matchId, patchData) {
    const response = await fetch(`/matches/${matchId}`, {
        method: "PATCH",
        headers: { "X-CSRFToken": Cookies.get("csrftoken") },
        body: JSON.stringify(patchData)
    })
    if (!response.ok) {
        throw new Error(`error while patching match ${id}`)
    }
}

async function newMatch(matchData) {
    const response = await fetch("/matches/new", {
        method: "POST",
        headers: { "X-CSRFToken": Cookies.get("csrftoken") },
        body: JSON.stringify(matchData)
    })
    if (response.ok) {
        return await response.json()
    }
    else if (response.status === 400) {
        throw new InputError(await response.json())
    }
    else {
        throw new Error(`error while creating new match`)
    }
}

async function newTournament(tournamentData) {
    const response = await fetch("/matches/tournaments/new", {
        method: "POST",
        headers: { "X-CSRFToken": Cookies.get("csrftoken") },
        body: JSON.stringify(tournamentData)
    })
    if (response.ok) {
        const tournament = await response.json()
        tournament.nextMatch = async function () { return await getNextMatch(this.id) }
        tournament.results = async function () { return await getTournamentResults(this.id) }
        return tournament
    }
    else if (response.status === 400) {
        throw new InputError(await response.json())
    }
    else {
        throw new Error(`unable to create new tournament (${response.status})`)
    }
}

export default class extends ViewBase {
    constructor() {
        super("/pong", "/pong/ssr/index")
    }

    async render() {
        var res = await super.render()
        if (res == 0) {
            console.log("Index view rendered")
            if (this.modal)
                return await this.modal.render(false)
            return 0 // did render normaly
        } else {
            return res
        }
    }

    async init() {
        await super.init()
        this.#pongGame = new PongGame($("#canvas").get(0))
        this.#pongGame.onRoundEnd(this.#onRoundEnd.bind(this))
        
        try {
            const tournamentId = localStorage.getItem("tournamentId");
            if (tournamentId) {
                this.#tournament = await getTournament(tournamentId)
                if (this.#tournament == null) {
                    localStorage.removeItem("tournamentId")
                }
            }

            const matchId = localStorage.getItem("matchId");
            if (matchId) {
                this.#match = await getMatch(matchId)
                if (this.#match == null) {
                    localStorage.removeItem("matchId")
                }
                // TODO : if there is a tournament, check if the match is linked to the tournament (error if not)
            }
        }
        catch (error) {
            console.warn(error)
        }
        this.#startNewRound()
        console.log("Index view initialized")
        if (this.modal)
            await this.modal.init()
    }

    clean() {
        super.clean()
        if (this.#pongGame)
            this.#pongGame.clean()
        console.log("Index view cleaned")
    }

    refresh() {
        super.refresh()
        this.#showRootMenu()
    }

// private:
    #pongGame


    /*
    Tournament {
        id: int
    }
    */
    #tournament = null
    
    /*
    Match {
        id: int (null if the match is couldn't be created in the backend)

        p1_type: int (0=user, 1=guest, 2=ai)
        p1_nickname: string
        p1_score: int

        p2_type: int (0=user, 1=guest, 2=ai)
        p2_nickname: string
        p2_score: int

        is_finished: bool
        tournament_id: int | null
    }
    */
    #match = null

    #buildPlayerForm = (playerNum, isCurrentUser = false) => {
        return /*html*/`
            <div class="col">
                <h4>Player ${playerNum}</h4>
                <div class="mb-3">
                    <label for="nickname-${playerNum}" class="form-label">Nickname</label>
                    <input type="text" class="form-control" id="nickname-${playerNum}" name="nickname-${playerNum}" value="${isCurrentUser ? window.user.username : ""}" required/>
                </div>
                <div id="login-${playerNum}" style="display:none">
                    <div class="mb-3">
                        <label for="username-${playerNum}" class="form-label">Username</label>
                        <input type="text" class="form-control" id="username-${playerNum}" name="username-${playerNum}"/>
                    </div>
                    <div class="mb-3">
                        <label for="password-${playerNum}" class="form-label">Password</label>
                        <input type="password" class="form-control" id="password-${playerNum}" name="password-${playerNum}"/>
                    </div>
                </div>
                    <button type="button" class="btn btn-link" ` + (isCurrentUser ? "disabled" : `onclick="( function() {
                        const loginDiv = document.getElementById('login-${playerNum}');
                        const btn = event.target;
                        if (!loginDiv || !btn)
                            return;
                        if (loginDiv.style.display === '' || loginDiv.style.display === 'none')
                        {
                            loginDiv.style.display = 'block';
                            btn.textContent = 'guest';
                            document.getElementById('username-${playerNum}').setAttribute('required', '');
                            document.getElementById('password-${playerNum}').setAttribute('required', '');
                            document.getElementById('password-${playerNum}').setAttribute('minlength', '5');
                        }
                        else
                        {
                            loginDiv.style.display = 'none';
                            btn.textContent = 'login';
                            document.getElementById('username-${playerNum}').removeAttribute('required');
                            document.getElementById('password-${playerNum}').removeAttribute('required');
                            document.getElementById('password-${playerNum}').removeAttribute('minlength');
                        }
                    })()"`) + ">login</button></div>"
    }

    #getPlayerInfo(playerNum) {
        const isCredentialsProvided = $(`#login-${playerNum}`).css("display") !== "none";
        if (playerNum === 1 && window.user != null || isCredentialsProvided)
            var type = 0 // user currently logged in
        else
            var type = 1 // guest
        //  var type = 2 AI
        return { 
            type: type,
            isLoggedUser: playerNum == 1 && type == 0 && isCredentialsProvided == false,
            nickname: $(`#nickname-${playerNum}`).val(),
            username: isCredentialsProvided ? $(`#username-${playerNum}`).val() : null,
            password: isCredentialsProvided ? $(`#password-${playerNum}`).val() : null
        };
    }

    #setPlayerValidationErrors(playerNum, validation) {
        if (validation.nickname) {
            $(`#nickname-${playerNum}`).addClass("is-invalid");
            $(`#nickname-${playerNum}`).removeClass("is-valid");
        } else {
            $(`#nickname-${playerNum}`).removeClass("is-invalid");
            $(`#nickname-${playerNum}`).addClass("is-valid");
        }
        if ($(`#login-${playerNum}`).css("display") !== "none" && (validation.username || validation.credentials)) {
            $(`#username-${playerNum}`).addClass("is-invalid");
            $(`#username-${playerNum}`).removeClass("is-valid");
        } else if ($(`#login-${playerNum}`).css("display") !== "none") {
            $(`#username-${playerNum}`).removeClass("is-invalid");
            $(`#username-${playerNum}`).addClass("is-valid");
        }
        if ($(`#login-${playerNum}`).css("display") !== "none" && (validation.password || validation.credentials)) {
            $(`#password-${playerNum}`).addClass("is-invalid");
            $(`#password-${playerNum}`).removeClass("is-valid");
        } else if ($(`#login-${playerNum}`).css("display") !== "none") {
            $(`#password-${playerNum}`).removeClass("is-invalid");
            $(`#password-${playerNum}`).addClass("is-valid");
        }
    }

    #showTournamentMenu() {
        $("#floating-menu").html(/*html*/`
            <div class="container tour-menu">
                <h3 class="mb-3 menu-title">New Tournament</h3>
                <hr>
                <form id="tournament-form" novalidate>
                    <label for="tournament-type-select">Type:</label>
                    <select name="type" id="tournament-type-select">
                        <option value="0">Round Robin</option>
                        <option value="1">Single Elimination</option>
                    </select>
                    <div class="row">
                        ${this.#buildPlayerForm(1, window.user != null)}
                        ${this.#buildPlayerForm(2)}
                        ${this.#buildPlayerForm(3)}
                        ${this.#buildPlayerForm(4)}
                    </div>
                    <div class="d-flex justify-content-between mt-3">
                        <button type="button" class="btn btn-secondary" id="back-btn">Back</button>
                        <button type="submit" class="btn btn-primary" id="start-btn">Start</button>
                    </div>
                </form>
            </div>
        `);

        $("#back-btn").on("click", () => {
            this.#showRootMenu()
        });

        $("#tournament-form").on("submit", async (e) => {
            e.preventDefault();
            const formEl = e.currentTarget;
            if (formEl.checkValidity()) {
                formEl.classList.remove("was-validated");
                const players = [
                    this.#getPlayerInfo(1),
                    this.#getPlayerInfo(2),
                    this.#getPlayerInfo(3),
                    this.#getPlayerInfo(4)
                ]
                try {
                    this.#tournament = await newTournament({
                        players: players,
                        type: parseInt($("#tournament-type-select").val())
                    })
                    localStorage.setItem("tournamentId", this.#tournament.id)
                    $("#floating-menu").html("")
                    this.#startNewRound()
                }
                catch (error) {
                    if (error instanceof InputError) {
                        if (error.description.message) {
                            console.error(error.description.message)
                        }
                        if (error.description.hasOwnProperty("players")) {
                            this.#setPlayerValidationErrors(1, error.description.players["1"])
                            this.#setPlayerValidationErrors(2, error.description.players["2"])
                            this.#setPlayerValidationErrors(3, error.description.players["3"])
                            this.#setPlayerValidationErrors(4, error.description.players["4"])
                        }
                        return
                    }
                    else {
                        console.error(error)
                    }
                }
            }
            else {
                formEl.classList.add("was-validated");
            }
        });
    }

    #showPvpMenu() {
        $("#floating-menu").html(/*html*/`
            <div class="container pvp-menu">
                <h3 class="mb-3 menu-title">New PvP match</h3>
                <hr>
                <form id="pvp-form" novalidate>
                    <div class="row">
                        ${this.#buildPlayerForm(1, window.user != null)}
                        ${this.#buildPlayerForm(2)}
                    </div>
                    <div class="d-flex justify-content-between mt-3">
                        <button type="button" class="btn btn-secondary" id="back-btn">Back</button>
                        <button type="submit" class="btn btn-primary" id="start-btn">Start</button>
                    </div>
                </form>
            </div>
        `);

        $("#back-btn").on("click", () => {
            this.#showRootMenu()
        });

        $("#pvp-form").on("submit", async (e) => {
            e.preventDefault();
            const formEl = e.currentTarget;
            if (formEl.checkValidity()) {
                formEl.classList.remove("was-validated");
                const players = [
                    this.#getPlayerInfo(1),
                    this.#getPlayerInfo(2)
                ]
                try {
                    this.#match = await newMatch({
                        players: players
                    })
                    localStorage.setItem("matchId", this.#match.id)
                }
                catch(error) {
                    if (error instanceof InputError) {
                        if (error.description.message) {
                            console.error(error.description.message)
                        }
                        if (error.description.hasOwnProperty("players")) {
                            this.#setPlayerValidationErrors(1, error.description.players["1"])
                            this.#setPlayerValidationErrors(2, error.description.players["2"])
                        }
                        return
                    }
                    else {
                        console.warn(error)
                        this.#match = {
                            id: null,
                            p1_type: players[0].type, p1_nickname: players[0].nickname, p1_score: 0,
                            p2_type: players[1].type, p2_nickname: players[1].nickname, p2_score: 0,
                            is_finished: false,
                            tournament_id: null
                        }
                    }
                } 
                $("#floating-menu").html("")
                this.#startNewRound()
            }
            else {
                formEl.classList.add("was-validated");
            }
        });
    }
    
    #showPvAiMenu() {
        $("#floating-menu").html(/*html*/`
            <div class="container pva-menu">
                <h3 class="mb-3 menu-title">New PvP match</h3>
                <hr>
                <form id="pva-form" novalidate>
                    <div class="row">
                        ${this.#buildPlayerForm(1, window.user != null)}
                    </div>
                    <div class="d-flex justify-content-between mt-3">
                        <button type="button" class="btn btn-secondary" id="back-btn">Back</button>
                        <button type="submit" class="btn btn-primary" id="start-btn">Start</button>
                    </div>
                </form>
            </div>
        `);

        $("#back-btn").on("click", () => {
            this.#showRootMenu()
        });

        $("#pva-form").on("submit", async (e) => {
            e.preventDefault();
            const formEl = e.currentTarget;
            if (formEl.checkValidity()) {
                formEl.classList.remove("was-validated");
                const players = [
                    this.#getPlayerInfo(1),
                    { 
                        type: 2,
                        isLoggedUser: false,
                        nickname: "AI",
                        username: null,
                        password: null
                    }
                ]
                try {
                    this.#match = await newMatch({
                        players: players
                    })
                    localStorage.setItem("matchId", this.#match.id)
                }
                catch(error) {
                    if (error instanceof InputError) {
                        if (error.description.message) {
                            console.error(error.description.message)
                        }
                        if (error.description.hasOwnProperty("players")) {
                            this.#setPlayerValidationErrors(1, error.description.players["1"])
                        }
                        return
                    }
                    else {
                        console.warn(error)
                        this.#match = {
                            id: null,
                            p1_type: players[0].type, p1_nickname: players[0].nickname, p1_score: 0,
                            p2_type: players[1].type, p2_nickname: players[1].nickname, p2_score: 0,
                            is_finished: false,
                            tournament_id: null
                        }
                    }
                } 
                $("#floating-menu").html("")
                this.#startNewRound()
            }
            else {
                formEl.classList.add("was-validated");
            }
        });
    }

    #showRootMenu() {
        $("#floating-menu").html(/*html*/`
            <div class="container root-menu">
                <h3 class="mb-3 menu-title">New Game</h3>
                <hr>
                <button class="btn btn-secondary btn-custom" id="pva-btn">Player versus AI</button>
                <button class="btn btn-secondary btn-custom" id="pvp-btn">Player versus Player</button>
                <button class="btn btn-secondary btn-custom" id="tour-btn">Tournament</button>
            </div>
        `)
        $("#pva-btn").on("click", () => {
            this.#showPvAiMenu()
        })
        $("#pvp-btn").on("click", () => {
            this.#showPvpMenu()
        })
        $("#tour-btn").on("click", () => {
            this.#showTournamentMenu()
        })
    }

    async #showTournamentResults() {
        const results = await this.#tournament.results()
        if (results.rankings.length > 0) {
            $("#floating-menu").html(/*html*/`
                <div class="container tournament-result">
                    <h3 class="mb-3 menu-title">Tournament Complete</h3>
                    <hr>
                    <p>Winner: ${results.winner}</p>
                    <p>Final Rankings:</p>
                    <ol>
                        ${results.rankings.map((p) => `<li>${p.nickname} (${p.wins} wins)</li>`).join('')}
                    </ol>
                    <button class="btn btn-secondary btn-custom" id="return-btn">Return to Menu</button>
                </div>
            `);
        } else {
            $("#floating-menu").html(/*html*/`
                <div class="container tournament-result">
                    <h3 class="mb-3 menu-title">Tournament Complete</h3>
                    <hr>
                    <p>Winner: ${results.winner}</p>
                    <button class="btn btn-secondary btn-custom" id="return-btn">Return to Menu</button>
                </div>
            `);
        }
        $("#return-btn").on("click", () => {
            this.#tournament = null
            localStorage.removeItem("tournamentId")
            this.#showRootMenu();
        });
    }

    #showMatchResults() {
        $("#floating-menu").html(/*html*/`
            <div class="container match-results">
                <h3 class="mb-3 menu-title">Match Complete</h3>
                <hr>
                <p>Winner: ${this.#match.p1_score > this.#match.p2_score ? this.#match.p1_nickname : this.#match.p2_nickname}</p>
                <p>Score: ${this.#match.p1_nickname} ${this.#match.p1_score} - ${this.#match.p2_score} ${this.#match.p2_nickname}</p>
                <button class="btn btn-secondary btn-custom" id="return-btn">Return to Menu</button>
            </div>
        `);
        $("#return-btn").on("click", () => {
            this.#match = null
            localStorage.removeItem("matchId")
            this.#showRootMenu();
        });
    }

    #showMatchAnouncement() {
        $("#floating-menu").html(/*html*/`
            <div class="container match-anouncement">
                <h3 class="mb-3 menu-title">Next match</h3>
                <hr>
                <div class="d-flex justify-content-around align-items-center mb-4">
                    <div class="text-center">
                        <h4>${this.#match.p1_nickname}</h4>
                    </div>
                    <div class="text-center">
                        <h3>VS</h3>
                    </div>
                    <div class="text-center">
                        <h4>${this.#match.p2_nickname}</h4>
                    </div>
                </div>
                <div class="text-center">
                    <button class="btn btn-primary btn-custom" id="start-match-btn">Start Match</button>
                </div>
            </div>
        `);
        
        $("#start-match-btn").on("click", () => {
            $("#floating-menu").html("");
            localStorage.setItem("matchId", this.#match.id)
            this.#pongGame.start_round(this.#match);
        });
    }

    async #startNewRound() {
        if (this.#match && this.#match.is_finished == false) {
            this.#pongGame.start_round(this.#match);
        }
        else if (this.#tournament) {
            this.#match = await this.#tournament.nextMatch()
            if (this.#match) {
                this.#showMatchAnouncement()
            }
            else {
                this.#showTournamentResults()
            }
        }
        else {
            this.#showRootMenu()
        }
    }

    async #onRoundEnd(result) {
        console.assert(this.#match) // round is started with this.#match so it should still be here when the round end
        if (result.winner === 1) {
            this.#match.p1_score += 1
        }
        else if (result.winner === 2) {
            this.#match.p2_score += 1
        }
        if (this.#match.p1_score >= 3 || this.#match.p2_score >= 3) {
            this.#match.is_finished = true
        }
        try {
            await patchMatch(this.#match.id, {
                p1_score: this.#match.p1_score,
                p2_score: this.#match.p2_score,
                is_finished: this.#match.is_finished
            })
        }
        catch (error) {
            console.warn(error)
        }
        if (this.#match.is_finished) {
            if (this.#tournament == null) {
                this.#showMatchResults()
                return
            }
        }
        this.#startNewRound()
    }
}
