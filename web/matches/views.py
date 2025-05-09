import json
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate

from accounts.models import User
from .models import Match, Tournament

# Create your views here.

class MyValidationError(BaseException):
    def __init__(self, desc) -> None:
        self.dict = desc

def validate_player(request, input:dict, auth_cache:dict[tuple[str,str], User|None]) -> dict:
    output = {}
    output['type'] = input['type']
    output['nickname'] = input['nickname']
    if input['type'] == 0: # user
        if input['isLoggedUser']:
            output['user'] = request.user
        else:
            if (input["username"], input["password"]) not in auth_cache:
                auth_cache[(input["username"], input["password"])] = authenticate(username=input["username"], password=input["password"])
            output['user'] = auth_cache[(input["username"], input["password"])]
        if output['user'] is None:
            raise MyValidationError({ "credentials": True })
    return output

def validate_match_players(request, p1, p2, auth_cache:dict[tuple[str,str], User|None]) -> tuple[dict, dict]:
    validation_errors = {}
    if p1['nickname'] == p2['nickname']:
        validation_errors.setdefault("players", {}).setdefault("1", {}).update({ "nickname": True })
        validation_errors.setdefault("players", {}).setdefault("2", {}).update({ "nickname": True })
    try:
        vp1 = validate_player(request, p1, auth_cache)
    except MyValidationError as e:
        validation_errors.setdefault("players", {}).setdefault("1", {}).update(e.dict)
        vp1 = None
    try:
        vp2 = validate_player(request, p2, auth_cache)
    except MyValidationError as e:
        validation_errors.setdefault("players", {}).setdefault("2", {}).update(e.dict)
        vp2 = None
    if vp1 is not None and vp2 is not None:
        if vp1.get('user', None) is not None and vp2.get('user', None) is not None and vp1['user'] == vp2['user']:
            validation_errors.setdefault("players", {}).setdefault("1", {}).update({ "credentials": True })
            validation_errors.setdefault("players", {}).setdefault("2", {}).update({ "credentials": True })
    if len(validation_errors.get("players", {})) > 0:
        raise MyValidationError(validation_errors)
    return (vp1, vp2) # pyright: ignore

@require_http_methods(["POST"])
def matches_new(request):
    try:
        data = json.loads(request.body)
        if len(data['players']) != 2:
            raise ValueError("bad input")

        p1, p2 = validate_match_players(request, data['players'][0], data['players'][1], {})
        match = Match.objects.create(p1, p2)
        return JsonResponse(match.dict())

    except MyValidationError as e:
        return JsonResponse(e.dict, status=400)

    except (json.JSONDecodeError, KeyError, IndexError, ValueError) as e:
        return JsonResponse({"message": str(e)}, status=400)

@require_http_methods(["GET", "PATCH"])
def matches_details(request, match_id:int):
    try:
        match = Match.objects.get_ongoing_match(id=match_id)
        if request.method == "GET":
            return JsonResponse(match.dict())
        elif request.method == "PATCH":
            match.patch(json.loads(request.body))
            return JsonResponse({"message": "OK"})
    except json.JSONDecodeError:
        return JsonResponse({"message": "json decode error"}, status=400)
    except Match.DoesNotExist: #pyright: ignore
        return JsonResponse({"error": "Match not found"}, status=404)

@require_http_methods(["POST"])
def tournaments_new(request):
    try:
        data = json.loads(request.body)
        if len(data['players']) != 4:
            raise ValueError("bad input")

        validation_errors = {}
        validated_players = [{}] * len(data['players'])
        cache = {}
        for i in range(len(data['players'])):
            for j in range(len(data['players'])):
                if i == j:
                    continue
                try:
                    validated_players[i], validated_players[j] = validate_match_players(request, data['players'][i], data['players'][j], cache)
                except MyValidationError as e:
                    validation_errors.setdefault("players", {}).setdefault(i+1, {}).update(e.dict.get("players", {}).get("1", {}))
                    validation_errors.setdefault("players", {}).setdefault(j+1, {}).update(e.dict.get("players", {}).get("2", {}))

        if len(validation_errors.get("players", {})) > 0 or validation_errors.get("message", None):
            return JsonResponse(validation_errors, status=400)
        if data['type'] == 0: # round robin
            tournament = Tournament.objects.create_round_robin(validated_players) # pyright
        else:
            tournament = Tournament.objects.create_single_elimination(validated_players)
        return JsonResponse({"id": tournament.id})

    except (json.JSONDecodeError, KeyError, IndexError, ValueError) as e:
        return JsonResponse({"message": str(e)}, status=400)

@require_http_methods(["GET"])
def tournaments_details(_, tournament_id:int):
    tournament = Tournament.objects.get_ongoing_tournament(id=tournament_id)
    if tournament is None:
        return JsonResponse({"message": "no ongoing tournament found for this id"}, status=404)
    else:
        return JsonResponse(tournament.dict())

@require_http_methods(["GET"])
def tournaments_next_match(_, tournament_id:int):
    tournament = Tournament.objects.get_ongoing_tournament(id=tournament_id)
    if tournament is None:
        return JsonResponse({"message": "no ongoing tournament found for this id"}, status=404)
    else:
        match = tournament.next_match()
        if match is None:
            return JsonResponse({"message": "no match left for this tournament"}, status=404)
        return JsonResponse(match.dict())

@require_http_methods(["GET"])
def tournaments_results(_, tournament_id:int):
    tournament = Tournament.objects.get(id=tournament_id)
    if tournament is None:
        return JsonResponse({"message": "no tournament found for this id"})
    if tournament.is_finished == False:
        return JsonResponse({"message": "tournament not finished"}, status=400)

    if tournament.type == 0: # round robin
        scores:dict[str,int] = {}
        for match in tournament.matches.all():
            winner = match.winner()
            scores[match.p1_nickname] = scores.get(match.p1_nickname, 0)
            scores[match.p2_nickname] = scores.get(match.p2_nickname, 0)
            scores[winner['nickname']] += 1
        
        results = {
            "winner": "",
            "rankings": [ { "nickname": nickname, "wins": wins } for nickname, wins in scores.items() ]
        }
        results["rankings"].sort(reverse=True, key=lambda x: x['wins'])
        results["winner"] = results["rankings"][0]['nickname']
        return JsonResponse(results)
    else:
        finalMatch = tournament.current_round_matches()[0]
        return JsonResponse({
            "winner": finalMatch.winner()["nickname"],
            "rankings": []
        })
