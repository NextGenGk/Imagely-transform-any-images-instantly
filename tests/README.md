# Imagely Test Suite

Comprehensive test coverage for all application features including Razorpay subscription management, credit system, and image processing.

## Test Structure

### 1. All Features Tests (`all-features.test.ts`)
Tests all 13 image processing features:
- Basic resize (pixels and millimeters)
- Format conversion (PNG, JPG, WebP)
- Compression (various sizes)
- Rotation (90°, 180°, 45°)
- Flip/Mirror (horizontal, vertical)
- Grayscale/Black & White
- Blur effects
- Sharpen effects
- Contrast adjustment
- DPI/Resolution settings
- Passport photos (standard, US, with backgrounds)
- Combined operations
- Background colors

### 2. Razorpay Subscription Tests (`razorpay-subscription.test.ts`)
Comprehensive subscription lifecycle tests:

#### Subscription Creation
- Create Razorpay customer for new users
- Reuse existing Razorpay customers
- Handle basic plan (free) without Razorpay
- Validate plan IDs

#### Subscription Activation
- Activate pro subscription with Razorpay
- Activate free subscription without Razorpay
- Set correct credits based on plan
- Update subscription status

#### Credit Management
- Initialize credits for new users
- Reset credits when period expires
- Maintain credits before reset date
- Handle unlimited credits for pro plan
- Deduct credits after usage
- Check sufficient credits before processing
- Throw error on insufficient credits

#### Subscription Cancellation
- Cancel at period end (maintain access)
- Cancel immediately (lose access)
- Handle no active subscription error

#### Subscription Renewal
- Handle renewal webhook events
- Update subscription period
- Reset credits on renewal

#### Subscription Status
- Return correct status for pro users
- Return correct status for free users
- Return no access when credits exhausted

#### Plan Transitions
- Upgrade from basic to pro
- Downgrade from pro to basic after cancellation
- Update credits on plan change

#### Month End Scenarios
- Convert pro user to free when subscription expires
- Maintain pro access until period end
- Reset credits based on new plan

### 3. API Integration Tests (`api-integration.test.ts`)
Tests all API endpoints:

#### Subscription API
- `POST /api/subscription/create` - Create subscriptions
- `POST /api/subscription/verify` - Verify payments
- `POST /api/subscription/cancel` - Cancel subscriptions
- `GET /api/subscription/status` - Get subscription status

#### Credits API
- `GET /api/user/credits` - Get user credits
- Credit initialization for new users
- Credit sync and reset

#### Webhook API
- `POST /api/webhooks/razorpay` - Handle Razorpay webhooks
- subscription.activated
- subscription.charged (renewal)
- subscription.cancelled
- subscription.paused
- subscription.resumed
- subscription.completed
- Signature verification

#### Image Processing API
- `POST /api/process-image` - Process images
- `POST /api/parse-query` - Parse natural language queries
- Credit checks and deductions
- Request saving

#### History API
- `GET /api/history` - Get processing history
- Pagination support

#### Health Check API
- `GET /api/health` - System health check
- Service status checks
- System metrics

### 4. User Flow Tests (`user-flows.test.ts`)
End-to-end user journey tests:

#### New User Onboarding
- Registration and first upload
- Initial credit allocation

#### Free User Flow
- 10 requests per month limit
- Credit exhaustion handling
- Upgrade prompts
- Monthly credit reset

#### Pro Subscription Flow
- Complete purchase flow
- Credit allocation (500)
- Pro feature access

#### Subscription Renewal Flow
- Automatic renewal
- Credit reset on renewal
- Failed payment handling

#### Subscription Cancellation Flow
- Cancel at period end
- Maintain access until expiry
- Downgrade to basic
- Immediate cancellation

#### Plan Upgrade Flow
- Upgrade from basic to pro
- Immediate credit grant

#### Image Processing Flow
- Complete workflow
- Multiple requests
- History saving

#### Month End Scenarios
- Active pro user renewal
- Cancelled pro user downgrade
- Free user credit reset

#### Edge Cases
- Zero credits
- Grace period
- Concurrent requests
- Mid-period plan changes

#### Feature Access Control
- Pro feature restrictions
- Basic feature access

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Suite
```bash
npm test tests/features/razorpay-subscription.test.ts
npm test tests/features/api-integration.test.ts
npm test tests/features/user-flows.test.ts
npm test tests/features/all-features.test.ts
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with UI
```bash
npm run test:ui
```

### Run Comprehensive Test Suite (PowerShell)
```powershell
.\tests\run-all-tests.ps1
```

## Environment Variables Required

For full test coverage, ensure these environment variables are set in `.env`:

```env
# Database
DATABASE_URL=your_database_url

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# Google Gemini API
GEMINI_API_KEY=your_gemini_key

# ImageKit
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_endpoint

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
RAZORPAY_BASIC_PLAN_ID=your_basic_plan_id
RAZORPAY_PRO_PLAN_ID=your_pro_plan_id
```

## Test Coverage Areas

### ✅ Subscription Management
- [x] Create subscription with Razorpay
- [x] Activate subscription
- [x] Cancel subscription (immediate and at period end)
- [x] Subscription renewal
- [x] Subscription status checks
- [x] Plan upgrades and downgrades

### ✅ Credit System
- [x] Credit initialization
- [x] Credit deduction
- [x] Credit reset (monthly)
- [x] Credit checks before processing
- [x] Insufficient credit handling
- [x] Unlimited credits for pro users

### ✅ Razorpay Integration
- [x] Customer creation
- [x] Subscription creation
- [x] Payment verification
- [x] Webhook handling
- [x] Signature verification

### ✅ Month End Scenarios
- [x] Pro user renewal with credit reset
- [x] Cancelled pro user downgrade to free
- [x] Free user credit reset
- [x] Subscription expiry handling

### ✅ API Endpoints
- [x] All subscription endpoints
- [x] Credit endpoints
- [x] Webhook endpoints
- [x] Image processing endpoints
- [x] History endpoints
- [x] Health check endpoint

### ✅ User Flows
- [x] New user onboarding
- [x] Free user journey
- [x] Pro subscription purchase
- [x] Subscription cancellation
- [x] Plan transitions
- [x] Image processing workflow

### ✅ Error Handling
- [x] Authentication errors
- [x] Validation errors
- [x] Insufficient credits
- [x] Payment failures
- [x] API errors

### ✅ Security
- [x] Input validation
- [x] Input sanitization
- [x] Signature verification
- [x] Rate limiting

## Key Test Scenarios

### Subscription Lifecycle
1. **New User** → Basic plan (10 credits)
2. **Upgrade** → Pro plan (500 credits)
3. **Usage** → Credits deducted per request
4. **Renewal** → Credits reset monthly
5. **Cancellation** → Downgrade to basic at period end

### Credit Management
1. **Initialization** → New users get 10 credits
2. **Deduction** → 1 credit per image processing request
3. **Reset** → Credits reset monthly based on plan
4. **Exhaustion** → Block requests when credits = 0
5. **Upgrade** → Immediate credit increase

### Month End Behavior
1. **Active Pro** → Credits reset to 500, subscription continues
2. **Cancelled Pro** → Downgrade to basic, credits reset to 10
3. **Free User** → Credits reset to 10

## Mocking Strategy

Tests use Vitest's mocking capabilities to:
- Mock database operations
- Mock Razorpay API calls
- Mock external service calls
- Isolate unit tests from external dependencies

## Continuous Integration

These tests are designed to run in CI/CD pipelines:
- Fast execution
- No external dependencies required (with mocks)
- Clear pass/fail indicators
- Detailed error messages

## Contributing

When adding new features:
1. Add tests to appropriate test file
2. Follow existing test structure
3. Include both success and error cases
4. Test edge cases
5. Update this README

## Test Results Interpretation

- ✅ **Green** - All tests passed
- ❌ **Red** - Tests failed (check error messages)
- ⚠️ **Yellow** - Tests skipped (missing API keys)

## Support

For test-related issues:
1. Check environment variables are set
2. Ensure database is accessible
3. Verify API keys are valid
4. Review test output for specific errors
