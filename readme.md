second attempt, no ng material
My app lacks functionality regarding user-restricted access. Type access is restricted by rules enforced in firebase firestore so only session and timer data can be accessed. If spam abused, budget limits apply and shut down the app immediately.

# wintool2 🏆

A real-time challenge tracking application for gaming sessions. `wintool2` allows users to create sessions, manage game challenges, and synchronize a global timer across multiple clients instantly.

🔗[**View Live Demo**](https://wintool2--wintool2-1.europe-west4.hosted.app/)

> **⚠️ Branch Information:**
> This is the **`master`** branch, intended for local development.
>
> If you are looking for the production configuration (Firebase App Hosting, Cloud Functions, and SSR optimizations), please switch to the **[`deployment`](https://github.com/christried/wintool2/tree/deployment)** branch.


## 📸 Screenshots

### Session Selection
<img width="840" height="428" alt="image" src="https://github.com/user-attachments/assets/d2e2ce77-be52-42ef-82d4-31ab95f7d589" />


### Challenge Dashboard & Timer
<img width="1910" height="568" alt="image" src="https://github.com/user-attachments/assets/9c24966f-9d7a-4235-a64f-9f3a50affe5a" />


## 🛠️ Tech Stack

* **Frontend:** Angular 20 (Signals, SSR/Hydration)
* **Backend:** Node.js / Express (migrated to Firebase Cloud Functions and Firebase Firestore on `deployment` branch)

## 🚀 Local Development

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/christried/wintool2.git](https://github.com/christried/wintool2.git)
    cd wintool2/app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    ng serve
    ```
    Navigate to `http://localhost:4200/`.

## ☁️ Deployment

To deploy this application to Firebase:

1.  Switch to the `deployment` branch.
2.  Ensure your `firebase.config.ts` and `environment.development.ts` are configured.
3.  Push to GitHub (if connected to Firebase App Hosting) or deploy manually via CLI.
