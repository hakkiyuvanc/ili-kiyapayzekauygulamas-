# Layer 7: Testing & Distribution - Implementation Guide

## Golden Dataset (50 Test Scenarios)

### Test Scenario Categories

1. **Healthy Relationships (10 scenarios)**
   - High empathy, balanced communication
   - Positive conflict resolution
   - Strong "we" language

2. **Developing Relationships (15 scenarios)**
   - Mixed metrics
   - Some conflict patterns
   - Growth opportunities

3. **Challenging Relationships (15 scenarios)**
   - High conflict indicators
   - Communication imbalances
   - Gottman's "Four Horsemen" present

4. **Edge Cases (10 scenarios)**
   - Very short conversations (< 10 messages)
   - Very long conversations (> 500 messages)
   - Multi-language content
   - Heavy emoji usage
   - System messages only

### Test Data Structure

```json
{
  "scenario_id": "healthy_001",
  "category": "healthy",
  "description": "Young couple with strong communication",
  "conversation_text": "...",
  "expected_metrics": {
    "empathy_score": ">= 80",
    "conflict_score": "<= 20",
    "overall_health": "Sağlıklı"
  },
  "platform": "whatsapp",
  "message_count": 45
}
```

## Automated Testing

### Backend Tests

```bash
# Run all tests
pytest backend/tests/

# Run with coverage
pytest --cov=backend/app --cov-report=html

# Run specific test suite
pytest backend/tests/test_analysis.py -v
```

### Frontend Tests

```bash
# Run Jest tests
cd frontend && npm test

# Run with coverage
npm test -- --coverage

# E2E tests with Playwright
npm run test:e2e
```

### Integration Tests

```python
# backend/tests/test_integration/test_full_analysis_flow.py
def test_full_analysis_flow():
    """Test complete analysis pipeline"""
    # 1. Parse conversation
    # 2. Apply PII masking
    # 3. Run AI analysis
    # 4. Unmask results
    # 5. Validate output schema
    pass
```

## Electron Distribution

### electron-builder Configuration

```json
{
  "build": {
    "appId": "com.amor.relationship-ai",
    "productName": "AMOR - İlişki Analiz AI",
    "directories": {
      "output": "dist"
    },
    "files": [
      "frontend/out/**/*",
      "backend/**/*",
      "!backend/venv/**/*",
      "!backend/tests/**/*"
    ],
    "mac": {
      "category": "public.app-category.lifestyle",
      "target": ["dmg", "zip"],
      "icon": "build/icon.icns",
      "hardenedRuntime": true,
      "gatekeeperAssess": false,
      "entitlements": "build/entitlements.mac.plist",
      "entitlementsInherit": "build/entitlements.mac.plist"
    },
    "win": {
      "target": ["nsis", "portable"],
      "icon": "build/icon.ico"
    },
    "linux": {
      "target": ["AppImage", "deb"],
      "category": "Utility"
    }
  }
}
```

### Code Signing

**macOS:**
```bash
# Sign the app
codesign --deep --force --verify --verbose --sign "Developer ID Application: Your Name" AMOR.app

# Notarize
xcrun notarytool submit AMOR.dmg --keychain-profile "notary-profile" --wait
```

**Windows:**
```bash
# Sign with SignTool
signtool sign /f certificate.pfx /p password /tr http://timestamp.digicert.com /td sha256 /fd sha256 AMOR-Setup.exe
```

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
name: Build and Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      - name: Install dependencies
        run: |
          pip install -r backend/requirements.txt
          pip install pytest pytest-cov
      - name: Run tests
        run: pytest backend/tests/ --cov=backend/app
      
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd frontend && npm ci
      - name: Run tests
        run: cd frontend && npm test
      
  build-electron:
    needs: [test-backend, test-frontend]
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [macos-latest, windows-latest, ubuntu-latest]
    steps:
      - uses: actions/checkout@v3
      - name: Build Electron app
        run: npm run build:electron
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: electron-${{ matrix.os }}
          path: dist/
```

## Implementation Checklist

### Testing
- [ ] Create 50 golden dataset scenarios
- [ ] Implement backend unit tests (target: 80% coverage)
- [ ] Implement frontend component tests
- [ ] Add integration tests for full pipeline
- [ ] Set up E2E tests with Playwright
- [ ] Add performance benchmarks

### Distribution
- [ ] Configure electron-builder
- [ ] Set up code signing certificates
- [ ] Create build scripts for all platforms
- [ ] Implement auto-update mechanism
- [ ] Add crash reporting (Sentry)
- [ ] Create installation guides

### CI/CD
- [ ] Set up GitHub Actions workflows
- [ ] Configure automated testing
- [ ] Add build artifact uploads
- [ ] Implement release automation
- [ ] Set up staging environment

## Quality Metrics

**Target Metrics:**
- Backend test coverage: >= 80%
- Frontend test coverage: >= 70%
- E2E test pass rate: 100%
- Build success rate: >= 95%
- Average analysis time: < 5 seconds
- Memory usage: < 500MB

## Release Process

1. **Version Bump**: Update version in `package.json`
2. **Changelog**: Update `CHANGELOG.md`
3. **Tag**: Create git tag `v1.0.0`
4. **Build**: Run `npm run build:all`
5. **Test**: Run full test suite
6. **Sign**: Code sign all binaries
7. **Upload**: Upload to release platform
8. **Announce**: Publish release notes

## Next Steps

After completing Layer 7:
1. Beta testing with real users
2. Performance optimization
3. Security audit
4. Accessibility improvements
5. Internationalization (i18n)
