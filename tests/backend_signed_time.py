"""Run using ../Counter_Backend/env/bin/python tests/backend_signed_time.py.
Uses the backend's isolated API fixture; never opens the application's database.
"""
import sys
import unittest
from pathlib import Path
sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'Counter_Backend'))
from test_api import APITests

class SignedTimeTests(APITests):
    def test_departure_and_overtime_round_trip(self):
        person = self.person()
        departure = self.hours(person['id'], hours=0, minutes=-30, date='2024-03-31')
        self.hours(person['id'], hours=1, minutes=15, date='2024-04-01')
        detail = self.client.get(f"/api/persons/{person['id']}", headers=self.headers).json()
        self.assertEqual(detail['total_extra_hours'], .75)
        response = self.client.put(f"/api/extra-hours/{departure['id']}", headers=self.headers, json={'hours': -1, 'minutes': -30})
        self.assertEqual(response.status_code, 200, response.text)
        summary = self.client.get(f"/api/extra-hours/persons/{person['id']}/summary", headers=self.headers).json()
        self.assertEqual(summary['decimal_hours'], -.25)
        stored = self.client.get(f"/api/extra-hours/{departure['id']}", headers=self.headers).json()
        self.assertEqual(stored['hours'] * 60 + stored['minutes'], -90)
        response = self.client.put(f"/api/extra-hours/{departure['id']}", headers=self.headers, json={'hours': 0, 'minutes': 30})
        self.assertEqual(response.status_code, 200, response.text)
        for minutes in (-60, 60):
            self.assertEqual(self.client.post('/api/extra-hours/', headers=self.headers, json={'person_id': person['id'], 'minutes': minutes}).status_code, 422)

if __name__ == '__main__':
    suite = unittest.TestSuite([SignedTimeTests('test_departure_and_overtime_round_trip')])
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    sys.exit(not result.wasSuccessful())
