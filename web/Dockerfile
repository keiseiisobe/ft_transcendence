FROM python:3
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /project
COPY requirements.txt /project/
RUN pip install -r requirements.txt
COPY . /project/
RUN chmod 777 docker-entrypoint.sh
# ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
