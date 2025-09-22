#!/usr/bin/env python3
"""
Demo script to showcase DSS Engine functionality
"""
import requests
import json
import time
from datetime import datetime

def demo_api():
    """Demonstrate the DSS Engine API functionality"""
    base_url = "http://localhost:8000"
    
    print("DSS Engine API Demo")
    print("=" * 50)
    
    # Wait for server to be ready
    print("Waiting for server to start...")
    time.sleep(2)
    
    try:
        # Test 1: Get available villages
        print("\n1. Getting available villages...")
        response = requests.get(f"{base_url}/api/dss/villages")
        if response.status_code == 200:
            villages = response.json()
            print(f"   Found {len(villages)} villages")
            print(f"   Sample villages: {villages[:3]}")
        else:
            print(f"   Error: {response.status_code}")
            return
        
        # Test 2: Get available schemes
        print("\n2. Getting available schemes...")
        response = requests.get(f"{base_url}/api/dss/schemes")
        if response.status_code == 200:
            schemes = response.json()
            print(f"   Found {len(schemes)} schemes")
            print("   Sample schemes:")
            for scheme in schemes[:3]:
                print(f"     - {scheme['name']} ({scheme['category']})")
        else:
            print(f"   Error: {response.status_code}")
            return
        
        # Test 3: Get recommendations for different villages
        test_villages = ["village_001", "village_002", "village_015"]
        
        for village_id in test_villages:
            print(f"\n3. Getting recommendations for {village_id}...")
            response = requests.get(f"{base_url}/api/dss/recommend?village_id={village_id}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"   Village: {data['village_id']}")
                print(f"   Total recommendations: {data['total_schemes']}")
                print("   Top 3 recommendations:")
                
                for i, rec in enumerate(data['recommendations'][:3], 1):
                    print(f"     {i}. {rec['scheme']}")
                    print(f"        Reason: {rec['reason']}")
                    print(f"        Score: {rec['score']:.2f} | Priority: {rec['priority']}")
                    print()
            else:
                print(f"   Error: {response.status_code} - {response.text}")
        
        # Test 4: Test error handling
        print("\n4. Testing error handling...")
        response = requests.get(f"{base_url}/api/dss/recommend?village_id=invalid_village")
        if response.status_code == 404:
            print("   ✅ Error handling works correctly")
        else:
            print(f"   ❌ Unexpected response: {response.status_code}")
        
        print("\n" + "=" * 50)
        print("Demo completed successfully!")
        print("Visit http://localhost:8000/docs for interactive API documentation")
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the server.")
        print("Make sure the server is running by executing: python start_server.py")
    except Exception as e:
        print(f"❌ Error during demo: {e}")

if __name__ == "__main__":
    demo_api()
