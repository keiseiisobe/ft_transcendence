import tensorflow as tf
import numpy as np
import os
import json
from tensorflow.keras import layers
from channels.generic.websocket import WebsocketConsumer
from typing import Tuple
import matplotlib.pyplot as plt

seed = 42
tf.random.set_seed(seed)
np.random.seed(seed)

iteration = 0
num_iteration = 1000
loss_arr = np.array([], dtype=np.float64)


class AIPongModel(tf.keras.Model):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.hidden1 = layers.Dense(256, activation="relu")
        self.hidden2 = layers.Dense(512, activation="relu")
        self.hidden3 = layers.Dense(256, activation="relu")
        self.actor = layers.Dense(3)

    def call(self, inputs: tf.Tensor):
        x = self.hidden1(inputs)
        x = self.hidden2(x)
        x = self.hidden3(x)
        return self.actor(x)


class AIPong:
    def __init__(
            self,
            learning_rate=0.001,
            gamma=0.99,
            model_path="ai_opponent.keras",
    ):
        self.model = AIPongModel()
        self.learning_rate = learning_rate
        self.gamma = gamma
        self.states_memory = tf.TensorArray(
            dtype=tf.float32,
            size=0,
            dynamic_size=True,
            clear_after_read=False
        )
        self.action_logits_memory = tf.TensorArray(
            dtype=tf.float32,
            size=0,
            dynamic_size=True,
            clear_after_read=False
        )
        self.rewards_memory = tf.TensorArray(
            dtype=tf.int32,
            size=0,
            dynamic_size=True,
            clear_after_read=False
        )
        self.optimizer = tf.keras.optimizers.Adam(
            learning_rate=self.learning_rate
        )
        self.model_path = model_path

    def policy_forward(self, state):
        state = tf.expand_dims(state, axis=0)
        action_logits = self.model(state)
        action = tf.random.categorical(action_logits, 1)[0][0]
        return action, action_logits

    def store_transition(self, state, action_logits, reward, i):
        self.states_memory = self.states_memory.write(i, state)
        self.action_logits_memory = self.action_logits_memory.write(i, action_logits)
        self.rewards_memory = self.rewards_memory.write(i, reward)

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
            returns = returns.write(i, discounted_sum)
        returns = returns.stack()[::-1]
        # standarlize
        # returns = (
        #     returns - tf.math.reduce_mean(returns)) / \
        #     (tf.math.reduce_std(returns) + self.eps)
        return returns

    def compute_loss(self, returns):
        action_probs = tf.nn.softmax(self.action_logits_memory)
        action_log_probs = tf.math.log(action_probs)
        weighted_action_log_probs = tf.multiply(action_log_probs, returns)
        loss = tf.reduce_mean(weighted_action_log_probs)
        return loss

    def train(self):
        n = self.states_memory.size()
        with tf.GradientTape() as tape:
            for i in tf.range(n):
                state = self.states_memory.read(i)
                reward = self.rewards_memory.read(i)
                action, action_logits = self.policy_forward(state)
                self.store_transition(
                    state,
                    action_logits[0],
                    reward,
                    i
                )
            self.states_memory = self.states_memory.stack()
            self.action_logits_memory = self.action_logits_memory.stack()
            self.rewards_memory = self.rewards_memory.stack()
            returns = self.get_expected_return()
            self.action_logits_memory, returns = [
                tf.expand_dims(x, 1) for x in [
                    self.action_logits_memory,
                    returns
                ]
            ]
            loss = self.compute_loss(returns)
        print("returns: ", returns)
        print("loss: ", loss)
        global loss_arr
        loss_arr = np.append(loss_arr, loss)
        grads = tape.gradient(loss, self.model.trainable_variables)
        self.optimizer.apply_gradients(zip(grads, self.model.trainable_variables))
        self.states_memory = tf.TensorArray(
            dtype=tf.float32,
            size=0,
            dynamic_size=True,
            clear_after_read=False
        )
        self.action_logits_memory = tf.TensorArray(
            dtype=tf.float32,
            size=0,
            dynamic_size=True,
            clear_after_read=False
        )
        self.rewards_memory = tf.TensorArray(
            dtype=tf.int32,
            size=0,
            dynamic_size=True,
            clear_after_read=False
        )

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
        done = data["done"]
        raw_action, action_logits = self.ai_agent.policy_forward(state)
        action = int(raw_action)
        action = -1 if action == 0 else 0 if action == 1 else 1
        response = json.dumps({"action": action})
        self.send(response)
        self.ai_agent.store_transition(
            state,
            action_logits[0],
            reward,
            self.ai_agent.states_memory.size()
        )
        if done:
            self.ai_agent.train()
            self.ai_agent.save_model()
            global num_iteration
            global iteration
            iteration += 1
            if iteration % num_iteration == 0:
                global loss_arr
                plt.plot(loss_arr)
                plt.ylabel("Losses")
                plt.xlabel("Iterations")
                plt.ylim(-50, 50)
                plt.xlim(0)
                plt.savefig("training.pdf")
