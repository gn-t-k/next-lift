# Next Lift Development Project

This document describes the overview of the Next Lift system development project.

## Project Overview

Next Lift is a system for planning and recording weight training, with two platforms: iOS and Web applications. We aim to build a system with the following strengths:

- Extreme UX that is easy to operate even in a fatigued state during training
- Statistical data analysis features to support planned training
- Data input features using voice and images

## Development Plan

### Phase 1: Infrastructure Setup

- Monorepo environment setup (pnpm workspaces + turborepo)
- Authentication API server construction (Hono + Better Auth)
- Better Auth configuration
- Turso Database configuration
- Foundation for Web/iOS/Turso integration

### Phase 2: Basic Feature Implementation

- Authentication system (Apple ID, Google authentication)
- Basic data recording and display features
- Data synchronization features

### Phase 3: Feature Expansion

- Statistical data analysis features
- Training plan creation features
- Voice and image input features

## Development Principles

### Basic Principles

- **Collaborative Development**: Collaborative design and implementation between users and Claude
- **Utilize Latest Information**: Always plan and develop based on the latest documentation and technical information
- **Loosely Coupled Design**: Technology choices that make framework replacement easy
- **Continuous Improvement**: Iterative improvement of specifications and implementation

### Documentation Management Policy

- **Technical Details and Development Guidelines**: CLAUDE.md → distributed to .claude directory
- **Project Overview, Features, and Status**: README.md
- **Regular Self-Review**: Automatically review and update documentation after important decisions
- **Continuity Confirmation**: Ensure documentation not only for this time but also when similar instructions are given in the future

### Quality Management Policy

- **CI Priority**: Minimize manual checks and automate everything possible with CI
- **Japanese First**: Commit messages, comments, and documentation written in Japanese
- **Small Pull Requests**: Keep pull requests as small as possible for easy review
