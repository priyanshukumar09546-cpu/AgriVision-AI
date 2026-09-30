import urllib.request
import io
import uuid
import json

def test_detect():
    boundary = uuid.uuid4().hex
    headers = {'Content-Type': f'multipart/form-data; boundary={boundary}'}

    body = io.BytesIO()
    body.write(f'--{boundary}\r\n'.encode('utf-8'))
    body.write(b'Content-Disposition: form-data; name="cropId"\r\n\r\n')
    body.write(b'tomato\r\n')

    body.write(f'--{boundary}\r\n'.encode('utf-8'))
    body.write(b'Content-Disposition: form-data; name="file"; filename="sample_1.jpg"\r\n')
    body.write(b'Content-Type: image/jpeg\r\n\r\n')
    with open('public/samples/sample_1.jpg', 'rb') as f:
        body.write(f.read())
    body.write(b'\r\n')
    body.write(f'--{boundary}--\r\n'.encode('utf-8'))

    # Test via Vite proxy
    url = 'http://localhost:5173/api/detect'
    req = urllib.request.Request(url, data=body.getvalue(), headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print("HTTP Status Code:", resp.status)
            print("Response JSON:")
            print(json.dumps(data, indent=2))
            assert data.get("success") is True
            assert data.get("crop") == "Tomato"
            assert data.get("disease") == "Early Blight"
            print("\n>>> TEST PASSED: Successfully detected Tomato Early Blight via Vite proxy!")
    except urllib.error.HTTPError as e:
        print("HTTP Error:", e.code, e.read().decode('utf-8'))
        raise e

if __name__ == '__main__':
    test_detect()
