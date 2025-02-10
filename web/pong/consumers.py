import tensorflow as tf
import numpy as np
import random
import os
import json
from channels.generic.websocket import WebsocketConsumer

class PongAI:
    def __init__(self, learning_rate=0.00001, gamma=0.99, model_path="ai_opponent.keras", exploration_rate=0.3):
        self.learning_rate = learning_rate
        self.gamma = gamma
        self.state_memory = []
        self.action_memory = []
        self.reward_memory = []
        self.model = self.build_model()
        self.optimizer = tf.keras.optimizers.Adam(learning_rate=self.learning_rate)
        self.model_path = model_path
        self.exploration_rate = exploration_rate

    def build_model(self):
        model = tf.keras.Sequential([
            tf.keras.layers.Dense(64, activation='relu', input_shape=(8,)),
            tf.keras.layers.Dense(64, activation='relu'),
            tf.keras.layers.Dense(3, activation='softmax')
        ])
        return model

    def choose_action(self, state):
        #print("weights: ", self.model.weights)
        state = np.expand_dims(state, axis=0)
        print("input: ", state)
        if random.uniform(0, 1) < self.exploration_rate:
            print("exploration")
            action = int(np.random.choice([-1, 1, 0]))
        else:
            probs = self.model.predict(state, verbose=0)[0]
            print("probabilities: ", probs)
            action = int(np.random.choice([-1, 1, 0], p=probs))
        print("action: ", "up" if action == -1 else "down" if action == 1 else "stay")
        return action

    def store_transition(self, state, action, reward):
        self.state_memory.append(state)
        self.action_memory.append(action)
        self.reward_memory.append(reward)

    def compute_discounted_rewards(self):
        discounted_rewards = np.zeros_like(self.reward_memory, dtype=np.float32)
        cumulative_reward = 0
        for t in reversed(range(len(self.reward_memory))):
            cumulative_reward = self.reward_memory[t] + (self.gamma * cumulative_reward)
            discounted_rewards[t] = cumulative_reward
        return discounted_rewards

    def train(self):
        states = np.array(self.state_memory)
        actions = np.array(self.action_memory)
        rewards = self.compute_discounted_rewards()
        with tf.GradientTape() as tape:
            probs = self.model(states, training=True)
            action_masks = tf.one_hot(actions, 3)
            log_probs = tf.reduce_sum(action_masks * tf.math.log(probs + 1e-8), axis=1)
            loss = -tf.reduce_mean(log_probs * rewards)
        grads = tape.gradient(loss, self.model.trainable_variables)
        for var, grad in zip(self.model.trainable_variables, grads):
            var.assign_sub(self.learning_rate * grad)
        self.state_memory = []
        self.action_memory = []
        self.reward_memory = []
        
    def save_model(self):
        self.model.save(self.model_path)
        print(f"Model saved at {self.model_path}")

    def load_model(self):
        if os.path.exists(self.model_path):
            self.model = tf.keras.models.load_model(self.model_path)
            print(f"Model loaded from {self.model_path}")
        else:
            print("No saved model found!")

class PongAiConsumer(WebsocketConsumer):
    def connect(self):
        self.ai_agent = PongAI()
        self.ai_agent.load_model()
        self.accept()

    def disconnect(self, close_code):
        pass

    def receive(self, text_data):
        data = json.loads(text_data)
        state = np.array([
            data["ball_x"],
            data["ball_y"],
            data["left_paddle_y"],
            data["right_paddle_y"],
            data["pre_ball_x"],
            data["pre_ball_y"],
            data["pre_left_paddle_y"],
            data["pre_right_paddle_y"]
        ])
        action = self.ai_agent.choose_action(state)
        response = json.dumps({"action": action})
        self.send(response)
        self.ai_agent.store_transition(state, action, data["reward"])
        if len(self.ai_agent.reward_memory) % 10 == 0:
            self.ai_agent.train()
            self.ai_agent.save_model()
