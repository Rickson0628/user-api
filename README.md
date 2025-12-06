# 🖥️ User API for Books Favourites App

This is the backend API for the [Books Favourites App](https://github.com/Rickson0628/Books-Favourites-). It handles user authentication, book favourites management, and database interactions.

---

## 🚀 Live Demo

🔗 [Books Favourites App](https://books-favourites-xt9c.vercel.app/login)

---

## 🛠️ Tech Stack

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* JWT for authentication

---

## ✨ Features

* 🔐 **User Authentication** (Register, Login, Logout)
* ⭐ **Manage favourites** (Add, View, Delete)
* 🔒 **JWT protected API endpoints**
* 🌐 **Works with Books Favourites frontend**

---

## 📦 Installation (Local Setup)

### 1️⃣ Clone the repository

```
git clone https://github.com/Rickson0628/user-api.git
cd user-api
```

### 2️⃣ Install dependencies

```
npm install
```

### 3️⃣ Create a `.env` file

```
PORT=8080
MONGODB=mongodb+srv://<your-db-uri>
JWT_SECRET=your-secret-key
```

### 4️⃣ Run the server

```
npm start
```

---

## 🔧 Environment Variables

| Variable     | Description                       |
| ------------ | --------------------------------- |
| `PORT`       | Server port                       |
| `MONGODB`    | MongoDB Atlas connection string   |
| `JWT_SECRET` | Secret key for signing JWT tokens |

---

## 📁 Project Structure

```
/server
  ├── routes/
  ├── models/
  ├── controllers/
  ├── user-service.js
  └── server.js
```

---

## 🧪 API Endpoints (Example)

### **Auth Routes**

```
POST /api/register
POST /api/login
GET  /api/profile
```

### **Favourites Routes**

```
POST   /api/books/favourites
GET    /api/books/favourites
DELETE /api/books/favourites/:id
```

---

## 🤝 Credits

Developed by **Rickson Bozar**
Backend for [Books Favourites App](https://github.com/Rickson0628/Books-Favourites-)
