""" Trains an agent with (stochastic) Policy Gradients on Pong. Uses OpenAI Gym. """
import numpy as np
import _pickle as pickle
import json
from channels.generic.websocket import WebsocketConsumer

# hyperparameters
D = 1 * 5  # input dimensionality: 80x80 grid
H = 200  # number of hidden layer neurons
batch_size = 10  # every how many episodes to do a param update?
learning_rate = 1e-4
gamma = 0.99  # discount factor for reward
decay_rate = 0.99  # decay factor for RMSProp leaky sum of grad^2
resume = True  # resume from previous checkpoint?
next_x = np.zeros(D)
xs, hs, dlogps, drs = [], [], [], []
running_reward = None
reward_sum = 0
episode_number = 0


class AIPongConsumer(WebsocketConsumer):
    def sigmoid(self, x):
        return 1.0 / (1.0 + np.exp(-x))  # sigmoid "squashing" function to interval [0,1]

    def discount_rewards(self, r):
        """ take 1D float array of rewards and compute discounted reward """
        discounted_r = np.zeros_like(r, dtype=np.float64)
        running_add = 0
        for t in reversed(range(0, r.size)):
            if r[t] != 0: running_add = 0  # reset the sum, since this was a game boundary (pong specific!)
            running_add = running_add * gamma + r[t]
            discounted_r[t] = running_add
        return discounted_r

    def policy_forward(self, x):
        h = np.dot(self.model['W1'], x)
        h[h < 0] = 0  # ReLU nonlinearity
        logp = np.dot(self.model['W2'], h)
        p = self.sigmoid(logp)
        return p, h  # return probability of taking action 2, and hidden state

    def policy_backward(self, eph, epdlogp):
        """ backward pass. (eph is array of intermediate hidden states) """
        dW2 = np.dot(eph.T, epdlogp).ravel()
        dh = np.outer(epdlogp, self.model['W2'])
        dh[eph <= 0] = 0  # backpro prelu
        dW1 = np.dot(dh.T, self.epx)
        return {'W1': dW1, 'W2': dW2}
    
    def connect(self):
        # model initialization
        if resume:
           self.model = pickle.load(open('save.p', 'rb'))
        else:
           self.model = {}
           self.model['W1'] = np.random.randn(H,D) / np.sqrt(D)  # "Xavier" initialization
           self.model['W2'] = np.random.randn(H) / np.sqrt(H)
        self.grad_buffer = {k: np.zeros_like(v) for k, v in self.model.items()}  # update buffers that add up gradients over a batch
        self.rmsprop_cache = {k: np.zeros_like(v) for k, v in self.model.items()}  # rmsprop memory
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
        print("x: ", x)
        print("reward: ", reward)
        done = data["done"]

        # forward the policy network and sample an action from the returned probability
        aprob, h = self.policy_forward(x)
        action = -1 if np.random.uniform() < aprob else 1  # roll the dice!

        # record various intermediates (needed later for backprop)
        global xs, hs, dlogps, drs, reward_sum
        xs.append(x)  # observation
        hs.append(h)  # hidden state
        y = 1 if action == -1 else 0  # a "fake label"
        dlogps.append(y - aprob)  # grad that encourages the action that was taken to be taken (see http://cs231n.github.io/neural-networks-2/#losses if confused)
        
        # step the environment and get new measurements
        response = json.dumps({"action": action})
        self.send(response)

        reward_sum += reward
        drs.append(reward) # record reward (has to be done after we call step() to get reward for previous action)

        if done: # an episode finished
            global episode_number
            episode_number += 1

            # stack together all inputs, hidden states, action gradients, and rewards for this episode
            self.epx = np.vstack(xs)
            eph = np.vstack(hs)
            epdlogp = np.vstack(dlogps)
            epr = np.vstack(drs)
            xs, hs, dlogps, drs = [], [], [], [] # reset array memory

            # compute the discounted reward backwards through time
            discounted_epr = self.discount_rewards(epr)
            # standardize the rewards to be unit normal (helps control the gradient estimator variance)
            discounted_epr -= np.mean(discounted_epr)
            discounted_epr /= np.std(discounted_epr)

            epdlogp *= discounted_epr # modulate the gradient with advantage (PG magic happens right here.)
            grad = self.policy_backward(eph, epdlogp)
            for k in self.model: self.grad_buffer[k] += grad[k] # accumulate grad over batch

            # perform rmsprop parameter update every batch_size episodes
            if episode_number % batch_size == 0:
                for k,v in self.model.items():
                    g = self.grad_buffer[k] # gradient
                    self.rmsprop_cache[k] = decay_rate * self.rmsprop_cache[k] + (1 - decay_rate) * g**2
                    self.model[k] += learning_rate * g / (np.sqrt(self.rmsprop_cache[k]) + 1e-5)
                    self.grad_buffer[k] = np.zeros_like(v) # reset batch gradient buffer

                # boring book-keeping
                global running_reward
                running_reward = reward_sum if running_reward is None else running_reward * 0.99 + reward_sum * 0.01
                print("reward_sum: ", reward_sum)
                if episode_number % 100 == 0: pickle.dump(self.model, open('save.p', 'wb'))
                reward_sum = 0





# import tensorflow as tf
# import numpy as np
# import os
# import json
# from tensorflow.keras import layers
# from channels.generic.websocket import WebsocketConsumer
# from typing import Tuple
# import matplotlib.pyplot as plt

# seed = 42
# tf.random.set_seed(seed)
# np.random.seed(seed)

# iteration = 0
# num_iteration = 1000
# loss_arr = np.array([], dtype=np.float64)


# class AIPongModel(tf.keras.Model):
#     def __init__(self, **kwargs):
#         super().__init__(**kwargs)
#         self.hidden = layers.Dense(256, activation="relu")
#         self.actor = layers.Dense(2)

#     def call(self, inputs: tf.Tensor):
#         x = self.hidden(inputs)
#         return self.actor(x)


# class AIPong:
#     def __init__(
#             self,
#             learning_rate=0.001,
#             gamma=0.99,
#             model_path="ai_opponent.keras",
#     ):
#         self.model = AIPongModel()
#         self.learning_rate = learning_rate
#         self.gamma = gamma
#         self.states_memory = tf.TensorArray(
#             dtype=tf.float32,
#             size=0,
#             dynamic_size=True,
#             clear_after_read=False
#         )
#         self.action_logits_memory = tf.TensorArray(
#             dtype=tf.float32,
#             size=0,
#             dynamic_size=True,
#             clear_after_read=False
#         )
#         self.rewards_memory = tf.TensorArray(
#             dtype=tf.int32,
#             size=0,
#             dynamic_size=True,
#             clear_after_read=False
#         )
#         self.optimizer = tf.keras.optimizers.Adam(
#             learning_rate=self.learning_rate
#         )
#         self.model_path = model_path

#     def policy_forward(self, state):
#         state = tf.expand_dims(state, axis=0)
#         action_logits = self.model(state)
#         action = tf.random.categorical(action_logits, 1)[0][0]
#         return action, action_logits

#     def store_transition(self, state, action_logits, reward, i):
#         self.states_memory = self.states_memory.write(i, state)
#         self.action_logits_memory = self.action_logits_memory.write(i, action_logits)
#         self.rewards_memory = self.rewards_memory.write(i, reward)

#     def get_expected_return(self):
#         n = tf.shape(self.rewards_memory)[0]
#         returns = tf.TensorArray(dtype=tf.float32, size=n)
#         self.rewards_memory = tf.cast(self.rewards_memory[::-1], dtype=tf.float32)
#         discounted_sum = tf.constant(0.0)
#         discounted_sum_shape = discounted_sum.shape
#         for i in tf.range(n):
#             reward = self.rewards_memory[i]
#             discounted_sum = reward + self.gamma * discounted_sum
#             discounted_sum.set_shape(discounted_sum_shape)
#             returns = returns.write(i, discounted_sum)
#         returns = returns.stack()[::-1]
#         # standarlize
#         returns = (
#             returns - tf.math.reduce_mean(returns)) / \
#             tf.math.reduce_std(returns)
#         return returns

#     def compute_loss(self, returns):
#         action_probs = tf.nn.softmax(self.action_logits_memory)
#         action_log_probs = tf.math.log(action_probs)
#         weighted_action_log_probs = tf.multiply(action_log_probs, returns)
#         loss = tf.reduce_mean(weighted_action_log_probs)
#         return loss

#     def train(self):
#         n = self.states_memory.size()
#         with tf.GradientTape() as tape:
#             for i in tf.range(n):
#                 state = self.states_memory.read(i)
#                 reward = self.rewards_memory.read(i)
#                 action, action_logits = self.policy_forward(state)
#                 self.store_transition(
#                     state,
#                     action_logits[0],
#                     reward,
#                     i
#                 )
#             self.states_memory = self.states_memory.stack()
#             self.action_logits_memory = self.action_logits_memory.stack()
#             self.rewards_memory = self.rewards_memory.stack()
#             returns = self.get_expected_return()
#             self.action_logits_memory, returns = [
#                 tf.expand_dims(x, 1) for x in [
#                     self.action_logits_memory,
#                     returns
#                 ]
#             ]
#             loss = self.compute_loss(returns)
#         print("returns: ", returns)
#         print("loss: ", loss)
#         global loss_arr
#         loss_arr = np.append(loss_arr, loss)
#         grads = tape.gradient(loss, self.model.trainable_variables)
#         self.optimizer.apply_gradients(zip(grads, self.model.trainable_variables))
#         self.states_memory = tf.TensorArray(
#             dtype=tf.float32,
#             size=0,
#             dynamic_size=True,
#             clear_after_read=False
#         )
#         self.action_logits_memory = tf.TensorArray(
#             dtype=tf.float32,
#             size=0,
#             dynamic_size=True,
#             clear_after_read=False
#         )
#         self.rewards_memory = tf.TensorArray(
#             dtype=tf.int32,
#             size=0,
#             dynamic_size=True,
#             clear_after_read=False
#         )

#     def save_model(self):
#         self.model.save(self.model_path)
#         print(f"Model saved at {self.model_path}")

#     def load_model(self):
#         if os.path.exists(self.model_path):
#             self.model = tf.keras.models.load_model(self.model_path)
#             print(f"Model loaded from {self.model_path}")
#         else:
#             print("No saved model found!")


# class AIPongConsumer(WebsocketConsumer):
#     def connect(self):
#         self.ai_agent = AIPong()
#         self.accept()
#         self.ai_agent.load_model()

#     def disconnect(self, close_code):
#         pass

#     def receive(self, text_data):
#         data = json.loads(text_data)
#         width = 900
#         height = 600
#         state = np.array([
#             data["ball_x"]/width,
#             data["ball_y"]/height,
#             data["right_paddle_y"]/height,
#             0 if data["ball_dx"] < 0 else 1,
#             0 if data["ball_dy"] < 0 else 1
#         ])
#         reward = data["reward"]
#         done = data["done"]
#         raw_action, action_logits = self.ai_agent.policy_forward(state)
#         action = int(raw_action)
#         action = -1 if action == 0 else 1#0 if action == 1 else 1
#         response = json.dumps({"action": action})
#         self.send(response)
#         self.ai_agent.store_transition(
#             state,
#             action_logits[0],
#             reward,
#             self.ai_agent.states_memory.size()
#         )
#         if done:
#             self.ai_agent.train()
#             self.ai_agent.save_model()
#             global num_iteration
#             global iteration
#             iteration += 1
#             if iteration % num_iteration == 0:
#                 global loss_arr
#                 plt.plot(loss_arr)
#                 plt.ylabel("Losses")
#                 plt.xlabel("Iterations")
#                 plt.ylim(-50, 50)
#                 plt.xlim(0)
#                 plt.savefig("training.pdf")
