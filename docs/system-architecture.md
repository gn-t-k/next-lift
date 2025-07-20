# Next Lift System Architecture

This document describes the system architecture overview and major components.

## Overview

Next Lift is a system for managing weight training plans and records. It consists of two applications: iOS app and Web app. Each application provides the following features:

- iOS App
  - Authentication using Google account and Apple ID
  - CRUD functionality for training records
  - Offline support and data synchronization with local-first design
  - UX optimized for ease of use even during fatigue from training
  - AI-powered features such as free text and voice input (premium features)
- Web App
  - Authentication using Google account and Apple ID
  - CRUD functionality for training records
  - CRUD functionality for training plans
  - Data synchronization with local-first design
  - Features designed for large screens such as statistical data display and filtering
  - AI-powered features such as free text and voice input (premium features)

Next Lift uses an authentication database and Per-User databases.

- Authentication Database
  - Manages user information and session information
  - Supports authentication using Google account and Apple ID
- Per-User Database
  - Stores user-specific data such as training records and plans
  - Uses independent database instances for each user
  - iOS app reads and writes data from local instances, with changes automatically synced to remote instances
  - Web app reads and writes data from remote instances

An authentication API server is used to connect applications with databases. The authentication API server provides the following functions:

- Processes authentication requests from each application
- Creates Per-User database and provides connection information during user registration

## Component Details

### iOS App

- **Framework**: React Native
- **Target Platform**: iOS only (no Android testing environment)
- **Authentication**: Better Auth (integrated with authentication API server)
- **Database**: Per-User database (Local Replica)
- **Data Access**: Drizzle ORM + op-sqlite

### Web App

- **Framework**: React Router
- **Target Devices**: PC (optimized for large screens for statistical data display), Smartphone (for Android users)
- **Authentication**: Better Auth (integrated with authentication API server)
- **Database**: Per-User database (Remote Database)
- **Data Access**: Drizzle ORM
- **Deployment**: Cloudflare Workers

### Authentication API Server

- **Framework**: Hono
- **Library**: Better Auth
- **Authentication Methods**: Apple ID, Google authentication
- **API**: REST API (authentication endpoints for Web and iOS)
- **Database**: Authentication database
- **Data Access**: Drizzle ORM
- **Deployment**: Cloudflare Workers

### Authentication Database

- **Database**: Turso

### Per-User Database

- **Database**: Turso Embedded Replicas

## Package Management

Next Lift uses pnpm for package management. In the monorepo structure, each application and library is organized as follows:

```text
/apps
  ├── ios … iOS app
  ├── web … Web app
  └── auth-api … Authentication API server
/packages
  ├── react-components … Shared React components
  ├── react-native-components … Shared React Native components
  ├── per-user-database … Per-User database schema and client
  └── auth-database … Authentication database schema and client
```
