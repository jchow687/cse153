# Importing the scapy library
from scapy.all import *
import random

# Target IP and port
target_ip = "" # Replace with the target IP address from the DNS Guardian
target_port = 0 # Replace with the target port from the TCP Gatekeeper

http_request = (
    "GET / HTTP/1.1\r\n"
    f"Host: {target_ip}:{target_port}"
    "\r\nUser-Agent: Scapy/1.0\r\n"
    "Accept: */*\r\n"
    "Connection: close\r\n"
    "\r\n"
)

source_port = random.randint(1024, 65535)


def send_http_request():
    try:
        # Step 1: Send the HTTP GET request after the handshake is complete
        # Send the HTTP reqsuest with correct sequence and acknowledgment numbers

        # On scapy documentation, use "TCP_client.tcplink" to complete the handshake
        # assign the variable that was assgined the handshake and wrap it with the http reuquest
        # then print the data that was called into wireshark to record waht it responeded
        # which well then complete the flag

        # Define a callback function to capture the HTTP response
        # answer = a.sr1(req)
        # this will record the http response in which read the flag in the terminal
        
        pass

    except Exception as e:
        print(f"Error sending HTTP request: {e}")

send_http_request()

