import ViewBase from "./ViewBase"
import PongGame from "../pongGame/PongGame"
import Cookies from 'js-cookie'

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

async function getTournament(id) {
    const tournamentResponse = await fetch(`/matches/tournaments/${id}`, {
        method: "GET",
        headers: { "X-CSRFToken": Cookies.get("csrftoken") }
    })
    if (tournamentResponse.ok) {
        const tournament = await tournamentResponse.json()
        tournament.next_match = async function () {
            const nextMatchResponse = await fetch(`/matches/tournaments/${this.id}/next-match`, {
                method: "GET",
                headers: { "X-CSRFToken": Cookies.get("csrftoken") }
            })
            if (nextMatchResponse.ok) {
                return await response.json()
            }
            else if (nextMatchResponse.status === 404) {
                return null
            }
            else {
                throw new Error(`error while fetching next match for tournament ${this.id}`)
            }
        }
        tournament.results = async function () {
            const resultsResponse = await fetch(`/matches/tournaments/${this.id}/results`, {
                method: "GET",
                headers: { "X-CSRFToken": Cookies.get("csrftoken") }
            })
            if (resultsResponse.ok) {
                return await response.json()
            }
            else if (resultsResponse.status === 404) {
                return null
            }
            else {
                throw new Error(`error while fetching results for tournament ${this.id}`)
            }
        }
    }
    else if (tournamentResponse.status === 404) {
        return null
    }
    else {
        throw new Error(`error while fetching tournament ${id}`)
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
        
        const tournamentId = localStorage.getItem("tournamentId");
        if (tournamentId) {
            this.#tournament = getTournament(tournamentId)
            if (this.#tournament == null) {
                localStorage.removeItem("tournamentId")
            }
        }

        const matchId = localStorage.getItem("matchId");
        if (matchId) {
            this.#match = getMatch(matchId)
            if (this.#match == null) {
                localStorage.removeItem("matchId")
            }
            // TODO : if there is a tournament, check if the match is linked to the tournament (error if not)
        }
         
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
        this.#rootMenu()
    }

// private:
    #pongGame
    #tournament = null
    #match = null

    #rootMenu() {
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
            $("#floating-menu").html("")
        })
        $("#pvp-btn").on("click", () => {
            this.#pvpMenu()
        })
        $("#tour-btn").on("click", () => {
            this.#tournamentMenu()
        })
    }

    #buildPlayerForm = (playerNum) => {
        return /*html*/`
            <div class="col">
                <h4>Player ${playerNum}</h4>
                <div class="mb-3">
                    <label for="nickname-${playerNum}" class="form-label">Nickname</label>
                    <input type="text" class="form-control" id="nickname-${playerNum}" name="nickname-${playerNum}" required/>
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
                <button type="button" class="btn btn-link" onclick="(
                    function() {
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
                    }
                )()">login</button>
            </div>`
    }

    #buildCurrentLoggedPlayerForm = (playerNum) => {
        return /*html*/`
            <div class="col">
                <h4>Player ${playerNum}</h4>
                <div class="mb-3">
                    <label for="nickname-${playerNum}" class="form-label">Nickname</label>
                    <input type="text" class="form-control" id="nickname-${playerNum}" name="nickname-${playerNum}" value="${window.user.username}" required/>
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
                <button type="button" class="btn btn-link" disabled>login</button>
            </div>`
    }

    #pvpMenu() {
        $("#floating-menu").html(/*html*/`
            <div class="container pvp-menu">
                <h3 class="mb-3 menu-title">New PvP match</h3>
                <hr>
                <form id="pvp-form" novalidate>
                    <div class="row">
                        ${window.user ? this.#buildCurrentLoggedPlayerForm(1) : this.#buildPlayerForm(1)}
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
            this.#rootMenu()
        });

        $("#pvp-form").on("submit", async (e) => {
            e.preventDefault();
            const formEl = e.currentTarget;
            if (formEl.checkValidity()) {
                try {
                    const res = await fetch("/matches/newMatch/", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRFToken": Cookies.get("csrftoken")
                        },
                        body: JSON.stringify({
                            players: [
                                this.#getPlayerInfo("pvp-form", 1),
                                this.#getPlayerInfo("pvp-form", 2)
                            ]
                        })
                    });
                    if (res.ok) {
                        const data = await res.json();
                        localStorage.setItem("matchId", data.matchId);
                        // Clear any previous tournament ID
                        localStorage.removeItem("tournamentId");
                        $("#floating-menu").html("");
                        
                        // Set the PvP round end handler
                        this.#pongGame.onRoundEnd(this.#onRoundEndPvP.bind(this));
                        
                        this.#pongGame.start_round({
                            scoreLeft: data.scorePlayer1,
                            scoreRight: data.scorePlayer2,
                            side: Math.random() < 0.5 ? -1 : 1
                        });
                    }
                    else if (res.status === 400) {
                        const data = await res.json();
                        formEl.classList.remove("was-validated");
                        if (typeof data.invalidUser === 'number') {
                            // Player array index corresponds to player number - 1
                            const playerNum = data.invalidUser + 1;
                            $(`#username-${playerNum}`).addClass("is-invalid");
                            $(`#password-${playerNum}`).addClass("is-invalid");
                        }
                    }
                    else
                        throw new Error(`Server responded with status: ${res.status}`);
                } catch (error) {
                    console.error("Failed to create new match:", error);
                }
            }
            else {
                formEl.classList.add("was-validated");
            }
        });
    }

    #tournamentMenu() {
        $("#floating-menu").html(/*html*/`
            <div class="container tour-menu">
                <h3 class="mb-3 menu-title">New Tournament</h3>
                <hr>
                <form id="tournament-form" novalidate>
                    <div class="row">
                        ${window.user ? this.#buildCurrentLoggedPlayerForm(1) : this.#buildPlayerForm(1)}
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
            this.#rootMenu()
        });

        $("#tournament-form").on("submit", async (e) => {
            e.preventDefault();
            const formEl = e.currentTarget;
            if (formEl.checkValidity()) {
                try {
                    const res = await fetch("/matches/newTournament/", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRFToken": Cookies.get("csrftoken")
                        },
                        body: JSON.stringify({
                            players: [
                                this.#getPlayerInfo("tournament-form", 1),
                                this.#getPlayerInfo("tournament-form", 2),
                                this.#getPlayerInfo("tournament-form", 3),
                                this.#getPlayerInfo("tournament-form", 4)
                            ]
                        })
                    });
                    
                    if (res.ok) {
                        const data = await res.json();
                        localStorage.setItem("matchId", data.matchId);
                        localStorage.setItem("tournamentId", data.tournamentId);
                        
                        // Get match details to show players
                        try {
                            const matchDetailsRes = await fetch(`/matches/score?matchId=${data.matchId}`, {
                                method: "GET",
                                headers: { "Content-Type": "application/json" }
                            });
                            
                            if (matchDetailsRes.ok) {
                                const matchDetails = await matchDetailsRes.json();
                                
                                // Show who's playing with start button
                                $("#floating-menu").html(/*html*/`
                                    <div class="container next-match">
                                        <h3 class="mb-3 menu-title">First Match</h3>
                                        <hr>
                                        <div class="d-flex justify-content-around align-items-center mb-4">
                                            <div class="text-center">
                                                <h4>${matchDetails.player1Name}</h4>
                                            </div>
                                            <div class="text-center">
                                                <h3>VS</h3>
                                            </div>
                                            <div class="text-center">
                                                <h4>${matchDetails.player2Name}</h4>
                                            </div>
                                        </div>
                                        <div class="text-center">
                                            <button class="btn btn-primary btn-custom" id="start-match-btn">Start Match</button>
                                        </div>
                                    </div>
                                `);
                                
                                // Set the Tournament round end handler
                                this.#pongGame.onRoundEnd(this.#onRoundEndTournament.bind(this));
                                
                                // Add button click event
                                $("#start-match-btn").on("click", () => {
                                    $("#floating-menu").html("");
                                    this.#pongGame.start_round({
                                        scoreLeft: data.scorePlayer1,
                                        scoreRight: data.scorePlayer2,
                                        side: Math.random() < 0.5 ? -1 : 1
                                    });
                                });
                            } else {
                                throw new Error("Failed to get match details");
                            }
                        } catch (error) {
                            console.error("Error showing match players:", error);
                            
                            // Fallback to original behavior
                            $("#floating-menu").html("");
                            this.#pongGame.onRoundEnd(this.#onRoundEndTournament.bind(this));
                            this.#pongGame.start_round({
                                scoreLeft: data.scorePlayer1,
                                scoreRight: data.scorePlayer2,
                                side: Math.random() < 0.5 ? -1 : 1
                            });
                        }
                    }
                    else if (res.status === 400) {
                        const data = await res.json();
                        formEl.classList.remove("was-validated");
                        if (typeof data.invalidUser === 'number') {
                            // Player array index corresponds to player number - 1
                            const playerNum = data.invalidUser + 1;
                            $(`#username-${playerNum}`).addClass("is-invalid");
                            $(`#password-${playerNum}`).addClass("is-invalid");
                        }
                    }
                    else
                        throw new Error(`Server responded with status: ${res.status}`);
                } catch (error) {
                    console.error("Failed to create new tournament:", error);
                }
            } else {
                formEl.classList.add("was-validated");
            }
        });
    }

    async #onRoundEndPvP(res) {
        try {
            const matchId = localStorage.getItem("matchId");
            if (!matchId)
                throw new Error(`No match id`);

            const response = await fetch("/matches/update-score/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": Cookies.get("csrftoken")
                },
                body: JSON.stringify({
                    matchId: matchId,
                    scoreLeft: res.scoreLeft,
                    scoreRight: res.scoreRight
                })
            });

            if (response.ok) {
                const data = await response.json();
                
                if (data.matchFinished) {
                    localStorage.removeItem("matchId");
                    $("#floating-menu").html(/*html*/`
                        <div class="container game-over">
                            <h3 class="mb-3 menu-title">Game Over</h3>
                            <hr>
                            <p>Winner: ${data.winnerNickname}</p>
                            <p>Final Score: ${data.players.left} ${data.finalScore.scoreLeft} - ${data.finalScore.scoreRight} ${data.players.right}</p>
                            <button class="btn btn-primary btn-custom" id="return-btn">Return to Menu</button>
                        </div>
                    `);
                    $("#return-btn").on("click", () => { this.#rootMenu(); });
                }
                else {
                    this.#pongGame.start_round({
                        scoreLeft: data.scoreLeft,
                        scoreRight: data.scoreRight,
                        side: Math.random() < 0.5 ? -1 : 1
                    });
                }
            }
            else
                throw new Error(`Failed to update match score: ${response.status} ${response.statusText}`);
        } catch (error) {
            alert(error.message);
            localStorage.removeItem("matchId");
            this.#rootMenu();
        }
    }
    
    async #onRoundEndTournament(res) {
        try {
            const matchId = localStorage.getItem("matchId");
            const tournamentId = localStorage.getItem("tournamentId");
            
            if (!matchId || !tournamentId)
                throw new Error(`Missing match or tournament id`);

            const response = await fetch("/matches/update-score/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": Cookies.get("csrftoken")
                },
                body: JSON.stringify({
                    matchId: matchId,
                    scoreLeft: res.scoreLeft,
                    scoreRight: res.scoreRight
                })
            });

            if (response.ok) {
                const data = await response.json();
                
                if (data.matchFinished) {
                    // Show match result temporarily
                    $("#floating-menu").html(/*html*/`
                        <div class="container match-result">
                            <h3 class="mb-3 menu-title">Match Complete</h3>
                            <hr>
                            <p>Winner: ${data.winnerNickname}</p>
                            <p>Score: ${data.players.left} ${data.finalScore.scoreLeft} - ${data.finalScore.scoreRight} ${data.players.right}</p>
                            <p>Loading next match...</p>
                        </div>
                    `);
                    
                    // Get next match in tournament
                    try {
                        const nextMatchResponse = await fetch(`/matches/next-tournament-match?tournamentId=${tournamentId}`, {
                            method: "GET",
                            headers: { "Content-Type": "application/json" }
                        });
                        
                        if (nextMatchResponse.ok) {
                            const nextMatchData = await nextMatchResponse.json();
                            
                            if (nextMatchData.tournamentFinished) {
                                // Tournament is complete
                                localStorage.removeItem("matchId");
                                localStorage.removeItem("tournamentId");
                                
                                $("#floating-menu").html(/*html*/`
                                    <div class="container tournament-over">
                                        <h3 class="mb-3 menu-title">Tournament Complete</h3>
                                        <hr>
                                        <p>Winner: ${nextMatchData.tournamentWinner}</p>
                                        <p>Final Rankings:</p>
                                        <ol>
                                            ${nextMatchData.rankings.map(player => `<li>${player.nickname} (${player.wins} wins)</li>`).join('')}
                                        </ol>
                                        <button class="btn btn-primary btn-custom" id="return-btn">Return to Menu</button>
                                    </div>
                                `);
                                $("#return-btn").on("click", () => { this.#rootMenu(); });
                            } else {
                                // Start next match - first show who's playing
                                localStorage.setItem("matchId", nextMatchData.matchId);
                                
                                $("#floating-menu").html(/*html*/`
                                    <div class="container next-match">
                                        <h3 class="mb-3 menu-title">Next Match</h3>
                                        <hr>
                                        <div class="d-flex justify-content-around align-items-center mb-4">
                                            <div class="text-center">
                                                <h4>${nextMatchData.player1}</h4>
                                            </div>
                                            <div class="text-center">
                                                <h3>VS</h3>
                                            </div>
                                            <div class="text-center">
                                                <h4>${nextMatchData.player2}</h4>
                                            </div>
                                        </div>
                                        <div class="text-center">
                                            <button class="btn btn-primary btn-custom" id="start-match-btn">Start Match</button>
                                        </div>
                                    </div>
                                `);
                                
                                // Add button click event
                                $("#start-match-btn").on("click", () => {
                                    $("#floating-menu").html("");
                                    this.#pongGame.start_round({
                                        scoreLeft: nextMatchData.scorePlayer1,
                                        scoreRight: nextMatchData.scorePlayer2,
                                        side: Math.random() < 0.5 ? -1 : 1
                                    });
                                });
                            }
                        } else {
                            throw new Error(`Failed to get next tournament match: ${nextMatchResponse.status}`);
                        }
                    } catch (nextMatchError) {
                        console.error("Failed to get next tournament match:", nextMatchError);
                        throw nextMatchError;
                    }
                }
                else {
                    // Continue current match
                    this.#pongGame.start_round({
                        scoreLeft: data.scoreLeft,
                        scoreRight: data.scoreRight,
                        side: Math.random() < 0.5 ? -1 : 1
                    });
                }
            }
            else {
                throw new Error(`Failed to update match score: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            alert(error.message);
            localStorage.removeItem("matchId");
            localStorage.removeItem("tournamentId");
            this.#rootMenu();
        }
    }

    #getPlayerInfo(formId, playerNum) {
        const nickname = $(`#nickname-${playerNum}`, `#${formId}`).val();
        const loginDivVisible = $(`#login-${playerNum}`, `#${formId}`).css("display") !== "none";
        const isCurrentUser = (playerNum === 1 && !!window.user); 
        const type = isCurrentUser || loginDivVisible ? "loggedInUser" : "guest";
        const username = loginDivVisible ? $(`#username-${playerNum}`, `#${formId}`).val() : null;
        const password = loginDivVisible ? $(`#password-${playerNum}`, `#${formId}`).val() : null;
        return { nickname, type, username, password };
    }


    #showRootMenu() {

    }

    #showTournamentResults() {

    }

    async #startNewRound() {
        if (this.#match) {
            this.#pongGame.start_round(this.#match);
        }
        else if (this.#tournament) {
            this.#match = await this.#tournament.nextMatch()
            if (this.#match) {
                // TODO : anounce next match
                this.#pongGame.start_round(this.#match);
            }
            else {
                this.#showTournamentResults()
            }
        }
        else {
            this.#showRootMenu()
        }
    }
}
