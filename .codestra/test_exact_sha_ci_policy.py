"""Regression evidence for the narrowly pinned certification workflows."""
import runpy
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
POLICY = runpy.run_path(str(ROOT / '.codestra/validate-production-orchestrator-contract.py'))
REPOSITORY = 'appolon1908/codestra'


class ExactCertificationPolicyTests(unittest.TestCase):
    def test_workflow_drift_fails_closed(self):
        for relative in ('.github/workflows/required-exact-sha-ci.yml', '.github/workflows/ghcr-readonly-preflight.yml'):
            workflow = (ROOT / relative).read_text()
            self.assertFalse(POLICY['workflow_has_runtime_mutation'](workflow, relative))
            self.assertTrue(POLICY['workflow_has_runtime_mutation'](workflow + '\n# unreviewed change\n', relative))
            self.assertTrue(POLICY['workflow_has_runtime_mutation'](workflow + '\n# kubectl apply -f live.yml\n', relative))

    def test_candidate_package_dependency_drift_fails_closed(self):
        relative = '.github/workflows/required-exact-sha-ci.yml'
        workflow = (ROOT / relative).read_text()
        bindings = POLICY['APPROVED_CONTROL_PLANE_DEPENDENCY_SHA256'][REPOSITORY][relative]
        for dependency, expected in list(bindings.items()):
            bindings[dependency] = '0' * 64
            try:
                self.assertTrue(POLICY['workflow_has_runtime_mutation'](workflow, relative), dependency)
            finally:
                bindings[dependency] = expected


if __name__ == '__main__':
    unittest.main()
