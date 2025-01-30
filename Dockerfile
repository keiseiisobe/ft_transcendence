# syntax=docker/dockerfile:1
FROM python:3
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /project
COPY requirements.txt /project/
RUN apt-get update && apt-get install -y chromium \
    	    	      	      	      	 chromium-driver;
RUN pip install -r requirements.txt; \
    pip install -U 'channels[daphne]'; \
    pip install django-friendship \
    		django-rainbowtests \
		Pillow \
		"selenium >= 4.8.0" \
		webdriver-manager \
		chromedriver-binary;
ENV CHROME_BIN=/usr/bin/chromium
ENV CHROME_DRIVER=/usr/bin/chromedriver
ENV PATH=$PATH:/usr/bin
COPY . /project/
