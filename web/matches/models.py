from datetime import datetime
from django.db import models
from channels.auth import get_user_model
from itertools import combinations
import random

# Create your models he.

class TournamentManager(models.Manager):
    def create_round_robin(self, players:list[dict]):
        tournament = super().create(type=0)
        match_players = list(combinations(players, 2))
        random.shuffle(match_players)
        for p1, p2 in match_players:
            Match.objects.create(p1, p2, tournament)
        return tournament

    def create_single_elimination(self, players:list[dict]):
        tournament = super().create(type=1)
        match_players = [(players[p1], players[p1+1]) for p1 in range(0, len(players), 2)]
        for p1, p2 in match_players:
            Match.objects.create(p1, p2, tournament)
        return tournament
    
    def get_ongoing_tournament(self, id):
        tournament = super().get(id=id)
        if tournament is not None and tournament.is_finished == False:
            return tournament
        else:
            return None

class Tournament(models.Model):
    TOURNAMENT_TYPE_CHOICES = [(0, "round-robin"), (1, "single-elimination")]

    type = models.IntegerField(choices=TOURNAMENT_TYPE_CHOICES)
    date = models.DateTimeField(auto_now_add=True)
    
    objects = TournamentManager()

    def current_round_matches(self):
        current_round = self.matches.order_by("-round").values_list("round", flat=True).first() # pyright: ignore
        return list(self.matches.filter(round=current_round)) # pyright: ignore

    @property
    def is_finished(self):
        if self.type == 0: # round-robin
            return self.matches.filter(is_finished=False).exists() == False # pyright: ignore
        else:
            matches = self.current_round_matches()
            if len(matches) == 1 and matches[0].is_finished:
                return True
            else:
                return False
    
    def next_match(self):
        if self.type == 0: # round-robin
            return self.matches.filter(is_finished=False).order_by("id").first() #pyright: ignore
        else:
            matches = self.current_round_matches()
            for match in matches:
                if not match.is_finished:
                    return match
            if len(matches) > 1:
                for i in range(0, len(matches), 2):
                    Match.objects.create( matches[i].winner(), matches[i+1].winner(), tournament=self, round=matches[i].round + 1)
                return self.next_match()
            else:
                return None

    def dict(self):
        return {
            "id": self.id #pyright: ignore
        }

class MatchManager(models.Manager):
    def create(self, p1:dict, p2:dict, tournament: Tournament|None = None, round=1):
        if p1['type'] == 0 and p1.get('user', None) == None or p2['type'] == 0 and p2.get('user', None) == None:
            raise ValueError('type 0 player must have a user')
        if p1.get('user', None) is not None and p2.get('user', None) is not None and p1['user'] == p2['user']:
            raise ValueError('match users must be different')
        if p1['nickname'] == p2['nickname']:
            raise ValueError('players nicknames must be different')
        return super().create(
            p1_type     = p1['type'],
            p1_nickname = p1['nickname'][:20],
            p1_user     = p1.get('user', None),
            p2_type     = p2['type'],
            p2_nickname = p2['nickname'][:20],
            p2_user     = p2.get('user', None),
            tournament  = tournament,
            round       = round
        )
    
    def get_ongoing_match(self, id):
        return super().get(id=id, is_finished=False)

class Match(models.Model):
    PLAYER_TYPE_CHOICES = [(0, "User"), (1, "Guest"), (2, "AI")]

    p1_type = models.IntegerField(choices=PLAYER_TYPE_CHOICES)
    p1_nickname = models.CharField(max_length=20)
    p1_user = models.ForeignKey(get_user_model(), null=True, blank=True, on_delete=models.CASCADE, related_name="matches_as_p1")
    p1_score = models.IntegerField(default=0) # type: ignore

    p2_type = models.IntegerField(choices=PLAYER_TYPE_CHOICES)
    p2_nickname = models.CharField(max_length=20)
    p2_user = models.ForeignKey(get_user_model(), null=True, blank=True, on_delete=models.CASCADE, related_name="matches_as_p2")
    p2_score = models.IntegerField(default=0) # type: ignore

    tournament = models.ForeignKey(Tournament, null=True, blank=True, on_delete=models.CASCADE, related_name="matches")
    round = models.IntegerField(default=1) # type: ignore

    is_finished = models.BooleanField(default=False) # type: ignore
    date = models.DateTimeField(auto_now_add=True)

    objects = MatchManager()
    
    def dict(self) -> dict:
        return {
            "id": self.id, #pyright: ignore
            "p1_type": self.p1_type,
            "p1_nickname": self.p1_nickname,
            "p1_score": self.p1_score,
            "p2_type": self.p2_type,
            "p2_nickname": self.p2_nickname,
            "p2_score": self.p2_score,
            "is_finished": self.is_finished,
            "tournament_id": self.tournament.id if self.tournament else None #pyright: ignore
        }
        
    def patch(self, patch_data):
        if 'p1_type' in patch_data:
            self.p1_type = patch_data['p1_type']
        if 'p1_nickname' in patch_data:
            self.p1_nickname = patch_data['p1_nickname']
        if 'p1_score' in patch_data:
            self.p1_score = patch_data['p1_score']
        if 'p2_type' in patch_data:
            self.p2_type = patch_data['p2_type']
        if 'p2_nickname' in patch_data:
            self.p2_nickname = patch_data['p2_nickname']
        if 'p2_score' in patch_data:
            self.p2_score = patch_data['p2_score']
        if 'is_finished' in patch_data:
            self.is_finished = patch_data['is_finished']
        if 'tournament_id' in patch_data:
            self.tournament_id = patch_data['tournament_id']
        self.date = datetime.now()
        self.save()

    def winner(self):
        if not self.is_finished:
            return None
        if self.p1_score > self.p2_score:
            return {
                "type": self.p1_type,
                "nickname": self.p1_nickname,
                "user": self.p1_user
            }
        else:
            return {
                "type": self.p2_type,
                "nickname": self.p2_nickname,
                "user": self.p2_user
            }
