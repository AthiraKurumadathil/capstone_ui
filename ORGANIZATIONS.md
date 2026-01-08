# Organization Management System

Complete React components for managing organizations with full CRUD operations.

## Components Created

### 1. **OrganizationList.js** - List All Organizations
- Displays all organizations in a table format
- Status indicator (Active/Inactive)
- Action buttons: View, Edit, Delete
- Delete confirmation modal
- Empty state with create button
- Error handling and loading states

### 2. **OrganizationForm.js** - Create & Edit Organizations
- Form for creating new organizations
- Form for editing existing organizations
- Field validation:
  - Name (required)
  - Email (required, must be valid email format)
  - Phone (required, must be valid phone format)
  - Address (required)
  - City (optional)
  - State (optional)
  - Zip Code (optional)
  - Active status toggle
- Real-time error clearing
- Loading states

### 3. **OrganizationDetail.js** - View Organization Details
- View full organization details
- Display all fields including ID
- Edit and Back buttons
- Clickable email and phone links
- Status display
- Error handling for not found/loading states

### 4. **organizationService.js** - API Service
- `getAllOrganizations()` - GET /organizations
- `getOrganization(orgId)` - GET /organizations/{org_id}
- `createOrganization(data)` - POST /organizations
- `updateOrganization(orgId, data)` - PUT /organizations/{org_id}
- `deleteOrganization(orgId)` - DELETE /organizations/{org_id}
- Automatic JWT token injection in all requests
- Error handling and logging

## API Endpoints

All endpoints require JWT authentication (Bearer token).

### GET /organizations
Get all organizations

**Response:**
```json
[
  {
    "id": 1,
    "name": "Acme Corp",
    "email": "info@acme.com",
    "phone": "555-1234",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "active": true
  }
]
```

### POST /organizations
Create a new organization

**Request Body:**
```json
{
  "name": "New Company",
  "email": "contact@company.com",
  "phone": "555-5678",
  "address": "456 Oak Ave",
  "city": "Boston",
  "state": "MA",
  "zip": "02101",
  "active": true
}
```

### GET /organizations/{org_id}
Get a single organization

**Response:**
```json
{
  "id": 1,
  "name": "Acme Corp",
  "email": "info@acme.com",
  "phone": "555-1234",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zip": "10001",
  "active": true
}
```

### PUT /organizations/{org_id}
Update an organization (partial updates supported)

**Request Body:**
```json
{
  "name": "Updated Name",
  "active": false
}
```

### DELETE /organizations/{org_id}
Delete an organization

**Response:** 204 No Content

## Routes

```
/organizations - List all organizations (protected)
/organizations/create - Create new organization (protected)
/organizations/:orgId - View organization details (protected)
/organizations/edit/:orgId - Edit organization (protected)
```

## Features

✅ **Full CRUD Operations**
- Create, Read, Update, Delete organizations

✅ **Form Validation**
- Email format validation
- Phone number format validation
- Required field validation
- Real-time error clearing

✅ **Authentication**
- JWT token automatically injected
- Protected routes with PrivateRoute

✅ **User Experience**
- Loading states
- Error messages
- Confirmation dialogs for delete
- Empty states with helpful CTAs
- Responsive design
- Smooth animations and transitions

✅ **Error Handling**
- API error catching
- User-friendly error messages
- Console logging for debugging

## File Structure

```
src/
├── components/
│   ├── OrganizationList.js
│   ├── OrganizationList.css
│   ├── OrganizationForm.js
│   ├── OrganizationForm.css
│   ├── OrganizationDetail.js
│   └── OrganizationDetail.css
├── services/
│   └── organizationService.js
└── App.js (updated with routes)
```

## Usage

### Access Organization Management

From the Home page:
1. Click "Organizations" in the navbar
2. Or click "View Organizations" button

### Create Organization

1. Click "+ Create Organization" button
2. Fill in required fields
3. Optionally add city, state, zip
4. Toggle active status if needed
5. Click "Create" button

### View Organization Details

1. From list, click "View" button
2. See all organization details
3. Click "Edit" to modify

### Edit Organization

1. From list, click "Edit" button
2. Or from detail view, click "Edit"
3. Modify desired fields
4. Click "Update" button

### Delete Organization

1. From list, click "Delete" button
2. Confirm deletion in modal
3. Organization removed from system

## Styling

Modern, responsive design with:
- Gradient backgrounds
- Smooth transitions and animations
- Color-coded buttons and status indicators
- Mobile-friendly layout
- Accessibility features

## Environment Variables

API URL configured in `.env`:
```
REACT_APP_API_URL=http://127.0.0.1:8000
```

## Dependencies

- React 18.2.0
- React Router DOM 6.14.0
- Axios 1.4.0

## Notes

- All API calls require valid JWT token (auto-handled)
- Token injected via axios interceptor
- Form validates before submission
- Delete requires confirmation
- Support for partial updates in edit mode
