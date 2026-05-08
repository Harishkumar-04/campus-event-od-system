# Campus Event OD System

A comprehensive web application for managing campus events and On-Duty (OD) requests for students, faculty, and administrators. Built with Next.js, Prisma, and NextAuth for a modern, secure, and scalable solution.

## Features

### For Students
- View and register for campus events
- Submit On-Duty (OD) requests for events
- Track OD approval status
- Manage profile settings
- Apply for intercollege OD permissions

### For Faculty
- Approve/reject student OD requests
- View today's OD activities
- Manage event registrations

### For HOD (Head of Department)
- Oversee intercollege OD requests
- Approve bulk OD requests for events

### For Club Admins
- Create and manage campus events
- View event registrations
- Export event data

### For Super Admins
- Full system administration
- Manage users, departments, and system settings
- Bulk operations and data exports

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with multiple providers
- **UI Components**: Shadcn/ui
- **Deployment**: Vercel (recommended)

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Harishkumar-04/campus-event-od-system.git
cd campus-event-od-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/campus_event_db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
# Add other auth provider secrets as needed
```

4. Set up the database:
```bash
npx prisma migrate dev
npx prisma db seed
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Database Schema

The application uses Prisma ORM with the following main models:
- User (students, faculty, admins)
- Event (campus events)
- ODRequest (On-Duty requests)
- Registration (event registrations)
- Department
- IntercollegeOD

## API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth handlers

### Events
- `GET /api/events` - List all events
- `POST /api/events` - Create new event (admin only)
- `GET /api/events/[id]` - Get event details
- `PUT /api/events/[id]` - Update event
- `DELETE /api/events/[id]` - Delete event

### OD Requests
- `GET /api/od-requests` - List OD requests
- `POST /api/od-requests` - Create OD request
- `PUT /api/od-requests/[id]` - Update OD request
- `POST /api/od-requests/bulk-approve` - Bulk approve requests

### Other endpoints for faculty, students, registrations, etc.

## Usage

1. **Registration/Login**: Users can register or login with their credentials
2. **Role-based Access**: The app automatically redirects users to their respective dashboards based on their roles
3. **Event Management**: Club admins can create events, students can register
4. **OD System**: Students submit OD requests, faculty/HOD approve them
5. **Reports**: Export functionality for various data

## Development

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Database Management
- `npx prisma studio` - Open Prisma Studio for database management
- `npx prisma migrate dev` - Run migrations in development
- `npx prisma generate` - Generate Prisma client

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Set up PostgreSQL database (e.g., Vercel Postgres or external provider)
4. Deploy automatically on push

### Manual Deployment
1. Build the application: `npm run build`
2. Start the server: `npm start`
3. Ensure database is accessible

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add some feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email [your-email@example.com] or create an issue in this repository.

---

Built with ❤️ for efficient campus event and OD management.
