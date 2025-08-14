# Appwrite Schema Update Instructions

## Add Missing Fields to Leagues Collection

Please add the following fields to your `leagues` collection in Appwrite Console:

### 1. scoringRules (Required for saving scoring settings)
- **Type**: String
- **Size**: 5000
- **Required**: No
- **Default**: null
- **Array**: No

### 2. pickTimeSeconds
- **Type**: Integer
- **Required**: No
- **Min**: null
- **Max**: null
- **Default**: 90

### 3. seasonStartWeek
- **Type**: Integer
- **Required**: No
- **Min**: null
- **Max**: null
- **Default**: 1

### 4. gameMode
- **Type**: String
- **Size**: 50
- **Required**: No
- **Default**: "power4"

### 5. rosterSchema
- **Type**: String
- **Size**: 1000
- **Required**: No
- **Default**: null

### 6. inviteCode
- **Type**: String
- **Size**: 20
- **Required**: No
- **Default**: null

### 7. isPublic
- **Type**: Boolean
- **Required**: No
- **Default**: true

### 8. commissionerId
- **Type**: String
- **Size**: 255
- **Required**: No
- **Default**: null

## How to Add These Fields:

1. Go to your Appwrite Console
2. Navigate to Databases → college-football-fantasy → leagues collection
3. Click on "Attributes" tab
4. Click "Create Attribute" for each field above
5. Fill in the details as specified
6. Save each attribute

Once these fields are added, the commissioner settings page will be able to save scoring rules and other settings properly.
