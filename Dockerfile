FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci --include=dev

COPY . .

ARG VITE_BACKEND_API_URL=http://localhost:8080/api/v1
ARG VITE_MEDIA_API_URL=http://localhost:8081/api/v1

RUN npm run build


FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]