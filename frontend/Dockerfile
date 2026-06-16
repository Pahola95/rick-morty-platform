# ── Etapa 1: Build ──────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Aumentar memoria de Node durante el build
ENV NODE_OPTIONS="--max-old-space-size=2048"

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# ── Etapa 2: Serve con Nginx ────────────────────────────
FROM nginx:alpine

# Move the built app from the builder's `browser` folder into nginx html root
COPY --from=builder /app/dist/frontend /usr/share/nginx/html
RUN if [ -d /usr/share/nginx/html/browser ]; then \
			cp -a /usr/share/nginx/html/browser/. /usr/share/nginx/html/; \
			rm -rf /usr/share/nginx/html/browser; \
		fi
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]