"""Test runner for all unit tests"""

import os
import sys
import unittest

# Add project root to path
sys.path.insert(0, "/Users/hakkiyuvanc/GİTHUB/ilişki yapay zeka/ili-kiyapayzekauygulamas-")

# Discover and run all tests
if __name__ == "__main__":
    # Get tests directory
    test_dir = os.path.dirname(os.path.abspath(__file__))

    # Discover all test files
    loader = unittest.TestLoader()
    suite = loader.discover(test_dir, pattern="test_*.py")

    # Run tests with verbose output
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    # Print summary
    print("\n" + "=" * 70)
    print("TEST SUMMARY")
    print("=" * 70)
    print(f"Tests run: {result.testsRun}")
    print(f"Successes: {result.testsRun - len(result.failures) - len(result.errors)}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    print("=" * 70)

    # Exit with error code if tests failed
    sys.exit(not result.wasSuccessful())
