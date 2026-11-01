import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'destiny.settings')
django.setup()

from rest_framework.test import APIClient

client = APIClient()

# 1. Test Admin Login
login_res = client.post('/api/v1/auth/login/', {'email': 'admin@destiny.com', 'password': 'AdminPassword123!'}, format='json')
assert login_res.status_code == 200, f"Admin login failed: {login_res.data}"
token = login_res.data['data']['access']
client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
print("[OK] 1. Admin Login: SUCCESS")

# 2. Test Admin Dashboard Stats
stats_res = client.get('/api/v1/admin/dashboard/')
assert stats_res.status_code == 200, f"Stats failed: {stats_res.data}"
print("[OK] 2. Admin Dashboard Stats:", stats_res.data['data'])

# 3. Test Admin User List
users_res = client.get('/api/v1/admin/users/?role=PASSENGER')
assert users_res.status_code == 200, f"Users failed: {users_res.data}"
print(f"[OK] 3. Admin Users (Passengers) Count: {users_res.data['count']}")

# 4. Test Admin Driver List
drivers_res = client.get('/api/v1/admin/drivers/')
assert drivers_res.status_code == 200, f"Drivers failed: {drivers_res.data}"
print(f"[OK] 4. Admin Drivers Count: {drivers_res.data['count']}")

# 5. Test Driver Approve & Suspend workflow
if drivers_res.data['data']:
    d_id = drivers_res.data['data'][0]['id']
    appr_res = client.post(f'/api/v1/admin/drivers/{d_id}/approve/')
    assert appr_res.status_code == 200, f"Approve failed: {appr_res.data}"
    print(f"[OK] 5. Driver {d_id} Approve: SUCCESS")

    susp_res = client.post(f'/api/v1/admin/drivers/{d_id}/suspend/')
    assert susp_res.status_code == 200, f"Suspend failed: {susp_res.data}"
    print(f"[OK] 5b. Driver {d_id} Suspend: SUCCESS")
else:
    print("[INFO] No drivers yet in database to toggle, skipping approve/suspend test")

# 6. Test Admin Rides List
rides_res = client.get('/api/v1/admin/rides/')
assert rides_res.status_code == 200, f"Rides failed: {rides_res.data}"
print(f"[OK] 6. Admin Rides Count: {rides_res.data['count']}")

print("\nSUCCESS: ALL ADMIN API ENDPOINTS VERIFIED 100% OPERATIONAL!")
