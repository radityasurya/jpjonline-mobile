# Mobile Exam List API Integration

## Overview

The mobile app now uses the mobile-optimized `/api/me/exams` endpoint for fetching exam lists. This endpoint provides a cleaner, more efficient response format specifically designed for mobile consumption.

## API Endpoint

### Endpoint

```
GET /api/me/exams
```

### Authentication

Requires Bearer token in Authorization header.

### Response Format

```json
{
  "categories": [
    {
      "id": "cat_123",
      "name": "Undang-Undang Jalan Raya",
      "accessible": true,
      "exams": [
        {
          "id": "exam_123",
          "slug": "ujian-teori-jpj-set-1",
          "title": "Ujian Teori JPJ - Set 1",
          "description": "...",
          "questionCount": 50,
          "crown": false,
          "passRate": 70,
          "category": "Undang-Undang Jalan Raya",
          "totalTimeDuration": 1800,
          "timerType": "TOTAL_TIME_LIMIT",
          "mode": "OPEN"
        }
      ]
    }
  ]
}
```

## Benefits

### ✅ Mobile-Optimized

- **Grouped by category**: Better UX for mobile navigation
- **Clean response**: No database internals exposed
- **Mobile-friendly field names**: Uses `crown` instead of `isPremium`
- **Access filtering**: Only returns categories with accessible exams
- **User-specific**: Automatically filters by user's access level

### ✅ Performance

- Single API call to get all exams
- Pre-filtered data reduces client-side processing
- Smaller payload size

### ✅ Security

- No sensitive database fields exposed
- User access level enforced server-side
- Premium content properly gated

## Implementation Details

### Service Layer (`services/examsService.js`)

The `getUserExams()` function has been updated to:

1. Use the new `/api/me/exams` endpoint
2. Validate the mobile-optimized response format
3. Log additional metrics (accessible categories count)
4. Handle invalid responses gracefully

```javascript
export const getUserExams = async (token) => {
  // Fetches from /api/me/exams
  // Returns mobile-optimized format
  // Validates response structure
};
```

### API Configuration (`config/api.js`)

Added new endpoint constant:

```javascript
EXAMS: {
  USER_EXAMS: '/api/me/exams',  // New mobile-optimized endpoint
  // ... other endpoints
}
```

### Mobile App Integration (`app/(tabs)/tests.tsx`)

The tests screen already supports the new format:

- Consumes `categories` array from response
- Filters accessible categories
- Flattens exams for display
- Handles category-based filtering

### Component Support (`components/tests/ExamCard.tsx`)

ExamCard component displays:

- `crown` badge for premium exams
- `questionCount` for exam size
- `mode` (OPEN/CLOSED) for exam type
- `totalTimeDuration` for time limits
- `passRate` for difficulty indication

## Field Mapping

| Backend Field | Mobile Field | Description |
|--------------|--------------|-------------|
| `isPremium` | `crown` | Premium exam indicator |
| `questions` | `questionCount` | Number of questions |
| `settings.type` | `mode` | OPEN or CLOSED exam mode |
| `duration` | `totalTimeDuration` | Time limit in seconds |
| `passingScore` | `passRate` | Required pass percentage |

## Usage Example

```typescript
import { getUserExams } from '@/services';

// Fetch exams
const response = await getUserExams();

// Access categories
response.categories.forEach(category => {
  console.log(category.name);
  console.log(category.accessible);
  
  // Access exams in category
  category.exams.forEach(exam => {
    console.log(exam.title);
    console.log(exam.crown); // Premium indicator
    console.log(exam.questionCount);
  });
});
```

## Error Handling

The service includes comprehensive error handling:

- Network errors
- Invalid response format
- Missing authentication
- Server errors

All errors are logged and propagated to the UI layer for user feedback.

## Future Enhancements

Potential improvements:

1. Add pagination for large exam lists
2. Include exam completion status
3. Add user's best score per exam
4. Include estimated completion time
5. Add difficulty ratings

## Testing

To test the integration:

1. Ensure user is authenticated
2. Navigate to Tests tab
3. Verify exams load correctly
4. Check category filtering works
5. Verify premium exams show crown badge
6. Test search functionality

## Related Files

- `services/examsService.js` - Service implementation
- `config/api.js` - API configuration
- `app/(tabs)/tests.tsx` - Tests screen
- `components/tests/ExamCard.tsx` - Exam card component
- `types/api.ts` - TypeScript type definitions
