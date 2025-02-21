""" Trains an agent with (stochastic) Policy Gradients on Pong. Uses OpenAI Gym. """
import numpy as np
import _pickle as pickle
import json
from channels.generic.websocket import WebsocketConsumer

D = 1 * 5
H = 200
batch_size = 10
learning_rate = 1e-4
gamma = 0.99
decay_rate = 0.99
resume = True
next_x = np.zeros(D)
xs, hs, dlogps, drs = [], [], [], []
running_reward = None
reward_sum = 0
episode_number = 0


class AIPongConsumer(WebsocketConsumer):
    def sigmoid(self, x):
        return 1.0 / (1.0 + np.exp(-x))

    def discount_rewards(self, r):
        discounted_r = np.zeros_like(r, dtype=np.float64)
        running_add = 0
        for t in reversed(range(0, r.size)):
            if r[t] != 0: running_add = 0
            running_add = running_add * gamma + r[t]
            discounted_r[t] = running_add
        return discounted_r

    def policy_forward(self, x):
        h = np.dot(self.model['W1'], x)
        h[h < 0] = 0
        logp = np.dot(self.model['W2'], h)
        p = self.sigmoid(logp)
        return p, h

    def policy_backward(self, eph, epdlogp):
        dW2 = np.dot(eph.T, epdlogp).ravel()
        dh = np.outer(epdlogp, self.model['W2'])
        dh[eph <= 0] = 0
        dW1 = np.dot(dh.T, self.epx)
        return {'W1': dW1, 'W2': dW2}
    
    def connect(self):
        if resume:
           self.model = pickle.load(open('normal.p', 'rb'))
        else:
           self.model = {}
           self.model['W1'] = np.random.randn(H,D) / np.sqrt(D)
           self.model['W2'] = np.random.randn(H) / np.sqrt(H)
        self.grad_buffer = {k: np.zeros_like(v) for k, v in self.model.items()}
        self.rmsprop_cache = {k: np.zeros_like(v) for k, v in self.model.items()}
        self.accept()

    def disconnect(self, close_code):
        pass

    def receive(self, text_data):
        data = json.loads(text_data)
        width = 900
        height = 600
        global next_x
        x = np.copy(next_x)
        next_x = np.array([
            data["ball_x"]/width,
            data["ball_y"]/height,
            data["right_paddle_y"]/height,
            0 if data["ball_dx"] < 0 else 1,
            0 if data["ball_dy"] < 0 else 1
        ])
        reward = data["reward"]
        done = data["done"]

        aprob, h = self.policy_forward(x)
        action = -1 if np.random.uniform() < aprob else 1

        global xs, hs, dlogps, drs, reward_sum
        xs.append(x)
        hs.append(h)
        y = 1 if action == -1 else 0
        dlogps.append(y - aprob)
        
        response = json.dumps({"action": action})
        self.send(response)

        reward_sum += reward
        drs.append(reward)

        if done:
            global episode_number
            episode_number += 1

            self.epx = np.vstack(xs)
            eph = np.vstack(hs)
            epdlogp = np.vstack(dlogps)
            epr = np.vstack(drs)
            xs, hs, dlogps, drs = [], [], [], []

            discounted_epr = self.discount_rewards(epr)
            discounted_epr -= np.mean(discounted_epr)
            discounted_epr /= np.std(discounted_epr)

            epdlogp *= discounted_epr
            grad = self.policy_backward(eph, epdlogp)
            for k in self.model: self.grad_buffer[k] += grad[k]

            if episode_number % batch_size == 0:
                for k,v in self.model.items():
                    g = self.grad_buffer[k]
                    self.rmsprop_cache[k] = decay_rate * self.rmsprop_cache[k] + (1 - decay_rate) * g**2
                    self.model[k] += learning_rate * g / (np.sqrt(self.rmsprop_cache[k]) + 1e-5)
                    self.grad_buffer[k] = np.zeros_like(v)

                global running_reward
                running_reward = reward_sum if running_reward is None else running_reward * 0.99 + reward_sum * 0.01
                if episode_number % 100 == 0:
                    print("saved at normal.p")
                    pickle.dump(self.model, open('normal.p', 'wb'))
                reward_sum = 0
