# Survey (SAAS)
It's survey service

## Fontend
  We uses `React` + `surveyjs` to develop dynamic survey form.
  
## Backend
  We uses Node.js to run as backend API services.
  
## Database
  We uses mongoDB to store answers.
  ![](images/mongodb.png)
  
  ```
  # Download image
  docker pull pepsi7959/ubuntu16.04-mongodbv4.0.10
  
  # Create container
  docker run -idt --privileged=true --name mongodb -v $(pwd):/root/ -p 27017:27017pepsi7959/ubuntu16.04-mongodbv4.0.10 
  ```

## start service
If you use `npm start`, then start both frontend with port:`3000` and backend with port:`3001`
```bash
npm start
```
