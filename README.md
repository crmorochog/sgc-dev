Sistema Central y administrativo de contactos
Instalación y ejecución

1. Backend

cd backend\cmorocho
.\mvnw.cmd spring-boot:run

Configurar previamente la conexión a SQL Server y la variable de entorno JWT_SECRET.

2. Frontend

cd frontend
npm.cmd install

Crear el archivo .env.local en la carpeta frontend:

NEXT_PUBLIC_API_URL=http://localhost:1200

Iniciar la aplicación:

npm.cmd run dev

Acceso a la aplicación

Frontend: http://localhost:3000
Backend: http://localhost:1200
Swagger: http://localhost:1200/swagger-ui/index.html

API REST

POST /api/auth/register Registrar usuario
POST /api/auth/login Iniciar sesión
GET /api/contacts Listar y buscar contactos
GET /api/contacts/{id} Consultar contacto
POST /api/contacts Crear contacto
PUT /api/contacts/{id} Actualizar contacto
DELETE /api/contacts/{id} Eliminar contacto

Autor

Cristian Morocho