# Overview

FitProgress is a web application designed for tracking fitness transformation journeys through progress photos. The application allows users to upload, organize, and analyze their fitness photos with features including weight tracking, progress comparisons, timeline visualization, and video generation from photo sequences. The app emphasizes privacy by processing all images locally without sending data to external servers.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React with TypeScript**: Modern React application using functional components and hooks
- **Vite**: Development server and build tool for fast development and optimized production builds
- **Wouter**: Lightweight client-side routing library for navigation
- **Tailwind CSS**: Utility-first CSS framework for styling with custom design system
- **shadcn/ui**: Pre-built UI component library with Radix UI primitives
- **TanStack Query**: Data fetching and state management for API interactions
- **React Hook Form**: Form handling with validation

## Backend Architecture
- **Express.js**: Node.js web framework handling API routes and middleware
- **TypeScript**: Full-stack type safety with shared schema definitions
- **RESTful API**: Standard REST endpoints for CRUD operations on photos
- **File Upload Handling**: Base64 encoding for image storage and processing
- **Memory Storage**: In-memory data storage with interface for future database integration

## Data Storage Solutions
- **Drizzle ORM**: Type-safe SQL query builder and ORM
- **PostgreSQL**: Configured for production database (Neon Database)
- **Memory Storage**: Current implementation uses in-memory storage with plans for database migration
- **Base64 Image Encoding**: Images stored as base64 strings in database records

## Authentication and Authorization
- **No Authentication**: Currently implemented without user authentication
- **Local Processing**: All image processing happens client-side for privacy
- **Session Management**: Basic session handling infrastructure in place

## External Dependencies
- **Neon Database**: PostgreSQL hosting service for production database
- **FFmpeg**: Client-side video generation from photo sequences
- **Three.js**: 3D graphics library for enhanced visual effects
- **Radix UI**: Accessible UI primitives for component system
- **Replit Integration**: Development environment integration with Cartographer and dev banner plugins

## Key Design Patterns
- **Component Composition**: Modular UI components with clear separation of concerns
- **Custom Hooks**: Reusable logic for data fetching, photo management, and UI state
- **Type-Safe API**: Shared TypeScript schemas between frontend and backend
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Progressive Enhancement**: Core functionality works without JavaScript enhancements

## Image Processing Features
- **Local Processing**: All image operations performed in browser
- **Image Resizing**: Automatic image optimization for storage efficiency
- **Comparison Tools**: Side-by-side photo comparison with metrics calculation
- **Timeline Visualization**: Chronological progress tracking with weight analysis
- **Video Generation**: Client-side video creation from photo sequences using FFmpeg

## Database Schema
- **Photos Table**: Stores photo metadata including date, type, weight, notes, filename, and base64 image data
- **UUID Primary Keys**: Unique identifiers for all records
- **Flexible Schema**: Support for multiple photo types (front, side, back, pose)
- **Audit Fields**: Created timestamp tracking for data integrity