# League Creation Flow

## Overview
This diagram shows the step-by-step process for a commissioner to create a new fantasy league.

## User Flow Steps

### 1. League Setup Form
- **Page**: `/league/create`
- **Form Fields**:
  - League name (required)
  - Season (2025)
  - Max teams (4-24)
  - Game mode (All Games vs Conference Only)
  - Draft type (Snake vs Auction)
  - Pick time (30-600 seconds)
  - Draft date/time
  - Public/Private setting
  - Password (if private)

### 2. Form Validation
- **Client-side validation**: Required fields, format checks
- **Server-side validation**: Duplicate names, date validation
- **Error handling**: Display validation errors

### 3. League Creation
- **API Call**: `POST /api/leagues`
- **Database**: Create record in `leagues` collection
- **Response**: League ID and confirmation

### 4. Redirect to Dashboard
- **Success**: Redirect to `/league/[id]`
- **Error**: Stay on form with error message

## Decision Points
- **Public vs Private**: Affects join process
- **Conference Mode**: Limits player pool
- **Draft Type**: Affects draft interface

## Error Scenarios
- **Duplicate name**: Suggest alternative names
- **Invalid date**: Show date picker
- **Server error**: Retry mechanism

