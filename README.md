ngrok http 4200 --url dragon-sure-usually.ngrok-free.app


Build the image:
docker build -t oetexam-frontend .

Run the container:
docker run -d -p 80:80 --name oetexam-frontend oetexam-frontend

The app will be accessible at http://<server-ip>.
