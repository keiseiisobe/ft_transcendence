import json
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate

# Create your views here.

@require_http_methods(["POST"])
def matches_new(request):
    pass

@require_http_methods(["GET", "POST"])
def matches_details(request, id:int):
    pass

@require_http_methods(["POST"])
def tournament_new(request):
    pass










@require_http_methods(["POST"])
def new_match(request):
    try:
        data = json.loads(request.body)
        players = data["players"]
        
        # Ensure exactly 2 players for a match
        if len(players) != 2:
            return JsonResponse({"message": "Match requires exactly 2 players"}, status=400)
            
        p1 = players[0]
        p2 = players[1]
    except (json.JSONDecodeError, KeyError) as e:
        return JsonResponse({"message": f"invalid request data: {e}"}, status=400)

    def validate_player(pdata, label):
        if pdata["type"] == "loggedInUser":
            if request.user.is_authenticated and not pdata.get("username"):
                return request.user
            user = authenticate(username=pdata.get("username"), password=pdata.get("password"))
            if not user:
                return JsonResponse({"invalidUser": label}, status=400)
            return user
        return None

    user_p1 = validate_player(p1, 0)
    if isinstance(user_p1, JsonResponse):
        return user_p1
    user_p2 = validate_player(p2, 1)
    if isinstance(user_p2, JsonResponse):
        return user_p2

    from .models import Match
    match = Match.objects.create(
        p1_type=0 if user_p1 else 1,  # 0=User,1=Guest
        p1_nickname=p1["nickname"][:10],
        p1_user=user_p1,
        p1_score=0,
        p2_type=0 if user_p2 else 1,
        p2_nickname=p2["nickname"][:10],
        p2_user=user_p2,
        p2_score=0
    )

    return JsonResponse({
        "matchId": match.id,
        "scorePlayer1": match.p1_score,
        "scorePlayer2": match.p2_score
    })

@require_http_methods(["GET"])
def get_match_score(request):
    match_id = request.GET.get('matchId')
    
    if not match_id:
        return JsonResponse({"error": "Match ID is required"}, status=400)
    
    try:
        from .models import Match
        match = Match.objects.get(id=match_id)
        
        if match.is_finished:
            return JsonResponse({"error": "Match is finished"}, status=404)
        
        return JsonResponse({
            "scoreLeft": match.p1_score,
            "scoreRight": match.p2_score,
            "player1Name": match.p1_nickname,
            "player2Name": match.p2_nickname
        })
    except Match.DoesNotExist:
        return JsonResponse({"error": "Match not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@require_http_methods(["POST"])
def update_match_score(request):
    try:
        data = json.loads(request.body)
        match_id = data.get("matchId")
        new_score_left = data.get("scoreLeft")
        new_score_right = data.get("scoreRight")
        
        if not match_id or new_score_left is None or new_score_right is None:
            return JsonResponse({"error": "Invalid request data"}, status=400)
        
        from .models import Match
        match = Match.objects.get(id=match_id)
        
        if new_score_left > match.p1_score:
            match.p1_score = new_score_left
        elif new_score_right > match.p2_score:
            match.p2_score = new_score_right
        
        match_finished = match.p1_score >= 3 or match.p2_score >= 3
        if match_finished:
            match.is_finished = True
        
        match.save()
        
        if match_finished:
            return JsonResponse({
                "matchFinished": True,
                "winner": "left" if match.p1_score >= 3 else "right",
                "winnerNickname": match.p1_nickname if match.p1_score >= 3 else match.p2_nickname,
                "finalScore": {
                    "scoreLeft": match.p1_score,
                    "scoreRight": match.p2_score
                },
                "players": {
                    "left": match.p1_nickname,
                    "right": match.p2_nickname
                }
            })
        else:
            return JsonResponse({
                "matchFinished": False,
                "scoreLeft": match.p1_score,
                "scoreRight": match.p2_score
            })
        
    except Match.DoesNotExist:
        return JsonResponse({"error": "Match not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@require_http_methods(["POST"])
def new_tournament(request):
    try:
        data = json.loads(request.body)
        players = data["players"]
        
        # Ensure exactly 4 players for a tournament
        if len(players) != 4:
            return JsonResponse({"message": "Tournament requires exactly 4 players"}, status=400)
            
    except (json.JSONDecodeError, KeyError) as e:
        return JsonResponse({"message": f"invalid request data: {e}"}, status=400)

    def validate_player(pdata, index):
        if pdata["type"] == "loggedInUser":
            if request.user.is_authenticated and not pdata.get("username"):
                return request.user
            user = authenticate(username=pdata.get("username"), password=pdata.get("password"))
            if not user:
                return JsonResponse({"invalidUser": index}, status=400)
            return user
        return None

    # Validate all players
    validated_users = []
    for i, player in enumerate(players):
        user = validate_player(player, i)
        if isinstance(user, JsonResponse):
            return user
        validated_users.append(user)

    from .models import Tournament, Match
    # Create tournament
    tournament = Tournament.objects.create()
    
    # Create matches for round-robin tournament (everyone plays against everyone once)
    first_match = None
    for i in range(len(players)):
        for j in range(i + 1, len(players)):
            # Player i vs Player j
            p1, p2 = players[i], players[j]
            user_p1, user_p2 = validated_users[i], validated_users[j]
            
            match = Match.objects.create(
                p1_type=0 if user_p1 else 1,  # 0=User,1=Guest
                p1_nickname=p1["nickname"][:10],
                p1_user=user_p1,
                p1_score=0,
                p2_type=0 if user_p2 else 1,
                p2_nickname=p2["nickname"][:10],
                p2_user=user_p2,
                p2_score=0,
                tournament=tournament
            )
            
            if first_match is None:
                first_match = match

    return JsonResponse({
        "tournamentId": tournament.id,
        "matchId": first_match.id,
        "scorePlayer1": first_match.p1_score,
        "scorePlayer2": first_match.p2_score
    })

@require_http_methods(["GET"])
def next_tournament_match(request):
    tournament_id = request.GET.get('tournamentId')
    
    if not tournament_id:
        return JsonResponse({"error": "Tournament ID is required"}, status=400)
    
    try:
        from .models import Tournament, Match
        from django.db.models import Q
        
        tournament = Tournament.objects.get(id=tournament_id)
        matches = Match.objects.filter(tournament=tournament)
        
        # Check if all matches are finished
        if tournament.is_finished:
            # Calculate tournament rankings
            player_stats = {}
            
            # Collect all player nicknames
            for match in matches:
                if match.p1_nickname not in player_stats:
                    player_stats[match.p1_nickname] = {"wins": 0, "points": 0}
                if match.p2_nickname not in player_stats:
                    player_stats[match.p2_nickname] = {"wins": 0, "points": 0}
                
                # Count wins and points
                if match.is_finished:
                    if match.p1_score > match.p2_score:
                        player_stats[match.p1_nickname]["wins"] += 1
                    else:
                        player_stats[match.p2_nickname]["wins"] += 1
                    
                    player_stats[match.p1_nickname]["points"] += match.p1_score
                    player_stats[match.p2_nickname]["points"] += match.p2_score
            
            # Convert to sorted list (by wins, then by points)
            rankings = [
                {"nickname": nickname, "wins": stats["wins"], "points": stats["points"]}
                for nickname, stats in player_stats.items()
            ]
            rankings.sort(key=lambda x: (x["wins"], x["points"]), reverse=True)
            
            tournament_winner = rankings[0]["nickname"] if rankings else "Unknown"
            
            return JsonResponse({
                "tournamentFinished": True,
                "tournamentWinner": tournament_winner,
                "rankings": rankings
            })
        else:
            # Find next unfinished match
            next_match = matches.filter(is_finished=False).first()
            
            if not next_match:
                # This shouldn't happen if tournament.is_finished is reliable
                return JsonResponse({
                    "error": "Tournament state inconsistent - no matches available"
                }, status=500)
                
            return JsonResponse({
                "tournamentFinished": False,
                "matchId": next_match.id,
                "scorePlayer1": next_match.p1_score,
                "scorePlayer2": next_match.p2_score,
                "player1": next_match.p1_nickname,
                "player2": next_match.p2_nickname
            })
            
    except Tournament.DoesNotExist:
        return JsonResponse({"error": "Tournament not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
