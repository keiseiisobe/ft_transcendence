import tensorflow as tf
import numpy as np
import random
import os
import json
from tensorflow.keras import layers
from channels.generic.websocket import WebsocketConsumer
from typing import Tuple
import matplotlib.pyplot as plt

interval = 30
iteration = np.array([0])
num_iteration = 3
returns_sum_arr = np.array([0], dtype=np.float64)

class AIPongModel(tf.keras.Model):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.hidden = layers.Dense(128, activation="relu")
        self.actor = layers.Dense(3)
        self.critic = layers.Dense(1)
    
    def call(self, inputs: tf.Tensor) -> Tuple[tf.Tensor, tf.Tensor]:
        x = self.hidden(inputs)
        return self.actor(x), self.critic(x)

class AIPong:
    def __init__(self, learning_rate=0.001, gamma=0.99, model_path="ai_opponent.keras", exploration_rate=0.3):
        self.model = AIPongModel()
        self.learning_rate = learning_rate
        self.gamma = gamma
        self.states_memory = tf.TensorArray(dtype=tf.float32, size=0, dynamic_size=True, clear_after_read=False)
        self.action_probs_memory = tf.TensorArray(dtype=tf.float32, size=0, dynamic_size=True, clear_after_read=False)
        self.values_memory = tf.TensorArray(dtype=tf.float32, size=0, dynamic_size=True, clear_after_read=False)
        self.rewards_memory = tf.TensorArray(dtype=tf.int32, size=0, dynamic_size=True, clear_after_read=False)
        self.optimizer = tf.keras.optimizers.Adam(learning_rate=self.learning_rate)
        self.model_path = model_path
        self.exploration_rate = exploration_rate
        self.eps = np.finfo(np.float32).eps.item()
        self.huber_loss = tf.keras.losses.Huber(reduction=tf.keras.losses.Reduction.SUM)
        seed = 42
        tf.random.set_seed(seed)
        np.random.seed(seed)

    def policy_forward(self, state):
        state = np.expand_dims(state, axis=0)
        action_logits, value = self.model(state)
        action = tf.random.categorical(action_logits, 1)
        action = action[0][0]
        action_probs = tf.nn.softmax(action_logits)
        return action, action_probs, value

    def store_transition(self, state, action_prob, value, reward, i):
        self.states_memory.write(i, state).mark_used()
        self.action_probs_memory.write(i, action_prob).mark_used()
        self.values_memory.write(i, tf.squeeze(value)).mark_used()
        self.rewards_memory.write(i, reward).mark_used()

    def get_expected_return(self):
        n = tf.shape(self.rewards_memory)[0]
        returns = tf.TensorArray(dtype=tf.float32, size=n)
        self.rewards_memory = tf.cast(self.rewards_memory[::-1], dtype=tf.float32)
        discounted_sum = tf.constant(0.0)
        discounted_sum_shape = discounted_sum.shape
        for i in tf.range(n):
            reward = self.rewards_memory[i]
            discounted_sum = reward + self.gamma * discounted_sum
            discounted_sum.set_shape(discounted_sum_shape)
            returns.write(i, reward * discounted_sum).mark_used()
        returns = returns.stack()[::-1]
        # standarlize
        returns = (
            returns - tf.math.reduce_mean(returns)) / \
            (tf.math.reduce_std(returns) + self.eps)
        return returns

    def compute_loss(self, returns):
        advantage = returns - self.values_memory
        action_log_probs = tf.math.log(self.action_probs_memory)
        action_loss = -tf.math.reduce_sum(action_log_probs * advantage)
        critic_loss = self.huber_loss(self.values_memory, returns)
        return action_loss + critic_loss
    
    def train(self):
        n = self.states_memory.size()
        with tf.GradientTape() as tape:
            for i in tf.range(n):
                state = self.states_memory.read(i)
                reward = self.rewards_memory.read(i)
                action, action_probs, value = self.policy_forward(state)
                self.store_transition(state, action_probs[0][int(action)], value, reward, i)
            self.action_probs_memory = self.action_probs_memory.stack()
            self.values_memory = self.values_memory.stack()
            self.rewards_memory = self.rewards_memory.stack()
            returns = self.get_expected_return()
            global returns_sum_arr
            returns_sum_arr = np.append(returns_sum_arr, tf.math.reduce_sum(returns))
            self.action_probs_memory, self.values_memory, returns = [
                tf.expand_dims(x, 1) for x in [self.action_probs_memory, self.values_memory, returns]
            ]
            loss = self.compute_loss(returns)
        grads = tape.gradient(loss, self.model.trainable_variables)
        self.optimizer.apply_gradients(zip(grads, self.model.trainable_variables))
        self.states_memory = tf.TensorArray(dtype=tf.float32, size=0, dynamic_size=True, clear_after_read=False)
        self.action_probs_memory = tf.TensorArray(dtype=tf.float32, size=0, dynamic_size=True, clear_after_read=False)
        self.values_memory = tf.TensorArray(dtype=tf.float32, size=0, dynamic_size=True, clear_after_read=False)
        self.rewards_memory = tf.TensorArray(dtype=tf.int32, size=0, dynamic_size=True, clear_after_read=False)
        
    def save_model(self):
        self.model.save(self.model_path)
        print(f"Model saved at {self.model_path}")

    def load_model(self):
        if os.path.exists(self.model_path):
            self.model = tf.keras.models.load_model(self.model_path)
            print(f"Model loaded from {self.model_path}")
        else:
            print("No saved model found!")

class AIPongConsumer(WebsocketConsumer):
    def connect(self):
        self.ai_agent = AIPong()
        self.accept()
        self.ai_agent.load_model()

    def disconnect(self, close_code):
        pass

    def receive(self, text_data):
        data = json.loads(text_data)
        width = 900
        height = 600
        state = np.array([
            data["ball_x"]/width,
            data["ball_y"]/height,
            data["left_paddle_y"]/height,
            data["right_paddle_y"]/height,
            data["pre_ball_x"]/width,
            data["pre_ball_y"]/height,
            data["pre_left_paddle_y"]/height,
            data["pre_right_paddle_y"]/height
        ])
        reward = data["reward"]
        raw_action, action_probs, value = self.ai_agent.policy_forward(state)
        if np.random.uniform() < self.ai_agent.exploration_rate:
            raw_action = int(np.random.choice([0, 1, 2], 1))
        action = int(raw_action)
        action = -1 if action == 0 else 0 if action == 1 else 1
        response = json.dumps({"action": action})
        self.send(response)
        self.ai_agent.store_transition(
            state,
            action_probs[0][raw_action],
            value,
            reward,
            self.ai_agent.states_memory.size()
        )
        global interval
        if self.ai_agent.rewards_memory.size() % interval == 0:
            self.ai_agent.train()
            self.ai_agent.save_model()
            # global iteration
            # global num_iteration
            # iteration = np.append(iteration, iteration[-1] + interval)
            # if iteration.size % num_iteration == 0:
            #     plt.plot(iteration, returns_sum_arr)
            #     plt.ylabel("Avarage Returns")
            #     plt.xlabel("Iterations")
            #     plt.ylim(-2, 2)
            #     plt.xlim(0)
            #     plt.savefig("training.pdf")
