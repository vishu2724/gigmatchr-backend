# GigMatchr – Gig Work Posting Platform

GigMatchr is a backend-focused web application designed to manage gig-based work posting and application workflows in a structured manner.  
The platform focuses on replacing direct contact-based hiring with a clear, API-driven process involving task posting, applications, and status tracking.

> 🚧 This project is actively under development.

---

## 🚀 Features (Current)
- Gig work posting by users through REST APIs
- Application submission with structured data instead of direct contact
- Multi-stage application status flow (applied, shortlisted, selected, completed)
- Centralized handling of gigs and applications
- Clean separation of concerns using controllers, services, and routes

---

## 🛠 Tech Stack
**Backend**
- Node.js
- Express.js

**Database**
- MySQL
- Prisma ORM

**Tools**
- Git & GitHub
- Postman

---

## 🧱 Backend Architecture
The backend is structured to support scalability and clarity:

src/
├── routes/ # API routes
├── controllers/ # Request handling logic
├── services/ # Business logic
├── prisma/ # Database schema & migrations
├── middlewares/ # Validation & error handling
└── app.js # App entry point


---

## 📊 Database Design
- Users  
- Gigs (work posts)  
- Applications  

Relational integrity is enforced using Prisma with foreign key relationships between users, gigs, and applications.

---

## 🔄 Application Flow
1. User creates a gig post
2. Other users apply with required details
3. Application status progresses through defined stages
4. Gig lifecycle is tracked end-to-end via APIs

---

## 🧪 API Development
- RESTful API design principles
- Proper request validation
- Consistent status codes and error handling
- Iterative refinement based on evolving requirements

---

## 📌 Current Status
- Core schema design completed
- Gig and application APIs in progress
- Status workflow implementation ongoing

---

## 🔮 Planned Enhancements
- Authentication and role-based access control
- Advanced validation and authorization
- Frontend integration
- Deployment and API documentation

---

## 👨‍💻 Author
**Vishant Bhardwaj**  
GitHub: https://github.com/vishu2724
