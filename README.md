ngrok http 4200 --url dragon-sure-usually.ngrok-free.app


Build the image:
docker build -t oetexam-frontend .

Run the container:
docker run -d -p 80:80 --name oetexam-frontend oetexam-frontend

The app will be accessible at http://<server-ip>.

# from the frontend repo (or copy the file to the server first)
sudo cp server-nginx.conf /etc/nginx/sites-available/oetexam                                                                                                                                                   
sudo ln -s /etc/nginx/sites-available/oetexam /etc/nginx/sites-enabled/                                                                                                                                        
sudo rm -f /etc/nginx/sites-enabled/default                                                                                                                                                                    
sudo nginx -t && sudo systemctl reload nginx
