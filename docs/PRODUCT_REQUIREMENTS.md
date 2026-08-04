# Product Requirements Document

## Product Name

Application Tracker

## Document Status

- Version: 0.1
- Status: Draft
- Last Updated: August 4, 2026
- Owner: Melvin Berkoh

## 1. Product Overview

Application Tracker is a web application that helps job seekers organize job applications, track hiring progress, schedule follow-ups, and review job-search performance.

The product will replace disconnected spreadsheets, browser bookmarks, notes, and calendar reminders with one structured dashboard.

## 2. Problem Statement

Job seekers often apply to many positions across different platforms. Important information becomes difficult to manage, including:

- Which companies they applied to
- Which resume version they submitted
- Current application status
- Recruiter contact information
- Interview dates
- Follow-up deadlines
- Salary and location details
- Rejection and response patterns

Without a centralized system, users may miss follow-ups, forget application details, or lose visibility into whether their job-search strategy is working.

## 3. Product Goals

The application should allow users to:

1. Store and manage job applications.
2. Track applications through a hiring pipeline.
3. Identify applications requiring follow-up.
4. Search and filter application records.
5. View useful job-search statistics.
6. Access the application on desktop and mobile devices.
7. Keep each user’s data private and secure.

## 4. Non-Goals for the MVP

The first release will not include:

- Automatic job scraping
- Automatic application submission
- AI resume scoring
- Gmail integration
- Calendar synchronization
- Browser extension support
- Team or recruiter accounts
- Native mobile applications
- Subscription payments

These features may be evaluated after the MVP is complete.

## 5. Target User

### Primary User

An individual job seeker managing multiple applications simultaneously.

### User Needs

The user needs to:

- Quickly record a new application
- See the current status of every application
- Know which companies require follow-up
- Prepare for recruiter calls and interviews
- Track application outcomes
- Understand their response and interview rates

## 6. MVP Features

### 6.1 Authentication

Users must be able to:

- Create an account
- Sign in
- Sign out
- Access only their own application data

### 6.2 Application Management

Users must be able to:

- Create an application
- View an application
- Edit an application
- Delete an application

Each application may contain:

- Company name
- Position title
- Job description
- Job posting URL
- Location
- Work arrangement
- Salary range
- Application source
- Resume version
- Application status
- Date applied
- Follow-up date
- Recruiter or contact information
- Notes
- Created and updated timestamps

### 6.3 Application Pipeline

Applications must support the following statuses:

- Saved
- Applied
- Recruiter Screen
- Interview
- Assessment
- Offer
- Rejected
- Withdrawn

Users must be able to update an application’s status.

### 6.4 Dashboard

The dashboard should display:

- Total applications
- Applications submitted
- Active interview processes
- Offers
- Rejections
- Applications requiring follow-up
- Applications grouped by status

### 6.5 Search and Filtering

Users should be able to search or filter applications by:

- Company
- Position title
- Status
- Location
- Work arrangement
- Date applied

### 6.6 Follow-Up Tracking

Users must be able to:

- Add a follow-up date
- View upcoming follow-ups
- Identify overdue follow-ups
- Mark follow-up activity in application notes

### 6.7 Responsive Design

The application must support:

- Desktop browsers
- Tablets
- Mobile browsers

Core actions must remain usable on smaller screens.

## 7. User Stories

### Application Management

- As a job seeker, I want to save a job before applying so I can return to it later.
- As a job seeker, I want to record an application so I do not forget where and when I applied.
- As a job seeker, I want to edit application details when the hiring process changes.
- As a job seeker, I want to delete incorrect or unnecessary records.

### Pipeline Tracking

- As a job seeker, I want to update an application’s status so I can understand my current pipeline.
- As a job seeker, I want to see applications grouped by stage so I can focus on active opportunities.

### Follow-Ups

- As a job seeker, I want to assign follow-up dates so I do not miss opportunities.
- As a job seeker, I want overdue follow-ups to be clearly visible.

### Analytics

- As a job seeker, I want to see application statistics so I can evaluate my job-search strategy.

## 8. Functional Requirements

- Users must be authenticated before accessing private application data.
- Every application must belong to one user.
- Company name and position title are required.
- Application status must use a supported status value.
- Invalid form submissions must display clear validation messages.
- Users must not be able to view or modify another user’s records.
- Destructive actions must require confirmation.
- Loading, empty, success, and error states must be displayed where appropriate.

## 9. Quality Requirements

### Accessibility

- Forms must have associated labels.
- Interactive controls must support keyboard navigation.
- Color must not be the only indicator of status.
- Text and interface elements should maintain sufficient contrast.

### Performance

- Primary dashboard content should load quickly under normal conditions.
- Database queries should request only required data.
- Large application lists should support pagination or incremental loading when necessary.

### Security

- Authentication credentials must not be stored directly by the application.
- Environment variables must not be committed to Git.
- Server-side authorization must verify resource ownership.
- User input must be validated before database operations.

### Reliability

- Failed operations must display understandable error messages.
- Application data must remain consistent after updates.
- Important functionality should have automated tests.

## 10. MVP Success Criteria

The MVP is complete when:

- A user can create an account and sign in.
- A user can create, view, update, and delete applications.
- A user can move applications through the hiring pipeline.
- A user can search and filter applications.
- A user can view application statistics.
- A user can identify upcoming and overdue follow-ups.
- User data is separated and protected.
- The application works on desktop and mobile screens.
- The production application is deployed.
- Setup and usage instructions are documented.

## 11. Future Enhancements

Potential post-MVP features include:

- Resume version management
- Interview event tracking
- Email reminders
- Calendar integration
- Data import and export
- Job-description analysis
- Application conversion analytics
- Browser extension
- Automated job-posting metadata extraction
- Custom pipeline stages
- Dark mode

## 12. Open Questions

- Which authentication provider will be used?
- Which hosted PostgreSQL provider will be used?
- Should users be able to attach resume files in the first release?
- Should the dashboard use a table, Kanban board, or both?
- Should deleted applications be permanently removed or archived?
