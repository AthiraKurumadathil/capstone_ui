# Capstone UI Login Application

A React-based login application with email and password validation, API integration, and protected routes.

## Features

✅ **Email Validation** - Validates email format  
✅ **Password Validation** - Minimum 6 characters required  
✅ **API Integration** - Axios-based authentication service  
✅ **Protected Routes** - Private route component for authenticated pages  
✅ **Token Management** - JWT token storage and management  
✅ **User Session** - User data stored in localStorage  
✅ **Responsive Design** - Modern, gradient-based UI  
✅ **Error Handling** - Form validation and server error messages  

## Project Structure

```
capstone_ui/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Login.js
│   │   ├── Login.css
│   │   ├── Home.js
│   │   ├── Home.css
│   │   └── PrivateRoute.js
│   ├── services/
│   │   └── authService.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

## Installation

### Local Setup Instructions

1. **Clone the project from GitHub:**
```bash
git clone https://github.com/AthiraKurumadathil/capstone_ui.git
cd capstone_ui
```

2. **Download and Install Node.js:**
   - Visit [nodejs.org](https://nodejs.org/)
   - Download and install the latest LTS version
   - Verify installation:
   ```bash
   node --version
   npm --version
   ```

3. **Install dependencies:**
   - Open terminal/command prompt in the project directory
   ```bash
   npm install
   ```

4. **Run the application:**
```bash
npm start
```

The app will open at `http://localhost:3000`

5. **Configure Environment Variables (if needed):**
   - Create a `.env` file in the root directory:
   ```
   REACT_APP_API_URL=http://localhost:3001/api
   ```

## Running the Application

```bash
npm start
```

The app will open at `http://localhost:3000`

## API Endpoint Configuration

**Update the API endpoint in `src/services/authService.js`:**

The login endpoint should be:
```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

## Routes

- `/` - Login page (public)
- `/home` - Home/Dashboard page (protected, requires authentication)

## Form Validation Rules

### Email
- Required field
- Must be valid email format (contains @ and domain)

### Password
- Required field
- Minimum 6 characters

## Authentication Flow

1. User enters email and password
2. Form validation is performed
3. If valid, credentials are sent to the API
4. On success, JWT token is stored in localStorage
5. User is redirected to `/home`
6. Protected routes check for token before allowing access
7. Logout removes token and redirects to login

## Technologies Used

- **React 18** - UI framework
- **React Router v6** - Client-side routing
- **Axios** - HTTP client for API calls
- **CSS3** - Styling with gradients and animations

## Customization

### Changing API Endpoint
Edit `src/services/authService.js` and update the `API_BASE_URL` variable.

### Styling
- `src/index.css` - Global styles
- `src/components/Login.css` - Login component styles
- `src/components/Home.css` - Home component styles

### Password Requirements
Update the validation in `src/components/Login.js` in the `validatePassword()` function.

## Notes

⚠️ **Important**: Replace `http://localhost:3001/api` with your actual API endpoint.

The application expects the API to return a `token` in the response for successful authentication.
